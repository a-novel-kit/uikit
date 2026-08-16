# @a-novel-kit/uikit-storybook

Shared Storybook configuration for Agora Svelte interfaces. The package provides the manager theme,
dark preview, fonts, tokens, MDX documentation, GitHub-flavored Markdown, and accessibility checks.

## Setup

Install the preset with Storybook and the Svelte Vite framework.

```bash
pnpm add --save-dev @a-novel-kit/uikit-storybook @storybook/svelte-vite storybook
```

Add it to `.storybook/main.ts`. The application owns its story paths and framework declaration.

```ts
import type { StorybookConfig } from "@storybook/svelte-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|ts|svelte)"],
  addons: ["@a-novel-kit/uikit-storybook"],
  framework: "@storybook/svelte-vite",
};

export default config;
```

No manager or preview file is required. Add local configuration only for application-specific story
ordering or parameters.
