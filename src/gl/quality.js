// Automatic quality for the realistic hero.
//
// 1. detectDevice() reads what the browser says about the GPU and the device and picks a
//    starting tier. It is only a first guess.
// 2. The Governor then watches real frame times (and GPU times where the browser exposes them)
//    and moves resolution first, detail second, until the scene holds about 60 frames a second.
//    It steps down quickly when frames are late and probes upward carefully when there is room.
// 3. What it settles on is remembered for the next visit, so returning visitors start right.
// 4. If even the lightest tier cannot keep up, it asks to switch to the drawn hero instead.

// Each tier: internal pixel budget, and the detail of each part of the scene.
export const TIERS = [
  { name: "minimal", pixels: 90_000, steps: 56, oct: 3, nOct: 5, exact: 2, grow: 0.05, shadow: 0, refl: 0, cloud: 6, cloudLight: 0, highCloud: 0 },
  { name: "low", pixels: 150_000, steps: 72, oct: 4, nOct: 6, exact: 2, grow: 0.038, shadow: 8, refl: 20, cloud: 8, cloudLight: 1, highCloud: 1 },
  { name: "medium", pixels: 240_000, steps: 96, oct: 5, nOct: 7, exact: 2, grow: 0.028, shadow: 14, refl: 36, cloud: 12, cloudLight: 1, highCloud: 1 },
  { name: "high", pixels: 380_000, steps: 130, oct: 5, nOct: 8, exact: 4, grow: 0.02, shadow: 22, refl: 60, cloud: 16, cloudLight: 2, highCloud: 1 },
  { name: "ultra", pixels: 760_000, steps: 170, oct: 6, nOct: 9, exact: 4, grow: 0.015, shadow: 28, refl: 70, cloud: 22, cloudLight: 2, highCloud: 1 },
];
export const tierIndex = (name) => TIERS.findIndex((t) => t.name === name);

export function detectDevice(gl) {
  let renderer = "";
  try {
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    renderer = String((ext && gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) || gl.getParameter(gl.RENDERER) || "");
  } catch {
    renderer = "";
  }
  const r = renderer.toLowerCase();
  const nav = typeof navigator !== "undefined" ? navigator : {};
  const mobile =
    window.matchMedia("(pointer: coarse)").matches || /android|iphone|ipad|ipod|mobile/i.test(nav.userAgent || "");
  const memory = nav.deviceMemory || 0; // GB, Chromium only, rounded and capped at 8
  const cores = nav.hardwareConcurrency || 4;
  const saveData = Boolean(nav.connection && nav.connection.saveData);
  const software = /swiftshader|llvmpipe|softpipe|software|basic render|mesa offscreen/.test(r);

  let tier;
  if (software) tier = -1;
  else if (mobile) {
    if (/apple/.test(r)) tier = 2; // recent iPhones and iPads
    else if (/adreno.*\b(7\d\d|8\d\d)\b|mali-g7[1-9]|mali-g[89]\d|immortalis|xclipse/.test(r)) tier = 2;
    else tier = 1;
    if (memory && memory <= 3) tier = Math.min(tier, 0);
  } else {
    if (/rtx|radeon rx|radeon pro|quadro|arc a\d|geforce gtx (1[6-9]|[2-9]\d)|apple m[2-9]|apple m\d (pro|max|ultra)/.test(r)) tier = 4;
    else if (/apple m1|iris\(r\) xe|iris xe|radeon(\(tm\))? graphics|radeon 7\d0m|geforce|nvidia/.test(r)) tier = 3;
    else tier = 2; // older integrated graphics, or a browser that keeps the GPU name private
    if (cores <= 4) tier = Math.min(tier, 2);
  }
  if (saveData) tier = Math.min(tier, 1);
  return { renderer, mobile, memory, cores, saveData, software, tier };
}

// Remembered per browser for a while. Only a convenience: everything works without it.
const KEY = "aiesec-hero-quality-v1";
const DAY = 864e5;
export function readStored() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || "null");
    if (!s || typeof s !== "object") return null;
    const age = Date.now() - (s.at || 0);
    if (age > 30 * DAY) return null;
    if (s.fallback && age > 14 * DAY) return null; // try the realistic scene again after two weeks
    return s;
  } catch {
    return null;
  }
}
export function writeStored(value) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...value, at: Date.now() }));
  } catch {
    /* private mode or storage blocked: nothing to remember, nothing breaks */
  }
}

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;
const quantile = (a, q) => {
  const s = [...a].sort((x, y) => x - y);
  return s[Math.min(s.length - 1, Math.floor(q * s.length))];
};

const FRAME_MS = 16.9; // one frame at 60 Hz, with a hair of slack
const GPU_TARGET = 11.5; // GPU time we aim for, leaving room for the page around it

export class Governor {
  constructor({ tier, scale, maxTier = TIERS.length - 1, cssPixels, apply, giveUp, timer = false, fixed = false }) {
    this.maxTier = maxTier;
    this.tier = clamp(tier, 0, maxTier);
    this.cssPixels = Math.max(1, cssPixels);
    this.applyFn = apply;
    this.giveUpFn = giveUp;
    this.timer = timer;
    this.fixed = fixed;
    this.scale = scale ?? this.range().base;
    this.scale = clamp(this.scale, this.range().min, this.range().max);
    this.capMs = null; // a frame-rate ceiling imposed from outside (power saving), once detected
    this.ban = 15000;
    this.noProbeUntil = 0;
    this.quietUntil = performance.now() + 1800; // the page is still loading: do not judge yet
    this.bornAt = performance.now();
    this.changedAt = performance.now();
    this.stats = { fps: 0, avg: 0, p90: 0, gpu: null };
    this.slow = 0;
    this.roomy = 0;
    this.floor = 0;
    this.probe = null;
    this.downCheck = null;
    this.reset();
  }

  range(tier = this.tier) {
    const base = clamp(Math.sqrt(TIERS[tier].pixels / this.cssPixels), 0.2, 1);
    return { base, min: clamp(base * 0.72, 0.18, 1), max: clamp(base * 1.3, 0.2, 1) };
  }

  reset() {
    this.dts = [];
    this.gpus = [];
    this.elapsed = 0;
  }

  // true once quality has stopped moving: only then may the page save power by drawing less
  settled() {
    const now = performance.now();
    return this.fixed || (now - this.bornAt > 9000 && now - this.changedAt > 6000 && !this.probe && !this.downCheck);
  }

  // the viewport changed size: keep the same pixel budget
  resize(cssPixels) {
    this.cssPixels = Math.max(1, cssPixels);
    const r = this.range();
    this.scale = clamp(this.scale, r.min, r.max);
    this.commit();
  }

  // rendering paused or throttled on purpose: what follows is not a fair measurement
  pause(ms = 800) {
    this.reset();
    this.quietUntil = Math.max(this.quietUntil, performance.now() + ms);
  }

  frame(dtMs, gpuMs) {
    if (this.fixed) return;
    if (dtMs > 250) {
      // a stall (tab switch, garbage collection, a page loading): not the scene's fault
      this.reset();
      return;
    }
    this.dts.push(dtMs);
    if (gpuMs != null && gpuMs > 0) this.gpus.push(gpuMs);
    this.elapsed += dtMs;
    if (this.elapsed < 500 || this.dts.length < 20) return;
    this.evaluate();
    this.reset();
  }

  evaluate() {
    const now = performance.now();
    const avg = mean(this.dts);
    const p90 = quantile(this.dts, 0.9);
    const gpu = this.gpus.length >= 8 ? quantile(this.gpus, 0.5) : null;
    this.stats = { fps: 1000 / avg, avg, p90, gpu };
    if (now < this.quietUntil) return;
    const budget = Math.max(FRAME_MS, this.capMs || 0);

    // A step down that changed nothing, with frames arriving like clockwork at 30 (or 20, or 15)
    // a second, means a power-saving mode is holding the frame rate. Undo the step and treat that
    // rate as the ceiling. Anything less regular is real load (or a busy page), and the cheaper
    // setting simply stays.
    if (this.downCheck) {
      const dc = this.downCheck;
      const regular = p90 < avg * 1.1;
      const nearCap = [33.3, 50, 66.7].some((c) => Math.abs(avg - c) < c * 0.08);
      if (avg < dc.avg * 0.93) this.downCheck = null;
      else if (--dc.windows <= 0) {
        this.downCheck = null;
        if (regular && nearCap) {
          this.capMs = avg;
          this.restore(dc.prev);
          return;
        }
      }
    }

    // Frame times are the truth. GPU timers, where they exist, leave out part of the cost (on
    // integrated graphics the page's own compositing shares the chip), so they only hint.
    const over = avg > budget * 1.16 ? avg / budget : 0;
    if (over) {
      this.roomy = 0;
      if (this.probe) {
        // the last step up was one too many: go back, and wait longer before trying again
        const prev = this.probe.prev;
        this.probe = null;
        this.noProbeUntil = now + this.ban;
        this.ban = Math.min(this.ban * 2, 120000);
        this.restore(prev);
        return;
      }
      this.slow++;
      if (this.slow >= (over > 1.6 ? 1 : 2)) {
        this.slow = 0;
        this.stepDown(over, avg);
      }
      return;
    }
    this.slow = 0;
    this.floor = 0;

    if (this.probe && --this.probe.windows <= 0) {
      this.probe = null; // the step up held
      this.ban = 15000;
    }

    const roomy = avg < budget * 1.04 && p90 < budget * 1.12 && (gpu == null || gpu < GPU_TARGET * 0.85);
    if (!roomy) {
      this.roomy = 0;
      return;
    }
    this.roomy++;
    const need = gpu != null && gpu < GPU_TARGET * 0.55 ? 3 : 6;
    if (this.roomy >= need && now >= this.noProbeUntil && !this.probe && !this.downCheck) {
      this.roomy = 0;
      this.stepUp(gpu);
    }
  }

  stepDown(over, avg) {
    const prev = { tier: this.tier, scale: this.scale };
    const r = this.range();
    if (this.scale > r.min * 1.02) {
      // cost follows pixel count, so shrink each side by the square root of the overshoot
      this.scale = Math.max(r.min, this.scale * clamp(1 / Math.sqrt(over), 0.72, 0.9));
    } else if (this.tier > 0) {
      this.tier--;
      this.scale = this.range().base;
    } else {
      this.floor++;
      if (this.floor >= 4 && over > 1.5 && this.giveUpFn) this.giveUpFn();
      return;
    }
    this.downCheck = { avg, prev, windows: 2 };
    this.commit();
  }

  stepUp(gpu) {
    const prev = { tier: this.tier, scale: this.scale };
    const r = this.range();
    if (this.scale < r.max * 0.98) {
      const k = gpu != null ? clamp(Math.sqrt(GPU_TARGET / gpu) * 0.95, 1.04, 1.15) : 1.1;
      this.scale = Math.min(r.max, this.scale * k);
    } else if (this.tier < this.maxTier) {
      this.tier++;
      this.scale = this.range().min * 1.05;
    } else {
      return;
    }
    this.probe = { prev, windows: 3 };
    this.commit();
  }

  restore(prev) {
    this.tier = prev.tier;
    this.scale = prev.scale;
    this.commit();
  }

  commit() {
    this.quietUntil = performance.now() + 1200;
    this.changedAt = performance.now();
    this.slow = 0;
    this.roomy = 0;
    this.reset();
    if (this.applyFn) this.applyFn({ tier: this.tier, scale: this.scale, params: TIERS[this.tier] });
  }
}
