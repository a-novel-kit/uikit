<script lang="ts" module>
  import type { ComponentSize } from "./types";

  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";

  /** Props for a styled native button. */
  export interface ButtonProps extends Omit<HTMLButtonAttributes, "children"> {
    /** Content rendered inside the button. */
    children?: Snippet;
    /** Visual treatment. Choose importance with variant and meaning with tone. */
    variant?: "solid" | "outline" | "ghost";
    /** Semantic intent; danger is reserved for destructive or irreversible actions. */
    tone?: "brand" | "neutral" | "danger";
    /** Control size. */
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
    --button-selected-foreground: var(--color-action-primary-selected);
    --button-text: var(--color-action-primary-text);
    --button-foreground: var(--color-action-primary);
    --button-foreground-hover: var(--color-action-primary-hover);
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
    --button-glow: var(--shadow-glow-neutral);
  }

  .danger {
    --button-rest: var(--color-action-danger);
    --button-hover: var(--color-action-danger-hover);
    --button-active: var(--color-action-danger-active);
    --button-selected: var(--color-action-danger-selected);
    --button-selected-foreground: var(--color-action-danger-selected);
    --button-text: var(--color-action-danger-text);
    --button-foreground: var(--color-action-danger);
    --button-foreground-hover: var(--color-action-danger-hover);
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
    border-color: var(--button-rest);
    background-color: transparent;
    color: var(--button-foreground);
  }

  .outline:hover:not(:disabled):not([aria-pressed="true"]) {
    border-color: var(--button-hover);
    background-color: color-mix(in oklab, var(--button-selected) var(--color-mix-2), transparent);
    color: var(--button-foreground-hover);
  }

  .outline:active:not(:disabled):not([aria-pressed="true"]) {
    background-color: color-mix(in oklab, var(--button-active) var(--color-mix-3), transparent);
  }

  .outline[aria-pressed="true"] {
    box-shadow: var(--button-glow);
    border-color: var(--button-selected);
    background-color: color-mix(in oklab, var(--button-selected) var(--color-mix-2), transparent);
    color: var(--button-selected-foreground);
  }

  .ghost {
    background-color: transparent;
    color: var(--button-foreground);
  }

  .ghost:hover:not(:disabled):not([aria-pressed="true"]) {
    background-color: var(--color-action-ghost-hover);
    color: var(--button-foreground-hover);
  }

  .ghost:active:not(:disabled):not([aria-pressed="true"]) {
    background-color: var(--color-surface-subtle);
  }

  .ghost[aria-pressed="true"] {
    box-shadow: var(--button-glow);
    border-color: var(--button-selected);
    background-color: color-mix(in oklab, var(--button-selected) var(--color-mix-2), var(--color-surface-raised));
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
