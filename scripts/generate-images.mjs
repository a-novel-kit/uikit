// Generates the publishable brand-image resolutions from reviewed raw sources.
import { access, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const rawRoot = resolve(repositoryRoot, "packages/images/raw");
const outputRoot = resolve(repositoryRoot, "packages/images/files");

const presets = {
  banner: {
    sizes: [
      { width: 320 },
      { width: 640 },
      { width: 960 },
      { width: 1280 },
      { width: 1920 },
      { width: 2560 },
      { width: 3840 },
    ],
  },
  icon: {
    sizes: [16, 32, 48, 96, 144, 192, 512, 1024].map((size) => ({
      height: size,
      width: size,
    })),
  },
};

const sources = [
  {
    filename: "agora-banner.png",
    height: 1792,
    preset: "banner",
    width: 7136,
  },
  {
    filename: "agora-icon.png",
    height: 1792,
    preset: "icon",
    width: 1792,
  },
];

const argumentsList = process.argv.slice(2);
const checkOnly = argumentsList.length === 1 && argumentsList[0] === "--check";

if (argumentsList.length > 0 && !checkOnly) {
  throw new Error("Usage: node scripts/generate-images.mjs [--check]");
}

const portablePath = (path) => path.split(sep).join("/");

const outputDirectory = (preset, size) => (preset === "banner" ? `${size.width}w` : `${size.width}x${size.height}`);

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

  for (const source of sources) {
    const sourcePath = resolve(rawRoot, source.filename);
    if (dirname(sourcePath) !== rawRoot) {
      throw new Error(`Image source must be a direct child of packages/images/raw: ${source.filename}`);
    }

    const metadata = await sharp(sourcePath).metadata();
    if (metadata.format !== "png" || metadata.width !== source.width || metadata.height !== source.height) {
      throw new Error(
        `${source.filename} must be a ${source.width}x${source.height} PNG; received ` +
          `${metadata.width ?? "unknown"}x${metadata.height ?? "unknown"} ${metadata.format ?? "file"}`
      );
    }

    for (const size of presets[source.preset].sizes) {
      const target = resolve(outputRoot, source.preset, outputDirectory(source.preset, size), source.filename);
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
