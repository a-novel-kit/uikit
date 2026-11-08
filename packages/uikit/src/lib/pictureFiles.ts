import { type PictureCrop, type PictureRule, type PictureSource, cropSize, pictureSize } from "./picture";

/** The quality a picture is encoded at first, then the lower ones it tries until it fits the rule's size. */
const bestQuality = 0.9;
const lowerQualities = [0.8, 0.7, 0.6, 0.5];

/** The browser side of picture framing: decoding a chosen file and encoding the framed picture. */
export interface PictureFiles {
  /** Decodes an image file the browser can open. Rejects when it cannot. */
  open(file: Blob): Promise<PictureSource>;
  /**
   * Draws the crop at the rule's exact ratio and encodes it as a still WebP, or as a JPEG where the
   * browser cannot encode WebP, at the best quality that fits the rule's size. A picture still over
   * it at the lowest quality resolves as is, for the server to refuse.
   */
  encode(source: PictureSource, crop: PictureCrop, rule: PictureRule): Promise<Blob>;
  /** Frees a source no frame shows anymore. */
  release(source: PictureSource): void;
}

/** Reads and writes pictures with the browser's image decoder and canvas. */
export const browserPictureFiles: PictureFiles = {
  async open(file) {
    const url = URL.createObjectURL(file);
    try {
      const image = await decode(url);
      return { url, width: image.naturalWidth, height: image.naturalHeight };
    } catch (error) {
      URL.revokeObjectURL(url);
      throw error;
    }
  },
  async encode(source, crop, rule) {
    const size = pictureSize(source, crop, rule);
    const canvas = document.createElement("canvas");
    canvas.width = size.width;
    canvas.height = size.height;

    const context = canvas.getContext("2d");
    if (!context) throw new Error("The browser has no 2D canvas.");
    // JPEG has no transparency, and a transparent image shows its fill everywhere alike.
    context.fillStyle = "white";
    context.fillRect(0, 0, size.width, size.height);
    context.imageSmoothingQuality = "high";
    const kept = cropSize(source, rule.ratio, crop.zoom);
    const image = await decode(source.url);
    context.drawImage(image, crop.x, crop.y, kept.width, kept.height, 0, 0, size.width, size.height);

    return await encodeWithin(canvas, rule.maxBytes);
  },
  release(source) {
    URL.revokeObjectURL(source.url);
  },
};

async function decode(url: string): Promise<HTMLImageElement> {
  const image = new Image();
  image.src = url;
  await image.decode();
  return image;
}

/** Encodes a canvas as WebP, or as JPEG where the browser cannot encode WebP, at the best quality within `maxBytes`. */
async function encodeWithin(canvas: HTMLCanvasElement, maxBytes: number): Promise<Blob> {
  let type = "image/webp";
  let picture = await toBlob(canvas, type, bestQuality);
  // Safari encodes no WebP: it answers with a PNG instead.
  if (picture.type !== type) {
    type = "image/jpeg";
    picture = await toBlob(canvas, type, bestQuality);
  }

  for (const quality of lowerQualities) {
    if (picture.size <= maxBytes) break;
    picture = await toBlob(canvas, type, quality);
  }
  return picture;
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("The browser could not encode the picture."))),
      type,
      quality
    );
  });
}
