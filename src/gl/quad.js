// Minimal WebGL2 full-screen shader runner. No three.js here on purpose: the hero must paint
// before the 3D bundle is even requested.
//
// createQuad(canvas, fragmentSource, options) -> { ok, gl, set, seti, texture, resize, setScale,
//   setCamera, resetHistory, start, stop, renderOnce, destroy, getScale, getSize, hasTimer }
//
// options:
//   maxDpr        cap on device pixel ratio for the scene (default 1.5)
//   initialScale  starting fraction of that resolution (default 1)
//   minScale, maxScale  bounds for the built-in adaptive resolution
//   adaptive      let the runner lower and raise resolution from frame times (default true).
//                 Turn off when something else (a quality governor) decides.
//   timer         measure GPU time per frame where the browser allows it (default false)
//   accumulate    render the scene below screen resolution, then rebuild a full-resolution
//                 image from successive frames, each shifted by a fraction of a pixel. While the
//                 camera holds still the frames simply add up; while it moves, the previous
//                 image is carried to where each point now is (from the camera and the scene's
//                 distance per pixel) and kept within the range of what is visible now, so
//                 edges stay clean in motion without ghosts.
//                 The scene shader must add `uJitter` to gl_FragCoord and write the distance
//                 along each ray into alpha as log2(1 + 8t) / 18.873 (t in scene units, sky at
//                 6e4). Call setCamera() every frame.
//   outDpr        cap on device pixel ratio for the rebuilt image (default 1.5)
//   onFrame(time, dtSeconds, info)   called before each draw; info = { gpuMs, rawDtMs }
//   shouldDraw(now)                  return false to skip a frame (idle throttling)

const VERT = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

// Folds the newest low-resolution frame into the full-resolution history.
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
uniform float uMotion;   // 1 when the camera moved since the last frame
uniform vec3  uCamPos, uCamFw, uCamRt, uCamUp;
uniform float uFocal;
uniform vec3  uPrevPos, uPrevFw, uPrevRt, uPrevUp;
uniform float uPrevFocal;

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

  vec2 huv = uv;
  float keep = 1.0;
  bool moving = uMotion > 0.5;
  if (moving) {
    // the point this pixel shows now, and where the previous camera saw it
    vec2 n = (gl_FragCoord.xy - 0.5 * uOutRes) / (0.5 * uOutRes.y);
    vec3 rd = normalize(n.x * uCamRt + n.y * uCamUp + uFocal * uCamFw);
    // the scene keeps its distance per pixel in the alpha channel, on a log scale
    float a = texelFetch(uScene, ivec2(clamp(sp, vec2(0.0), uSceneRes - 1.0)), 0).a;
    float t = (exp2(a * 18.873) - 1.0) / 8.0;
    vec3 v = uCamPos + rd * min(t, 6.0e4) - uPrevPos;
    float z = dot(v, uPrevFw);
    vec2 pn = vec2(dot(v, uPrevRt), dot(v, uPrevUp)) / max(z, 1e-5) * uPrevFocal;
    huv = (pn * 0.5 * uOutRes.y + 0.5 * uOutRes) / uOutRes;
    if (z <= 0.0 || huv.x < 0.0 || huv.y < 0.0 || huv.x > 1.0 || huv.y > 1.0) keep = 0.0;
  }
  vec4 h = texture(uHist, huv);
  if (moving) {
    // keep the past only within the range of what is here now: this is what stops ghosts
    vec3 mn = cur, mx = cur;
    ivec2 c0 = ivec2(floor(sp));
    ivec2 hi = ivec2(uSceneRes) - 1;
    for (int y = -1; y <= 1; y++) {
      for (int x = -1; x <= 1; x++) {
        vec3 c = texelFetch(uScene, clamp(c0 + ivec2(x, y), ivec2(0), hi), 0).rgb;
        mn = min(mn, c);
        mx = max(mx, c);
      }
    }
    h.rgb = clamp(h.rgb, mn, mx);
  }
  float hw = uReset > 0.5 ? 0.0 : h.a * 16.0 * (moving ? 0.8 : uDecay) * keep;
  hw = min(hw, moving ? 5.0 : 15.9);
  vec3 col = (h.rgb * hw + cur * w) / (hw + w);
  o = vec4(col, min(hw + w, 15.9) / 16.0);
}`;

// Puts the rebuilt image on the screen with words standing in it at full resolution. The scene is
// drawn below screen resolution, which suits land and sky but leaves printed letters soft, so a
// title on a plane across the scene is drawn here instead, per screen pixel, from its own sharp
// texture. Whatever the scene found nearer than the plane (its distance per pixel, in the alpha
// of the scene image) stands in front of the letters.
const PRESENT_FRAG = `#version 300 es
precision highp float;
out vec4 o;
uniform sampler2D uHist;
uniform sampler2D uScene;
uniform sampler2D uTitle;
uniform vec2  uSceneRes;
uniform vec2  uOutRes;
uniform vec2  uJitter;
uniform vec3  uCamPos, uCamFw, uCamRt, uCamUp;
uniform float uFocal;
uniform vec4  uTitleRect;   // x0, y0, x1, y1 on the plane z = uTitleZ
uniform float uTitleZ;
uniform float uTitleA;
uniform vec3  uTitleCol;

void main() {
  vec3 col = texelFetch(uHist, ivec2(gl_FragCoord.xy), 0).rgb;
  vec2 uv = gl_FragCoord.xy / uOutRes;
  vec2 n = (gl_FragCoord.xy - 0.5 * uOutRes) / (0.5 * uOutRes.y);
  vec3 rd = normalize(n.x * uCamRt + n.y * uCamUp + uFocal * uCamFw);
  float tt = (uTitleZ - uCamPos.z) / max(rd.z, 1e-4);
  vec2 tuv = ((uCamPos + rd * tt).xy - uTitleRect.xy) / (uTitleRect.zw - uTitleRect.xy);
  // sampled outside any branch, so the texture's own filtering knows its footprint
  float cov = texture(uTitle, tuv).r;
  float inside = step(0.0, tuv.x) * step(tuv.x, 1.0) * step(0.0, tuv.y) * step(tuv.y, 1.0) * step(1e-4, rd.z);
  // the scene's distance here, at the scene's own resolution
  float a = texture(uScene, (uv * uSceneRes - uJitter) / uSceneRes).a;
  float t = (exp2(a * 18.873) - 1.0) / 8.0;
  float clear = smoothstep(tt * 0.94, tt * 1.06, t);
  col = mix(col, uTitleCol, cov * inside * clear * uTitleA);
  o = vec4(col, 1.0);
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

const GL_OPTIONS = {
  antialias: false,
  alpha: false,
  depth: false,
  stencil: false,
  powerPreference: "high-performance",
  preserveDrawingBuffer: false,
};

// Compile and link a scene's programs without holding up the page where possible. Where the
// browser offers KHR_parallel_shader_compile the driver may compile in the background, and this
// waits for it a frame at a time. Some drivers only compile when the result is asked for (a
// large shader on Chrome over Direct3D never reports done on its own), so after a short wait it
// asks, which compiles it there and then. Hand the result to createQuad({ programs }).
// limit: how long to let the browser compile in the background before waiting for it outright
// (the realistic scene's shader never reports itself done on Chrome on Windows, so it gets little)
export function prelink(canvas, frag, { accumulate = false, limit = 1200 } = {}) {
  const gl = canvas.getContext("webgl2", GL_OPTIONS);
  if (!gl) return Promise.reject(new Error("no webgl2"));
  const start = (src) => {
    const vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, VERT);
    gl.compileShader(vs);
    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, src);
    gl.compileShader(fs);
    const p = gl.createProgram();
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.bindAttribLocation(p, 0, "aPos");
    gl.linkProgram(p);
    return { p, vs, fs };
  };
  const jobs = [start(frag), accumulate ? start(ACCUM_FRAG) : null];
  // send the work to the GPU now: with nothing drawn yet, nothing else would
  gl.flush();
  const ext = gl.getExtension("KHR_parallel_shader_compile");
  const finish = () => {
    const out = jobs.map((j) => {
      if (!j) return null;
      if (!gl.getProgramParameter(j.p, gl.LINK_STATUS)) {
        const log = gl.getShaderInfoLog(j.fs) || gl.getShaderInfoLog(j.vs) || gl.getProgramInfoLog(j.p);
        throw new Error("Program link failed: " + log);
      }
      gl.deleteShader(j.vs);
      gl.deleteShader(j.fs);
      return j.p;
    });
    return { main: out[0], accum: out[1] };
  };
  if (!ext) return Promise.resolve().then(finish);
  const t0 = performance.now();
  return new Promise((resolve, reject) => {
    const poll = () => {
      const done = jobs.every((j) => !j || gl.getProgramParameter(j.p, ext.COMPLETION_STATUS_KHR));
      if (done || performance.now() - t0 > limit) {
        try {
          resolve(finish());
        } catch (err) {
          reject(err);
        }
      } else {
        gl.flush();
        requestAnimationFrame(poll);
      }
    };
    poll();
  });
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
    reproject = true,
    programs = null, // from prelink(): already compiled
    crispTitle = false, // draw a title plane at full resolution over the rebuilt image (setTitle)
  } = {},
) {
  const gl = canvas.getContext("webgl2", GL_OPTIONS);
  if (!gl) return { ok: false };

  let program;
  let accProg = null;
  let presProg = null;
  try {
    program = programs ? programs.main : link(gl, frag);
    if (accumulate) accProg = programs && programs.accum ? programs.accum : link(gl, ACCUM_FRAG);
  } catch (err) {
    console.error(err);
    return { ok: false, error: err, gl };
  }
  if (accumulate && crispTitle) {
    try {
      presProg = link(gl, PRESENT_FRAG);
    } catch (err) {
      console.error(err); // the scene draws the title itself then
    }
  }
  const title = { rect: [0, 0, 1, 1], z: 20, a: 0, col: [0.95, 0.945, 0.965], unit: 0 };
  const setTitle = (o) => Object.assign(title, o);
  const presLoc = new Map();
  const P = (n) => {
    if (!presLoc.has(n)) presLoc.set(n, gl.getUniformLocation(presProg, n));
    return presLoc.get(n);
  };

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
  // Upload a canvas or image as a texture bound to a fixed unit (0 to 3; 4 to 7 are used by the
  // accumulation: 4 distance, 5 scratch for new render targets, 6 scene, 7 history).
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
  // Float render targets carry the history at higher precision where the browser allows it.
  // The distance per pixel that lets the history follow the camera travels in the alpha channel
  // of the scene image (a second render target stalled some GPUs for seconds per frame).
  const floatTargets = accumulate && Boolean(gl.getExtension("EXT_color_buffer_float"));
  const reprojection = accumulate && reproject;
  let sceneTex = null;
  let depthTex = null;
  let sceneFbo = null;
  const hist = [null, null];
  const histFbo = [null, null];
  let cur = 0;
  let reset = true;
  let frameIndex = 0;
  const newTex = (w, h, kind, filter) => {
    const t = gl.createTexture();
    // Unit 5 is kept free for this. Binding on whatever unit happened to be active could put
    // the new target where the scene expects one of its own textures: the scene then reads the
    // image it is drawing into, the GPU refuses, and the canvas stays black.
    gl.activeTexture(gl.TEXTURE5);
    gl.bindTexture(gl.TEXTURE_2D, t);
    if (kind === "rgba16f") gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
    else if (kind === "r16f") gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16F, w, h, 0, gl.RED, gl.HALF_FLOAT, null);
    else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  };
  const newFbo = (colorTex, extraTex) => {
    const f = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, f);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, colorTex, 0);
    if (extraTex) {
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, extraTex, 0);
      gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return f;
  };
  const freeTargets = (which) => {
    if (which !== "hist" && sceneTex) {
      gl.deleteTexture(sceneTex);
      if (depthTex) gl.deleteTexture(depthTex);
      gl.deleteFramebuffer(sceneFbo);
      sceneTex = depthTex = sceneFbo = null;
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
          hist[i] = newTex(ow, oh, floatTargets ? "rgba16f" : "rgba8", gl.LINEAR);
          histFbo[i] = newFbo(hist[i]);
        }
        reset = true;
      }
      if (w !== width || h !== height) {
        width = w;
        height = h;
        freeTargets("scene");
        sceneTex = newTex(w, h, "rgba8", gl.LINEAR);
        depthTex = null;
        sceneFbo = newFbo(sceneTex, depthTex);
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

  // The camera, for following the history while it moves: position, the three axes, focal length.
  const camNow = new Float32Array(13);
  const camPrev = new Float32Array(13);
  let haveCam = false;
  let havePrev = false;
  const setCamera = (pos, fw, rt, up, focal) => {
    camNow.set(pos, 0);
    camNow.set(fw, 3);
    camNow.set(rt, 6);
    camNow.set(up, 9);
    camNow[12] = focal;
    haveCam = true;
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
    for (const n of [
      "uScene", "uHist", "uDepth", "uSceneRes", "uOutRes", "uJitter", "uReset", "uDecay", "uMotion",
      "uCamPos", "uCamFw", "uCamRt", "uCamUp", "uFocal", "uPrevPos", "uPrevFw", "uPrevRt", "uPrevUp", "uPrevFocal",
    ]) {
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
    // did the camera move since the last frame?
    let moved = false;
    if (haveCam && havePrev) {
      for (let i = 0; i < 13; i++) {
        if (Math.abs(camNow[i] - camPrev[i]) > 1e-7) {
          moved = true;
          break;
        }
      }
    }
    if (moved && !reprojection) reset = true;

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
    gl.uniform1f(accLoc.uMotion, moved && reprojection && !reset ? 1 : 0);
    gl.uniform3f(accLoc.uCamPos, camNow[0], camNow[1], camNow[2]);
    gl.uniform3f(accLoc.uCamFw, camNow[3], camNow[4], camNow[5]);
    gl.uniform3f(accLoc.uCamRt, camNow[6], camNow[7], camNow[8]);
    gl.uniform3f(accLoc.uCamUp, camNow[9], camNow[10], camNow[11]);
    gl.uniform1f(accLoc.uFocal, camNow[12]);
    gl.uniform3f(accLoc.uPrevPos, camPrev[0], camPrev[1], camPrev[2]);
    gl.uniform3f(accLoc.uPrevFw, camPrev[3], camPrev[4], camPrev[5]);
    gl.uniform3f(accLoc.uPrevRt, camPrev[6], camPrev[7], camPrev[8]);
    gl.uniform3f(accLoc.uPrevUp, camPrev[9], camPrev[10], camPrev[11]);
    gl.uniform1f(accLoc.uPrevFocal, camPrev[12]);
    gl.bindFramebuffer(gl.FRAMEBUFFER, histFbo[next]);
    gl.viewport(0, 0, outW, outH);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    // 3. onto the screen, with the title drawn sharp over it while there is one
    if (presProg && title.a > 0) {
      gl.useProgram(presProg);
      gl.activeTexture(gl.TEXTURE7);
      gl.bindTexture(gl.TEXTURE_2D, hist[next]);
      gl.uniform1i(P("uHist"), 7);
      gl.uniform1i(P("uScene"), 6);
      gl.uniform1i(P("uTitle"), title.unit);
      gl.uniform2f(P("uSceneRes"), width, height);
      gl.uniform2f(P("uOutRes"), outW, outH);
      gl.uniform2f(P("uJitter"), jx, jy);
      gl.uniform3f(P("uCamPos"), camNow[0], camNow[1], camNow[2]);
      gl.uniform3f(P("uCamFw"), camNow[3], camNow[4], camNow[5]);
      gl.uniform3f(P("uCamRt"), camNow[6], camNow[7], camNow[8]);
      gl.uniform3f(P("uCamUp"), camNow[9], camNow[10], camNow[11]);
      gl.uniform1f(P("uFocal"), camNow[12]);
      gl.uniform4f(P("uTitleRect"), title.rect[0], title.rect[1], title.rect[2], title.rect[3]);
      gl.uniform1f(P("uTitleZ"), title.z);
      gl.uniform1f(P("uTitleA"), title.a);
      gl.uniform3f(P("uTitleCol"), title.col[0], title.col[1], title.col[2]);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, outW, outH);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    } else {
      gl.bindFramebuffer(gl.READ_FRAMEBUFFER, histFbo[next]);
      gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
      gl.blitFramebuffer(0, 0, outW, outH, 0, 0, outW, outH, gl.COLOR_BUFFER_BIT, gl.NEAREST);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    cur = next;
    reset = false;
    if (haveCam) {
      camPrev.set(camNow);
      havePrev = true;
    }
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
    reset = true;
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
    if (presProg) gl.deleteProgram(presProg);
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
    setCamera,
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
    reprojection,
    crispTitle: Boolean(presProg),
    setTitle,
    // the picture as it stands, copied while the drawing is still there to copy
    still: () => {
      drawScene();
      const c = document.createElement("canvas");
      c.width = canvas.width;
      c.height = canvas.height;
      c.getContext("2d").drawImage(canvas, 0, 0);
      return c;
    },
  };
}
