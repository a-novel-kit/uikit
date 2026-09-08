# @a-novel-kit/uikit-images

Lossless, web-ready Agora brand images. The package owns the editable source artwork in `raw/` and
contains responsive banners and square icons in `files/`. Raw artwork remains in Git LFS and is not
included in the published npm package.

## Usage

Import the smallest file that covers the image's rendered size and display density. Bundlers such as
Vite resolve the import to a public asset URL.

```ts
import bannerUrl from "@a-novel-kit/uikit-images/files/banner/1280w/agora-banner.png";
import iconUrl from "@a-novel-kit/uikit-images/files/icon/192x192/agora-icon.png";
```

Banner files retain the source aspect ratio and are available at widths from 320 to 3840 pixels.
Their `*w` directories map directly to HTML `srcset` width descriptors. Icon files cover browser,
PWA, and app surfaces from 16×16 through 1024×1024 pixels.

Use meaningful alternative text when the brand image contributes content. Use an empty `alt` when
the surrounding interface already names Agora.

## Reproducing the images

Run the repository generator after changing reviewed source artwork or a preset:

```sh
pnpm generate:images
```

The source-to-preset manifest is hardcoded in `scripts/generate-images.mjs`. Sources live in
`packages/images/raw`; generated files keep the source filename, and their directories identify the
preset and resolution.
