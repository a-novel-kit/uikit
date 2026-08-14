import { fileURLToPath } from "node:url";

import remarkGfm from "remark-gfm";

const resolve = (specifier: string) => fileURLToPath(import.meta.resolve(specifier));

interface MdxLoaderOptions {
  mdxCompileOptions?: {
    remarkPlugins?: unknown[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export const addons = [
  resolve("@storybook/addon-svelte-csf/preset"),
  resolve("@storybook/addon-docs/preset"),
  resolve("@storybook/addon-a11y/preset"),
  resolve("@storybook/addon-vitest/preset"),
];

export const managerEntries = (entries: string[] = []) => [
  ...entries,
  resolve("@storybook/addon-docs/manager"),
  resolve("@storybook/addon-a11y/manager"),
  resolve("@storybook/addon-vitest/manager"),
];

export const previewAnnotations = (entries: string[] = []) => [
  ...entries,
  resolve("@storybook/addon-docs/preview"),
  resolve("@storybook/addon-a11y/preview"),
];

export const mdxLoaderOptions = (options: MdxLoaderOptions = {}) => ({
  ...options,
  mdxCompileOptions: {
    ...options.mdxCompileOptions,
    remarkPlugins: [...(options.mdxCompileOptions?.remarkPlugins ?? []), remarkGfm],
  },
});

export const core = {
  disableWhatsNewNotifications: true,
};

export const features = {
  menuOnboardingChecklist: false,
  sidebarOnboardingChecklist: false,
};

export const docs = {
  defaultName: "Documentation",
};
