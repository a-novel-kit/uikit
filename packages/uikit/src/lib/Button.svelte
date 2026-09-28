<!--
@component
Renders a styled native button. Defaults to `type="button"`; use `type="submit"` for form submission.

```svelte
<script lang="ts">
  import { Button } from "@a-novel-kit/uikit";
</script>

<Button type="submit">Save</Button>
```
-->
<script lang="ts" module>
  import type { ComponentSize } from "./types";

  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";

  /** Props for a styled native button. */
  export interface ButtonProps extends Omit<HTMLButtonAttributes, "children"> {
    /** Content rendered inside the button. */
    children?: Snippet;
    /** Visual importance; defaults to "solid". Use tone for semantic intent. */
    variant?: "solid" | "outline" | "ghost";
    /** Semantic intent; defaults to "brand". Reserve danger for destructive actions. */
    tone?: "brand" | "neutral" | "danger";
    /** Control size on the shared height and typography scales; defaults to "md". */
    size?: ComponentSize;
    /** Removes inline padding and makes the control square. Used by IconButton. */
    square?: boolean;
  }
</script>

<script lang="ts">
  let {
    variant = "solid",
    tone = "brand",
    size = "md",
    square = false,
    type = "button",
    class: className = "",
    children,
    ...rest
  }: ButtonProps = $props();
</script>

<button {type} class="button {variant} {tone} {size} {square ? 'square' : ''} {className}" {...rest}>
  {@render children?.()}
</button>

<style>
  .button {
    --button-border: var(--button-rest);
    --button-border-hover: var(--button-hover);
    --button-selected-border: var(--button-selected);
    display: inline-flex;
    justify-content: center;
    align-items: center;
    gap: var(--space-2);
    transition:
      background-color var(--duration-fast) var(--easing-standard),
      border-color var(--duration-fast) var(--easing-standard),
      box-shadow var(--duration-fast) var(--easing-standard),
      color var(--duration-fast) var(--easing-standard);
    cursor: pointer;
    box-sizing: border-box;
    box-shadow: none;
    border: var(--border-width-thin) solid transparent;
    border-radius: var(--radius-md);
    font-weight: var(--font-weight-bold);
    line-height: var(--line-height-tight);
    font-family: var(--font-family-interface);
  }

  .brand {
    --button-rest: var(--color-action-primary);
    --button-hover: var(--color-action-primary-hover);
    --button-active: var(--color-action-primary-active);
    --button-selected: var(--color-action-primary-selected);
    --button-selected-foreground: var(--color-action-primary-foreground);
    --button-text: var(--color-action-primary-text);
    --button-foreground: var(--color-action-primary-foreground);
    --button-foreground-hover: var(--color-action-primary-foreground-hover);
    --button-glow: var(--shadow-glow-brand-strong);
  }

  .neutral {
    --button-rest: var(--color-action-neutral);
    --button-hover: var(--color-action-neutral-hover);
    --button-active: var(--color-action-neutral-active);
    --button-selected: var(--color-action-neutral-selected);
    --button-selected-foreground: var(--color-action-neutral-text);
    --button-text: var(--color-action-neutral-text);
    --button-foreground: var(--color-text-secondary);
    --button-foreground-hover: var(--color-text-primary);
    --button-border: var(--color-border-default);
    --button-border-hover: var(--color-border-strong);
    --button-selected-border: var(--color-border-strong);
    --button-glow: var(--shadow-glow-neutral);
  }

  .danger {
    --button-rest: var(--color-action-danger);
    --button-hover: var(--color-action-danger-hover);
    --button-active: var(--color-action-danger-active);
    --button-selected: var(--color-action-danger-selected);
    --button-selected-foreground: var(--color-action-danger-foreground);
    --button-text: var(--color-action-danger-text);
    --button-foreground: var(--color-action-danger-foreground);
    --button-foreground-hover: var(--color-action-danger-foreground-hover);
    --button-glow: var(--shadow-glow-pressure-strong);
  }

  .button:focus-visible {
    outline: var(--focus-ring-width) solid var(--color-focus-ring);
    outline-offset: var(--focus-ring-offset);
  }

  /* Logical padding keeps the control shape consistent in right-to-left layouts. */
  .sm {
    padding-inline: var(--space-3);
    padding-block: var(--space-1-5);
    min-block-size: var(--control-height-sm);
    font-size: var(--font-size-sm);
  }
  .md {
    padding-inline: var(--space-4);
    padding-block: var(--space-2);
    min-block-size: var(--control-height-md);
    font-size: var(--font-size-md);
  }
  .lg {
    padding-inline: var(--space-5);
    padding-block: var(--space-3);
    min-block-size: var(--control-height-lg);
    font-size: var(--font-size-lg);
  }

  .square {
    padding: 0;
    aspect-ratio: 1;
  }

  .sm.square {
    inline-size: var(--control-height-sm);
  }

  .md.square {
    inline-size: var(--control-height-md);
  }

  .lg.square {
    inline-size: var(--control-height-lg);
  }

  .solid {
    background-color: var(--button-rest);
    color: var(--button-text);
  }

  .solid:hover:not(:disabled):not([aria-pressed="true"]) {
    background-color: var(--button-hover);
  }

  .solid:active:not(:disabled):not([aria-pressed="true"]) {
    background-color: var(--button-active);
  }

  .solid[aria-pressed="true"] {
    box-shadow: var(--button-glow);
    background-color: var(--button-selected);
  }

  .outline {
    border-color: var(--button-border);
  }

  .outline:hover:not(:disabled):not([aria-pressed="true"]) {
    border-color: var(--button-border-hover);
  }

  .outline,
  .ghost {
    background-color: transparent;
    color: var(--button-foreground);
  }

  :is(.outline, .ghost):hover:not(:disabled):not([aria-pressed="true"]) {
    background-color: var(--color-action-subtle-hover);
    color: var(--button-foreground-hover);
  }

  :is(.outline, .ghost):active:not(:disabled):not([aria-pressed="true"]) {
    background-color: var(--color-action-subtle-active);
  }

  :is(.outline, .ghost)[aria-pressed="true"] {
    box-shadow: var(--button-glow);
    border-color: var(--button-selected-border);
    background-color: color-mix(in oklab, var(--button-selected-foreground) var(--color-mix-3), transparent);
    color: var(--button-selected-foreground);
  }

  .button:disabled {
    opacity: 1;
    cursor: not-allowed;
    box-shadow: none;
    border-color: var(--color-action-disabled-border);
    background-color: var(--color-action-disabled-surface);
    color: var(--color-action-disabled-text);
  }
</style>
