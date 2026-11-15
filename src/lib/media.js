// Generated photographs live in src/assets/gen/. Drop a file there with the exact name from
// src/assets/gen/README.md and it is picked up here on the next build or hot reload. Anything
// missing falls back to code-made art (see components/Scenic.jsx), so the site never shows a hole.
const files = import.meta.glob("../assets/gen/*.{jpg,jpeg,png,webp,avif}", {
  eager: true,
  query: "?url",
  import: "default",
});

const byName = {};
for (const [path, url] of Object.entries(files)) {
  const name = path.split("/").pop().replace(/\.[^.]+$/, "");
  byName[name] = url;
}

export const gen = (name) => byName[name] || null;
export const hasGen = (name) => Boolean(byName[name]);
