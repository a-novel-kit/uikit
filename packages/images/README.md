# @a-novel-kit/uikit-images

Lossless, web-ready logos for Agora, Studio, A-Novel, and KIT. The package publishes responsive
banners and square icons from `files/`. Their editable source artwork stays in `raw/`, under Git LFS,
outside the published package.

## Usage

Import the smallest file that covers the image's rendered size and display density. Bundlers such as
Vite resolve the import to a public asset URL.

```ts
import bannerUrl from "@a-novel-kit/uikit-images/files/banner/160h/agora-banner.png";
import iconUrl from "@a-novel-kit/uikit-images/files/icon/192x192/agora-icon.png";
```

Files follow `files/banner/{height}h/{logo}-banner{variant}.png` and
`files/icon/{size}x{size}/{logo}-icon{variant}.png`, where `{logo}` is `agora`, `a-novel`, `kit`, or
`studio`.

| `{variant}`    | Mode  | Background  |
| -------------- | ----- | ----------- |
| _(none)_       | Dark  | Transparent |
| `-black`       | Dark  | Black       |
| `-light`       | Light | Transparent |
| `-light-white` | Light | White       |

Banner files are available at heights from 80 to 960 pixels and keep each logo's aspect ratio. For a
banner displayed at a fixed height, the height directories map to `srcset` density descriptors: at 80
CSS pixels, `80h` is `1x`, `160h` is `2x`, and `240h` is `3x`. Icon files cover browser, PWA, and app
surfaces from 16×16 through 1024×1024 pixels.

Use meaningful alternative text when the logo contributes content. Use an empty `alt` when the
surrounding interface already names the product.

## Reproducing the images

Run the repository generator after changing reviewed source artwork or a preset:

```sh
git lfs pull
pnpm generate:images
```

Each logo's folder in `packages/images/raw` holds its GIMP project, its export plug-in, and the
instructions to install both. The plug-in writes the eight PNG sources the generator reads into the
folder's `exports/` directory. The logo list, presets, and variant suffixes are hardcoded in
`scripts/generate-images.mjs`.
