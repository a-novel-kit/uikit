import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import Color from "colorjs.io";

const outputDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const checkOnly = process.argv.includes("--check");
const scaleLength = 12;
const scaleDivisions = scaleLength - 1;
const scaleMultipliers = Array.from({ length: scaleLength }, (_, index) => index);

const bases = Object.freeze({
  harmony: Object.freeze({
    halfTurn: 180,
    brandHue: 232,
    oppositionBias: -10,
    oppositionSpread: 52,
  }),
  accent: Object.freeze({
    lightnessFloor: 0.26,
    relativeChromaFloor: 0.8,
    relativeChromaPeak: 1,
    toneCurve: "smoothstep",
  }),
  contrast: Object.freeze({
    accentStep: 10,
    inverseStep: 1,
    method: "WCAG21",
    minimumNormalText: 4.5,
  }),
  gamutCusp: Object.freeze({
    lightnessMax: 0.9,
    lightnessMin: 0.4,
    lightnessStep: 0.001,
  }),
  neutral: Object.freeze({
    chroma: 0.008,
    lightnessCurve: 1.6,
    lightnessFloor: 0.11,
    lightnessPeak: 0.96,
  }),
});

const normalizeHue = (hue) => ((hue % 360) + 360) % 360;
const round = (value, precision = 5) => Number(value.toFixed(precision));
const hueGap = (from, to) => round(normalizeHue(to - from), 2);
const curve = (progress, exponent) => progress ** exponent;
const smoothstep = (progress) => progress * progress * (3 - 2 * progress);

const oppositionCenter = normalizeHue(bases.harmony.brandHue + bases.harmony.halfTurn + bases.harmony.oppositionBias);

const familyHues = Object.freeze({
  brand: bases.harmony.brandHue,
  pressure: round(normalizeHue(oppositionCenter - bases.harmony.oppositionSpread / 2), 2),
  signal: round(normalizeHue(oppositionCenter + bases.harmony.oppositionSpread / 2), 2),
});

const findGamutCusp = (hue) => {
  const sampleCount = Math.round(
    (bases.gamutCusp.lightnessMax - bases.gamutCusp.lightnessMin) / bases.gamutCusp.lightnessStep
  );
  let cusp = { chroma: 0, lightness: bases.gamutCusp.lightnessMin };

  for (let index = 0; index <= sampleCount; index += 1) {
    const lightness = bases.gamutCusp.lightnessMin + bases.gamutCusp.lightnessStep * index;
    const color = new Color("oklch-p3", [lightness, bases.accent.relativeChromaPeak, hue]);
    const [, chroma] = color.to("oklch").coords;

    if (chroma > cusp.chroma) {
      cusp = { chroma, lightness };
    }
  }

  return Object.freeze({
    chroma: round(cusp.chroma),
    lightness: round(cusp.lightness),
  });
};

const familyCusps = Object.freeze(
  Object.fromEntries(Object.entries(familyHues).map(([family, hue]) => [family, findGamutCusp(hue)]))
);

const toOklch = ({ chroma, hue, lightness }) =>
  `oklch(${round(lightness)} ${round(chroma)} ${round(normalizeHue(hue), 2)})`;

const accentScale = (family, hue) =>
  scaleMultipliers.map((multiplier) => {
    const progress = multiplier / scaleDivisions;
    const toneProgress = smoothstep(progress);
    const lightness =
      bases.accent.lightnessFloor + (familyCusps[family].lightness - bases.accent.lightnessFloor) * toneProgress;
    const relativeChroma =
      bases.accent.relativeChromaFloor +
      (bases.accent.relativeChromaPeak - bases.accent.relativeChromaFloor) * toneProgress;
    const color = new Color("oklch-p3", [lightness, relativeChroma, hue]);
    const [, chroma] = color.to("oklch").coords;

    return Object.freeze({
      chroma: round(chroma),
      hue: round(normalizeHue(hue), 2),
      lightness: round(lightness),
    });
  });

const neutralScale = scaleMultipliers.map((multiplier) => {
  const progress = multiplier / scaleDivisions;
  const lightness =
    bases.neutral.lightnessFloor +
    (bases.neutral.lightnessPeak - bases.neutral.lightnessFloor) * curve(progress, bases.neutral.lightnessCurve);
  return Object.freeze({
    chroma: bases.neutral.chroma,
    hue: familyHues.brand,
    lightness: round(lightness),
  });
});

const scales = Object.freeze({
  neutral: neutralScale,
  brand: accentScale("brand", familyHues.brand),
  pressure: accentScale("pressure", familyHues.pressure),
  signal: accentScale("signal", familyHues.signal),
});

const chromaticFamilies = ["brand", "pressure", "signal"];

const palette = Object.fromEntries(Object.entries(scales).map(([family, scale]) => [family, scale.map(toOklch)]));

const inverseColor = new Color(palette.neutral[bases.contrast.inverseStep - 1]);
const accentContrast = Object.freeze(
  Object.fromEntries(
    chromaticFamilies.map((family) => [
      family,
      round(new Color(palette[family][bases.contrast.accentStep - 1]).contrast(inverseColor, bases.contrast.method), 2),
    ])
  )
);
const actionContrast = Object.freeze({
  brand: round(new Color(palette.brand[8]).contrast(inverseColor, bases.contrast.method), 2),
  pressure: round(
    Color.mix(new Color(palette.pressure[8]), new Color(palette.pressure[9]), 0.5, { space: "oklab" }).contrast(
      inverseColor,
      bases.contrast.method
    ),
    2
  ),
});
const contrastFailures = Object.entries(accentContrast).filter(
  ([, contrast]) => contrast < bases.contrast.minimumNormalText
);
const actionContrastFailures = Object.entries(actionContrast).filter(
  ([, contrast]) => contrast < bases.contrast.minimumNormalText
);

if (contrastFailures.length > 0) {
  throw new Error(
    `Accent contrast contract failed: ${contrastFailures
      .map(([family, contrast]) => `${family} ${contrast}:1`)
      .join(", ")}`
  );
}

if (actionContrastFailures.length > 0) {
  throw new Error(
    `Action contrast contract failed: ${actionContrastFailures
      .map(([family, contrast]) => `${family} ${contrast}:1`)
      .join(", ")}`
  );
}

const familyPeakRatios = Object.freeze(
  Object.fromEntries(
    ["pressure", "signal"].map((family) => [
      family,
      Object.freeze({
        chroma: round(familyCusps[family].chroma / familyCusps.brand.chroma, 8),
        lightness: round(familyCusps[family].lightness / familyCusps.brand.lightness, 8),
      }),
    ])
  )
);

const gamutChromaRatios = Object.freeze(
  Object.fromEntries(
    Object.entries(scales)
      .filter(([family]) => family !== "neutral")
      .map(([family, scale]) => [
        family,
        Object.freeze(scale.map(({ chroma }) => round(chroma / familyCusps[family].chroma, 8))),
      ])
  )
);

const colorSystem = {
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

const neutralColorLines = scaleMultipliers.flatMap((_, index) => {
  const step = index + 1;

  return [
    `  --color-neutral-${step}: oklch(`,
    "    calc(",
    "      var(--color-neutral-lightness-floor) +",
    "        (var(--color-neutral-lightness-peak) - var(--color-neutral-lightness-floor)) *",
    `          pow(var(--color-scale-progress-${step}), var(--color-neutral-lightness-curve))`,
    "    )",
    "    var(--color-neutral-chroma)",
    "    var(--color-hue-brand)",
    "  );",
  ];
});

const accentColorLines = chromaticFamilies.flatMap((family, familyIndex) => [
  ...scaleMultipliers.flatMap((_, index) => {
    const step = index + 1;

    return [
      `  --color-${family}-${step}: oklch(`,
      `    from var(--base-${family})`,
      "      calc(",
      "        var(--color-accent-lightness-floor) +",
      "          (l - var(--color-accent-lightness-floor)) *",
      `            var(--color-scale-tone-${step})`,
      "      )",
      `      calc(c * var(--color-gamut-chroma-${family}-${step}))`,
      "      h",
      "  );",
    ];
  }),
  ...(familyIndex < chromaticFamilies.length - 1 ? [""] : []),
]);

const cssLines = [
  "/* Generated from one OKLCH basis and gamut-relative coefficients. Do not edit. */",
  ":root {",
  `  --color-hue-brand: ${bases.harmony.brandHue};`,
  `  --color-harmony-half-turn: ${bases.harmony.halfTurn};`,
  `  --color-harmony-opposition-bias: ${bases.harmony.oppositionBias};`,
  `  --color-harmony-opposition-spread: ${bases.harmony.oppositionSpread};`,
  "  --color-hue-pressure: calc(",
  "    var(--color-hue-brand) + var(--color-harmony-half-turn) +",
  "      var(--color-harmony-opposition-bias) -",
  "      var(--color-harmony-opposition-spread) / var(--multiplier-2)",
  "  );",
  "  --color-hue-signal: calc(",
  "    var(--color-hue-brand) + var(--color-harmony-half-turn) +",
  "      var(--color-harmony-opposition-bias) +",
  "      var(--color-harmony-opposition-spread) / var(--multiplier-2)",
  "  );",
  "",
  `  --color-peak-lightness-brand: ${familyCusps.brand.lightness};`,
  `  --color-peak-chroma-brand: ${familyCusps.brand.chroma};`,
  `  --color-peak-lightness-pressure-factor: ${familyPeakRatios.pressure.lightness};`,
  `  --color-peak-chroma-pressure-factor: ${familyPeakRatios.pressure.chroma};`,
  `  --color-peak-lightness-signal-factor: ${familyPeakRatios.signal.lightness};`,
  `  --color-peak-chroma-signal-factor: ${familyPeakRatios.signal.chroma};`,
  "  --base-brand: oklch(",
  "    var(--color-peak-lightness-brand)",
  "    var(--color-peak-chroma-brand)",
  "    var(--color-hue-brand)",
  "  );",
  "  --base-pressure: oklch(",
  "    from var(--base-brand)",
  "      calc(l * var(--color-peak-lightness-pressure-factor))",
  "      calc(c * var(--color-peak-chroma-pressure-factor))",
  "      var(--color-hue-pressure)",
  "  );",
  "  --base-signal: oklch(",
  "    from var(--base-brand)",
  "      calc(l * var(--color-peak-lightness-signal-factor))",
  "      calc(c * var(--color-peak-chroma-signal-factor))",
  "      var(--color-hue-signal)",
  "  );",
  "",
  `  --color-accent-lightness-floor: ${bases.accent.lightnessFloor};`,
  `  --color-neutral-lightness-floor: ${bases.neutral.lightnessFloor};`,
  `  --color-neutral-lightness-peak: ${bases.neutral.lightnessPeak};`,
  `  --color-neutral-lightness-curve: ${bases.neutral.lightnessCurve};`,
  `  --color-neutral-chroma: ${bases.neutral.chroma};`,
  "  --color-scale-divisions: var(--multiplier-11);",
  ...scaleMultipliers.flatMap((multiplier, index) => {
    const step = index + 1;

    return [
      `  --color-scale-progress-${step}: calc(var(--multiplier-${multiplier}) / var(--color-scale-divisions));`,
      `  --color-scale-tone-${step}: calc(var(--color-scale-progress-${step}) * var(--color-scale-progress-${step}) * (var(--multiplier-3) - var(--multiplier-2) * var(--color-scale-progress-${step})));`,
    ];
  }),
  "",
  ...Object.entries(gamutChromaRatios).flatMap(([family, ratios], familyIndex) => [
    ...ratios.map((ratio, index) => `  --color-gamut-chroma-${family}-${index + 1}: ${ratio};`),
    ...(familyIndex < chromaticFamilies.length - 1 ? [""] : []),
  ]),
  "",
  ...neutralColorLines,
  "  --base-neutral: var(--color-neutral-9);",
  "",
  ...accentColorLines,
  "}",
  "",
];

const moduleLines = [
  "/* Generated from one OKLCH basis and gamut-relative coefficients. Do not edit. */",
  "// prettier-ignore",
  `export const colorSystem = Object.freeze(${JSON.stringify(colorSystem, null, 2)});`,
  "",
  "// prettier-ignore",
  "export const palette = Object.freeze({",
  ...Object.entries(palette).map(([family, colors]) => `  ${family}: Object.freeze(${JSON.stringify(colors)}),`),
  "});",
  "",
];

const outputs = {
  "colors.css": cssLines.join("\n"),
  "palette.js": moduleLines.join("\n"),
};

const staleFiles = [];

await Promise.all(
  Object.entries(outputs).map(async ([filename, content]) => {
    const outputPath = resolve(outputDirectory, filename);

    if (!checkOnly) {
      await writeFile(outputPath, content);
      return;
    }

    let current;
    try {
      current = await readFile(outputPath, "utf8");
    } catch {
      staleFiles.push(filename);
      return;
    }

    if (current !== content) {
      staleFiles.push(filename);
    }
  })
);

if (staleFiles.length > 0) {
  throw new Error(`Generated color artifacts are stale: ${staleFiles.sort().join(", ")}`);
}
