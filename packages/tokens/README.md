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
Graphic and gradient tokens use the same palette and mix scale. Effects carry no
component meaning and play no part in foreground contrast.

Components use semantic aliases such as `--color-action-primary` and `--color-feedback-error-text`.
Brand is the base and carries agency. Signal highlights what deserves notice without calling for
action: a success, or an upcoming change. Pressure marks errors and anything that needs immediate
attention.

A hue shows two ways, and they pair. Its ink is the neon itself (`--color-ink-{brand,pressure,signal}`), for
what is drawn thin: text, an icon, a line. Its tint is a deep step of its ramp
(`--color-tint-{brand,pressure,signal}`), for what is filled under its ink: a tag, a chosen chip, a colored
action. The neon never fills behind text. A pair is lit with its fill one step up and its ink a quarter of the
way to white (`--color-{ink,tint}-{brand,pressure,signal}-lit`): the pointer lights an action, a chosen action
stays lit, and a label, which has no resting look to stand out of, always shows lit. Nothing glows: no action, no
label, no mark. A mark that is on, such as a checked box or a switch, is small, so the brand's ink fills it
(`--color-control-on`). Disabled controls use neutral surface,
border, and text tokens. Feedback components pair color with a label or icon. Primitive palette steps remain
available for design-system work.

A custom color is one a person gives to an item of their own, such as a tag or a calendar. It is a family apart
from the three hues, and shows only on what a person colored. `--color-mark-custom` is the exact color, for a small
solid mark. `--color-ink-custom` on `--color-tint-custom`, and their `-lit` forms, are its pair, which takes the
color's hue alone. They default to no mark and the neutral pair: uikit's `customColorStyle` sets them on a colored
item. The `palette` entry also exports the `swatches` offered beside a free choice: the three hues and the steps
between them, about 30 degrees apart, each stored as its hue's most saturated sRGB color.

`scripts/generate-colors.mjs` is the authoring source. Run
`pnpm --filter @a-novel-kit/uikit-tokens generate:colors` after changing its compact bases. It writes
the literal `colors.css` and an OKLCH `palette` export for tooling. Color.js samples gamut only
during development. The private Storybook manager converts colors to the sRGB strings its theme parser
requires. That conversion stays outside the token and component APIs.

## Spacing, shape, and motion

Spacing steps by a `0.1875rem` (3px) base, and sizes, such as control heights, icons and blurs, by a
`0.25rem` (4px) one. Radius, border, duration and opacity tokens each multiply their own base, and the
focus ring derives from the border's. Changing a base preserves the relationships between generated
values.

## Type

The font-family tokens map to the faces vendored in [`@a-novel-kit/uikit-fonts`](../fonts). The size
scale multiplies or divides a `1rem` base by powers of the `1.125` density ratio. Heros exposes
regular and bold faces, so interface emphasis uses `400` or `700`.

## Token contract

`uikit-token-contract` holds an application's CSS to these tokens. It reads the stylesheets and the
Svelte style blocks under each directory it is given, and fails on:

- A `var(--name)` with no fallback that nothing defines. A misspelled or removed custom property fails
  silently in the browser.
- A property that reads outside its family: a padding that takes a `--size-*` token, a width that takes
  a `--space-*` one, a `font-size` where `font: var(--text-*)` sets the whole text style.
- A raw value where a scale exists: a length, a time, an easing, a `z-index`.
- A scale taken apart: a base such as `--space-base`, or a `calc()` that multiplies a space or a size
  by a number.
- An `@media` width other than `35rem` or `48rem`.
- A primitive palette token, such as `--color-brand-9`.
- A hex, `rgb()`, `hsl()` or Display P3 color literal. The check reads scripts and documents for this
  rule too.

Each violation prints the family its property takes. Run the check from the application's root, where
it also reads the custom properties that uikit's components declare:

```bash
pnpm exec uikit-token-contract src
```

Stories and documentation show primitives and demo values. Under a `--docs` directory, only the
unknown token and color literal rules hold:

```bash
pnpm exec uikit-token-contract --docs src/stories src
```

A value no scale holds states its reason in a comment directly above its declaration:

```css
/* off-scale: half a grid step above and below its line */
padding-block: calc(var(--size-1) / 2);
```

The comment exempts that declaration, or the `@media` rule it sits above. An unknown token and a color
literal still fail under it, and so does a comment that excuses nothing. The check prints how many
exceptions it let through, and `--list-exceptions` lists them.

In this repository, `pnpm lint` runs the check over every package.
