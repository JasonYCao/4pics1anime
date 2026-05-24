#!/usr/bin/env node
// Detects each file in images-source/qNN/ by content (not extension)
// and re-encodes anything that isn't a real PNG into a real PNG using
// macOS's `sips`. Lossless for JPEG inputs; AVIF/HEIC/HEIF get decoded
// to RGB and re-encoded as PNG (we re-encode to WebP later anyway).
//
// macOS-only (depends on `sips`). Run before `npm run images`.

import { readdir, rename, unlink, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { exec as execCb } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(execCb);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "images-source");

async function detectType(file) {
  const { stdout } = await exec(`file -b ${JSON.stringify(file)}`);
  const out = stdout.trim();
  if (/PNG image/.test(out)) return "png";
  if (/JPEG image/.test(out)) return "jpeg";
  if (/AVIF/.test(out)) return "avif";
  if (/HEIF|HEIC/.test(out)) return "heif";
  if (/Web\/P|WebP/i.test(out)) return "webp";
  return { unknown: out };
}

async function convertToPng(file) {
  const tmp = `${file}.tmp.png`;
  try {
    await exec(`sips -s format png ${JSON.stringify(file)} --out ${JSON.stringify(tmp)}`);
    await rename(tmp, file);
  } catch (err) {
    // Best-effort cleanup of the tmp file.
    if (existsSync(tmp)) {
      try { await unlink(tmp); } catch {}
    }
    throw err;
  }
}

async function main() {
  if (!existsSync(SRC)) {
    console.log("[normalize] no images-source/ — nothing to do");
    return;
  }

  const dirs = (await readdir(SRC, { withFileTypes: true }))
    .filter((d) => d.isDirectory() && /^q\d+$/i.test(d.name))
    .map((d) => d.name)
    .sort();

  let converted = 0;
  let alreadyOk = 0;
  const problems = [];

  for (const dir of dirs) {
    const sub = path.join(SRC, dir);
    const files = (await readdir(sub))
      .filter((f) => /\.(png|jpg|jpeg|webp|avif|heic|heif)$/i.test(f))
      .sort();

    for (const f of files) {
      const full = path.join(sub, f);
      const kind = await detectType(full);

      if (kind === "png") {
        alreadyOk++;
        continue;
      }
      if (typeof kind === "object") {
        problems.push({ file: full, info: kind.unknown });
        continue;
      }

      try {
        const before = (await stat(full)).size;
        await convertToPng(full);
        const after = (await stat(full)).size;
        console.log(
          `[normalize] ${dir}/${f}  ${kind} → png  (${(before/1024).toFixed(0)}KB → ${(after/1024).toFixed(0)}KB)`
        );
        converted++;
      } catch (err) {
        problems.push({ file: full, info: `${kind}: ${err.message}` });
      }
    }
  }

  console.log("");
  console.log(`[normalize] done — converted ${converted}, already PNG ${alreadyOk}, problems ${problems.length}`);
  for (const p of problems) {
    console.log(`  ? ${p.file} — ${p.info}`);
  }
  if (problems.length > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
