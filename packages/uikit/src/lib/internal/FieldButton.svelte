<!--
@component
Renders a square ghost button inside a field. It never draws a border: the field already outlines
the control, so the button shows only its icon, a background and a color.
-->
<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";

  /** Props for a borderless button placed inside a field; give it an accessible name. */
  export interface FieldButtonProps extends Omit<HTMLButtonAttributes, "children" | "class" | "type"> {
    /** Decorative icon rendered inside the button. */
    children: Snippet;
  }
</script>

<script lang="ts">
  let { children, ...rest }: FieldButtonProps = $props();
</script>

<button {...rest} type="button" class="field-button">
  {@render children()}
</button>

<style>
  .field-button {
    display: grid;
    place-items: center;
    transition:
      background-color var(--duration-fast) var(--easing-standard),
      color var(--duration-fast) var(--easing-standard);
    cursor: pointer;
    box-sizing: border-box;
    border: 0;
    border-radius: var(--radius-md);
    background: transparent;
    padding: 0;
    inline-size: var(--control-height-sm);
    block-size: var(--control-height-sm);
    color: var(--color-text-muted);
  }

  .field-button:hover:not(:disabled, [aria-pressed="true"]) {
    background: var(--color-action-subtle-hover);
    color: var(--color-text-primary);
  }

  .field-button:active:not(:disabled),
  .field-button[aria-pressed="true"] {
    background: var(--color-action-subtle-active);
    color: var(--color-text-primary);
  }

  .field-button:focus-visible {
    outline: var(--focus-ring-width) solid var(--color-focus-ring);
    outline-offset: var(--focus-ring-offset);
  }

  .field-button:disabled {
    cursor: not-allowed;
    color: var(--color-control-disabled-text);
  }
</style>
