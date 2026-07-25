import "../src/preview.css";

import "@a-novel-kit/uikit-fonts/fonts.css";
import "@a-novel-kit/uikit-tokens/tokens.css";

import type { Preview } from "@storybook/svelte-vite";
import { themes } from "storybook/theming";

const preview: Preview = {
  parameters: {
    a11y: {
      test: "error",
      options: {
        runOnly: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"],
      },
    },
    backgrounds: {
      options: {
        night: { name: "Agora night", value: "var(--color-neutral-1)" },
        paper: { name: "Paper", value: "var(--color-neutral-12)" },
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      theme: themes.dark,
      toc: true,
    },
    options: {
      storySort: {
        order: ["Overview", "Foundations", ["Color system", "Typography"], "Components"],
      },
    },
  },
  initialGlobals: {
    backgrounds: { value: "night" },
  },
};

export default preview;
