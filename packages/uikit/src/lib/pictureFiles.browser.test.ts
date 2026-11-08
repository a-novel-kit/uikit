/// <reference types="vite/client" />
import { centeredCrop } from "./picture";
import { browserPictureFiles } from "./pictureFiles";

import { afterEach, describe, expect, it, vi } from "vitest";

const avatar = { ratio: { width: 1, height: 1 }, maxWidth: 512, maxBytes: 262144 };
const background = { ratio: { width: 16, height: 9 }, maxWidth: 1280, maxBytes: 524288 };

/** Draws an image with a transparent corner, as a photo a person might choose. */
async function imageFile(width: number, height: number): Promise<File> {
  const canvas = new OffscreenCanvas(width, height);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("No 2D canvas");
  context.fillStyle = "midnightblue";
  context.fillRect(0, 0, width, height);
  context.clearRect(0, 0, 40, 40);
  context.fillStyle = "gold";
  context.fillRect(width / 2 - 100, height / 2 - 100, 200, 200);
  return new File([await canvas.convertToBlob({ type: "image/png" })], "photo.png", { type: "image/png" });
}

/** Opens an image of the given size and encodes it, framed from its center, under a rule. */
async function encode(width: number, height: number, rule: typeof avatar): Promise<Blob> {
  const source = await browserPictureFiles.open(await imageFile(width, height));
  try {
    return await browserPictureFiles.encode(source, centeredCrop(source, rule.ratio), rule);
  } finally {
    browserPictureFiles.release(source);
  }
}

/** Replaces the browser's encoder for the duration of a test; `encode` gets the native one to call. */
function stubEncoder(
  encode: (native: HTMLCanvasElement["toBlob"], ...args: Parameters<HTMLCanvasElement["toBlob"]>) => void
) {
  const native = HTMLCanvasElement.prototype.toBlob;
  return vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(function (
    this: HTMLCanvasElement,
    ...args
  ) {
    encode(native.bind(this), ...args);
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("browserPictureFiles", () => {
  it("opens an image file at its size, and refuses a file that is no image", async () => {
    const source = await browserPictureFiles.open(await imageFile(1200, 800));
    expect(source).toMatchObject({ width: 1200, height: 800 });
    browserPictureFiles.release(source);

    const notes = new File(["not an image"], "notes.txt", { type: "text/plain" });
    await expect(browserPictureFiles.open(notes)).rejects.toThrow();
  });

  it.each([
    ["a square of at most 512 pixels", avatar, [1200, 800], [512, 512]],
    ["a square of the pixels a small image keeps", avatar, [300, 200], [200, 200]],
    ["a 16:9 background of at most 1280x720", background, [1600, 1200], [1280, 720]],
    ["a 16:9 background in whole 16x9 units", background, [300, 200], [304, 171]],
  ])("saves %s as a still WebP within the rule's bytes", async (_, rule, [width, height], size) => {
    const picture = await encode(width, height, rule);

    expect(picture.type).toBe("image/webp");
    expect(picture.size).toBeLessThanOrEqual(rule.maxBytes);
    const bitmap = await createImageBitmap(picture);
    expect([bitmap.width, bitmap.height]).toEqual(size);
    expect(bitmap.width * rule.ratio.height).toBe(bitmap.height * rule.ratio.width);
  });

  it("draws transparent pixels on an opaque white ground", async () => {
    const source = await browserPictureFiles.open(await imageFile(1200, 800));
    const picture = await browserPictureFiles.encode(source, { zoom: 1, x: 0, y: 0 }, avatar);

    const canvas = new OffscreenCanvas(1, 1);
    const context = canvas.getContext("2d")!;
    context.drawImage(await createImageBitmap(picture), 2, 2, 1, 1, 0, 0, 1, 1);
    const [red, green, blue, alpha] = context.getImageData(0, 0, 1, 1).data;
    expect(alpha).toBe(255);
    expect(Math.min(red, green, blue)).toBeGreaterThan(240);
  });

  it("saves a JPEG where the browser cannot encode WebP, as Safari", async () => {
    stubEncoder((native, done, type, quality) => native(done, type === "image/webp" ? "image/png" : type, quality));

    const picture = await encode(1600, 1200, background);

    expect(picture.type).toBe("image/jpeg");
    const bitmap = await createImageBitmap(picture);
    expect([bitmap.width, bitmap.height]).toEqual([1280, 720]);
  });

  it("lowers the quality until the picture fits the rule's bytes", async () => {
    const encoder = stubEncoder((native, done, type, quality) => {
      if (quality !== undefined && quality > 0.75) done(new Blob([new Uint8Array(300 * 1024)], { type }));
      else native(done, type, quality);
    });

    const picture = await encode(1200, 800, avatar);

    expect(picture.size).toBeLessThanOrEqual(avatar.maxBytes);
    expect(encoder.mock.calls.map(([, , quality]) => quality)).toEqual([0.9, 0.8, 0.7]);
  });

  it("resolves a picture still over the rule's bytes at the lowest quality, for the server to refuse", async () => {
    const encoder = stubEncoder((_, done, type) => done(new Blob([new Uint8Array(300 * 1024)], { type })));

    const picture = await encode(1200, 800, avatar);

    expect(picture.size).toBe(300 * 1024);
    expect(encoder.mock.calls.map(([, , quality]) => quality)).toEqual([0.9, 0.8, 0.7, 0.6, 0.5]);
  });
});
