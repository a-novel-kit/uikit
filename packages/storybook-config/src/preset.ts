import { fileURLToPath } from "node:url";

import remarkGfm from "remark-gfm";

const resolve = (specifier: string) => fileURLToPath(import.meta.resolve(specifier));

/** Existing Storybook MDX loader options accepted by the preset hook. */
interface MdxLoaderOptions {
  /** Options forwarded to the MDX compiler. */
  mdxCompileOptions?: {
    /** Remark plugins already configured by the consuming Storybook. */
    remarkPlugins?: unknown[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/** Existing Vite configuration accepted by the preset hook. */
interface ViteConfig {
  /** Dependency pre-bundling options already configured by the consuming Storybook. */
  optimizeDeps?: {
    /** Dependencies already listed for pre-bundling. */
    include?: string[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/** Asks search engines to leave a published Storybook out of their results. */
const noindex = '<meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex" />';

/** Storybook addons installed by the A-Novel preset. */
export const addons = [
  resolve("@storybook/addon-svelte-csf/preset"),
  resolve("@storybook/addon-docs/preset"),
  resolve("@storybook/addon-a11y/preset"),
  resolve("@storybook/addon-vitest/preset"),
];

/** Adds the manager entries required by the configured addons. */
export const managerEntries = (entries: string[] = []) => [
  ...entries,
  resolve("@storybook/addon-docs/manager"),
  resolve("@storybook/addon-a11y/manager"),
  resolve("@storybook/addon-vitest/manager"),
];

/** Adds the preview entries required by the configured addons. */
export const previewAnnotations = (entries: string[] = []) => [
  ...entries,
  resolve("@storybook/addon-docs/preview"),
  resolve("@storybook/addon-a11y/preview"),
];

/** Enables GitHub Flavored Markdown without replacing consumer MDX options. */
export const mdxLoaderOptions = (options: MdxLoaderOptions = {}) => ({
  ...options,
  mdxCompileOptions: {
    ...options.mdxCompileOptions,
    remarkPlugins: [...(options.mdxCompileOptions?.remarkPlugins ?? []), remarkGfm],
  },
});

/** Shared Storybook core settings. */
export const core = {
  disableWhatsNewNotifications: true,
};

/** Shared Storybook feature settings. */
export const features = {
  menuOnboardingChecklist: false,
  sidebarOnboardingChecklist: false,
};

/** Shared generated-document settings. */
export const docs = {
  defaultName: "Documentation",
};

/** Keeps the manager out of search results. */
export const managerHead = (head = "") => `${head}\n${noindex}`;

/** Keeps the story and docs frames out of search results. */
export const previewHead = (head = "") => `${head}\n${noindex}`;

/**
 * Pre-bundles each entry of this package that stories import. Vite matches each specifier exactly, and optimizes an
 * unlisted one mid-run, which reloads the story tests.
 */
export const viteFinal = (config: ViteConfig): ViteConfig => ({
  ...config,
  optimizeDeps: {
    ...config.optimizeDeps,
    include: [
      ...(config.optimizeDeps?.include ?? []),
      "@a-novel-kit/uikit-storybook",
      "@a-novel-kit/uikit-storybook/ScrollPreview.svelte",
    ],
  },
});
