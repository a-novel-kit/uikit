/// <reference types="vite/client" />
import { expect, it, onTestFinished } from "vitest";

import "@a-novel-kit/uikit-tokens/tokens.css";

const ratios = { tight: 1, compact: 1.25, normal: 1.5, loose: 1.75 };

it.each(["xs", "sm", "md", "lg", "xl", "2xl", "4xl"])("stacks every %s line on whole pixels", (size) => {
  const stack = document.createElement("div");
  document.body.append(stack);
  onTestFinished(() => stack.remove());

  for (const [step, ratio] of Object.entries(ratios)) {
    const line = document.createElement("p");
    line.style.cssText = `margin: 0; font-size: var(--font-size-${size}); line-height: var(--line-height-${step})`;
    line.textContent = "Beyond the last lantern";
    stack.append(line);

    const style = getComputedStyle(line);
    expect(parseFloat(style.lineHeight)).toBe(2 * Math.round((ratio * parseFloat(style.fontSize)) / 2));
    expect(line.getBoundingClientRect().top % 1).toBe(0);
  }
});
