<script lang="ts" module>
  import type { HTMLButtonAttributes } from "svelte/elements";

  export interface ButtonProps extends HTMLButtonAttributes {
    /** Visual emphasis. `solid` is the primary action; `ghost` is low-emphasis. */
    variant?: "solid" | "ghost";
    /** Control size. */
    size?: "sm" | "md" | "lg";
  }
</script>

<script lang="ts">
  // A native <button> — the accessible element already exists, so we style it with
  // tokens rather than reach for a primitive. All other native button attributes
  // (type, disabled, onclick, aria-*, …) come from HTMLButtonAttributes and forward
  // through {...rest}. Emphasis is Bold (Heros ships only 400/700), never a mid weight.
  let { variant = "solid", size = "md", type = "button", children, ...rest }: ButtonProps = $props();
</script>

<button {type} class="button {variant} {size}" {...rest}>
  {@render children?.()}
</button>

<style>
  .button {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    gap: var(--space-2);
    transition: background-color var(--duration-fast) var(--easing-standard);
    cursor: pointer;
    box-sizing: border-box;
    border: var(--border-width-thin) solid transparent;
    border-radius: var(--radius-md);
    font-weight: var(--font-weight-bold);
    line-height: var(--line-height-tight);
    font-family: var(--font-family-interface);
  }

  .button:focus-visible {
    outline: var(--focus-ring-width) solid var(--color-focus-ring);
    outline-offset: var(--focus-ring-offset);
  }

  .button:disabled {
    opacity: var(--opacity-disabled);
    cursor: not-allowed;
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

  .solid {
    background-color: var(--color-action-primary);
    color: var(--color-action-primary-text);
  }
  .solid:hover:not(:disabled) {
    background-color: var(--color-action-primary-hover);
  }

  .ghost {
    background-color: transparent;
    color: var(--color-action-ghost-text);
  }
  .ghost:hover:not(:disabled) {
    background-color: var(--color-action-ghost-hover);
  }
</style>
