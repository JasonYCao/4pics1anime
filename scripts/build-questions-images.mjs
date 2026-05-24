#!/usr/bin/env node
// Scans images-source/qNN/{1..4}.{png,jpg,jpeg,webp} and writes
// optimized WebP files to public/questions/qNN/N.webp.
//
// Optimized for low-bandwidth presentation: 1280px max width, quality 70.

import { readdir, mkdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "images-source");
const OUT = path.join(ROOT, "public", "questions");

const MAX_WIDTH = 1280;
const QUALITY = 70;
const SUPPORTED = new Set([".png", ".jpg", ".jpeg", ".webp"]);

async function processOne(srcFile, outFile) {
  if (existsSync(outFile)) {
    const [s, o] = await Promise.all([stat(srcFile), stat(outFile)]);
    if (o.mtimeMs >= s.mtimeMs) return { skipped: true };
  }
  await mkdir(path.dirname(outFile), { recursive: true });
  const info = await sharp(srcFile)
    .rotate()
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(outFile);
  return { skipped: false, bytes: info.size };
}

async function main() {
  if (!existsSync(SRC)) {
    console.log(`[images] No images-source/ directory — nothing to do.`);
    return;
  }

  const qDirs = (await readdir(SRC, { withFileTypes: true }))
    .filter((d) => d.isDirectory() && /^q\d+$/i.test(d.name))
    .map((d) => d.name)
    .sort();

  if (qDirs.length === 0) {
    console.log(`[images] No qNN/ subdirectories in images-source/.`);
    return;
  }

  let built = 0;
  let skipped = 0;
  let totalBytes = 0;

  for (const qDir of qDirs) {
    const srcDir = path.join(SRC, qDir);
    const files = (await readdir(srcDir))
      .filter((f) => SUPPORTED.has(path.extname(f).toLowerCase()))
      .sort();

    for (const file of files) {
      const base = path.basename(file, path.extname(file));
      if (!/^[1-4]$/.test(base)) continue; // only 1..4
      const srcFile = path.join(srcDir, file);
      const outFile = path.join(OUT, qDir, `${base}.webp`);
      const res = await processOne(srcFile, outFile);
      if (res.skipped) {
        skipped++;
      } else {
        built++;
        totalBytes += res.bytes;
        const kb = (res.bytes / 1024).toFixed(1);
        console.log(`[images] ${qDir}/${base}.webp  ${kb} KB`);
      }
    }
  }

  console.log(
    `[images] done — built ${built}, skipped ${skipped} (up-to-date), total ${(totalBytes / 1024).toFixed(1)} KB`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
