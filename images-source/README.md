# Image source folder

Drop 4 images into the matching question folder, named **1, 2, 3, 4** with
**hardest clue → easiest** matching the order in `4pics1anime.md`:

```
images-source/q01/
  1.png      # the file extension is .png by convention
  2.png      # — actual format can be PNG / JPEG / WebP / AVIF / HEIC
  3.png      # because macOS browsers often save under the wrong extension
  4.png
```

Workflow:

```sh
npm run fix-images    # macOS-only — sips-converts anything not actually PNG
npm run images        # sharp re-encodes to optimized WebP for the browser
```

`fix-images` walks every file in `images-source/qNN/`, detects the real
format by content, and converts AVIF / HEIC / HEIF / JPEG / WebP into real
PNG in place (atomic via a temp file). Safe to re-run any time — files
already PNG are skipped.

`images` then resizes each to max 1280px wide and writes a `.webp` at
~70% quality to `public/questions/qNN/N.webp`. Those optimized files are
what the app actually loads in the browser. Typical output is 20–80KB
per image — fine even on flaky venue wifi. The optimizer is idempotent;
only re-encodes when the source has changed.

`npm run build` runs `images` (not `fix-images`) automatically before
`vite build`, so Vercel deploys stay clean even though Vercel doesn't
have `sips`. Always run `fix-images` locally after dropping any new
files, then commit the (now-real) PNGs.
