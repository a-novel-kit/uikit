import "../preview.css";
import { reviewViewportOptions } from "./responsiveStory.js";
import { agoraTheme } from "./theme.js";

import "@a-novel-kit/uikit-fonts/fonts.css";
import "@a-novel-kit/uikit-tokens/tokens.css";

import type { Preview } from "@storybook/svelte-vite";
import { SyntaxHighlighter } from "storybook/internal/components";

// Storybook has no Svelte grammar; reuse markup and its embedded script/style highlighting.
SyntaxHighlighter.registerLanguage(
  "svelte",
  Object.assign(
    (highlighter: { alias: (language: string, alias: string) => void }) => highlighter.alias("markup", "svelte"),
    {
      displayName: "svelte",
    }
  )
);

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
        night: { name: "Agora night", value: "var(--color-surface-canvas)" },
        paper: { name: "Paper", value: "var(--color-text-primary)" },
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      theme: agoraTheme,
      toc: true,
    },
    viewport: {
      options: reviewViewportOptions,
    },
  },
  initialGlobals: {
    backgrounds: { value: "night" },
  },
};

/** Shared dark-mode preview defaults and accessibility checks. */
export default preview;
