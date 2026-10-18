// Generates the publishable brand-image resolutions from reviewed raw sources.
import { access, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
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
    sizes: [16, 32, 48, 96, 144, 192, 512, 1024].map((size) => ({
      height: size,
      width: size,
    })),
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

const portablePath = (path) => path.split(sep).join("/");

const outputDirectory = (preset, size) => (preset === "banner" ? `${size.height}h` : `${size.width}x${size.height}`);

const collectFiles = async (directory) => {
  try {
    await access(directory);
  } catch {
    return [];
  }

  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(path)));
    } else if (entry.isFile()) {
      files.push(path);
    }
  }

  return files;
};

const generateImages = async () => {
  const outputs = new Map();

  for (const logo of logos) {
    for (const [preset, { sizes, source }] of Object.entries(presets)) {
      for (const [variant, suffix] of Object.entries(variants)) {
        const sourcePath = resolve(rawRoot, logo, "exports", `${logo}-${source}-${variant}.png`);
        const metadata = await sharp(sourcePath).metadata();
        if (
          metadata.format !== "png" ||
          metadata.height !== sourceHeight ||
          (preset === "icon" && metadata.width !== sourceHeight)
        ) {
          throw new Error(
            `${portablePath(relative(repositoryRoot, sourcePath))} must be a PNG ${sourceHeight} pixels high` +
              `${preset === "icon" ? " and wide" : ""}; received ` +
              `${metadata.width ?? "unknown"}x${metadata.height ?? "unknown"} ${metadata.format ?? "file"}`
          );
        }

        for (const size of sizes) {
          const target = resolve(outputRoot, preset, outputDirectory(preset, size), `${logo}-${preset}${suffix}.png`);
          const contents = await sharp(sourcePath)
            .resize({
              height: size.height,
              kernel: sharp.kernel.lanczos3,
              width: size.width,
              withoutEnlargement: true,
            })
            .png({ adaptiveFiltering: true, compressionLevel: 9 })
            .toBuffer();

          outputs.set(target, contents);
        }
      }
    }
  }

  return outputs;
};

const outputs = await generateImages();

if (checkOnly) {
  const issues = [];
  const expectedPaths = new Set(outputs.keys());

  for (const [path, expected] of outputs) {
    try {
      const actual = await readFile(path);
      if (!actual.equals(expected)) {
        issues.push(`outdated ${portablePath(relative(repositoryRoot, path))}`);
      }
    } catch (error) {
      if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
        issues.push(`missing ${portablePath(relative(repositoryRoot, path))}`);
      } else {
        throw error;
      }
    }
  }

  for (const path of await collectFiles(outputRoot)) {
    if (!expectedPaths.has(path)) {
      issues.push(`unexpected ${portablePath(relative(repositoryRoot, path))}`);
    }
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
