# @a-novel-kit/uikit-storybook

Shared Storybook configuration for A-Novel Svelte projects. One preset gives a Storybook the A-Novel
theme and foundations, MDX documentation, and accessibility checks that fail the story tests.

## Setup

Install the preset with Storybook, the Svelte Vite framework, and the addons it registers. The addons
are peer dependencies, so they always match your Storybook version.

```bash
pnpm add --save-dev @a-novel-kit/uikit-storybook @storybook/svelte-vite storybook \
  @storybook/addon-a11y @storybook/addon-docs @storybook/addon-svelte-csf @storybook/addon-vitest
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

The preset installs the manager and preview configuration. Add local configuration only for
application-specific story ordering or parameters.

## Scroll previews

Render `ScrollPreview` as a story's page content to try scrolling: sticky headers, banners and rails
stay in view while its numbered rows move. It is for stories only.

```svelte
<script lang="ts">
  import ScrollPreview from "@a-novel-kit/uikit-storybook/ScrollPreview.svelte";
</script>

<Shell>
  <ScrollPreview rows={60} />
</Shell>
```

## Responsive screen documentation

Use `ResponsiveStoryPair` in an attached MDX page to compare a desktop and a mobile story export. Each
story renders in its own iframe at its review viewport, 1280×800 or 390×844, shown at 85% scale. The
mobile frame wraps beneath the desktop one on narrow docs pages. Toolbar globals such as the locale
reach both frames and stay in sync. Use fixed-state story controllers to keep menus and dialogs open
during review.

```mdx
import * as ScreenStories from "./screen.stories.svelte";

import { Meta, ResponsiveStoryPair } from "@a-novel-kit/uikit-storybook";

<Meta of={ScreenStories} />

<ResponsiveStoryPair desktop={ScreenStories.ReadyDesktop} mobile={ScreenStories.ReadyMobile} meta={ScreenStories} />
```

Apply `reviewStoryGlobals.desktop` and `reviewStoryGlobals.mobile` to the matching CSF exports so
their standalone canvas routes use the same viewport sizes. Long screens can pass `startAt` with an
element ID to align the relevant section at the top of both review frames.
