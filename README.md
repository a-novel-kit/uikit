# Agora UI

Composable Svelte components and shared design foundations for Agora interfaces.

[![X (formerly Twitter) Follow](https://img.shields.io/twitter/follow/agorastoryverse)](https://twitter.com/agorastoryverse)
[![Discord](https://img.shields.io/discord/1315240114691248138?logo=discord)](https://discord.gg/rp4Qr8cA)

<hr />

![GitHub repo file or directory count](https://img.shields.io/github/directory-file-count/a-novel-kit/uikit)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/a-novel-kit/uikit)
[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/a-novel-kit/uikit/main.yaml)](https://github.com/a-novel-kit/uikit/actions/workflows/main.yaml)
[![Codecov](https://codecov.io/gh/a-novel-kit/uikit/graph/badge.svg)](https://codecov.io/gh/a-novel-kit/uikit)

## What this is

This repository contains the generic UI packages shared by Agora clients:

```text
packages/
├── uikit/             composable Svelte components
├── tokens/            generated CSS and JavaScript design tokens
├── fonts/             self-hosted font faces and licenses
├── icons/             custom Svelte icon components
├── storybook-config/  reusable Agora Storybook preset and theme
└── storybook/         private design-system workbench
```

Components are native-first, use semantic tokens, and expose composition points through Svelte
snippets. Product workflows and screen-specific components belong to their client or feature
package rather than this repository.

## Installation

Packages are published to GitHub Packages under the `@a-novel-kit` scope. Install the component
package and import the global foundations once in the application shell:

```bash
pnpm add @a-novel-kit/uikit @a-novel-kit/uikit-fonts @a-novel-kit/uikit-tokens
```

```ts
import "@a-novel-kit/uikit-fonts/fonts.css";
import "@a-novel-kit/uikit-tokens/tokens.css";
```

```svelte
<script lang="ts">
  import { Button, Stack } from "@a-novel-kit/uikit";
</script>

<Stack gap="4">
  <Button>Continue</Button>
</Stack>
```

## Packages

| Package                                                       | Purpose                                                       |
| ------------------------------------------------------------- | ------------------------------------------------------------- |
| [`@a-novel-kit/uikit`](./packages/uikit)                      | Generic Svelte components and public component types.         |
| [`@a-novel-kit/uikit-tokens`](./packages/tokens)              | CSS tokens, generated OKLCH palette, and palette metadata.    |
| [`@a-novel-kit/uikit-fonts`](./packages/fonts)                | Self-hosted interface, editorial, and monospace font faces.   |
| [`@a-novel-kit/uikit-icons`](./packages/icons)                | Custom icon components and their shared SVG canvas.           |
| [`@a-novel-kit/uikit-storybook`](./packages/storybook-config) | Shared Storybook preset, preview defaults, and manager theme. |

## Contributing

Read the [developer onboarding guide](https://github.com/a-novel-kit/.github/blob/master/README.md)
for the shared toolchain, then follow this repository's [contributing guide](./CONTRIBUTING.md) for
package boundaries, public API rules, and the Storybook workflow.
