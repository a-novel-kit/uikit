# A-Novel UI

Composable Svelte components and shared design foundations for A-Novel interfaces.

[![X (formerly Twitter) Follow](https://img.shields.io/twitter/follow/agorastoryverse)](https://twitter.com/agorastoryverse)
[![Discord](https://img.shields.io/discord/1315240114691248138?logo=discord)](https://discord.gg/rp4Qr8cA)

<hr />

![GitHub repo file or directory count](https://img.shields.io/github/directory-file-count/a-novel-kit/uikit)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/a-novel-kit/uikit)
[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/a-novel-kit/uikit/main.yaml)](https://github.com/a-novel-kit/uikit/actions/workflows/main.yaml)
[![Codecov](https://codecov.io/gh/a-novel-kit/uikit/graph/badge.svg)](https://codecov.io/gh/a-novel-kit/uikit)

![Coverage graph](https://codecov.io/gh/a-novel-kit/uikit/graphs/sunburst.svg)

## What this is

A-Novel UI is the design system of the A-Novel web applications. Its Svelte components start from
native HTML elements, style themselves with semantic design tokens, and take their content through
Svelte snippets. The foundations they render with ship as separate packages, which an application
imports once.

Product workflows and screen-specific components live in the applications that use them. The
[Storybook](https://a-novel-kit.github.io/uikit/) documents every component and foundation.

## Installation

The packages are published to GitHub Packages, which needs a `read:packages` token even to read. The
[developer guide](https://a-novel-kit.github.io/stack/dependencies/node#configure) sets one up. Point
the `@a-novel-kit` scope at that registry in the application's `.npmrc`:

```ini
@a-novel-kit:registry=https://npm.pkg.github.com
```

Install the components with their peer dependencies and the foundations:

```bash
pnpm add @a-novel-kit/uikit @a-novel-kit/uikit-fonts @a-novel-kit/uikit-tokens @a-novel-kit/nodelib-i18n i18next
```

Import the foundation styles once in the application shell:

```ts
import "@a-novel-kit/uikit-fonts/fonts.css";
import "@a-novel-kit/uikit-tokens/tokens.css";
```

Then import components from the package root:

```svelte
<script lang="ts">
  import { Button, Stack } from "@a-novel-kit/uikit";
</script>

<Stack gap="4">
  <Button>Continue</Button>
</Stack>
```

## Packages

| Package                                                       | What it is for                                                                 |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| [`@a-novel-kit/uikit`](./packages/uikit)                      | The Svelte components, their default controllers, and their public types.      |
| [`@a-novel-kit/uikit-tokens`](./packages/tokens)              | The design tokens that components and applications style with.                 |
| [`@a-novel-kit/uikit-fonts`](./packages/fonts)                | The self-hosted font faces that the typography tokens name.                    |
| [`@a-novel-kit/uikit-icons`](./packages/icons)                | The shared canvas for custom icons. Standard icons come from `@lucide/svelte`. |
| [`@a-novel-kit/uikit-storybook`](./packages/storybook-config) | The Storybook preset and theme for A-Novel Svelte projects.                    |

The brand logos ship from [A-Novel UI assets](https://github.com/a-novel-kit/ui-assets).

## Contributing

Start with the [developer guide](https://a-novel-kit.github.io/stack/), then read the
[contribution guide](./CONTRIBUTING.md).
