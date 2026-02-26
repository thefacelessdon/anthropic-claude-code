#!/usr/bin/env node
/**
 * Image optimization script for HUE Unlimited.
 *
 * Usage:
 *   npm run optimize-images                  # optimize all images in public/
 *   npm run optimize-images -- --dir src/assets
 *   npm run optimize-images -- --max-width 1200
 *
 * What it does:
 *   1. Finds every .jpg, .jpeg, .png, .webp in the target directory (recursive)
 *   2. Resizes images wider than --max-width (default 1920px) while keeping aspect ratio
 *   3. Compresses to high-quality JPEG (quality 80) or WebP (quality 80)
 *   4. Overwrites originals — run BEFORE committing new images
 *   5. Skips files already under the size threshold (500 KB by default)
 */

import { readdir, stat } from "node:fs/promises";
import { join, extname, relative } from "node:path";
import { argv } from "node:process";

// --- Config from CLI flags ---------------------------------------------------
function flag(name, fallback) {
  const i = argv.indexOf(`--${name}`);
  return i !== -1 && argv[i + 1] ? argv[i + 1] : fallback;
}

const DIR = flag("dir", "public");
const MAX_WIDTH = Number(flag("max-width", "1920"));
const QUALITY = Number(flag("quality", "80"));
const SKIP_UNDER_KB = Number(flag("skip-under", "500")); // KB

const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

// --- Helpers -----------------------------------------------------------------
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full)));
    } else if (IMAGE_EXTS.has(extname(entry.name).toLowerCase())) {
      files.push(full);
    }
  }
  return files;
}

function fmtSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

// --- Main --------------------------------------------------------------------
async function main() {
  // Dynamic import so the script fails clearly if sharp isn't installed
  const sharp = (await import("sharp")).default;

  const root = join(process.cwd(), DIR);
  const files = await walk(root);

  if (files.length === 0) {
    console.log(`No images found in ${DIR}/`);
    return;
  }

  console.log(`Found ${files.length} image(s) in ${DIR}/\n`);

  let totalBefore = 0;
  let totalAfter = 0;
  let optimized = 0;
  let skipped = 0;

  for (const file of files) {
    const before = (await stat(file)).size;
    totalBefore += before;

    if (before < SKIP_UNDER_KB * 1024) {
      skipped++;
      totalAfter += before;
      continue;
    }

    const ext = extname(file).toLowerCase();
    const img = sharp(file);
    const meta = await img.metadata();

    let pipeline = sharp(file);

    // Resize if wider than max
    if (meta.width && meta.width > MAX_WIDTH) {
      pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
    }

    // Compress based on format
    if (ext === ".webp") {
      pipeline = pipeline.webp({ quality: QUALITY });
    } else if (ext === ".png") {
      // Convert large PNGs to WebP for better compression, keep .png extension
      pipeline = pipeline.png({ quality: QUALITY, compressionLevel: 9 });
    } else {
      pipeline = pipeline.jpeg({ quality: QUALITY, mozjpeg: true });
    }

    const buffer = await pipeline.toBuffer();
    const { writeFile } = await import("node:fs/promises");
    await writeFile(file, buffer);

    const after = buffer.length;
    totalAfter += after;
    optimized++;

    const saved = ((1 - after / before) * 100).toFixed(1);
    const rel = relative(process.cwd(), file);
    console.log(
      `  ${rel}  ${fmtSize(before)} → ${fmtSize(after)}  (${saved}% saved)`
    );
  }

  console.log(`\n--- Summary ---`);
  console.log(`Optimized: ${optimized} file(s)`);
  console.log(`Skipped (< ${SKIP_UNDER_KB} KB): ${skipped} file(s)`);
  console.log(
    `Total: ${fmtSize(totalBefore)} → ${fmtSize(totalAfter)}  (${((1 - totalAfter / totalBefore) * 100).toFixed(1)}% saved)`
  );
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
