# @a-novel-kit/uikit-tokens

A-Novel's design tokens ship as one dependency-free stylesheet. Import it once in the application shell.

```ts
import "@a-novel-kit/uikit-tokens/tokens.css";
```

An application also imports the page canvas once. It paints the canvas color on the root, hangs the app's lamp on
a layer fixed behind the page, and sets the body's font and the 20rem reflow floor.

```ts
import "@a-novel-kit/uikit-tokens/canvas.css";
```

## Scale model

A small set of base values controls each foundation. Public tokens multiply those bases, so a global
density or shape adjustment stays local to one declaration.

```css
--space-base: 0.1875rem;
--space-4: calc(var(--space-base) * 4);

--radius-base: 0.1875rem;
--radius-md: calc(var(--radius-base) * 2);
```

Components consume public tokens such as `--space-4` and `--radius-md`. Base tokens define the scale
itself.

## Color

Colors are authored from one OKLCH anchor in `scripts/generate-colors.mjs`, which writes every
primitive to `colors.css` as a literal `oklch()` color. Semantic transparency and blending use
`color-mix()`. The browser maps each device-independent color to the display gamut at paint time under
CSS Color 4.

Electric blue at `232deg` anchors the palette. Its `52deg` complement is biased by `-10deg` to an
opposition center at `42deg`, then split by `±26deg`. The generator derives pressure at `16deg` and
signal at `68deg`. Going around the hue circle, brand to pressure spans `144deg`, pressure to signal `52deg`,
and signal back to brand `164deg`.

The generator samples the Display P3 gamut to find each hue's peak and per-step chroma, so every step
keeps the approved vividness with no authored RGB value. A runtime override of a hue would leave those
gamut-relative steps behind, so the palette changes only through the generator.

The chromatic ramps end at each hue's Display P3 gamut cusp: brand `L 0.718 / C 0.193`, pressure
`L 0.656 / C 0.296`, and signal `L 0.797 / C 0.201`. Chromatic lightness and relative chroma follow a
smoothstep curve toward those cusps. Neutrals use a `1.6` lightness curve, fixed `C = 0.012`, and the
brand hue. The canvas shares that subtle grey-blue tint with independent lightness. Both curves hold
early steps near black, then accelerate into the vivid and readable half of each scale.

Semantic surfaces and borders mix the cusp-derived peaks into the neutral field. Their strengths derive
from `--color-mix-base: 6.25%`: surfaces use two units and the error border ten.
Graphic, glow, and gradient tokens use the same palette and mix scale. Effects carry no
component meaning and play no part in foreground contrast.

Components use semantic aliases such as `--color-action-primary` and `--color-feedback-error-text`.
Brand is the base and carries agency. Signal highlights what deserves notice without calling for
action: a success, or an upcoming change. Pressure marks errors and anything that needs immediate
attention. Actions use a restrained idle step, lighten once on hover, and reserve the peak plus glow for
selected state. Disabled controls use neutral surface, border, and text tokens. Feedback components pair
color with a label or icon. Primitive palette steps remain available for design-system work.

`scripts/generate-colors.mjs` is the authoring source. Run
`pnpm --filter @a-novel-kit/uikit-tokens generate:colors` after changing its compact bases. It writes
the literal `colors.css` and an OKLCH `palette` export for tooling. Color.js samples gamut only
during development. The private Storybook manager converts colors to the sRGB strings its theme parser
requires. That conversion stays outside the token and component APIs.

## Spacing, shape, and motion

Spacing uses a `0.25rem` base. Blur, radius, control height, border, focus-ring, duration, and
opacity tokens follow the same compact model. Changing a base preserves the relationships between
generated values.

## Type

The font-family tokens map to the faces vendored in [`@a-novel-kit/uikit-fonts`](../fonts). The size
scale multiplies or divides a `1rem` base by powers of the `1.125` density ratio. Heros exposes
regular and bold faces, so interface emphasis uses `400` or `700`.
