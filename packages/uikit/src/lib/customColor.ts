// Draws an item in a custom color: one a person gave it, such as a tag's or a calendar's. A custom color is a family
// apart from the three hues: it shows only on what a person colored, and the interface keeps to the three. The rule
// runs in script: it follows each hue's own gamut edge and measures the contrast it gives, which a stylesheet cannot
// do.
import { colorSystem } from "@a-novel-kit/uikit-tokens/palette";

/** A color as linear sRGB channels. A channel outside 0 to 1 lies outside sRGB. */
type Rgb = readonly [number, number, number];

const { divisions, lightnessFloor, relativeChromaFloor, relativeChromaPeak } = colorSystem.scale;
const [cuspLightnessMin, cuspLightnessMax] = colorSystem.gamut.cuspLightness;

/** A tint is the third step of its hue's ramp and a lit tint the fourth, as tokens.css sets the three hues'. */
const tintStep = 2;
/** What an ink aims for on its tint. The three hues' inks keep 4.9:1 as a browser paints them: the climb aims a tenth
 * higher, so no rounding to 8 bits lands an ink under it. */
const inkContrast = 5;
/** How far a lit ink goes to white, as tokens.css lights the three hues'. */
const litShare = 0.25;
/** The chroma under which the eye reads a gray, which has no hue to draw: such a color draws neutral. */
const grayChroma = 0.02;
/** No Display P3 color reaches this chroma. */
const chromaCeiling = 0.5;

/** What an item without a color draws with: the neutral pair, and no mark. */
const neutral = {
  ink: "var(--color-text-secondary)",
  tint: "var(--color-action-neutral)",
  inkLit: "var(--color-text-primary)",
  tintLit: "var(--color-action-neutral-hover)",
};

const lerp = (from: number, to: number, progress: number) => from + (to - from) * progress;
const smoothstep = (progress: number) => progress * progress * (3 - 2 * progress);
const inRange = (channel: number) => channel >= -1e-9 && channel <= 1 + 1e-9;
const clamp = (channel: number) => Math.min(1, Math.max(0, channel));
const clip = ([r, g, b]: Rgb): Rgb => [clamp(r), clamp(g), clamp(b)];

/** Reads a hex color as OKLCH, through the OKLab matrices of its specification. */
function oklch(hex: string) {
  const [r, g, b] = [1, 3, 5]
    .map((start) => parseInt(hex.slice(start, start + 2), 16) / 255)
    .map((channel) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4));

  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

  const greenRed = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const blueYellow = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;

  return {
    lightness: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    chroma: Math.hypot(greenRed, blueYellow),
    hue: Math.atan2(blueYellow, greenRed),
  };
}

/** Converts an OKLCH color, its hue in radians, to its linear sRGB channels. */
function channels(lightness: number, chroma: number, hue: number): Rgb {
  const [greenRed, blueYellow] = [chroma * Math.cos(hue), chroma * Math.sin(hue)];

  const l = (lightness + 0.3963377774 * greenRed + 0.2158037573 * blueYellow) ** 3;
  const m = (lightness - 0.1055613458 * greenRed - 0.0638541728 * blueYellow) ** 3;
  const s = (lightness - 0.0894841775 * greenRed - 1.291485548 * blueYellow) ** 3;

  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

/** Reports whether a color lies in Display P3, the gamut the three hues' ramps follow. */
function inP3([r, g, b]: Rgb) {
  const p3 = [0.8224619687 * r + 0.1775380313 * g, 0.0331941989 * r + 0.9668058011 * g];
  return p3.every(inRange) && inRange(0.0170826307 * r + 0.0723974407 * g + 0.9105199286 * b);
}

/** Finds the highest chroma a hue reaches at a lightness inside Display P3, by bisection. */
function edge(lightness: number, hue: number) {
  let [inside, outside] = [0, chromaCeiling];

  for (let pass = 0; pass < 16; pass += 1) {
    const chroma = (inside + outside) / 2;
    if (inP3(channels(lightness, chroma, hue))) inside = chroma;
    else outside = chroma;
  }

  return inside;
}

/** Finds a hue's neon: its most saturated color within the lightness range the generator searches. */
function cusp(hue: number) {
  let [low, high] = [cuspLightnessMin, cuspLightnessMax];

  // The edge's chroma rises to one peak and falls, so a third of the range holds no peak at each pass.
  while (high - low > 1e-4) {
    const third = (high - low) / 3;
    if (edge(low + third, hue) < edge(high - third, hue)) low += third;
    else high -= third;
  }

  const lightness = (low + high) / 2;
  return { lightness, chroma: edge(lightness, hue) };
}

/** WCAG relative luminance of a linear sRGB color. */
const luminance = ([r, g, b]: Rgb) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

const ratio = (first: number, second: number) => (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);

/**
 * Measures the WCAG contrast of two colors as a screen shows them, and returns the lower of two readings: a Display
 * P3 screen shows each color whole, and an sRGB screen shows it once the browser has clipped its channels.
 */
function contrast(first: Rgb, second: Rgb) {
  return Math.min(ratio(luminance(first), luminance(second)), ratio(luminance(clip(first)), luminance(clip(second))));
}

/**
 * Finds the lightness of a hue's ink on a fill: its neon, climbed up the gamut's edge until it keeps the contrast
 * the three hues' inks keep. The climb is what gives the pressure magenta its quarter of light.
 */
function inkLightness(from: number, hue: number, fill: Rgb) {
  const reads = (lightness: number) => contrast(channels(lightness, edge(lightness, hue), hue), fill) >= inkContrast;
  if (reads(from)) return from;

  let [low, high] = [from, 1];
  for (let pass = 0; pass < 12; pass += 1) {
    const lightness = (low + high) / 2;
    if (reads(lightness)) high = lightness;
    else low = lightness;
  }

  return high;
}

/** Writes an OKLCH color, its hue in radians, as CSS. Its chroma rounds down, so a color on the edge stays inside. */
function css(lightness: number, chroma: number, hue: number) {
  const degrees = ((((hue * 180) / Math.PI) % 360) + 360) % 360;
  return `oklch(${lightness.toFixed(4)} ${(Math.floor(chroma * 1e4) / 1e4).toFixed(4)} ${degrees.toFixed(2)})`;
}

const declarations = (mark: string, pair: typeof neutral) =>
  `--color-mark-custom:${mark};--color-ink-custom:${pair.ink};--color-tint-custom:${pair.tint};` +
  `--color-ink-custom-lit:${pair.inkLit};--color-tint-custom-lit:${pair.tintLit}`;

/**
 * Returns the style that draws an item in a custom color, as the declarations of the custom color tokens: set it on
 * the item, then read `--color-mark-custom` for a small solid mark, which shows the exact color, and the pair
 * `--color-ink-custom` on `--color-tint-custom`, or their `-lit` forms for a label, for what is filled under text.
 * The pair takes the color's hue alone, at the strength every hue's pair has, so its text reads whatever lightness
 * and saturation were picked: each ink keeps 4.9:1 on its tint. An item without a color, or with anything but a
 * six-digit hex value, draws neutral and no mark. A black, a white or a gray keeps its mark and draws neutral.
 *
 * @example
 * ```svelte
 * <li style={customColorStyle(tag.color)}>{tag.name}</li>
 * ```
 */
export function customColorStyle(color?: string | null): string {
  if (!color || !/^#[0-9a-f]{6}$/i.test(color)) return declarations("transparent", neutral);

  const { chroma, hue } = oklch(color);
  if (chroma < grayChroma) return declarations(color, neutral);

  const neon = cusp(hue);
  const step = (index: number) => {
    const tone = smoothstep(index / divisions);
    const lightness = lerp(lightnessFloor, neon.lightness, tone);
    return { lightness, chroma: lerp(relativeChromaFloor, relativeChromaPeak, tone) * edge(lightness, hue) };
  };

  const [tint, tintLit] = [step(tintStep), step(tintStep + 1)];
  const ink = inkLightness(neon.lightness, hue, channels(tint.lightness, tint.chroma, hue));
  const inkLit = inkLightness(lerp(ink, 1, litShare), hue, channels(tintLit.lightness, tintLit.chroma, hue));

  return declarations(color, {
    ink: css(ink, edge(ink, hue), hue),
    tint: css(tint.lightness, tint.chroma, hue),
    inkLit: css(inkLit, edge(inkLit, hue), hue),
    tintLit: css(tintLit.lightness, tintLit.chroma, hue),
  });
}
