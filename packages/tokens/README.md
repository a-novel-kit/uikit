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

One lightness base, one chroma base, one hue base, and small step values generate every family. Family
hues are rotations of `--color-hue-base`; family chroma uses named multipliers. Shared lightness and
chroma ramps then generate each 12-step palette in CSS.

```css
--color-brand-9: oklch(from var(--base-brand) var(--scale-l-9) calc(c * var(--scale-c-9)) h);
```

Components use semantic aliases such as `--color-action-primary` and `--color-text-primary`. Primitive
palette steps remain available for design-system work. Relative color syntax requires Chrome 119+,
Safari 16.4+, or Firefox 128+.

## Spacing, shape, and motion

Spacing uses a `0.25rem` base. Radius, control height, border, focus-ring, duration, easing, and disabled
opacity tokens follow the same compact model. Changing a base preserves the relationships between
generated values.

## Type

The font-family tokens map to the faces vendored in [`@a-novel-kit/uikit-fonts`](../fonts). The size
scale is generated from a `1rem` base and a `0.125rem` step. Heros exposes regular and bold faces, so
interface emphasis uses `400` or `700`.
