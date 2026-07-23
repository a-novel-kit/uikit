// Derive the primitive colour palette as perceptually-even OKLCH scales, seeded
// from the demo's own colours (see a-novel-kit/.github#140). OKLCH is chosen so
// lightness steps are perceptually uniform: every scale is one hue with an even
// lightness ramp and a chroma that peaks near the solid step. Re-run to
// regenerate from the seeds — the palette is a function of (seed hue, curve),
// never hand-picked hexes, which is what makes "change the colour later" a
// one-line edit. Emits DTCG token JSON that Style Dictionary compiles.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { converter } from "culori";

const toOklch = converter("oklch");

// Seeds distilled from the demo: the cyan signal (#38bdf8), the coral "pressure"
// accent DESIGN.md documents (#f15343), the near-black canvas (#0b0b0d), and the
// functional hues (green/amber/red). Only the *hue* of each seed is kept — the
// lightness/chroma come from the shared curve, so every family is coherent.
interface Family {
  seed: string;
  chromaMax: number;
  hueFallback?: number;
}

const FAMILIES: Record<string, Family> = {
  neutral: { seed: "#0b0b0d", chromaMax: 0.012, hueFallback: 255 },
  brand: { seed: "#38bdf8", chromaMax: 0.14 },
  pressure: { seed: "#f15343", chromaMax: 0.17 },
  success: { seed: "#3fb950", chromaMax: 0.15 },
  warning: { seed: "#f0b429", chromaMax: 0.15 },
  danger: { seed: "#ef4444", chromaMax: 0.17 },
};

const STEPS = 12;
// Dark-first: an even OKLCH lightness ramp from the app background (step 1) to
// near-white ink (step 12). Even L steps are the "mathematically logical" part —
// OKLCH makes them perceptually uniform.
const L_MIN = 0.17;
const L_MAX = 0.96;

// Chroma is low at the background/ink ends and peaks near the "solid" step,
// mirroring the Radix step semantics (1-2 backgrounds, 9 solid, 11-12 text).
const chromaShape = (t: number): number => 0.28 + 0.72 * Math.sin(Math.PI * Math.pow(t, 0.85));

const round = (n: number, digits = 4): number => Number(n.toFixed(digits));

interface Token {
  $type: "color";
  $value: string;
  $description: string;
}

function scale(hue: number, chromaMax: number): Record<string, Token> {
  const out: Record<string, Token> = {};
  for (let i = 1; i <= STEPS; i++) {
    const t = (i - 1) / (STEPS - 1);
    const l = round(L_MIN + (L_MAX - L_MIN) * t, 4);
    const c = round(chromaMax * chromaShape(t), 4);
    const h = round(hue, 2);
    out[String(i)] = {
      $type: "color",
      $value: `oklch(${l} ${c} ${h})`,
      $description: `step ${i} of ${STEPS}`,
    };
  }
  return out;
}

const color: Record<string, Record<string, Token>> = {};
for (const [name, family] of Object.entries(FAMILIES)) {
  const seed = toOklch(family.seed);
  const hue = seed?.h ?? family.hueFallback ?? 0;
  color[name] = scale(hue, family.chromaMax);
}

const dest = join(import.meta.dirname, "..", "src", "color.tokens.json");
mkdirSync(dirname(dest), { recursive: true });
writeFileSync(dest, `${JSON.stringify({ color }, null, 2)}\n`);
console.log(`Generated ${Object.keys(FAMILIES).length} x ${STEPS}-step OKLCH scales -> ${dest}`);
