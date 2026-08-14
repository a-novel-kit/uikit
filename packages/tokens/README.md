# @a-novel-kit/uikit-tokens

Agora's design tokens ship as one dependency-free stylesheet. Import it once in the application shell.

```ts
import "@a-novel-kit/uikit-tokens/tokens.css";
```

## Scale model

A small set of base values controls each foundation. Public tokens derive from those bases through
shared numeric multipliers, so a global density or shape adjustment stays local to one declaration.

```css
--space-base: 0.25rem;
--space-4: calc(var(--space-base) * var(--multiplier-4));

--radius-base: 0.25rem;
--radius-md: calc(var(--radius-base) * var(--multiplier-2));
```

Components consume public tokens such as `--space-4` and `--radius-md`. Base and multiplier tokens
define the system's scale and are not component-level choices.

## Color

Colors are authored from one OKLCH anchor. The generated stylesheet keeps primitives in `oklch()`,
relative color syntax, and CSS math. Semantic transparency and blending use `color-mix()`. The browser
maps each device-independent color to the display gamut at paint time under CSS Color 4. Applications
receive a dependency-free stylesheet.

Electric blue at `232deg` anchors the palette. Its `52deg` complement is biased by `-10deg` to an
opposition center at `42deg`, then split by `±26deg`. CSS `calc()` derives pressure at `16deg` and signal
at `68deg`, producing `144deg / 52deg / 164deg` gaps from the brand hue.

The generator samples the Display P3 gamut to calculate peak and per-step chroma coefficients for each
derived hue. The CSS output stores the brand peak once. Relative OKLCH applies generated lightness and
chroma factors to pressure and signal, preserving the approved vividness without authored RGB values.

```css
--color-hue-pressure: calc(
  var(--color-hue-brand) + var(--color-harmony-half-turn) + var(--color-harmony-opposition-bias) -
    var(--color-harmony-opposition-spread) / var(--multiplier-2)
);

--base-pressure: oklch(
  from var(--base-brand) calc(l * var(--color-peak-lightness-pressure-factor))
    calc(c * var(--color-peak-chroma-pressure-factor)) var(--color-hue-pressure)
);
```

The chromatic ramps end at each hue's Display P3 gamut cusp: brand `L 0.718 / C 0.193`, pressure
`L 0.656 / C 0.296`, and signal `L 0.797 / C 0.201`. Chromatic lightness and relative chroma follow a
smoothstep curve toward those cusps. Neutrals use a `1.6` lightness curve, fixed `C = 0.008`, and the
brand hue. Both curves hold early steps near black, then accelerate into the vivid and readable half
of each scale.

Semantic surfaces and borders mix the cusp-derived peaks into the neutral field. Their strengths derive
from `--color-mix-base: 6.25%`: surfaces use two units and borders use eight, nine, or ten units.
Graphic grid, trace, glow, and gradient tokens use the same palette and mix scale; effects remain
separate from component meaning and foreground contrast.

Components use semantic aliases such as `--color-action-primary` and `--color-feedback-error-text`.
Brand carries agency, pressure carries urgency and failure, and signal carries readiness and successful
outcomes. Actions use a restrained idle step, lighten once on hover, and reserve the peak plus glow for
selected state. Disabled controls use neutral surface, border, and text tokens. Feedback components pair
color with a label or icon. Primitive palette steps remain available for design-system work.

`scripts/generate-colors.mjs` is the authoring source. Run
`pnpm --filter @a-novel-kit/uikit-tokens generate:colors` after changing its compact bases. It writes
the formula-based `colors.css` and an OKLCH `palette` export for tooling. Color.js samples gamut only
during development. The private Storybook manager derives the legacy string required by its theme
parser; that conversion is outside the token and component APIs.

## Spacing, shape, and motion

Spacing uses a `0.25rem` base. Blur, radius, control height, border, focus-ring, duration, easing, and
disabled opacity tokens follow the same compact model. Changing a base preserves the relationships
between generated values.

## Type

The font-family tokens map to the faces vendored in [`@a-novel-kit/uikit-fonts`](../fonts). The size
scale is generated from a `1rem` base and a `0.125rem` step. Heros exposes regular and bold faces, so
interface emphasis uses `400` or `700`.
