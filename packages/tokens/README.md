# @a-novel-kit/uikit-tokens

Agora's design tokens as a single static stylesheet — `tokens.css`. CSS custom properties for colour
(`--color-*`), font families (`--font-family-*`) and weights (`--font-weight-*`). No build step: import it.

```ts
import "@a-novel-kit/uikit-tokens/tokens.css";
```

## Colour

`--color-<family>-<1..12>` are perceptually-even **OKLCH** scales (`oklch()` is a standard CSS colour) for
six families — `neutral`, `brand`, `pressure`, `success`, `warning`, `danger`. They are _derived_, not
hand-picked: each is one hue (taken from a demo seed) with an even lightness ramp and a chroma that peaks at
the solid step. To recolour, edit the seed in `scripts/generate.mjs` and run `pnpm generate` — the committed
`tokens.css` is rewritten.

## Type

`--font-family-{display,interface,story,mono}` and `--font-weight-{regular,bold}` map to the faces vendored
in [`@a-novel-kit/uikit-fonts`](../fonts). Heros ships only 400/700, so emphasis is Bold, never a mid weight.
