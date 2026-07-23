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
    gap: 0.5em;
    transition: background-color 120ms ease;
    cursor: pointer;
    border: 0;
    border-radius: 0.5rem;
    font-weight: var(--font-weight-bold);
    line-height: 1;
    font-family: var(--font-family-interface);
  }

  .button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Sizes use logical properties so the component is RTL-ready. */
  .sm {
    padding-inline: 0.75rem;
    padding-block: 0.375rem;
    font-size: 0.8125rem;
  }
  .md {
    padding-inline: 1rem;
    padding-block: 0.5rem;
    font-size: 0.9375rem;
  }
  .lg {
    padding-inline: 1.25rem;
    padding-block: 0.6875rem;
    font-size: 1.0625rem;
  }

  .solid {
    background-color: var(--color-brand-9);
    color: var(--color-neutral-1);
  }
  .solid:hover:not(:disabled) {
    background-color: var(--color-brand-10);
  }

  .ghost {
    background-color: transparent;
    color: var(--color-brand-11);
  }
  .ghost:hover:not(:disabled) {
    background-color: var(--color-neutral-3);
  }
</style>
