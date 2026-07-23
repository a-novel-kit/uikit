# @a-novel-kit/uikit-tokens

Agora's design tokens as a single static stylesheet — `tokens.css`. No build, no script, no dependencies:
it is CSS. Import it once.

```ts
import "@a-novel-kit/uikit-tokens/tokens.css";
```

## Colour — derived in pure CSS

Each family has **one hand-written base OKLCH** (`--base-brand`, `--base-neutral`, …), and every 12-step
scale (`--color-<family>-<1..12>`) is **derived from it in CSS** with relative color syntax + `calc()`:

```css
--color-brand-9: oklch(from var(--base-brand) var(--scale-l-9) calc(c * var(--scale-c-9)) h);
```

Hold the hue (`h`), walk the shared lightness ramp (`--scale-l-*`, perceptually even), taper the chroma
(`c × --scale-c-*`). **Recolour the whole system by editing a `--base-*` value** — the scales follow. Six
families: `neutral`, `brand`, `pressure`, `success`, `warning`, `danger`.

Requires relative color syntax (Chrome 119+, Safari 16.4+, Firefox 128+ — a fine baseline for a web-only
product).

## Type

`--font-family-{display,interface,story,mono}` and `--font-weight-{regular,bold}` map to the faces vendored
in [`@a-novel-kit/uikit-fonts`](../fonts). Heros ships only 400/700, so emphasis is Bold, never a mid weight.
