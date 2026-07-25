import type { StorybookConfig } from "@storybook/svelte-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|ts|svelte)"],
  addons: ["@storybook/addon-svelte-csf", "@storybook/addon-docs", "@storybook/addon-a11y"],
  framework: "@storybook/svelte-vite",
  docs: {
    defaultName: "Documentation",
  },
};

export default config;
