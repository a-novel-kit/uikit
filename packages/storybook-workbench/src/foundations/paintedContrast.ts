/** WCAG 2 relative luminance of a painted sRGB pixel. */
function luminance(pixel: Uint8ClampedArray) {
  const [r, g, b] = [...pixel.slice(0, 3)]
    .map((channel) => channel / 255)
    .map((channel) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4));

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Measures the WCAG contrast of an ink on its fill as the browser paints them over a backdrop: on a canvas, read
 * back in sRGB, gamut mapping and transparency included.
 */
export function paintedContrast(ink: string, fill: string, backdrop: string): number {
  const context = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!;
  const paint = (color: string) => {
    context.fillStyle = color;
    context.fillRect(0, 0, 1, 1);
    return luminance(context.getImageData(0, 0, 1, 1).data);
  };

  paint(backdrop);
  const [under, over] = [paint(fill), paint(ink)];

  return (Math.max(under, over) + 0.05) / (Math.min(under, over) + 0.05);
}

/** Reads the color a browser paints for a CSS color, as a six-digit hex value. */
export function paintedHex(color: string): string {
  const context = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!;
  context.fillStyle = color;
  context.fillRect(0, 0, 1, 1);

  return (
    "#" + [...context.getImageData(0, 0, 1, 1).data.slice(0, 3)].map((c) => c.toString(16).padStart(2, "0")).join("")
  );
}
