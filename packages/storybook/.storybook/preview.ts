import StoryI18nProvider from "../src/StoryI18nProvider.svelte";

import type { Preview } from "@storybook/svelte-vite";

const preview: Preview = {
  initialGlobals: {
    locale: "en",
  },
  globalTypes: {
    locale: {
      description: "Language of uikit's messages",
      toolbar: {
        icon: "globe",
        items: [
          { value: "en", title: "English" },
          { value: "fr", title: "Français" },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (_, context) => ({
      Component: StoryI18nProvider,
      props: { locale: context.globals.locale === "fr" ? "fr" : "en" },
    }),
  ],
  parameters: {
    options: {
      storySort: {
        order: [
          "Overview",
          "Foundations",
          ["Color system", "Layout & shape", "Typography", "Brand images", "Motion & depth"],
          "Components",
          ["Catalog", "Button", "Action controls"],
          "Layout",
          "Forms",
          "Navigation",
          "Data display",
          "Feedback",
          "Overlays",
          "Icons",
          "Recipes",
          "Guidelines",
          ["Composition", "Accessibility", "Content & layout"],
        ],
      },
    },
  },
};

export default preview;
