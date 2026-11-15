// Generated photographs live in src/assets/gen/. Drop a file there with the exact name from
// src/assets/gen/README.md, run `npm run images`, and it is picked up here. Anything missing
// falls back to code-made art (see components/Scenic.jsx), so the site never shows a hole.
const files = import.meta.glob("../assets/gen/*.{jpg,jpeg,png,webp,avif}", {
  eager: true,
  query: "?url",
  import: "default",
});
const sizeFiles = import.meta.glob("../assets/gen/sizes.json", { eager: true, import: "default" });
const sizes = Object.values(sizeFiles)[0] || {};

const full = {};
const small = {};
for (const [path, url] of Object.entries(files)) {
  const name = path.split("/").pop().replace(/\.[^.]+$/, "");
  if (name.endsWith("-sm")) small[name.slice(0, -3)] = url;
  else full[name] = url;
}

// depth maps for the photographs shown in 3D (cook/tools/depth.mjs): src/assets/depth/<name>.png
const depthFiles = import.meta.glob("../assets/depth/*.png", { eager: true, query: "?url", import: "default" });
const depth = {};
for (const [path, url] of Object.entries(depthFiles)) depth[path.split("/").pop().replace(/.png$/, "")] = url;
export const genDepth = (name) => depth[name] || null;

export const gen = (name) => full[name] || null;
export const genSmall = (name) => small[name] || full[name] || null;
export const hasGen = (name) => Boolean(full[name]);

// src plus a srcset, so a phone downloads the 1000 px file and a large screen the 2000 px one
export function genImage(name) {
  const src = full[name];
  if (!src) return null;
  const w = sizes[name];
  if (small[name] && w) return { src, srcSet: `${small[name]} ${w[1]}w, ${src} ${w[0]}w` };
  return { src, srcSet: undefined };
}
