import type { Preview } from "@storybook/svelte-vite";

const preview: Preview = {
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
