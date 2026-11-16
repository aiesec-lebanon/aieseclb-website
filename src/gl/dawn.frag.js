// "Dawn over Lebanon": one fragment shader, a multiplane camera.
// The viewer starts low over the Mediterranean looking east. Eleven ridges of Mount Lebanon
// stand at increasing depth. A valley winds up through all of them toward a pass in the summit
// ridge, and the sun comes up in that pass. As the page scrolls the camera flies up the valley:
// over the coast, into the cloud, out above it at sunrise, and through the pass into the sun.
// Every ridge is a vertical plane at its own depth, projected with a real perspective divide,
// so the parallax is exact rather than faked with speed factors. The sea is a true horizontal
// plane that mirrors the scene with a second, reflected ray.
// The look is deliberately graphic: clean tonal ridges with a lit and a shaded face, cloud
// banked against their feet, one family of blues, and a single warm light.

export const DAWN_FRAG = `#version 300 es
precision highp float;
out vec4 fragColor;

uniform vec2  uRes;
uniform float uTime;
uniform float uDay;      // 0 night, 0.5 sunrise, 1 day
uniform vec3  uCam;      // x, height, z
uniform float uHy;       // horizon height on screen, in units of half the frame height
// Always 0, added to the loop bounds so the shader compiler cannot unroll them (Chrome on Windows
// hands WebGL to Direct3D's compiler, which took 21 s on this shader cold when it could).
uniform int   uZero;
uniform vec2  uSun;      // sun direction as slopes (kx, ky)
uniform float uSunR;     // sun radius in slope units
uniform float uBearing;  // bearing of the flight valley (the sun's bearing at the start)
uniform float uWash;     // 0..1 fade into the page colour at the end of the flight
uniform vec3  uPageBg;
uniform float uIntro;    // 0..1 fade up on load
uniform sampler2D uTitle;
uniform vec4  uTitleRect;   // world x0, y0, x1, y1 on the plane at uTitleZ
uniform float uTitleZ;
uniform float uTitleA;
uniform sampler2D uCedar;   // silhouette of a cedar of Lebanon
uniform float uDeck;     // 0 below the cloud, 1 above it: the banks brighten and thicken
uniform float uFog;      // 0..1 white-out while the camera passes through the cloud

const float F  = 2.2;      // focal length: a long lens stacks the ridges
const float ZC = 5.6;      // depth of the coast, the first ridge
const float ZF = 30.0;     // depth of the summit ridge
const int   NL = 11;
float gTitle = 0.0;        // how much of this pixel is title, kept out of the grade

// ---------- noise ----------
float hash11(float p) { p = fract(p * 0.1031); p *= p + 33.33; p *= p + p; return fract(p); }
float hash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float vnoise1(float x) {
  float i = floor(x), f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(hash11(i), hash11(i + 1.0), f);
}
float vnoise2(vec2 x) {
  vec2 i = floor(x), f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x),
             mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm1(float x) {
  float a = 0.5, s = 0.0;
  for (int i = 0; i < 4 + uZero; i++) { s += a * vnoise1(x); x = x * 2.03 + 17.13; a *= 0.5; }
  return s / 0.9375;
}
float fbm2(vec2 x) {
  float a = 0.5, s = 0.0;
  for (int i = 0; i < 4 + uZero; i++) { s += a * vnoise2(x); x = x * 2.02 + vec2(11.7, 5.3); a *= 0.5; }
  return s / 0.9375;
}
float ridged(float x) { return 1.0 - abs(2.0 * vnoise1(x) - 1.0); }
float puffs(float x)  { return abs(2.0 * vnoise1(x) - 1.0); }   // round tops, sharp creases

// three-way blend across the day: night, sunrise, day
vec3 tod(vec3 n, vec3 s, vec3 d) {
  float wN = 1.0 - smoothstep(0.0, 0.5, uDay);
  float wD = smoothstep(0.5, 1.0, uDay);
  return n * wN + s * (1.0 - wN - wD) + d * wD;
}

// ---------- sky ----------
float glowAmount() {
  return mix(0.50, 1.0, smoothstep(0.0, 0.42, uDay)) * mix(1.0, 0.50, smoothstep(0.62, 1.0, uDay));
}
vec3 sunTint() {
  return mix(vec3(1.00, 0.60, 0.26), vec3(1.00, 0.86, 0.56), smoothstep(0.12, 0.9, uDay));
}

vec3 skyBase(float e) {
  float t = clamp(e / 0.60, 0.0, 1.0);
  vec3 top = tod(vec3(0.004, 0.016, 0.055), vec3(0.010, 0.120, 0.410), vec3(0.008, 0.380, 0.870));
  vec3 mid = tod(vec3(0.010, 0.075, 0.230), vec3(0.012, 0.420, 0.900), vec3(0.120, 0.560, 0.970));
  vec3 hor = tod(vec3(0.030, 0.230, 0.580), vec3(0.560, 0.760, 0.980), vec3(0.760, 0.890, 1.000));
  return mix(mix(hor, mid, smoothstep(0.0, 0.40, t)), top, smoothstep(0.26, 1.0, t));
}

// Gradient plus the sun's glow. stretch > 1 smears the glow vertically (for the sea).
// Warm light is added, never mixed toward: blue plus gold stays luminous instead of going grey.
vec3 skyGlow(vec2 k, float stretch) {
  float e = max(k.y, 0.0);
  vec3 col = skyBase(e);
  float dist = length(vec2(k.x - uSun.x, (k.y - uSun.y) / stretch));
  vec3 tint = sunTint();
  float g = glowAmount();
  float band = exp(-e * 9.0) * exp(-pow((k.x - uSun.x) / 0.46, 2.0));
  col += tint * band * 0.72 * g;
  // the glow round the sun: wide and warm
  col += tint * (exp(-dist * 2.5) * 0.42 + exp(-dist * 8.5) * 0.72) * g;
  // bloom just outside the disc, so it reads as a light as well as a shape
  col += tint * exp(-max(dist - uSunR, 0.0) * 26.0) * 0.55 * g;
  return col;
}

// colour of far air at a given bearing: what distance fades into
vec3 hazeColor(float kx) {
  vec3 col = skyBase(0.05);
  float near = exp(-pow((kx - uSun.x) / 0.36, 2.0));
  return col + sunTint() * near * glowAmount() * 0.42;
}

vec3 skyColor(vec2 k, float stretch) {
  float e = max(k.y, 0.0);
  vec3 col = skyGlow(k, stretch);
  float dist = length(vec2(k.x - uSun.x, (k.y - uSun.y) / stretch));
  vec3 tint = sunTint();
  float g = glowAmount();

  if (stretch < 1.5) {
    // long thin cloud, lit from underneath
    vec2 cq = vec2(k.x * 1.05 + uTime * 0.004, k.y * 11.0 + 2.0);
    float c = fbm2(cq);
    float m = smoothstep(0.52, 0.70, c) * smoothstep(0.10, 0.20, e) * (1.0 - smoothstep(0.30, 0.52, e));
    float under = smoothstep(0.52, 0.66, fbm2(cq + vec2(0.0, 0.55)));
    float lit = exp(-pow((k.x - uSun.x) / 0.80, 2.0)) * g;
    vec3 body = skyBase(e + 0.20) * tod(vec3(1.25), vec3(0.92), vec3(1.30));
    vec3 cc = body + mix(tint, vec3(1.0), 0.30) * lit * (0.40 + 0.40 * (1.0 - under));
    cc = mix(cc, vec3(1.0), smoothstep(0.72, 1.0, uDay) * 0.55);
    col = mix(col, cc, m * 0.52);

    // stars, gone by first light
    float sv = 1.0 - smoothstep(0.10, 0.44, uDay);
    if (sv > 0.0) {
      vec2 gcell = k * 82.0;
      vec2 id = floor(gcell);
      float h = hash21(id);
      vec2 o = vec2(hash21(id + 3.1), hash21(id + 7.7)) - 0.5;
      float r = length(fract(gcell) - 0.5 - o * 0.6);
      float tw = 0.70 + 0.30 * sin(uTime * (0.6 + h * 1.7) + h * 40.0);
      float star = step(0.962, h) * smoothstep(0.085, 0.0, r) * tw;
      col += vec3(0.80, 0.90, 1.0) * star * sv * smoothstep(0.14, 0.36, e) * 0.9;
    }
  }

  // the disc: crisp and flat, a shape before it is a light
  float px = 1.5 / (uRes.y * 0.5 * F);
  float disc = smoothstep(uSunR + px, uSunR - px, dist);
  float grad = clamp((k.y - uSun.y) / uSunR * 0.5 + 0.5, 0.0, 1.0);
  vec3 sunCol = mix(mix(vec3(1.00, 0.62, 0.22), vec3(1.00, 0.86, 0.52), grad),
                    vec3(1.00, 0.98, 0.90), smoothstep(0.35, 1.0, uDay));
  // as the disc opens at the end of the flight it becomes the colour of the page it turns into
  sunCol = mix(sunCol, uPageBg, smoothstep(0.10, 0.70, uSunR));
  col = mix(col, sunCol, disc);
  return col;
}

// ---------- ridges ----------
// Layer i of NL. Depth grows geometrically, height with it, so each ridge looks over the last.
void layerDims(int i, out float z, out float B, out float A, out float f, out float jag) {
  float t = float(i) / float(NL - 1);
  z = ZC * pow(ZF / ZC, t);
  B = 0.0249 * pow(z, 1.64);
  A = B * 0.25 + 0.05;
  f = 5.4 / pow(z, 0.86);
  jag = mix(0.12, 1.0, pow(t, 0.9));
}

// The flight valley winds a little as it climbs. The same curve steers the camera in JS.
float meander(float z) {
  return (0.30 * sin(z * 0.50 + 0.7) + 0.16 * sin(z * 1.27 + 2.1)) * smoothstep(0.0, 4.0, z);
}
// how far inside the valley this point is, 0..1
float valley(int i, float wx, float z) {
  float w = (0.105 * z + 0.22) * (0.80 + 0.55 * hash11(float(i) * 5.1 + 1.0));
  return exp(-pow((wx - uBearing * z - meander(z)) / w, 2.0));
}

// smooth crest height, without trees
float ridgeH(int i, float wx, float z, float B, float A, float f, float jag) {
  float seed = float(i) * 37.7 + 3.0;
  float x = wx * f + seed;
  float soft = (fbm1(x) - 0.5) * 2.0;
  float sharp = pow(ridged(x * 0.83 + 11.0), 1.5) * (0.62 + 0.38 * ridged(x * 2.31 + 5.0)) - 0.42;
  float h = B + A * mix(soft * 0.95, sharp * 1.75, jag);
  h += A * 0.07 * (vnoise1(x * 7.3) - 0.5) + A * 0.022 * (vnoise1(x * 26.0) - 0.5);
  // the valley the camera flies up, ending in the pass where first light shows
  float ff = i == NL - 1 ? 0.75 : 0.64 + 0.15 * hash11(float(i) * 9.7 + 4.0);
  float floorH = ff * B + A * 0.12 * (vnoise1(x * 3.1) - 0.5);
  h = mix(h, min(h, floorH), valley(i, wx, z));
  return h;
}

// conifers along the near crests
float treeH(int i, float wx) {
  float seed = float(i) * 37.7 + 3.0;
  float tf = 30.0 - float(i) * 5.0;
  float cell = floor(wx * tf);
  float tt = abs(fract(wx * tf) - 0.5) * 2.0;
  float keep = step(0.26, hash11(cell + seed));
  return pow(1.0 - tt, 1.3) * (0.014 + 0.030 * hash11(cell * 1.7 + seed)) * keep * (1.0 - float(i) * 0.16);
}

vec3 cloudLit()   { return tod(vec3(0.085, 0.210, 0.470), vec3(1.000, 0.975, 0.940), vec3(1.000, 1.000, 1.000)); }
vec3 cloudShade() { return tod(vec3(0.028, 0.085, 0.240), vec3(0.400, 0.590, 0.930), vec3(0.560, 0.740, 0.970)); }

vec3 layerTone(int i) {
  float t = float(i) / float(NL - 1);
  vec3 near = tod(vec3(0.006, 0.020, 0.058), vec3(0.008, 0.060, 0.170), vec3(0.016, 0.200, 0.470));
  vec3 far  = tod(vec3(0.024, 0.130, 0.360), vec3(0.170, 0.400, 0.780), vec3(0.380, 0.620, 0.920));
  return mix(near, far, pow(t, 0.85));
}
float airAt(float dz) { return (1.0 - exp(-dz * mix(0.030, 0.020, uDay))) * 0.78; }

vec3 layerColor(int i, float wx, float wy, float h, float dz, vec2 k, float z, float B, float A, float f, float jag, float px) {
  float t = float(i) / float(NL - 1);
  float below = max(h - wy, 0.0);
  vec3 col = layerTone(i);
  float sunNear = exp(-pow((k.x - uSun.x) / 0.34, 2.0));
  float sunUp = smoothstep(0.30, 0.62, uDay);

  // Each peak has a face toward the sun and a face away from it. The dividing line runs down
  // from the summit at a slant, as it does in every mountain drawing since woodblock prints.
  // The split fades out down the slope so it never becomes a stripe across the whole face.
  float reach = exp(-below / (A * 0.85 + 0.05));
  float xs = wx + below * 0.62;
  float e = 0.06 / f;
  // the two samples of the slope in a loop: one copy of the ridge for the compiler, not two
  float hs2[2];
  for (int j = 0; j < 2 + uZero; j++) hs2[j] = ridgeH(i, xs + (j == 0 ? e : -e), z, B, A, f, jag);
  float slope = (hs2[0] - hs2[1]) / (2.0 * e);
  float lit = mix(0.5, smoothstep(0.30, -0.30, slope / (A * f + 0.05)), reach);
  float contrast = mix(0.10, 0.34, sunUp) * mix(0.35, 1.0, t);
  col *= 1.0 - contrast * (1.0 - lit);
  vec3 lightCol = mix(sunTint(), vec3(1.0), smoothstep(0.6, 1.0, uDay));
  col += lightCol * lit * contrast * 0.50 * mix(0.6, 1.0, t);

  // the working land of the lower mountain: woods in patches, and the stone terraces
  if (i < 7) {
    float woods = smoothstep(0.50, 0.62, vnoise2(vec2(wx * f * 2.4 + float(i) * 3.1, wy * 1.7 / (A + 0.2))));
    col *= 1.0 - 0.20 * woods;
    float th = 0.030 * B + 0.012;
    float ty = (wy + 0.10 * A * vnoise1(wx * f * 2.2 + float(i))) / th;
    float line = smoothstep(0.0, 0.16, fract(ty)) * (1.0 - smoothstep(0.84, 1.0, fract(ty)));
    float show = clamp(th / (px * 5.0) - 0.4, 0.0, 1.0) * (1.0 - woods);   // only where there are pixels for it
    col *= 1.0 - 0.10 * (1.0 - line) * show;
  }

  // snow on the high ridges: fields with torn edges, bright on the lit face, blue in shade
  if (i >= NL - 5) {
    float up = float(i - (NL - 5)) / 4.0;
    float line = B + A * mix(0.75, -0.75, up);
    float n2 = fbm2(vec2(wx * f * 3.4 + float(i) * 3.0, wy * 2.4 / (A + 0.3)));
    float se = max(px * 1.6, 0.006);   // edges stay sharp however close the camera comes
    float snow = smoothstep(-se, se, wy - line + (n2 - 0.5) * A * 1.5) * mix(0.50, 0.97, up);
    // hatch of gullies through the snow, running down the slope
    float hatch = pow(ridged((wx + below * 0.55) * f * 4.1 + float(i) * 2.0), 5.0);
    snow *= 1.0 - 0.45 * hatch * smoothstep(0.02, 0.25, below / (A + 0.1));
    vec3 sl = tod(vec3(0.160, 0.320, 0.640), vec3(1.000, 0.930, 0.820), vec3(1.000, 1.000, 1.000));
    vec3 sd = tod(vec3(0.090, 0.210, 0.480), vec3(0.420, 0.580, 0.900), vec3(0.640, 0.790, 0.980));
    col = mix(col, mix(sd, sl, lit), snow);
  }

  // village lights before dawn on the low slopes, gathered into towns
  if (i < 4) {
    float lv = 1.0 - smoothstep(0.14, 0.42, uDay);
    if (lv > 0.0) {
      float dens = 30.0 - float(i) * 4.0;
      vec2 gcell = vec2(wx * dens, wy * dens * 1.8);
      vec2 id = floor(gcell);
      float hh = hash21(id + float(i) * 13.0);
      vec2 o = vec2(hash21(id + 1.3), hash21(id + 9.1)) - 0.5;
      float r = length((fract(gcell) - 0.5 - o * 0.7) * vec2(1.0, 1.5));
      float town = smoothstep(0.52, 0.80, vnoise2(vec2(wx * 1.3 + float(i) * 4.0, wy * 5.0 / B)));
      float low = 1.0 - smoothstep(0.10, 0.80, wy / B);
      float city = i == 0 ? 0.42 * (1.0 - smoothstep(0.0, 0.11, wy)) * smoothstep(0.3, 0.7, vnoise1(wx * 0.7 + 2.0)) : 0.0;
      float on = step(1.0 - 0.50 * town * low - city - 0.006, hh);
      float tw = 0.75 + 0.25 * sin(uTime * (1.0 + hh * 2.0) + hh * 50.0);
      float size = 0.17 * clamp(dz / 6.0, 0.25, 1.0);   // stay a point however close we come
      float l = on * smoothstep(size, size * 0.15, r) * tw * step(0.015, below);
      col += vec3(1.00, 0.72, 0.36) * l * lv * 1.5;
    }
  }

  // light spilling over the crest from behind, only where the sun actually is
  float rim = exp(-below / (0.008 * dz + 0.010)) * sunNear * glowAmount() * (1.0 - 0.6 * sunUp);
  col += sunTint() * rim * 0.80;

  // Cloud banked against the foot of the ridge. Before sunrise it is a low blue mist; once the
  // camera is above it, it is the sea of cloud the peaks stand in, with rounded, sunlit tops.
  if (i > 0) {
    float cx = wx * f * 1.2 + float(i) * 7.3 + uTime * 0.006 * (1.0 + float(i) * 0.15);
    float puff = puffs(cx) * 0.60 + puffs(cx * 2.7 + 3.0) * 0.27 + puffs(cx * 6.3 + 9.0) * 0.13;
    float level = mix(0.30, 0.56, uDeck) + 0.10 * (hash11(float(i) + 2.0) - 0.5);
    float topY = B * (level + (puff - 0.5) * mix(0.14, 0.24, uDeck));
    float soft = mix(0.20 * B + 0.008, max(px * 2.0, 0.004 * B), uDeck);
    float bank = smoothstep(topY + soft, topY - soft, wy);
    if (bank > 0.0) {
      float depth = clamp((topY - wy) / (0.24 * B + 0.04), 0.0, 1.0);
      vec3 lc = cloudLit() + sunTint() * sunNear * glowAmount() * 0.14;
      vec3 bc = mix(lc, cloudShade(), smoothstep(0.0, 1.0, depth) * 0.82);
      // a second row of billows lower down gives the bank a body
      float top2 = topY - (0.09 + 0.15 * puffs(cx * 1.9 + 17.0)) * B;
      float crest2 = exp(-max(top2 - wy, 0.0) / (0.050 * B + 0.01)) * smoothstep(px * 1.5, -px * 1.5, wy - top2);
      bc += (lc - cloudShade()) * crest2 * 0.42 * uDeck;
      float top3 = top2 - (0.10 + 0.16 * puffs(cx * 1.3 + 41.0)) * B;
      float crest3 = exp(-max(top3 - wy, 0.0) / (0.060 * B + 0.01)) * smoothstep(px * 1.5, -px * 1.5, wy - top3);
      bc += (lc - cloudShade()) * crest3 * 0.34 * uDeck;
      col = mix(col, bc, bank * mix(mix(0.42, 0.70, t), 0.97, uDeck));
    }
  }

  // air: distance takes the colour of the horizon
  col = mix(col, hazeColor(k.x), airAt(dz));
  return col;
}

// A stand of cedars on a crest: the silhouette every Lebanese knows.
float cedars(int i, float wx, float wy, float z, float B, float A, float f, float jag, float px) {
  float sp = 1.0 + float(i) * 0.50;        // spacing along the ridge
  float cellf = wx / sp;
  float acc = 0.0;
  for (int n = -1; n <= 1 + uZero; n++) {
    float cell = floor(cellf) + float(n);
    float r = hash11(cell * 7.3 + float(i) * 31.0);
    if (r < 0.50) continue;
    float cx = (cell + 0.2 + 0.6 * hash11(cell + float(i) * 3.0)) * sp;
    if (valley(i, cx, z) > 0.30) continue; // keep the flight line clear
    float hgt = (0.20 + 0.16 * hash11(cell * 3.1 + 9.0)) * (0.55 + float(i) * 0.22);
    float base = ridgeH(i, cx, z, B, A, f, jag) - hgt * 0.08;
    vec2 uv = vec2((wx - cx) / hgt + 0.5, (wy - base) / hgt);
    if (uv.x > 0.0 && uv.x < 1.0 && uv.y > 0.0 && uv.y < 1.0) {
      acc = max(acc, textureLod(uCedar, uv, max(0.0, log2(512.0 * px / hgt))).r);
    }
  }
  return acc;
}

// The Pigeon Rocks of Raouche stand in the water close to the camera.
const float ZR = 2.5;
// Seen from the sea: the slender spire on the left, and on the right the big rock, about as tall
// as it is wide, with its arch on the side that faces the spire. Proportions follow photographs.
// returns coverage; edge receives how close this point is to the lit side (0..1)
float rockMask(float wx, float wy, float px, out float edge) {
  // the big rock
  const float H = 0.38;
  float u = wx - 0.10;
  float yn = clamp(wy / H, 0.0, 1.0);
  float sideN = u > 0.0 ? 1.0 : 0.0;
  float hw = 0.20 * (1.0 + 0.06 * (1.0 - yn) + 0.045 * sin(yn * 3.1416))
           - 0.012 * exp(-pow((wy - 0.012) / 0.012, 2.0))            // the notch the waves cut
           + 0.007 * (vnoise1(wy * 38.0 + sideN * 9.0) - 0.5);       // eroded walls
  float top = H * (0.85 + 0.15 * smoothstep(-0.15, 0.10, u))
            - H * 0.15 * pow(clamp(abs(u - 0.03) / 0.21, 0.0, 1.0), 3.2) // a domed, rounded crown
            + 0.010 * vnoise1(u * 55.0) + 0.006 * vnoise1(u * 140.0); // scrub on top
  float big = smoothstep(-px, px, hw - abs(u)) * smoothstep(-px, px, top - wy);
  // the arch: straight legs and a round head, a little ragged
  float ax = u + 0.074 + 0.005 * (vnoise1(wy * 45.0) - 0.5);
  float aw = 0.054, ah = 0.182, ar = aw * 1.1;
  float f = length(vec2(ax / aw, max(wy - (ah - ar), 0.0) / ar)) - 1.0;
  big *= smoothstep(-px, px, f * aw);

  // the spire, leaning a little toward its neighbour
  const float HS = 0.335;
  float v = wx + 0.265;
  float ys = clamp(wy / HS, 0.0, 1.0);
  float lean = 0.026 * ys * ys;
  float vs = v - lean;
  float hs = 0.088 * (1.0 - 0.44 * pow(ys, 1.7))
           - 0.008 * exp(-pow((wy - 0.010) / 0.010, 2.0))
           + 0.006 * (vnoise1(wy * 42.0 + (vs > 0.0 ? 4.0 : 0.0)) - 0.5);
  float topS = HS * (1.0 - 0.55 * pow(clamp(abs(vs) / 0.06, 0.0, 1.0), 2.0)) + 0.008 * vnoise1(v * 70.0);
  float spire = smoothstep(-px, px, hs - abs(vs)) * smoothstep(-px, px, topS - wy);

  // the sun is to the right: right-hand edges and tops catch it
  float e1 = max(smoothstep(0.86, 1.0, u / max(hw, 0.01)), smoothstep(0.94, 1.0, wy / max(top, 0.01)) * 0.6);
  float e2 = max(smoothstep(0.78, 1.0, vs / max(hs, 0.01)), smoothstep(0.92, 1.0, wy / max(topS, 0.01)) * 0.6);
  float flick = 0.6 + 0.4 * vnoise1(wy * 60.0);                     // light catches the ledges, not a smooth band
  e1 *= flick;
  e2 *= flick;
  edge = big > spire ? e1 : e2;
  return max(big, spire);
}
bool rockBox(float wx, float wy) { return wy < 0.42 && wy > -0.01 && wx > -0.38 && wx < 0.33; }

vec3 rockColor(float wx, float wy, vec2 k, float edge) {
  float tex = vnoise2(vec2(wx * 14.0, wy * 30.0));
  vec3 c = tod(vec3(0.003, 0.010, 0.030), vec3(0.016, 0.055, 0.140), vec3(0.300, 0.400, 0.560));
  c *= 0.80 + 0.40 * tex;
  c *= 0.90 + 0.10 * sin(wy * 210.0 + vnoise1(wx * 9.0) * 5.0);   // strata of the limestone
  // the side toward the sun picks up the sky
  c += hazeColor(k.x) * edge * 0.50;
  return c;
}

// Everything above the water, for a ray leaving (ox, oy) at the camera's depth with slopes k.
vec3 scene(float ox, float oy, vec2 k, float stretch, bool reflected) {
  vec3 acc = vec3(0.0);
  float alpha = 0.0;

  float dzr = ZR - uCam.z;
  if (dzr > 0.04) {
    float wx = ox + k.x * dzr, wy = oy + k.y * dzr;
    if (rockBox(wx, wy)) {
      float edge;
      float m = rockMask(wx, wy, dzr / (uRes.y * 0.5 * F), edge) * smoothstep(0.04, 0.6, dzr);
      if (m > 0.0) {
        acc += m * rockColor(wx, wy, k, edge);
        alpha += m;
      }
    }
  }

  for (int i = 0; i < NL + uZero; i++) {
    if (alpha > 0.995) break;
    float z, B, A, f, jag;
    layerDims(i, z, B, A, f, jag);

    // the title stands in the air in front of the last three ridges
    if (i == NL - 3 && uTitleA > 0.0 && !reflected) {
      float dzt = uTitleZ - uCam.z;
      if (dzt > 0.5) {
        vec2 w = vec2(ox + k.x * dzt, oy + k.y * dzt);
        vec2 uv = (w - uTitleRect.xy) / (uTitleRect.zw - uTitleRect.xy);
        // a bank of mist drifts just in front of it and takes the feet of the letters, so the
        // words are plainly inside the landscape and not laid over it
        if (uv.x > -0.15 && uv.x < 1.15 && uv.y > -0.25 && uv.y < 0.42) {
          float mx = w.x * 0.19 + uTime * 0.012;
          float top = 0.05 + 0.15 * (puffs(mx) * 0.62 + puffs(mx * 2.6 + 3.0) * 0.38);
          float mist = smoothstep(top + 0.05, top - 0.08, uv.y) * smoothstep(-0.25, -0.05, uv.y);
          mist *= smoothstep(-0.15, 0.05, uv.x) * (1.0 - smoothstep(0.95, 1.15, uv.x)) * uTitleA;
          if (mist > 0.0) {
            float sn = exp(-pow((k.x - uSun.x) / 0.5, 2.0));
            vec3 mc = mix(cloudShade(), cloudLit(), 0.62 + 0.3 * smoothstep(top - 0.10, top, uv.y)) + sunTint() * sn * glowAmount() * 0.16;
            mc = mix(mc, hazeColor(k.x), airAt(dzt) * 0.6);
            float ma = mist * 0.90;
            acc += (1.0 - alpha) * ma * mc;
            alpha += (1.0 - alpha) * ma;
          }
        }
        if (uv.x > 0.0 && uv.x < 1.0 && uv.y > 0.0 && uv.y < 1.0) {
          float lod = max(0.0, log2(2048.0 * dzt / (uRes.y * 0.5 * F) / (uTitleRect.z - uTitleRect.x)));
          float a = textureLod(uTitle, uv, lod).r * uTitleA;
          gTitle = (1.0 - alpha) * a;
          acc += (1.0 - alpha) * a * vec3(1.0);
          alpha += (1.0 - alpha) * a;
        }
      }
    }

    float dz = z - uCam.z;
    if (dz < 0.06) continue;
    float wx = ox + k.x * dz;
    float wy = oy + k.y * dz;
    float maxH = B + A * 1.35 + 0.60;
    if (wy > maxH) continue;                // above anything this ridge can reach
    float h = ridgeH(i, wx, z, B, A, f, jag);
    float px = dz / (uRes.y * 0.5 * F);
    float crest = h + (i < 4 ? treeH(i, wx) : 0.0);
    float cover = smoothstep(-px, px, crest - wy);
    float tree = 0.0;
    if (i >= 3 && i <= 8 && wy > h - 0.06 && wy < h + 0.90) {
      tree = cedars(i, wx, wy, z, B, A, f, jag, px) * (1.0 - cover);
    }
    if (cover + tree <= 0.0) continue;
    float pass = smoothstep(0.06, 1.1, dz);                 // dissolve as the lens passes over
    vec3 c = layerColor(i, wx, wy, h, dz, k, z, B, A, f, jag, px);
    // cedars are silhouettes: the ridge's own shadow tone, a breath of green by day
    vec3 tc = mix(layerTone(i) * 0.60, hazeColor(k.x), airAt(dz));
    tc = mix(tc, tc * vec3(0.55, 1.05, 0.80), smoothstep(0.5, 1.0, uDay) * 0.7);
    float a = (cover + tree) * pass;
    c = mix(c, tc, tree / max(cover + tree, 1e-4));
    acc += (1.0 - alpha) * a * c;
    alpha += (1.0 - alpha) * a;
  }

  if (alpha < 0.995) acc += (1.0 - alpha) * skyColor(k, stretch);
  return acc;
}

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / (0.5 * uRes.y);
  vec2 k = vec2(p.x, p.y - uHy) / F;

  vec3 col;
  float wyCoast = uCam.y + k.y * (ZC - uCam.z);
  bool water = uCam.z < ZC && wyCoast < 0.0;
  if (water) {
    // the rocks stand in front of the water
    float dzr = ZR - uCam.z;
    if (dzr > 0.04) {
      float rx = uCam.x + k.x * dzr, ry = uCam.y + k.y * dzr;
      if (ry > 0.0 && rockBox(rx, ry)) {
        float edge;
        if (rockMask(rx, ry, dzr / (uRes.y * 0.5 * F), edge) * smoothstep(0.04, 0.6, dzr) > 0.5) water = false;
      }
    }
  }

  // The land, seen directly or reflected in the water: one call to the scene either way (a second
  // call site would be a whole second copy of the landscape for the shader compiler).
  float t = 0.0, wxh = 0.0, zh = 0.0, rip = 0.0;
  vec2 kr = k;
  if (water) {
    t = uCam.y / max(-k.y, 1e-4);           // distance to where the ray meets the sea
    wxh = uCam.x + k.x * t;
    zh = uCam.z + t;
    // two trains of ripples moving against each other, and a slow swell
    vec2 q = vec2(wxh * 4.6, zh * 20.0);
    float r1 = vnoise2(q + vec2(uTime * 0.28, uTime * 0.52)) - 0.5;
    float r2 = vnoise2(q * 2.9 - vec2(uTime * 0.20, uTime * 0.38)) - 0.5;
    float swell = sin(zh * 3.1 - uTime * 0.42 + wxh * 0.4) * 0.5;
    rip = r1 + 0.5 * r2;
    kr = vec2(k.x + rip * 0.014, max(-k.y + rip * 0.030 + swell * 0.004, 0.0015));
  }
  vec3 seen = scene(uCam.x, water ? -uCam.y : uCam.y, kr, water ? 3.4 : 1.0, water);
  if (!water) {
    col = seen;
  } else {
    vec3 refl = seen;

    float graze = clamp(-k.y / 0.34, 0.0, 1.0);
    float fres = mix(0.22, 0.97, pow(1.0 - graze, 2.4));
    vec3 deep = tod(vec3(0.003, 0.014, 0.046), vec3(0.006, 0.070, 0.200), vec3(0.012, 0.250, 0.580));
    col = mix(deep, refl, fres);

    // glitter on the road to the sun
    float path = exp(-pow((k.x - uSun.x) / (0.040 + 0.19 * graze), 2.0));
    float spark = pow(clamp(rip * 1.9 + 0.52, 0.0, 1.0), 7.0);
    col += sunTint() * spark * path * glowAmount() * 0.9;
    // a pale line where the sea meets the land
    float shore = smoothstep(ZC - 0.07, ZC - 0.004, zh);
    col = mix(col, hazeColor(k.x) * 1.15, shore * 0.30);
  }

  // inside the cloud everything goes to bright, soft white
  vec3 fogCol = mix(cloudShade(), cloudLit(), 0.90) + sunTint() * 0.14 * exp(-pow((k.x - uSun.x) / 0.8, 2.0));
  float fogN = 0.94 + 0.06 * vnoise2(p * 1.6 + vec2(uTime * 0.05, uCam.z * 0.8));
  col = mix(col, fogCol * fogN, uFog);

  // grade: the title stays clean white, the picture falls off toward the corners
  float vig = 1.0 - 0.30 * pow(clamp(length(p * vec2(0.50, 0.78)), 0.0, 1.4), 2.4);
  col *= mix(vig, 1.0, max(max(gTitle * (1.0 - uFog), uWash), max(uFog, smoothstep(0.10, 0.60, uSunR))));
  col = mix(col, uPageBg, uWash);
  col *= uIntro;
  // dither against banding in the long gradients
  col += (hash21(gl_FragCoord.xy + fract(uTime) * 61.0) - 0.5) / 255.0 * 1.6;
  fragColor = vec4(col, 1.0);
}
`;
