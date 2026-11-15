// "Dawn over Lebanon", realistic version.
// A real 3D scene, raymarched per pixel: a heightfield for Mount Lebanon (coast, foothills, a
// valley climbing to a pass, snow on the crest), an ocean with moving waves that reflects the sky
// and the land, a sky with a low sun and its scattering, mist lying against the mountain, and a
// slab of cloud the camera climbs through. World units are kilometres: x north-south, y up,
// z east. The sea is y = 0, the coast is near z = 0, the crest is about 27 km inland.
// It renders at a reduced internal resolution and is stretched to the screen, which is what keeps
// it smooth on an integrated GPU.

export const DAWN_REAL_FRAG = `#version 300 es
precision highp float;
out vec4 fragColor;

uniform vec2  uRes;
uniform float uTime;
uniform vec3  uCamPos;
uniform vec3  uCamTar;
uniform float uFocal;
uniform vec3  uSunDir;     // normalised
uniform float uDay;        // 0 twilight .. 1 full morning: sky brightness and haze
uniform float uSunR;       // angular radius of the disc, in radians
uniform float uWash;
uniform vec3  uPageBg;
uniform float uIntro;
uniform float uFrame;
uniform float uCover;      // how much of the low cloud has formed, 0..1
uniform sampler2D uNoise;  // 256x256 random values, repeating
uniform sampler2D uTitle;
uniform vec4  uTitleRect;  // world x0, y0, x1, y1 on the plane z = uTitleZ
uniform float uTitleZ;
uniform float uTitleA;

const float CB = 1.02;     // cloud base, km
const float CT = 1.46;     // cloud top, km
const float FAR = 90.0;

// ---------- noise from a texture: one fetch per octave ----------
float n2(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return textureLod(uNoise, (i + u + 0.5) / 256.0, 0.0).r;
}
float n2g(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return textureLod(uNoise, (i + u + 0.5) / 256.0, 0.0).g;
}
// The single-fetch trick above leans on the GPU's own bilinear filter, which only has 8 bits of
// position. For the big, slow octaves that shows up as contour lines on the land, so those use
// four exact fetches and interpolate in full precision.
float n2x(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  ivec2 ip = ivec2(i);
  float a = texelFetch(uNoise, ip & 255, 0).r;
  float b = texelFetch(uNoise, (ip + ivec2(1, 0)) & 255, 0).r;
  float c = texelFetch(uNoise, (ip + ivec2(0, 1)) & 255, 0).r;
  float d = texelFetch(uNoise, (ip + ivec2(1, 1)) & 255, 0).r;
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
const mat2 ROT = mat2(0.8, -0.6, 0.6, 0.8);

// ---------- the land ----------
// the valley the camera flies up; the same curve steers the camera in JS
float valleyX(float z) { return 0.9 * sin(z * 0.21 + 0.4) + 0.45 * sin(z * 0.53 + 1.3); }
float envelope(float z) {
  float e = pow(smoothstep(-0.3, 25.0, z), 1.25);
  return e * (1.0 - 0.5 * smoothstep(27.5, 44.0, z));
}
float valleyFloor(float z) { return envelope(z) * 1.8 + 0.012; }

float ridged(vec2 p, int oct) {
  float a = 0.5, s = 0.0, w = 0.0;
  for (int i = 0; i < 9; i++) {
    if (i >= oct) break;
    float n = 1.0 - abs(2.0 * (i < 4 ? n2x(p) : n2(p)) - 1.0);
    s += a * n * n;
    w += a;
    p = ROT * p * 2.03 + 7.1;
    a *= 0.47;
  }
  return s / w;
}

float terrain(vec2 p, int oct) {
  // p = (x, z)
  float zc = p.y - 1.6 * (n2x(vec2(p.x * 0.11, 3.7)) - 0.5);  // a coast that wanders
  float e = envelope(zc);
  float r = ridged(p * 0.085 + vec2(3.1, 7.7), oct);
  float big = n2x(p * 0.03 + 11.0);
  // the range runs the whole length of the coast: every stretch of it is high, some higher
  float h = e * (0.85 + 2.7 * r * (0.78 + 0.42 * big));
  h += smoothstep(0.0, 1.5, zc) * 0.025;                       // the coastal plain stands a little above the sea
  float g = exp(-pow((p.x - valleyX(p.y)) / (0.55 + 0.035 * max(p.y, 0.0)), 2.0));
  h = mix(h, min(h, valleyFloor(zc) + 0.14 * (r - 0.4)), g);
  h -= smoothstep(0.25, -2.5, zc) * 0.5;                       // the sea bed falls away
  return h;
}

// march the heightfield; returns distance or -1
float marchTerrain(vec3 ro, vec3 rd, float tmax, int oct, int steps, float stepK) {
  float t = 0.02;
  // out at sea there is nothing to hit before the coast, so start there
  if (ro.z < -1.0 && rd.z > 1e-4) t = max(t, (-1.0 - ro.z) / rd.z);
  if (t > tmax) return -1.0;                                   // the sea is nearer than the coast
  float lastD = 0.0, lastT = t;
  for (int i = 0; i < 140; i++) {
    if (i >= steps) break;
    vec3 p = ro + rd * t;
    if (p.y > 4.6 && rd.y > 0.0) return -1.0;                  // above every summit and climbing
    float d = p.y - terrain(p.xz, oct);
    if (d < 0.0004 * t + 0.0006) {
      // the ray is at or under the ground: close in on the surface by halving the interval,
      // so far silhouettes come out as clean as near ones
      float a = lastT, b = t;
      for (int j = 0; j < 6; j++) {
        float m = 0.5 * (a + b);
        vec3 q = ro + rd * m;
        if (q.y - terrain(q.xz, oct) < 0.0) b = m; else a = m;
      }
      return 0.5 * (a + b);
    }
    lastD = d;
    lastT = t;
    // steps lengthen with distance, or the far range would never be reached
    t += max(d * stepK, 0.02 * t + 0.003);
    if (t > tmax) return -1.0;
  }
  return -1.0;
}

vec3 terrainNormal(vec2 p, float t) {
  float e = max(0.004, 0.0009 * t);
  float h0 = terrain(p, 8);
  float hx = terrain(p + vec2(e, 0.0), 8);
  float hz = terrain(p + vec2(0.0, e), 8);
  return normalize(vec3(h0 - hx, e, h0 - hz));
}

float sunShadow(vec3 p) {
  if (uSunDir.y < -0.02) return 0.0;
  // The sun is low and behind the range, so most shadows are thrown by ridges many kilometres
  // away. Check the sun ray against the land at a few fixed distances inland first.
  if (uSunDir.z > 0.05) {
    for (int j = 0; j < 5; j++) {
      float zz = 12.0 + float(j) * 3.7;
      if (zz > p.z + 0.5) {
        vec3 q = p + uSunDir * ((zz - p.z) / uSunDir.z);
        if (q.y < terrain(q.xz, 3)) return 0.0;
      }
    }
  }
  float res = 1.0;
  float t = 0.05;
  for (int i = 0; i < 22; i++) {
    vec3 q = p + uSunDir * t;
    if (q.y > 4.6) break;
    float d = q.y - terrain(q.xz, 3);
    res = min(res, 9.0 * d / t);
    if (res < 0.02) break;
    t += max(d * 0.6, 0.08 + 0.05 * t);
  }
  return clamp(res, 0.0, 1.0);
}

// ---------- the sky ----------
vec3 sunColor() {
  // red on the horizon, gold a few degrees up, near white higher
  float e = clamp(uSunDir.y / 0.22, 0.0, 1.0);
  return mix(vec3(1.00, 0.36, 0.10), vec3(1.00, 0.88, 0.70), pow(e, 0.6));
}

// The sky without the sun's own glare: the blue of the air, and the band of warm light that lies
// along the horizon on the sun's side while the sun is low. This is also what distance fades to.
vec3 skyBase(vec3 rd) {
  float h = max(rd.y, 0.0);
  float day = uDay;
  vec3 zen = mix(vec3(0.004, 0.012, 0.046), vec3(0.030, 0.150, 0.480), day);
  vec3 mid = mix(vec3(0.010, 0.036, 0.118), vec3(0.120, 0.330, 0.720), day);
  vec3 hor = mix(vec3(0.028, 0.066, 0.155), vec3(0.400, 0.570, 0.820), day);
  float t = pow(h, 0.5);
  vec3 col = mix(hor, mix(mid, zen, smoothstep(0.25, 1.0, t)), smoothstep(0.0, 0.45, t));
  vec3 sunH = normalize(vec3(uSunDir.x, 0.0, uSunDir.z));
  vec3 rdH = normalize(vec3(rd.x, 0.0, rd.z) + vec3(0.0, 0.0, 1e-5));
  float azc = max(dot(sunH, rdH), 0.0);
  float lowSun = 1.0 - smoothstep(0.10, 0.32, uSunDir.y);
  col += vec3(1.00, 0.52, 0.16) * exp(-h * 8.0) * pow(azc, 4.0) * 0.30 * lowSun * mix(0.55, 1.0, day);
  col += vec3(1.00, 0.76, 0.42) * exp(-h * 18.0) * pow(azc, 9.0) * 0.60 * lowSun;
  return col;
}

vec3 skyColor(vec3 rd, bool withSun) {
  float mu = max(dot(rd, uSunDir), 0.0);
  vec3 col = skyBase(rd);
  vec3 warm = sunColor();
  // the aureole: light scattered forward round the sun
  col += warm * (pow(mu, 40.0) * 0.20 + pow(mu, 420.0) * 1.0 + pow(mu, 3200.0) * 5.0);
  if (withSun) {
    float ang = acos(clamp(dot(rd, uSunDir), -1.0, 1.0));
    float px = 1.3 / (uRes.y * 0.5 * uFocal);
    float disc = smoothstep(uSunR + px, uSunR - px, ang);
    float limb = mix(0.55, 1.0, sqrt(max(1.0 - pow(ang / max(uSunR, 1e-4), 2.0), 0.0)));
    vec3 sc = mix(warm * 26.0 * limb, uPageBg * 1.6, smoothstep(0.12, 0.60, uSunR));
    col = mix(col, sc, disc);
  }
  return col;
}

vec3 starField(vec3 rd) {
  float vis = (1.0 - smoothstep(0.10, 0.42, uDay)) * smoothstep(0.06, 0.30, rd.y);
  if (vis <= 0.0) return vec3(0.0);
  vec2 uv = vec2(atan(rd.x, rd.z), asin(clamp(rd.y, -1.0, 1.0))) * 110.0;
  vec2 id = floor(uv);
  float hsh = hash12(id);
  vec2 o = vec2(hash12(id + 3.1), hash12(id + 7.7)) - 0.5;
  float d = length(fract(uv) - 0.5 - o * 0.7);
  float s = step(0.972, hsh) * smoothstep(0.11, 0.0, d) * (0.6 + 0.4 * sin(uTime * (0.7 + hsh * 2.0) + hsh * 60.0));
  return vec3(0.80, 0.88, 1.0) * s * vis * 1.6 * (1.0 - pow(max(dot(rd, uSunDir), 0.0), 2.0));
}

// thin high cloud on a plane far above, lit from underneath by the low sun
vec3 highCloud(vec3 ro, vec3 rd, vec3 sky) {
  if (rd.y < 0.012) return sky;
  float t = (9.0 - ro.y) / rd.y;
  vec2 p = (ro.xz + rd.xz * t) * 0.045 + vec2(uTime * 0.0016, 0.0);
  float n = n2(p) * 0.55 + n2(p * 2.3 + 4.0) * 0.28 + n2(p * 5.1 + 9.0) * 0.12 + n2g(p * 11.0) * 0.05;
  float streak = n2(vec2(p.x * 0.35, p.y * 3.2) + 20.0);
  float m = smoothstep(0.60, 0.88, n * 0.7 + streak * 0.42) * smoothstep(0.012, 0.10, rd.y);
  float mu = max(dot(rd, uSunDir), 0.0);
  // the underside catches the low sun; away from it the cloud is only a little paler than the sky
  vec3 lit = sunColor() * (0.03 + 0.7 * pow(mu, 7.0)) * mix(0.8, 1.0, uDay);
  vec3 body = mix(vec3(0.030, 0.046, 0.090), vec3(0.800, 0.860, 0.960), uDay);
  vec3 c = body + lit * (0.30 + 0.70 * (1.0 - smoothstep(0.45, 0.80, n)));
  return mix(sky, c, m * 0.46);
}

// colour of the air between the eye and something t km away
vec3 applyAir(vec3 col, vec3 rd, float t) {
  float dens = mix(0.013, 0.011, uDay);
  float f = 1.0 - exp(-t * dens);
  vec3 air = skyBase(normalize(vec3(rd.x, 0.030, rd.z)));
  // looking toward the sun through a lot of air, the haze itself lights up
  float mu = max(dot(rd, uSunDir), 0.0);
  air += sunColor() * (pow(mu, 12.0) * 0.08 + pow(mu, 90.0) * 0.30) * f;
  return mix(col, air, f);
}

// ---------- surfaces ----------
vec3 shadeLand(vec3 p, vec3 rd, float t) {
  vec3 n = terrainNormal(p.xz, t);
  float slope = 1.0 - n.y;                                   // 0 flat, 1 cliff
  float alt = p.y;
  float nA = n2(p.xz * 1.7 + 2.0);
  float nB = n2g(p.xz * 6.3);
  float nC = n2(p.xz * 23.0);

  // limestone, and the red-brown earth under it
  vec3 rock = mix(vec3(0.200, 0.180, 0.150), vec3(0.330, 0.300, 0.250), nB) * (0.75 + 0.5 * nC);
  vec3 soil = mix(vec3(0.150, 0.100, 0.060), vec3(0.220, 0.170, 0.100), nA);
  // woods and maquis on the middle slopes, thinning with height and on cliffs
  float woods = smoothstep(0.42, 0.62, nA * 0.6 + n2(p.xz * 0.6 + 9.0) * 0.6)
              * (1.0 - smoothstep(1.55, 2.05, alt)) * smoothstep(0.02, 0.12, alt) * (1.0 - smoothstep(0.34, 0.52, slope));
  vec3 forest = mix(vec3(0.020, 0.045, 0.018), vec3(0.050, 0.085, 0.030), nC);
  vec3 albedo = mix(mix(soil, rock, smoothstep(0.16, 0.42, slope + nB * 0.15)), forest, woods);
  // the coastal plain: pale, built on
  albedo = mix(albedo, vec3(0.180, 0.170, 0.160), (1.0 - smoothstep(0.02, 0.09, alt)) * 0.7);
  // snow above the line, held on the gentler ground
  float snowLine = 1.95 + 0.45 * (nA - 0.5) - 0.25 * n.z;    // lower on the shaded, seaward faces
  float snow = smoothstep(snowLine - 0.12, snowLine + 0.18, alt) * (1.0 - smoothstep(0.30, 0.58, slope + (nC - 0.5) * 0.2));
  albedo = mix(albedo, vec3(0.86, 0.90, 0.96), snow);

  float ndl = max(dot(n, uSunDir), 0.0);
  float sh = ndl > 0.0 ? sunShadow(p + n * 0.01) : 0.0;
  vec3 sun = sunColor() * 5.5 * smoothstep(-0.02, 0.05, uSunDir.y);
  vec3 skyAmb = mix(vec3(0.020, 0.036, 0.085), vec3(0.230, 0.340, 0.560), uDay);
  vec3 col = albedo * (sun * ndl * sh + skyAmb * (0.45 + 0.55 * n.y));
  // light bounced back up off snow and haze
  col += albedo * sunColor() * 0.10 * uDay * clamp(0.5 - 0.5 * n.y, 0.0, 1.0);
  // snow glints toward the sun
  vec3 hv = normalize(uSunDir - rd);
  col += snow * sun * pow(max(dot(n, hv), 0.0), 24.0) * 0.18 * sh;

  // lights of towns and villages in the last of the night
  float night = 1.0 - smoothstep(0.16, 0.46, uDay);
  if (night > 0.0 && alt < 1.5) {
    vec2 g = p.xz * 26.0;
    vec2 id = floor(g);
    float hh = hash12(id);
    vec2 o = vec2(hash12(id + 1.3), hash12(id + 9.1)) - 0.5;
    float d = length(fract(g) - 0.5 - o * 0.7);
    float town = smoothstep(0.62, 0.84, n2(p.xz * 0.55 + 31.0));
    float coast = (1.0 - smoothstep(0.03, 0.16, alt)) * smoothstep(0.45, 0.75, n2(p.xz * 0.21 + 5.0));
    float low = 1.0 - smoothstep(0.25, 1.20, alt);
    float on = step(1.0 - 0.30 * town * low - 0.26 * coast, hh) * (1.0 - smoothstep(0.26, 0.44, slope));
    float size = clamp(0.012 * t, 0.10, 0.45);              // never smaller than a pixel or two
    float tw = 0.8 + 0.2 * sin(uTime * (1.0 + hh * 2.0) + hh * 40.0);
    col += vec3(1.00, 0.62, 0.26) * on * smoothstep(size, size * 0.2, d) * night * tw * 2.4 * clamp(0.25 / size, 0.4, 1.0);
  }
  return col;
}

vec3 waterNormal(vec2 p, float t) {
  // long swell plus two trains of smaller waves; the far sea is calmer on screen
  float amp = 1.0 / (1.0 + t * 0.35);
  vec2 q = p * 5.0;
  float tm = uTime * 0.35;
  vec2 e = vec2(0.03, 0.0);
  float a = n2(q + vec2(tm, tm * 0.6)) + 0.5 * n2(q * 2.7 - vec2(tm * 0.8, tm)) + 0.25 * n2g(q * 6.1 + tm);
  float ax = n2(q + e + vec2(tm, tm * 0.6)) + 0.5 * n2((q + e) * 2.7 - vec2(tm * 0.8, tm)) + 0.25 * n2g((q + e) * 6.1 + tm);
  float az = n2(q + e.yx + vec2(tm, tm * 0.6)) + 0.5 * n2((q + e.yx) * 2.7 - vec2(tm * 0.8, tm)) + 0.25 * n2g((q + e.yx) * 6.1 + tm);
  vec2 grad = vec2(ax - a, az - a) / e.x;
  return normalize(vec3(-grad.x * 0.055 * amp, 1.0, -grad.y * 0.055 * amp));
}

// what a reflected ray sees: sky, high cloud, and the dark shape of the land
vec3 reflection(vec3 p, vec3 rr, vec3 rm) {
  vec3 c = highCloud(p, rr, skyColor(rr, true));
  // the land is found along the plain mirror direction, barely ruffled, so its dark shape in the
  // water holds still instead of breaking into specks
  float t = marchTerrain(p + vec3(0.0, 0.002, 0.0), rm, 70.0, 3, 60, 0.9);
  if (t > 0.0) {
    vec3 q = p + rr * t;
    vec3 land = mix(vec3(0.012, 0.018, 0.030), vec3(0.10, 0.12, 0.13), uDay) * (0.7 + 0.6 * n2(q.xz * 2.0));
    c = applyAir(land, rr, t);
  }
  return c;
}

vec3 shadeSea(vec3 p, vec3 rd, float t) {
  vec3 n = waterNormal(p.xz, t);
  vec3 rr = reflect(rd, n);
  rr.y = abs(rr.y) + 0.002;
  rr = normalize(rr);
  // the mirror direction of a flat sea, with a quarter of the ripple: used to find the land
  vec3 calm = reflect(rd, normalize(mix(vec3(0.0, 1.0, 0.0), n, 0.25)));
  calm.y = abs(calm.y) + 0.002;
  calm = normalize(calm);
  float fres = 0.02 + 0.98 * pow(1.0 - max(dot(-rd, n), 0.0), 5.0);
  vec3 deep = mix(vec3(0.004, 0.012, 0.028), vec3(0.010, 0.060, 0.120), uDay);
  vec3 col = mix(deep, reflection(p, rr, calm), fres);
  // the sun broken up on the waves
  float sp = pow(max(dot(rr, uSunDir), 0.0), 900.0) * 30.0 + pow(max(dot(rr, uSunDir), 0.0), 60.0) * 0.5;
  col += sunColor() * sp * fres * smoothstep(-0.03, 0.03, uSunDir.y);
  return col;
}

// the Pigeon Rocks of Raouche, a little way off the bow
float sdRocks(vec3 p) {
  vec3 q = p - vec3(0.322, 0.0, -4.40);
  float bump = (n2(q.xy * 60.0 + q.z * 31.0) - 0.5) * 0.006 + (n2(q.zy * 23.0) - 0.5) * 0.010;
  // main rock: a tall block leaning slightly, flat on top
  vec3 b = q - vec3(0.0, 0.024, 0.0);
  vec3 d = abs(b) - vec3(0.036, 0.034, 0.024);
  float box = length(max(d, 0.0)) + min(max(d.x, max(d.y, d.z)), 0.0) - 0.008;
  // the arch through it, low on the seaward end
  float arch = length(vec2(q.x - 0.012, q.y) * vec2(1.0, 0.62)) - 0.0135;
  float main = max(box, -arch);
  // the smaller rock beside it
  vec3 s = q - vec3(-0.078, 0.012, 0.012);
  vec3 ds = abs(s) - vec3(0.012, 0.020, 0.010);
  float small = length(max(ds, 0.0)) + min(max(ds.x, max(ds.y, ds.z)), 0.0) - 0.006;
  return min(main, small) + bump;
}
float marchRocks(vec3 ro, vec3 rd) {
  // bounding sphere first
  vec3 c = vec3(0.303, 0.03, -4.40);
  vec3 oc = ro - c;
  float b = dot(oc, rd);
  float h = b * b - dot(oc, oc) + 0.012;
  if (h < 0.0) return -1.0;
  float t = max(-b - sqrt(h), 0.0);
  for (int i = 0; i < 40; i++) {
    float d = sdRocks(ro + rd * t);
    if (d < 0.0006) return t;
    t += d * 0.8;
    if (t > -b + sqrt(h)) break;
  }
  return -1.0;
}
vec3 shadeRocks(vec3 p, vec3 rd) {
  vec2 e = vec2(0.0012, 0.0);
  vec3 n = normalize(vec3(sdRocks(p + e.xyy) - sdRocks(p - e.xyy), sdRocks(p + e.yxy) - sdRocks(p - e.yxy), sdRocks(p + e.yyx) - sdRocks(p - e.yyx)));
  float strata = 0.85 + 0.15 * sin(p.y * 900.0 + n2(p.xz * 40.0) * 8.0);
  vec3 albedo = mix(vec3(0.240, 0.210, 0.170), vec3(0.360, 0.320, 0.260), n2(p.xy * 90.0)) * strata;
  albedo *= 0.55 + 0.45 * smoothstep(0.0, 0.012, p.y);     // wet and dark at the waterline
  float ndl = max(dot(n, uSunDir), 0.0);
  vec3 sun = sunColor() * 5.5 * smoothstep(-0.02, 0.05, uSunDir.y);
  vec3 skyAmb = mix(vec3(0.020, 0.036, 0.085), vec3(0.230, 0.340, 0.560), uDay);
  vec3 col = albedo * (sun * ndl + skyAmb * (0.45 + 0.55 * n.y));
  // light wrapping round the edges from the sun behind
  float rim = pow(1.0 - max(dot(n, -rd), 0.0), 3.0) * max(dot(rd, uSunDir), 0.0);
  col += sunColor() * rim * 0.9;
  return col;
}

// ---------- cloud ----------
float cloudDensity(vec3 p) {
  float hgt = (p.y - CB) / (CT - CB);
  float prof = smoothstep(0.0, 0.22, hgt) * (1.0 - smoothstep(0.50, 1.0, hgt));
  vec2 q = p.xz + vec2(uTime * 0.006, 0.0);
  float n = n2(q * 0.20) * 0.55 + n2(q * 0.55 + 5.0) * 0.28 + n2g(q * 1.5 + p.y * 2.0) * 0.17;
  // open sky over the sea, cloud gathering against the mountain
  float cover = mix(0.26, 0.66, smoothstep(0.5, 9.0, p.z)) * (1.0 - 0.6 * smoothstep(22.0, 30.0, p.z)) * uCover;
  return max(n - (1.0 - cover), 0.0) * prof * 4.2;
}

vec4 marchCloud(vec3 ro, vec3 rd, float tmax, float jitter) {
  // returns scattered light in rgb and transmittance in a
  float t0, t1;
  if (abs(rd.y) < 1e-4) {
    if (ro.y < CB || ro.y > CT) return vec4(0.0, 0.0, 0.0, 1.0);
    t0 = 0.0; t1 = 18.0;
  } else {
    float ta = (CB - ro.y) / rd.y, tb = (CT - ro.y) / rd.y;
    t0 = max(min(ta, tb), 0.0);
    t1 = min(max(ta, tb), tmax);
  }
  t1 = min(t1, t0 + 26.0);
  if (t1 <= t0) return vec4(0.0, 0.0, 0.0, 1.0);
  const int N = 16;
  float dt = (t1 - t0) / float(N);
  float t = t0 + dt * jitter;
  float T = 1.0;
  vec3 L = vec3(0.0);
  vec3 sunL = sunColor() * (1.6 + 2.6 * uDay) * smoothstep(-0.03, 0.06, uSunDir.y);
  vec3 amb = mix(vec3(0.030, 0.050, 0.110), vec3(0.420, 0.520, 0.700), uDay);
  float mu = max(dot(rd, uSunDir), 0.0);
  float phase = 0.55 + 1.6 * pow(mu, 6.0);                  // bright silver lining toward the sun
  for (int i = 0; i < N; i++) {
    vec3 p = ro + rd * t;
    float d = cloudDensity(p);
    if (d > 0.001) {
      float toSun = cloudDensity(p + uSunDir * 0.16) + cloudDensity(p + uSunDir * 0.42) * 0.6;
      float light = exp(-toSun * 1.7);
      float hgt = clamp((p.y - CB) / (CT - CB), 0.0, 1.0);
      vec3 c = sunL * light * phase + amb * (0.35 + 0.65 * hgt);
      float a = 1.0 - exp(-d * dt * 2.2);
      L += T * a * c;
      T *= 1.0 - a;
      if (T < 0.02) break;
    }
    t += dt;
  }
  return vec4(L, T);
}

vec3 tonemap(vec3 x) {
  // ACES fit
  x *= 0.72;
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 uv = (frag - 0.5 * uRes) / (0.5 * uRes.y);
  vec3 ro = uCamPos;
  vec3 fw = normalize(uCamTar - uCamPos);
  vec3 rt = normalize(cross(vec3(0.0, 1.0, 0.0), fw));
  vec3 up = cross(fw, rt);
  vec3 rd = normalize(uv.x * rt + uv.y * up + uFocal * fw);
  float jitter = hash12(frag + fract(uFrame * 0.618) * 71.0);

  // what is the first solid thing along this ray?
  float tSea = rd.y < -1e-4 ? -ro.y / rd.y : -1.0;
  float tmax = tSea > 0.0 ? min(tSea, FAR) : FAR;
  float tLand = marchTerrain(ro, rd, tmax, 5, 130, 0.5);
  float tRock = marchRocks(ro, rd);
  float tHit = FAR;
  int what = 0;                                              // 0 sky, 1 land, 2 sea, 3 rocks, 4 title
  if (tLand > 0.0) { tHit = tLand; what = 1; }
  else if (tSea > 0.0 && tSea < FAR) { tHit = tSea; what = 2; }
  if (tRock > 0.0 && tRock < tHit) { tHit = tRock; what = 3; }

  // the title stands in the air on a plane across the valley
  float titleA = 0.0;
  if (uTitleA > 0.0 && rd.z > 1e-4) {
    float tt = (uTitleZ - ro.z) / rd.z;
    if (tt > 0.0 && tt < tHit) {
      vec3 q = ro + rd * tt;
      vec2 tuv = (q.xy - uTitleRect.xy) / (uTitleRect.zw - uTitleRect.xy);
      if (tuv.x > 0.0 && tuv.x < 1.0 && tuv.y > 0.0 && tuv.y < 1.0) {
        float lod = max(0.0, log2(2048.0 * tt / (uRes.y * 0.5 * uFocal) / (uTitleRect.z - uTitleRect.x)));
        titleA = textureLod(uTitle, tuv, lod).r * uTitleA;
        if (titleA > 0.5) { tHit = tt; what = 4; }
      }
    }
  }

  vec3 col;
  if (what == 0) {
    col = skyColor(rd, true) + starField(rd);
    col = highCloud(ro, rd, col);
  } else {
    vec3 p = ro + rd * tHit;
    if (what == 1) col = shadeLand(p, rd, tHit);
    else if (what == 2) col = shadeSea(p, rd, tHit);
    else if (what == 3) col = shadeRocks(p, rd);
    else col = vec3(2.2);
    col = applyAir(col, rd, what == 4 ? tHit * 0.25 : tHit);
  }

  // cloud between the eye and whatever was hit
  vec4 cl = marchCloud(ro, rd, tHit, jitter);
  col = col * cl.a + cl.rgb;

  // the soft edge of the title, drawn over the scene where it was not solid enough to stop the ray
  if (what != 4 && titleA > 0.0) col = mix(col, vec3(2.2), titleA * cl.a);

  col = tonemap(col);
  col = pow(col, vec3(1.0 / 2.2));

  // grade
  float vig = 1.0 - 0.26 * pow(clamp(length(uv * vec2(0.50, 0.78)), 0.0, 1.4), 2.4);
  col *= mix(vig, 1.0, max(uWash, smoothstep(0.10, 0.60, uSunR)));
  col = mix(col, uPageBg, uWash);
  col *= uIntro;
  col += (hash12(frag + fract(uTime) * 61.0) - 0.5) / 255.0 * 2.4;   // grain, and it hides banding
  fragColor = vec4(col, 1.0);
}
`;
