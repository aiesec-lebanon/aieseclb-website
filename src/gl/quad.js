// Minimal WebGL2 full-screen shader runner. No three.js here on purpose: the hero must paint
// before the 3D bundle is even requested.
//
// createQuad(canvas, fragmentSource, { uniforms, maxDpr, onFrame }) -> { set, texture, resize, start, stop, destroy, ok }

const VERT = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

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

export function createQuad(
  canvas,
  frag,
  { maxDpr = 1.5, onFrame, initialScale = 1, minScale = 0.55, maxScale = 1 } = {},
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
  try {
    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, frag);
    program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error("Program link failed: " + gl.getProgramInfoLog(program));
    }
  } catch (err) {
    console.error(err);
    return { ok: false, error: err };
  }

  gl.useProgram(program);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  // one oversized triangle covers the viewport
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(program, "aPos");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

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

  const textures = [];
  // Upload a canvas or image as a texture bound to a fixed unit.
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
    const l = getLoc(name);
    if (l !== null) gl.uniform1i(l, unit);
  };

  // Resolution: device pixel ratio capped, then scaled down further if frames run long.
  let scale = initialScale;
  let width = 0;
  let height = 0;
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr) * scale;
    const w = Math.max(2, Math.round(canvas.clientWidth * dpr));
    const h = Math.max(2, Math.round(canvas.clientHeight * dpr));
    if (w !== width || h !== height) {
      width = w;
      height = h;
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
    set("uRes", w, h);
    return { width: w, height: h, cssWidth: canvas.clientWidth, cssHeight: canvas.clientHeight };
  };

  let raf = 0;
  let running = false;
  let last = 0;
  let slow = 0;
  let fast = 0;
  const t0 = performance.now();

  const frame = (now) => {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    const dt = last ? now - last : 16;
    last = now;
    // adaptive resolution: drop quickly when slow, recover carefully
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
    const time = (now - t0) / 1000;
    set("uTime", time);
    if (onFrame) onFrame(time, Math.min(dt, 100) / 1000);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
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
    if (onFrame) onFrame(time, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const onLost = (e) => {
    e.preventDefault();
    stop();
  };
  canvas.addEventListener("webglcontextlost", onLost);

  const destroy = () => {
    stop();
    canvas.removeEventListener("webglcontextlost", onLost);
    textures.forEach((t) => t && gl.deleteTexture(t));
    gl.deleteBuffer(buf);
    gl.deleteProgram(program);
    // The context itself is left alone: the same canvas can be handed a new program straight
    // away (React runs effects twice in development), and a lost context cannot compile one.
  };

  resize();
  return { ok: true, gl, set, texture, resize, start, stop, renderOnce, destroy, getScale: () => scale };
}
