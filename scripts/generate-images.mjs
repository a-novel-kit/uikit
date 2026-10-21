// Generates the publishable brand-image resolutions from reviewed raw sources. With --check, it
// writes nothing and fails when packages/images/files differs from the generated output.
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, relative, resolve, sep } from "node:path";

import sharp from "sharp";

const repositoryRoot = resolve(import.meta.dirname, "..");
const rawRoot = resolve(repositoryRoot, "packages/images/raw");
const outputRoot = resolve(repositoryRoot, "packages/images/files");

const logos = ["agora", "a-novel", "kit", "studio"];

// Every raw export shares this height. Banner sizes set only the height and keep their logo's aspect
// ratio.
const sourceHeight = 1792;

const presets = {
  banner: {
    sizes: [80, 160, 240, 320, 480, 640, 960].map((height) => ({ height })),
    source: "wordmark",
  },
  icon: {
    sizes: [16, 32, 48, 96, 144, 192, 512, 1024].map((size) => ({ height: size, width: size })),
    source: "icon",
  },
};

// Maps each raw export variant to its published file-name suffix. The dark-mode export on a
// transparent background is the logo's default file.
const variants = {
  transparent: "",
  black: "-black",
  "light-transparent": "-light",
  "light-white": "-light-white",
};

const argumentsList = process.argv.slice(2);
const checkOnly = argumentsList.length === 1 && argumentsList[0] === "--check";

if (argumentsList.length > 0 && !checkOnly) {
  throw new Error("Usage: node scripts/generate-images.mjs [--check]");
}

const portablePath = (path) => relative(repositoryRoot, path).split(sep).join("/");

const outputDirectory = (preset, size) => (preset === "banner" ? `${size.height}h` : `${size.width}x${size.height}`);

/** Lists the files under a directory, or none when the directory is missing. */
async function collectFiles(directory) {
  if (!existsSync(directory)) return [];

  const entries = await readdir(directory, { recursive: true, withFileTypes: true });
  return entries.filter((entry) => entry.isFile()).map((entry) => resolve(entry.parentPath, entry.name));
}

/** Rejects a raw export that is not a PNG at the shared source height, and square for icons. */
async function assertSource(sourcePath, preset) {
  const { format, height, width } = await sharp(sourcePath).metadata();
  const square = preset === "icon";
  if (format === "png" && height === sourceHeight && (!square || width === sourceHeight)) return;

  throw new Error(
    `${portablePath(sourcePath)} must be a PNG ${sourceHeight} pixels high${square ? " and wide" : ""}; ` +
      `received ${width ?? "unknown"}x${height ?? "unknown"} ${format ?? "file"}`
  );
}

/** Renders one raw export at one size. */
function render(sourcePath, size) {
  return sharp(sourcePath)
    .resize({ ...size, kernel: sharp.kernel.lanczos3, withoutEnlargement: true })
    .png({ adaptiveFiltering: true, compressionLevel: 9 })
    .toBuffer();
}

/**
 * Renders every logo, preset, variant, and size, keyed by output path. The renders run in parallel,
 * bounded by the libuv thread pool that sharp queues them on.
 */
async function generateImages() {
  const renders = [];

  for (const logo of logos) {
    for (const [preset, { sizes, source }] of Object.entries(presets)) {
      for (const [variant, suffix] of Object.entries(variants)) {
        const sourcePath = resolve(rawRoot, logo, "exports", `${logo}-${source}-${variant}.png`);
        await assertSource(sourcePath, preset);

        for (const size of sizes) {
          const target = resolve(outputRoot, preset, outputDirectory(preset, size), `${logo}-${preset}${suffix}.png`);
          renders.push({ target, sourcePath, size });
        }
      }
    }
  }

  const contents = await Promise.all(renders.map(({ sourcePath, size }) => render(sourcePath, size)));
  return new Map(renders.map(({ target }, index) => [target, contents[index]]));
}

const outputs = await generateImages();

if (checkOnly) {
  const issues = [];

  for (const [path, expected] of outputs) {
    if (!existsSync(path)) issues.push(`missing ${portablePath(path)}`);
    else if (!(await readFile(path)).equals(expected)) issues.push(`outdated ${portablePath(path)}`);
  }

  for (const path of await collectFiles(outputRoot)) {
    if (!outputs.has(path)) issues.push(`unexpected ${portablePath(path)}`);
  }

  if (issues.length > 0) {
    throw new Error(`Generated image drift:\n${issues.map((issue) => `- ${issue}`).join("\n")}`);
  }

  process.stdout.write(`Verified ${outputs.size} generated images.\n`);
} else {
  await rm(outputRoot, { force: true, recursive: true });

  for (const [path, contents] of outputs) {
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, contents);
  }

  process.stdout.write(`Generated ${outputs.size} images in packages/images/files.\n`);
}
