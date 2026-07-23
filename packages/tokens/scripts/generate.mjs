// DEV-ONLY regenerator for tokens.css. The committed tokens.css is what ships —
// this script exists only so the colours stay DERIVED (not hand-picked): they are
// perceptually-even OKLCH scales seeded from the demo's own colours. Change a seed
// and run: node scripts/generate.mjs
//
// OKLCH keeps lightness perceptually uniform, so each scale is one hue with an even
// lightness ramp and a chroma that peaks near the solid step.
import { writeFileSync } from "node:fs";
import { join } from "node:path";

import { converter } from "culori";

const toOklch = converter("oklch");

// Only the seed HUE is kept; lightness + chroma come from the shared curve, so all
// families are coherent and recolouring is a one-line seed edit.
const FAMILIES = {
  neutral: { seed: "#0b0b0d", chromaMax: 0.012, hueFallback: 255 },
  brand: { seed: "#38bdf8", chromaMax: 0.14 },
  pressure: { seed: "#f15343", chromaMax: 0.17 },
  success: { seed: "#3fb950", chromaMax: 0.15 },
  warning: { seed: "#f0b429", chromaMax: 0.15 },
  danger: { seed: "#ef4444", chromaMax: 0.17 },
};

const STEPS = 12;
const L_MIN = 0.17;
const L_MAX = 0.96;
const chromaShape = (t) => 0.28 + 0.72 * Math.sin(Math.PI * Math.pow(t, 0.85));
const round = (n, d = 4) => Number(n.toFixed(d));

const colours = [];
for (const [name, f] of Object.entries(FAMILIES)) {
  const hue = round(toOklch(f.seed)?.h ?? f.hueFallback ?? 0, 2);
  for (let i = 1; i <= STEPS; i++) {
    const t = (i - 1) / (STEPS - 1);
    const l = round(L_MIN + (L_MAX - L_MIN) * t);
    const c = round(f.chromaMax * chromaShape(t));
    colours.push(`  --color-${name}-${i}: oklch(${l} ${c} ${hue});`);
  }
}

// Static token voices — the families map to the vendored @a-novel-kit/uikit-fonts.
const fonts = [
  '  --font-family-display: "TeX Gyre Heros Cn", "Arial Narrow", "Noto Sans", sans-serif;',
  '  --font-family-interface: "TeX Gyre Heros", Arimo, "Noto Sans", Arial, system-ui, sans-serif;',
  '  --font-family-story: "Lora", Georgia, "Noto Serif", serif;',
  '  --font-family-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;',
  "  --font-weight-regular: 400;",
  "  --font-weight-bold: 700;",
];

const header = [
  "/* Agora design tokens — a static, committed stylesheet (no build step).",
  " * Colours are perceptually-even OKLCH scales DERIVED from the demo seeds;",
  " * regenerate after a seed change with: node scripts/generate.mjs",
  " */",
].join("\n");

const css = `${header}\n:root {\n${colours.join("\n")}\n\n${fonts.join("\n")}\n}\n`;
writeFileSync(join(import.meta.dirname, "..", "tokens.css"), css);
console.log(`wrote tokens.css (${Object.keys(FAMILIES).length}x${STEPS} OKLCH + font tokens)`);
