import { fileURLToPath } from "node:url";

import { mergeConfig } from "vite";

import type { StorybookConfig } from "@storybook/svelte-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.{js,ts,svelte}"],
  addons: ["@a-novel-kit/uikit-storybook"],
  framework: "@storybook/svelte-vite",
  viteFinal: async (config) =>
    mergeConfig(config, {
      resolve: {
        alias: [
          {
            find: /^@a-novel-kit\/uikit$/,
            replacement: fileURLToPath(new URL("../../uikit/src/lib/index.ts", import.meta.url)),
          },
          {
            find: /^@a-novel-kit\/uikit-icons$/,
            replacement: fileURLToPath(new URL("../../icons/src/lib/index.ts", import.meta.url)),
          },
        ],
      },
    }),
};

export default config;
