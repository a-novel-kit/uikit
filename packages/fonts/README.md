# @a-novel-kit/uikit-fonts

Self-hosted web fonts for the Agora design system. **Every byte is vendored in this package**
(`files/*.woff2`) and served same-origin — no CDN, no runtime font dependency, CSP-clean.

## Voices

| Token voice         | Family                                     | License                       |
| ------------------- | ------------------------------------------ | ----------------------------- |
| Interface / Display | TeX Gyre Heros + Heros Cn (Latin, 400/700) | GUST Font License (LPPL 1.3c) |
| Story               | Lora (variable serif)                      | SIL OFL 1.1                   |
| Mono                | JetBrains Mono (variable)                  | SIL OFL 1.1                   |
| Interface fallback  | Arimo (Latin, metric-compatible)           | SIL OFL 1.1                   |

TeX Gyre Heros is scoped to Latin through `unicode-range`. Missing scripts continue through the
family stack; platforms add locale-specific Noto faces. Heros exposes real 400 and 700 weights.

## Usage

Import the stylesheet once in the app shell (bundled by the platform's build, never `@import`-chained):

```ts
import "@a-novel-kit/uikit-fonts/fonts.css";
```

Then reference the families through the design tokens (`--font-family-interface`, `--font-family-display`,
`--font-family-story`, `--font-family-mono`).

## Reproducing the vendored fonts

```sh
pnpm vendor
```

Fetches TeX Gyre Heros from CTAN and converts the OTF to WOFF2 **ourselves**; copies the OFL variable
voices (Lora, JetBrains Mono, Arimo) out of their npm packages. The produced `files/` are committed —
they _are_ the fonts. Font licenses ship in `licenses/`.
