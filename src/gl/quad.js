// Minimal WebGL2 full-screen shader runner. No three.js here on purpose: the hero must paint
// before the 3D bundle is even requested.
//
// createQuad(canvas, fragmentSource, options) -> { ok, gl, set, seti, texture, resize, setScale,
//   resetHistory, start, stop, renderOnce, destroy, getScale, getSize, hasTimer }
//
// options:
//   maxDpr        cap on device pixel ratio for the scene (default 1.5)
//   initialScale  starting fraction of that resolution (default 1)
//   minScale, maxScale  bounds for the built-in adaptive resolution
//   adaptive      let the runner lower and raise resolution from frame times (default true).
//                 Turn off when something else (a quality governor) decides.
//   timer         measure GPU time per frame where the browser allows it (default false)
//   accumulate    render the scene below screen resolution, then rebuild a full-resolution
//                 image: a sharp (Catmull-Rom) upscale while the view moves, and, while it is
//                 still, sub-pixel jitter blended over successive frames until edges are clean.
//                 The scene shader must add `uJitter` to gl_FragCoord. Call resetHistory()
//                 whenever the camera moves.
//   outDpr        cap on device pixel ratio for the rebuilt image (default 1.5)
//   onFrame(time, dtSeconds, info)   called before each draw; info = { gpuMs, rawDtMs }
//   shouldDraw(now)                  return false to skip a frame (idle throttling)

const VERT = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

// Blends the newest low-resolution frame into the full-resolution history.
const ACCUM_FRAG = `#version 300 es
precision highp float;
out vec4 o;
uniform sampler2D uScene;
uniform sampler2D uHist;
uniform vec2  uSceneRes;
uniform vec2  uOutRes;
uniform vec2  uJitter;   // in scene pixels
uniform float uReset;
uniform float uDecay;

// Catmull-Rom filtered sample in 9 bilinear taps
vec3 sampleCR(vec2 uv) {
  vec2 sp = uv * uSceneRes;
  vec2 t1 = floor(sp - 0.5) + 0.5;
  vec2 f = sp - t1;
  vec2 w0 = f * (-0.5 + f * (1.0 - 0.5 * f));
  vec2 w1 = 1.0 + f * f * (-2.5 + 1.5 * f);
  vec2 w2 = f * (0.5 + f * (2.0 - 1.5 * f));
  vec2 w3 = f * f * (-0.5 + 0.5 * f);
  vec2 w12 = w1 + w2;
  vec2 t0 = (t1 - 1.0) / uSceneRes;
  vec2 t3 = (t1 + 2.0) / uSceneRes;
  vec2 t12 = (t1 + w2 / w12) / uSceneRes;
  vec3 r = texture(uScene, vec2(t0.x, t0.y)).rgb * w0.x * w0.y
         + texture(uScene, vec2(t12.x, t0.y)).rgb * w12.x * w0.y
         + texture(uScene, vec2(t3.x, t0.y)).rgb * w3.x * w0.y
         + texture(uScene, vec2(t0.x, t12.y)).rgb * w0.x * w12.y
         + texture(uScene, vec2(t12.x, t12.y)).rgb * w12.x * w12.y
         + texture(uScene, vec2(t3.x, t12.y)).rgb * w3.x * w12.y
         + texture(uScene, vec2(t0.x, t3.y)).rgb * w0.x * w3.y
         + texture(uScene, vec2(t12.x, t3.y)).rgb * w12.x * w3.y
         + texture(uScene, vec2(t3.x, t3.y)).rgb * w3.x * w3.y;
  return clamp(r, 0.0, 1.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uOutRes;
  // where this output pixel falls on the jittered scene grid
  vec2 sp = uv * uSceneRes - uJitter;
  vec3 cur = sampleCR(sp / uSceneRes);
  // a frame counts for more where one of its samples landed close to this pixel
  vec2 dd = abs(fract(sp) - 0.5);
  float w = 0.08 + exp(-dot(dd, dd) * 7.0);
  vec4 h = texelFetch(uHist, ivec2(gl_FragCoord.xy), 0);
  float hw = uReset > 0.5 ? 0.0 : h.a * 16.0 * uDecay;
  vec3 col = (h.rgb * hw + cur * w) / (hw + w);
  o = vec4(col, min(hw + w, 15.9) / 16.0);
}`;

function compile(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh);
    gl.deleteShader(sh);
    throw new Error("Shader compile failed: " + log);
  }
  return sh;
}

function link(gl, fragSrc) {
  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, fragSrc);
  const p = gl.createProgram();
  gl.attachShader(p, vs);
  gl.attachShader(p, fs);
  gl.bindAttribLocation(p, 0, "aPos");
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error("Program link failed: " + gl.getProgramInfoLog(p));
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  return p;
}

// Halton (2, 3): sub-pixel offsets that cover a pixel evenly over successive frames
function halton(i, b) {
  let f = 1;
  let r = 0;
  while (i > 0) {
    f /= b;
    r += f * (i % b);
    i = Math.floor(i / b);
  }
  return r;
}

export function createQuad(
  canvas,
  frag,
  {
    maxDpr = 1.5,
    outDpr = 1.5,
    onFrame,
    shouldDraw,
    initialScale = 1,
    minScale = 0.55,
    maxScale = 1,
    adaptive = true,
    timer = false,
    accumulate = false,
  } = {},
) {
  const gl = canvas.getContext("webgl2", {
    antialias: false,
    alpha: false,
    depth: false,
    stencil: false,
    powerPreference: "high-performance",
    preserveDrawingBuffer: false,
  });
  if (!gl) return { ok: false };

  let program;
  let accProg = null;
  try {
    program = link(gl, frag);
    if (accumulate) accProg = link(gl, ACCUM_FRAG);
  } catch (err) {
    console.error(err);
    return { ok: false, error: err, gl };
  }

  gl.useProgram(program);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  // one oversized triangle covers the viewport
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  const uniformLoc = new Map();
  const getLoc = (name) => {
    if (!uniformLoc.has(name)) uniformLoc.set(name, gl.getUniformLocation(program, name));
    return uniformLoc.get(name);
  };

  const set = (name, ...v) => {
    const l = getLoc(name);
    if (l === null) return;
    if (v.length === 1) gl.uniform1f(l, v[0]);
    else if (v.length === 2) gl.uniform2f(l, v[0], v[1]);
    else if (v.length === 3) gl.uniform3f(l, v[0], v[1], v[2]);
    else gl.uniform4f(l, v[0], v[1], v[2], v[3]);
  };
  const seti = (name, v) => {
    const l = getLoc(name);
    if (l !== null) gl.uniform1i(l, Math.round(v));
  };

  const textures = [];
  // Upload a canvas or image as a texture bound to a fixed unit (0 to 4; 5 is scratch for
  // render targets, 6 and 7 are taken by the accumulation pass).
  // tiling: a repeating lookup table (noise), sampled without mipmaps and without flipping.
  const texture = (name, source, unit, { tiling = false } = {}) => {
    let tex = textures[unit];
    if (!tex) {
      tex = gl.createTexture();
      textures[unit] = tex;
    }
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, !tiling);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    if (tiling) {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    } else {
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    }
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, tiling ? gl.REPEAT : gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, tiling ? gl.REPEAT : gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    const l = getLoc(name);
    if (l !== null) gl.uniform1i(l, unit);
  };

  // ---- accumulation targets ----
  const floatTargets = accumulate && Boolean(gl.getExtension("EXT_color_buffer_float"));
  let sceneTex = null;
  let sceneFbo = null;
  const hist = [null, null];
  const histFbo = [null, null];
  let cur = 0;
  let reset = true;
  let frameIndex = 0;
  const makeTarget = (w, h, hdr, filter) => {
    const t = gl.createTexture();
    // Unit 5 is kept free for this. Binding on whatever unit happened to be active could put
    // the new target where the scene expects one of its own textures: the scene then reads the
    // image it is drawing into, the GPU refuses, and the canvas stays black.
    gl.activeTexture(gl.TEXTURE5);
    gl.bindTexture(gl.TEXTURE_2D, t);
    if (hdr) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
    else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const f = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, f);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return { t, f };
  };
  const freeTargets = (which) => {
    if (which !== "hist" && sceneTex) {
      gl.deleteTexture(sceneTex);
      gl.deleteFramebuffer(sceneFbo);
      sceneTex = sceneFbo = null;
    }
    if (which !== "scene") {
      for (let i = 0; i < 2; i++) {
        if (hist[i]) gl.deleteTexture(hist[i]);
        if (histFbo[i]) gl.deleteFramebuffer(histFbo[i]);
        hist[i] = histFbo[i] = null;
      }
    }
  };

  // Resolution: device pixel ratio capped, then scaled.
  let scale = initialScale;
  let width = 0;
  let height = 0;
  let outW = 0;
  let outH = 0;
  const resize = () => {
    const css = { w: canvas.clientWidth, h: canvas.clientHeight };
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr) * scale;
    const w = Math.max(2, Math.round(css.w * dpr));
    const h = Math.max(2, Math.round(css.h * dpr));
    if (accumulate) {
      // the rebuilt image: screen resolution, within reason
      let od = Math.min(window.devicePixelRatio || 1, outDpr);
      const px = css.w * css.h * od * od;
      if (px > 2.6e6) od *= Math.sqrt(2.6e6 / px);
      const ow = Math.max(2, Math.round(css.w * od));
      const oh = Math.max(2, Math.round(css.h * od));
      if (ow !== outW || oh !== outH) {
        outW = ow;
        outH = oh;
        canvas.width = ow;
        canvas.height = oh;
        freeTargets("hist");
        for (let i = 0; i < 2; i++) {
          const tg = makeTarget(ow, oh, floatTargets, gl.NEAREST);
          hist[i] = tg.t;
          histFbo[i] = tg.f;
        }
        reset = true;
      }
      if (w !== width || h !== height) {
        width = w;
        height = h;
        freeTargets("scene");
        const tg = makeTarget(w, h, false, gl.LINEAR);
        sceneTex = tg.t;
        sceneFbo = tg.f;
        reset = true;
      }
    } else if (w !== width || h !== height) {
      width = w;
      height = h;
      canvas.width = w;
      canvas.height = h;
    }
    gl.useProgram(program);
    set("uRes", width, height);
    return { width, height, cssWidth: css.w, cssHeight: css.h };
  };
  const setScale = (s) => {
    scale = Math.max(0.1, Math.min(1, s));
    return resize();
  };

  // GPU time, where the browser exposes it (desktop Chromium mostly). Results arrive a few
  // frames late; a small pool of queries is kept in flight.
  const tq = timer ? gl.getExtension("EXT_disjoint_timer_query_webgl2") : null;
  const pending = [];
  const pollTimer = () => {
    if (!tq || !pending.length) return null;
    const q = pending[0];
    const available = gl.getQueryParameter(q, gl.QUERY_RESULT_AVAILABLE);
    const disjoint = gl.getParameter(tq.GPU_DISJOINT_EXT);
    if (!available && !disjoint) return null;
    pending.shift();
    let ms = null;
    if (available && !disjoint) ms = gl.getQueryParameter(q, gl.QUERY_RESULT) / 1e6;
    gl.deleteQuery(q);
    return ms;
  };

  let accLoc = null;
  if (accProg) {
    accLoc = {};
    for (const n of ["uScene", "uHist", "uSceneRes", "uOutRes", "uJitter", "uReset", "uDecay"]) {
      accLoc[n] = gl.getUniformLocation(accProg, n);
    }
  }

  const drawScene = () => {
    if (!accumulate) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, width, height);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      return;
    }
    // 1. the scene, at its own resolution, shifted by a fraction of a pixel
    frameIndex++;
    const jx = halton((frameIndex % 64) + 1, 2) - 0.5;
    const jy = halton((frameIndex % 64) + 1, 3) - 0.5;
    gl.useProgram(program);
    set("uJitter", jx, jy);
    gl.bindFramebuffer(gl.FRAMEBUFFER, sceneFbo);
    gl.viewport(0, 0, width, height);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    // 2. folded into the full-resolution history
    const next = 1 - cur;
    gl.useProgram(accProg);
    gl.activeTexture(gl.TEXTURE6);
    gl.bindTexture(gl.TEXTURE_2D, sceneTex);
    gl.activeTexture(gl.TEXTURE7);
    gl.bindTexture(gl.TEXTURE_2D, hist[cur]);
    gl.uniform1i(accLoc.uScene, 6);
    gl.uniform1i(accLoc.uHist, 7);
    gl.uniform2f(accLoc.uSceneRes, width, height);
    gl.uniform2f(accLoc.uOutRes, outW, outH);
    gl.uniform2f(accLoc.uJitter, jx, jy);
    gl.uniform1f(accLoc.uReset, reset ? 1 : 0);
    gl.uniform1f(accLoc.uDecay, 0.86);
    gl.bindFramebuffer(gl.FRAMEBUFFER, histFbo[next]);
    gl.viewport(0, 0, outW, outH);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    // 3. onto the screen
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, histFbo[next]);
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
    gl.blitFramebuffer(0, 0, outW, outH, 0, 0, outW, outH, gl.COLOR_BUFFER_BIT, gl.NEAREST);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    cur = next;
    reset = false;
    gl.useProgram(program); // callers set the scene's uniforms between frames
  };

  let raf = 0;
  let running = false;
  let last = 0;
  let slow = 0;
  let fast = 0;
  const t0 = performance.now();

  const draw = () => {
    let q = null;
    if (tq && pending.length < 5) {
      q = gl.createQuery();
      gl.beginQuery(tq.TIME_ELAPSED_EXT, q);
    }
    drawScene();
    if (q) {
      gl.endQuery(tq.TIME_ELAPSED_EXT);
      pending.push(q);
    }
  };

  const frame = (now) => {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    if (shouldDraw && !shouldDraw(now)) return;
    const dt = last ? now - last : 16;
    last = now;
    if (adaptive) {
      // drop quickly when slow, recover carefully
      if (dt > 26) slow++;
      else slow = Math.max(0, slow - 1);
      if (dt < 18) fast++;
      else fast = 0;
      if (slow > 20 && scale > minScale) {
        scale = Math.max(minScale, scale * 0.85);
        slow = 0;
        resize();
      } else if (fast > 240 && scale < maxScale) {
        scale = Math.min(maxScale, scale * 1.1);
        fast = 0;
        resize();
      }
    }
    const gpuMs = pollTimer();
    const time = (now - t0) / 1000;
    set("uTime", time);
    if (onFrame) onFrame(time, Math.min(dt, 100) / 1000, { gpuMs, rawDtMs: dt });
    draw();
  };

  const start = () => {
    if (running) return;
    running = true;
    last = 0;
    raf = requestAnimationFrame(frame);
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };
  // Draw one frame right now (used for the reduced-motion still and for resizes while paused).
  const renderOnce = () => {
    const now = performance.now();
    const time = (now - t0) / 1000;
    set("uTime", time);
    if (onFrame) onFrame(time, 0, { gpuMs: null, rawDtMs: 0 });
    reset = true;
    drawScene();
  };

  const onLost = (e) => {
    e.preventDefault();
    stop();
  };
  canvas.addEventListener("webglcontextlost", onLost);

  const destroy = () => {
    stop();
    canvas.removeEventListener("webglcontextlost", onLost);
    pending.forEach((q) => gl.deleteQuery(q));
    textures.forEach((t) => t && gl.deleteTexture(t));
    freeTargets();
    gl.deleteBuffer(buf);
    gl.deleteProgram(program);
    if (accProg) gl.deleteProgram(accProg);
    // The context itself is left alone: the same canvas can be handed a new program straight
    // away (React runs effects twice in development), and a lost context cannot compile one.
  };

  resize();
  return {
    ok: true,
    gl,
    set,
    seti,
    texture,
    resize,
    setScale,
    resetHistory: () => {
      reset = true;
    },
    start,
    stop,
    renderOnce,
    destroy,
    getScale: () => scale,
    getSize: () => ({ width, height, outW, outH }),
    hasTimer: Boolean(tq),
  };
}
