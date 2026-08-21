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

## Responsive screen documentation

Use `ResponsiveStoryPair` in an attached MDX page to compare separate desktop and mobile story
exports. Each story renders in its own iframe at the real review viewport, then the documentation
scales the iframe for a compact side-by-side comparison. Scalar toolbar globals, including locale,
are forwarded to both subdocuments and stay synchronized when their controls change.

```mdx
import * as ScreenStories from "./screen.stories.svelte";

import { Meta, ResponsiveStoryPair } from "@a-novel-kit/uikit-storybook";

<Meta of={ScreenStories} />

<ResponsiveStoryPair desktop={ScreenStories.ReadyDesktop} mobile={ScreenStories.ReadyMobile} meta={ScreenStories} />
```

Apply `reviewStoryGlobals.desktop` and `reviewStoryGlobals.mobile` to the matching CSF exports so
their standalone canvas routes use the same viewport sizes.
