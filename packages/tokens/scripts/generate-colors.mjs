// Generates colors.css and palette.js from the compact OKLCH bases below. With --check, it writes
// nothing and fails when either committed file differs from the generated output.
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import Color from "colorjs.io";

const outputDirectory = resolve(import.meta.dirname, "..");
const checkOnly = process.argv.includes("--check");
const scaleLength = 12;
const scaleDivisions = scaleLength - 1;
const scaleMultipliers = Array.from({ length: scaleLength }, (_, index) => index);

// Compact authoring inputs; generated scales and public metadata derive from these values.
const bases = {
  canvasLightness: 0.14478796,
  harmony: {
    halfTurn: 180,
    brandHue: 232,
    oppositionBias: -10,
    oppositionSpread: 52,
  },
  accent: {
    lightnessFloor: 0.26,
    relativeChromaFloor: 0.8,
    relativeChromaPeak: 1,
    toneCurve: "smoothstep",
  },
  contrast: {
    accentStep: 10,
    inverseStep: 1,
    method: "WCAG21",
    minimumNormalText: 4.5,
  },
  gamutCusp: {
    lightnessMax: 0.9,
    lightnessMin: 0.4,
    lightnessStep: 0.001,
  },
  neutral: {
    chroma: 0.012,
    lightnessCurve: 1.6,
    lightnessFloor: 0.11,
    lightnessPeak: 0.96,
  },
};

const normalizeHue = (hue) => ((hue % 360) + 360) % 360;
const round = (value, precision = 5) => Number(value.toFixed(precision));
const hueGap = (from, to) => round(normalizeHue(to - from), 2);
const lerp = (from, to, progress) => from + (to - from) * progress;
const smoothstep = (progress) => progress * progress * (3 - 2 * progress);
const byFamily = (families, valueOf) => Object.fromEntries(families.map((family) => [family, valueOf(family)]));

// ---- Palette ----

const oppositionCenter = normalizeHue(bases.harmony.brandHue + bases.harmony.halfTurn + bases.harmony.oppositionBias);

const familyHues = {
  brand: bases.harmony.brandHue,
  pressure: round(normalizeHue(oppositionCenter - bases.harmony.oppositionSpread / 2), 2),
  signal: round(normalizeHue(oppositionCenter + bases.harmony.oppositionSpread / 2), 2),
};
const chromaticFamilies = Object.keys(familyHues);

const canvas = `oklch(${bases.canvasLightness} ${bases.neutral.chroma} ${familyHues.brand})`;

/** Finds the highest Display P3 chroma reachable for a hue within the authored lightness range. */
function findGamutCusp(hue) {
  const { lightnessMax, lightnessMin, lightnessStep } = bases.gamutCusp;
  const sampleCount = Math.round((lightnessMax - lightnessMin) / lightnessStep);
  let cusp = { chroma: 0, lightness: lightnessMin };

  for (let index = 0; index <= sampleCount; index += 1) {
    const lightness = lightnessMin + lightnessStep * index;
    const [, chroma] = new Color("oklch-p3", [lightness, bases.accent.relativeChromaPeak, hue]).to("oklch").coords;
    if (chroma > cusp.chroma) cusp = { chroma, lightness };
  }

  return { chroma: round(cusp.chroma), lightness: round(cusp.lightness) };
}

const familyCusps = byFamily(chromaticFamilies, (family) => findGamutCusp(familyHues[family]));

/** Derives one chromatic step, easing lightness and relative chroma toward the family's gamut cusp. */
function accentStep(family, multiplier) {
  const hue = familyHues[family];
  const tone = smoothstep(multiplier / scaleDivisions);
  const lightness = lerp(bases.accent.lightnessFloor, familyCusps[family].lightness, tone);
  const relativeChroma = lerp(bases.accent.relativeChromaFloor, bases.accent.relativeChromaPeak, tone);
  const [, chroma] = new Color("oklch-p3", [lightness, relativeChroma, hue]).to("oklch").coords;

  return { chroma: round(chroma), hue: round(normalizeHue(hue), 2), lightness: round(lightness) };
}

/** Derives one neutral step: a fixed low chroma on the brand hue, with lightness on a power curve. */
function neutralStep(multiplier) {
  const progress = (multiplier / scaleDivisions) ** bases.neutral.lightnessCurve;
  const lightness = lerp(bases.neutral.lightnessFloor, bases.neutral.lightnessPeak, progress);

  return { chroma: bases.neutral.chroma, hue: familyHues.brand, lightness: round(lightness) };
}

const scales = {
  neutral: scaleMultipliers.map(neutralStep),
  ...byFamily(chromaticFamilies, (family) => scaleMultipliers.map((multiplier) => accentStep(family, multiplier))),
};

const toOklch = ({ chroma, hue, lightness }) =>
  `oklch(${round(lightness)} ${round(chroma)} ${round(normalizeHue(hue), 2)})`;

const palette = Object.fromEntries(Object.entries(scales).map(([family, scale]) => [family, scale.map(toOklch)]));

// ---- Contrast contract ----

const inverseColor = new Color(palette.neutral[bases.contrast.inverseStep - 1]);
const paletteColor = (family, index) => new Color(palette[family][index]);
const contrastWithInverse = (color) => round(color.contrast(inverseColor, bases.contrast.method), 2);

const accentContrast = byFamily(chromaticFamilies, (family) =>
  contrastWithInverse(paletteColor(family, bases.contrast.accentStep - 1))
);
const actionContrast = {
  brand: contrastWithInverse(paletteColor("brand", 8)),
  pressure: contrastWithInverse(
    Color.mix(paletteColor("pressure", 8), paletteColor("pressure", 9), 0.5, { space: "oklab" })
  ),
};

/** Throws when any family's contrast against the inverse text color is below the normal-text minimum. */
function assertContrast(contract, values) {
  const failures = Object.entries(values).filter(([, contrast]) => contrast < bases.contrast.minimumNormalText);
  if (failures.length === 0) return;

  const details = failures.map(([family, contrast]) => `${family} ${contrast}:1`).join(", ");
  throw new Error(`${contract} contrast contract failed: ${details}`);
}

assertContrast("Accent", accentContrast);
assertContrast("Action", actionContrast);

// ---- Outputs ----

/** Expresses a family's cusp relative to the brand cusp, which the CSS stores once. */
function peakRatio(family) {
  return {
    chroma: round(familyCusps[family].chroma / familyCusps.brand.chroma, 8),
    lightness: round(familyCusps[family].lightness / familyCusps.brand.lightness, 8),
  };
}

const familyPeakRatios = byFamily(["pressure", "signal"], peakRatio);

const colorSystem = {
  canvas,
  contrast: {
    ...bases.contrast,
    actionValues: actionContrast,
    values: accentContrast,
  },
  gamut: {
    authoring: "OKLCH",
    mapping: "CSS Color 4",
    target: "display gamut",
  },
  harmony: {
    ...bases.harmony,
    gaps: [
      hueGap(familyHues.brand, familyHues.pressure),
      hueGap(familyHues.pressure, familyHues.signal),
      hueGap(familyHues.signal, familyHues.brand),
    ],
    hues: familyHues,
    oppositionCenter,
  },
  model: "relative OKLCH",
  neutral: bases.neutral,
  scale: {
    ...bases.accent,
    divisions: scaleDivisions,
    multipliers: scaleMultipliers,
    peakRatios: familyPeakRatios,
    peaks: familyCusps,
  },
};

const generatedHeader = "/* Generated from one OKLCH basis and gamut-relative coefficients. Do not edit. */";

/** Declares the linear progress and smoothstep tone of one scale step. */
function scaleStepCss(multiplier) {
  const step = multiplier + 1;
  const progress = `var(--color-scale-progress-${step})`;

  return [
    `  --color-scale-progress-${step}: calc(var(--multiplier-${multiplier}) / var(--color-scale-divisions));`,
    `  --color-scale-tone-${step}: calc(${progress} * ${progress} * (var(--multiplier-3) - var(--multiplier-2) * ${progress}));`,
  ].join("\n");
}

/** Declares a family's per-step chroma, as a fraction of its gamut cusp chroma. */
function gamutChromaCss(family) {
  const cusp = familyCusps[family].chroma;
  const declaration = ({ chroma }, index) =>
    `  --color-gamut-chroma-${family}-${index + 1}: ${round(chroma / cusp, 8)};`;

  return scales[family].map(declaration).join("\n");
}

/** Declares one neutral step on the shared lightness curve. */
function neutralStepCss(multiplier) {
  const step = multiplier + 1;

  return `  --color-neutral-${step}: oklch(
    calc(
      var(--color-neutral-lightness-floor) +
        (var(--color-neutral-lightness-peak) - var(--color-neutral-lightness-floor)) *
          pow(var(--color-scale-progress-${step}), var(--color-neutral-lightness-curve))
    )
    var(--color-neutral-chroma)
    var(--color-hue-brand)
  );`;
}

/** Declares one chromatic step relative to its family's base color. */
function accentStepCss(family, multiplier) {
  const step = multiplier + 1;

  return `  --color-${family}-${step}: oklch(
    from var(--base-${family})
      calc(
        var(--color-accent-lightness-floor) +
          (l - var(--color-accent-lightness-floor)) *
            var(--color-scale-tone-${step})
      )
      calc(c * var(--color-gamut-chroma-${family}-${step}))
      h
  );`;
}

const accentScaleCss = (family) => scaleMultipliers.map((multiplier) => accentStepCss(family, multiplier)).join("\n");

const colorsCss = `${generatedHeader}
:root {
  --base-canvas: oklch(${bases.canvasLightness} var(--color-neutral-chroma) var(--color-hue-brand));
  --color-hue-brand: ${bases.harmony.brandHue};
  --color-harmony-half-turn: ${bases.harmony.halfTurn};
  --color-harmony-opposition-bias: ${bases.harmony.oppositionBias};
  --color-harmony-opposition-spread: ${bases.harmony.oppositionSpread};
  --color-hue-pressure: calc(
    var(--color-hue-brand) + var(--color-harmony-half-turn) +
      var(--color-harmony-opposition-bias) -
      var(--color-harmony-opposition-spread) / var(--multiplier-2)
  );
  --color-hue-signal: calc(
    var(--color-hue-brand) + var(--color-harmony-half-turn) +
      var(--color-harmony-opposition-bias) +
      var(--color-harmony-opposition-spread) / var(--multiplier-2)
  );

  --color-peak-lightness-brand: ${familyCusps.brand.lightness};
  --color-peak-chroma-brand: ${familyCusps.brand.chroma};
  --color-peak-lightness-pressure-factor: ${familyPeakRatios.pressure.lightness};
  --color-peak-chroma-pressure-factor: ${familyPeakRatios.pressure.chroma};
  --color-peak-lightness-signal-factor: ${familyPeakRatios.signal.lightness};
  --color-peak-chroma-signal-factor: ${familyPeakRatios.signal.chroma};
  --base-brand: oklch(
    var(--color-peak-lightness-brand)
    var(--color-peak-chroma-brand)
    var(--color-hue-brand)
  );
  --base-pressure: oklch(
    from var(--base-brand)
      calc(l * var(--color-peak-lightness-pressure-factor))
      calc(c * var(--color-peak-chroma-pressure-factor))
      var(--color-hue-pressure)
  );
  --base-signal: oklch(
    from var(--base-brand)
      calc(l * var(--color-peak-lightness-signal-factor))
      calc(c * var(--color-peak-chroma-signal-factor))
      var(--color-hue-signal)
  );

  --color-accent-lightness-floor: ${bases.accent.lightnessFloor};
  --color-neutral-lightness-floor: ${bases.neutral.lightnessFloor};
  --color-neutral-lightness-peak: ${bases.neutral.lightnessPeak};
  --color-neutral-lightness-curve: ${bases.neutral.lightnessCurve};
  --color-neutral-chroma: ${bases.neutral.chroma};
  --color-scale-divisions: var(--multiplier-${scaleDivisions});
${scaleMultipliers.map(scaleStepCss).join("\n")}

${chromaticFamilies.map(gamutChromaCss).join("\n\n")}

${scaleMultipliers.map(neutralStepCss).join("\n")}
  --base-neutral: var(--color-neutral-9);

${chromaticFamilies.map(accentScaleCss).join("\n\n")}
}
`;

const paletteFamilyJs = ([family, colors]) => `  ${family}: Object.freeze(${JSON.stringify(colors)}),`;

const paletteJs = `${generatedHeader}
// prettier-ignore
export const colorSystem = Object.freeze(${JSON.stringify(colorSystem, null, 2)});

// prettier-ignore
export const palette = Object.freeze({
${Object.entries(palette).map(paletteFamilyJs).join("\n")}
});
`;

const outputs = { "colors.css": colorsCss, "palette.js": paletteJs };

if (!checkOnly) {
  for (const [filename, content] of Object.entries(outputs))
    await writeFile(resolve(outputDirectory, filename), content);
} else {
  const staleFiles = [];
  for (const [filename, content] of Object.entries(outputs)) {
    const current = await readFile(resolve(outputDirectory, filename), "utf8").catch(() => undefined);
    if (current !== content) staleFiles.push(filename);
  }

  if (staleFiles.length > 0) throw new Error(`Generated color artifacts are stale: ${staleFiles.join(", ")}`);
}
