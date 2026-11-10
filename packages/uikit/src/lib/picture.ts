/** An exact aspect ratio, such as 1:1 or 16:9, in whole numbers. */
export interface AspectRatio {
  /** The ratio's width term, such as 16 in 16:9. */
  width: number;
  /** The ratio's height term, such as 9 in 16:9. */
  height: number;
}

/** What a server accepts of a picture, which the browser encodes it to fit. */
export interface PictureRule {
  /** The picture's exact aspect ratio. */
  ratio: AspectRatio;
  /** The largest width, in pixels. At least the width term of the reduced ratio. */
  maxWidth: number;
  /** The largest size, in bytes. */
  maxBytes: number;
}

/** What a server accepts of a whole picture, which the browser shrinks it to fit. */
export interface PictureLimits {
  /** The largest width, in pixels. */
  maxWidth: number;
  /** The largest height, in pixels. */
  maxHeight: number;
  /** The largest size, in bytes. */
  maxBytes: number;
}

/** A decoded image a person chose, which the browser shows from `url`. */
export interface PictureSource {
  /** An address the browser loads the image from, such as an object URL. */
  url: string;
  /** The image's width, in pixels. */
  width: number;
  /** The image's height, in pixels. */
  height: number;
}

/** The rectangle of a source a picture keeps, at the frame's aspect ratio. */
export interface PictureCrop {
  /** 1 keeps the largest rectangle the source covers; more keeps less of the source, up to `maxZoom`. */
  zoom: number;
  /** The rectangle's left edge, in source pixels. */
  x: number;
  /** The rectangle's top edge, in source pixels. */
  y: number;
}

/** A source framed at an aspect ratio: what a picture frame shows, and what its picture keeps. */
export interface PictureFrameState {
  /** The image under the frame. */
  source: PictureSource;
  /** The frame's aspect ratio, which the picture keeps exactly. */
  ratio: AspectRatio;
  /** The rectangle of the source the frame shows. */
  crop: PictureCrop;
}

/** The closest zoom: the frame then shows a quarter of the source's width or height. */
export const maxZoom = 4;

/** The size, in source pixels, of the rectangle a zoom keeps. */
export function cropSize(source: PictureSource, ratio: AspectRatio, zoom: number) {
  const width = Math.min(source.width, (source.height * ratio.width) / ratio.height) / zoom;
  return { width, height: (width * ratio.height) / ratio.width };
}

/** Keeps the center of the source, at the zoom where the frame shows as much of it as it can. */
export function centeredCrop(source: PictureSource, ratio: AspectRatio): PictureCrop {
  const size = cropSize(source, ratio, 1);
  return { zoom: 1, x: (source.width - size.width) / 2, y: (source.height - size.height) / 2 };
}

/**
 * Moves the image under the frame by a distance given in fractions of the frame's width, on both
 * axes, so a drag moves the image as far as the pointer.
 */
export function panCrop({ source, ratio, crop }: PictureFrameState, dx: number, dy: number): PictureCrop {
  const { width } = cropSize(source, ratio, crop.zoom);
  return cover(source, ratio, { ...crop, x: crop.x - dx * width, y: crop.y - dy * width });
}

/**
 * Zooms within bounds around a focus point, given in fractions of the frame's width and height: the
 * source pixel under it stays there. The center of the frame is the default focus.
 */
export function zoomCrop(
  { source, ratio, crop }: PictureFrameState,
  zoom: number,
  focusX = 0.5,
  focusY = 0.5
): PictureCrop {
  const nextZoom = Math.min(maxZoom, Math.max(1, zoom));
  const size = cropSize(source, ratio, crop.zoom);
  const next = cropSize(source, ratio, nextZoom);
  const x = crop.x + focusX * (size.width - next.width);
  const y = crop.y + focusY * (size.height - next.height);
  return cover(source, ratio, { zoom: nextZoom, x, y });
}

/**
 * Places the source under the frame, in percentages of the frame: the image's width and its
 * top-left corner, horizontally in the frame's width and vertically in its height.
 */
export function imagePlacement({ source, ratio, crop }: PictureFrameState) {
  const size = cropSize(source, ratio, crop.zoom);
  return {
    width: (source.width / size.width) * 100,
    left: (-crop.x / size.width) * 100,
    top: (-crop.y / size.height) * 100,
  };
}

/**
 * The size, in pixels, of the picture a crop saves: the source pixels it keeps, up to the rule's
 * width. The width is a whole multiple of the reduced ratio's width term, so the picture keeps the
 * ratio exactly.
 */
export function pictureSize(source: PictureSource, crop: PictureCrop, { ratio, maxWidth }: PictureRule) {
  const divisor = greatestCommonDivisor(ratio.width, ratio.height);
  const unit = { width: ratio.width / divisor, height: ratio.height / divisor };
  const kept = cropSize(source, ratio, crop.zoom).width;
  const units = Math.max(1, Math.min(Math.floor(maxWidth / unit.width), Math.round(kept / unit.width)));
  return { width: units * unit.width, height: units * unit.height };
}

/** The saved size of a whole picture: the source's proportions, shrunk only as far as the limits ask. */
export function wholeSize(source: PictureSource, { maxWidth, maxHeight }: PictureLimits) {
  const scale = Math.min(1, maxWidth / source.width, maxHeight / source.height);
  return {
    width: Math.max(1, Math.round(source.width * scale)),
    height: Math.max(1, Math.round(source.height * scale)),
  };
}

/** Keeps the rectangle inside the source, so the image always covers the frame. */
function cover(source: PictureSource, ratio: AspectRatio, crop: PictureCrop): PictureCrop {
  const size = cropSize(source, ratio, crop.zoom);
  return {
    zoom: crop.zoom,
    x: Math.min(source.width - size.width, Math.max(0, crop.x)),
    y: Math.min(source.height - size.height, Math.max(0, crop.y)),
  };
}

function greatestCommonDivisor(a: number, b: number): number {
  while (b !== 0) [a, b] = [b, a % b];
  return a;
}
