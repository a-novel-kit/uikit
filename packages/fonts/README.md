# @a-novel-kit/uikit-fonts

Self-hosted web fonts for the A-Novel design system. The WOFF2 files ship in this package, so an
application serves them from its own origin.

## Voices

| Token voice         | Family                                     | License                       |
| ------------------- | ------------------------------------------ | ----------------------------- |
| Interface / Display | TeX Gyre Heros + Heros Cn (Latin, 400/700) | GUST Font License (LPPL 1.3c) |
| Story               | Lora (variable serif)                      | SIL OFL 1.1                   |
| Mono                | JetBrains Mono (variable)                  | SIL OFL 1.1                   |
| Interface fallback  | Arimo (Latin, metric-compatible)           | SIL OFL 1.1                   |

TeX Gyre Heros is scoped to Latin through `unicode-range`, so other scripts fall through the family
stack. Platforms add locale-specific faces, such as Noto, for those scripts. Heros exposes real 400
and 700 weights.

## Usage

Import the stylesheet once in the application shell, so the platform's build bundles it.

```ts
import "@a-novel-kit/uikit-fonts/fonts.css";
```

Reference the families through the design tokens: `--font-family-interface`, `--font-family-display`,
`--font-family-story`, and `--font-family-mono`.

## Reproducing the vendored fonts

```sh
pnpm --filter @a-novel-kit/uikit-fonts vendor
```

The script downloads TeX Gyre Heros and its license from CTAN, and converts the faces to WOFF2. It
copies the OFL faces and their licenses from their npm packages. The `files/` and `licenses/` it
writes are committed and published.
