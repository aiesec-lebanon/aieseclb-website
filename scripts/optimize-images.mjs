// Makes web versions of the photographs in src/assets/gen.
//
//   npm run images
//
// New photographs can be dropped either in src/assets/gen/ or straight into
// src/assets/gen/originals/. For every new or oversized image it writes:
//   <name>.jpg      at most 2000 px on its long side (2400 for the full-bleed page heroes)
//   <name>-sm.jpg   at most 1000 px, for phones and small cards
// and moves the original into src/assets/gen/originals/ (ignored by git), so nothing is lost.
// Every web version also gets a WebP twin in src/assets/gen-webp/ (about a third smaller; the site
// offers it first and the JPEG to anything that cannot read it). It also records the pixel widths in src/assets/gen/sizes.json, which the site uses to let
// each browser pick the smaller or the larger file. Images already done are skipped, so it is
// safe to run again after adding more.
import sharp from "sharp";
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { basename, extname, join } from "node:path";

const DIR = "src/assets/gen";
const ORIG = join(DIR, "originals");
const SIZES = join(DIR, "sizes.json");
const WIDE = new Set(["lebanon-hero", "exchange-hero"]);
const EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

mkdirSync(ORIG, { recursive: true });
const sizes = existsSync(SIZES) ? JSON.parse(readFileSync(SIZES, "utf8")) : {};
let done = 0;
let skipped = 0;

for (const file of readdirSync(DIR)) {
  const ext = extname(file).toLowerCase();
  if (!EXTS.has(ext)) continue;
  const name = basename(file, extname(file));
  if (name.endsWith("-sm")) continue;

  const path = join(DIR, file);
  const max = WIDE.has(name) ? 2400 : 2000;
  const meta = await sharp(path).metadata();
  const long = Math.max(meta.width, meta.height);
  const isDone = ext === ".jpg" && long <= max && statSync(path).size < 1100 * 1024 && existsSync(join(DIR, `${name}-sm.jpg`)) && sizes[name];
  if (isDone) {
    skipped++;
    continue;
  }

  // keep the first original we ever saw under this name; never overwrite it
  const keep = join(ORIG, file);
  if (!existsSync(keep)) renameSync(path, keep);
  else unlinkSync(path);

  // platform screenshots carry small text, so they get a gentler compression
  const quality = name.startsWith("platform-") ? 88 : 80;
  const full = await sharp(keep)
    .rotate()
    .resize({ width: max, height: max, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality, progressive: true, mozjpeg: true })
    .toFile(join(DIR, `${name}.jpg`));
  const small = await sharp(keep)
    .rotate()
    .resize({ width: 1000, height: 1000, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: quality - 4, progressive: true, mozjpeg: true })
    .toFile(join(DIR, `${name}-sm.jpg`));
  sizes[name] = [full.width, small.width];
  done++;
  console.log(
    `${name}: ${(statSync(keep).size / 1024).toFixed(0)} KB original -> ${(full.size / 1024).toFixed(0)} KB (${full.width}x${full.height}) + ${(small.size / 1024).toFixed(0)} KB small`,
  );
}

// photographs dropped straight into originals/ that have no web version yet
for (const file of readdirSync(ORIG)) {
  const ext = extname(file).toLowerCase();
  if (!EXTS.has(ext)) continue;
  const name = basename(file, extname(file));
  if (existsSync(join(DIR, `${name}.jpg`)) && existsSync(join(DIR, `${name}-sm.jpg`))) continue;
  const keep = join(ORIG, file);
  try {
    const max = WIDE.has(name) ? 2400 : 2000;
    const quality = name.startsWith("platform-") ? 88 : 80;
    const full = await sharp(keep)
      .rotate()
      .resize({ width: max, height: max, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality, progressive: true, mozjpeg: true })
      .toFile(join(DIR, `${name}.jpg`));
    const small = await sharp(keep)
      .rotate()
      .resize({ width: 1000, height: 1000, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: quality - 4, progressive: true, mozjpeg: true })
      .toFile(join(DIR, `${name}-sm.jpg`));
    sizes[name] = [full.width, small.width];
    done++;
    console.log(`${name}: from originals/ -> ${(full.size / 1024).toFixed(0)} KB (${full.width}x${full.height}) + ${(small.size / 1024).toFixed(0)} KB small`);
  } catch (err) {
    // most often a file still being copied in: it will be picked up next time
    console.warn(`${name}: skipped for now (${err.message})`);
  }
}

// WebP twins of the web versions, made or remade whenever their JPEG is newer, and removed when it
// is gone. In their own folder, so this script never takes them for new photographs.
const WEBP = "src/assets/gen-webp";
mkdirSync(WEBP, { recursive: true });
let webps = 0;
for (const file of readdirSync(DIR)) {
  if (extname(file).toLowerCase() !== ".jpg") continue;
  const out = join(WEBP, basename(file, ".jpg") + ".webp");
  if (existsSync(out) && statSync(out).mtimeMs >= statSync(join(DIR, file)).mtimeMs) continue;
  await sharp(join(DIR, file)).webp({ quality: 76, effort: 5 }).toFile(out);
  webps++;
}
for (const file of readdirSync(WEBP)) {
  if (!existsSync(join(DIR, basename(file, ".webp") + ".jpg"))) unlinkSync(join(WEBP, file));
}
if (webps) console.log(`${webps} WebP versions written to ${WEBP}`);

// forget entries whose image has been removed
for (const name of Object.keys(sizes)) {
  if (!existsSync(join(DIR, `${name}.jpg`))) delete sizes[name];
}
const sorted = Object.fromEntries(Object.entries(sizes).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(SIZES, JSON.stringify(sorted, null, 2) + "\n");
console.log(`${done} optimised, ${skipped} already done. Originals are in ${ORIG} (not committed).`);
