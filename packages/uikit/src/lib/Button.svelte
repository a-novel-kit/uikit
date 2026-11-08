<!--
@component
Renders a styled native button. Defaults to `type="button"`; use `type="submit"` for form submission.
Pass `href` for navigation: it renders a native link with the same appearance. A ghost or text link
with `aria-current="page"` reads as the navigation's current item.

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
  import type { HTMLAnchorAttributes, HTMLButtonAttributes } from "svelte/elements";

  /** Props for a styled native button. */
  export interface ButtonProps extends Omit<HTMLButtonAttributes, "children"> {
    /** Content rendered inside the button. */
    children?: Snippet;
    /**
     * Visual importance; defaults to "solid". Use tone for semantic intent. "text" reads as plain
     * colored text until hovered, for a quiet secondary journey beside a form.
     */
    variant?: "solid" | "outline" | "ghost" | "text";
    /** Semantic intent; defaults to "brand". Reserve danger for destructive actions. */
    tone?: "brand" | "neutral" | "danger";
    /** Control size on the shared height and typography scales; defaults to "md". */
    size?: ComponentSize;
    /** Removes inline padding and makes the control square. Used by IconButton. */
    square?: boolean;
    /** Omit for native button actions. */
    href?: never;
  }

  /** Native link attributes combined with the shared Button appearance. */
  export interface ButtonLinkProps
    extends
      Omit<HTMLAnchorAttributes, "children" | "type">,
      Pick<ButtonProps, "children" | "variant" | "tone" | "size" | "square"> {
    /** Navigation destination; preserves native link behavior without JavaScript. */
    href: string;
    /** Form submission type is only available for button actions. */
    type?: never;
    /** Native links have no disabled state. */
    disabled?: never;
  }
</script>

<script lang="ts">
  let {
    variant = "solid",
    tone = "brand",
    size = "md",
    square = false,
    class: className = "",
    children,
    ...rest
  }: ButtonProps | ButtonLinkProps = $props();

  const classes = $derived(`button ${variant} ${tone} ${size} ${square ? "square" : ""} ${className}`);
</script>

{#if rest.href !== undefined}
  <a class={classes} {...rest}>
    {@render children?.()}
  </a>
{:else}
  <button {...rest} type={rest.type ?? "button"} class={classes}>
    {@render children?.()}
  </button>
{/if}

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
    user-select: none;
    text-decoration: none;
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

  .sm {
    padding-inline: var(--space-3);
    padding-block: var(--space-1);
    min-block-size: var(--control-height-sm);
    font-size: var(--font-size-sm);
  }
  .md {
    padding-inline: var(--space-4);
    padding-block: var(--space-1);
    min-block-size: var(--control-height-md);
    font-size: var(--font-size-sm);
  }
  .lg {
    padding-inline: var(--space-6);
    padding-block: var(--space-2);
    min-block-size: var(--control-height-lg);
    font-size: var(--font-size-md);
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

  @media (hover: hover) {
    .solid:hover:not(:disabled):not([aria-pressed="true"]) {
      background-color: var(--button-hover);
    }
  }

  .solid.brand:not(:disabled):not([aria-pressed="true"]) {
    box-shadow: var(--shadow-action-primary);
    background-image: var(--gradient-action-primary);
  }

  @media (hover: hover) {
    .solid.brand:hover:not(:disabled):not([aria-pressed="true"]) {
      box-shadow: var(--shadow-action-primary-hover);
      background-image: var(--gradient-action-primary-hover);
    }
  }

  .solid.brand:active:not(:disabled):not([aria-pressed="true"]) {
    background-image: none;
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

  @media (hover: hover) {
    .outline:hover:not(:disabled):not([aria-pressed="true"]) {
      border-color: var(--button-border-hover);
    }
  }

  .outline,
  .ghost,
  .text {
    background-color: transparent;
    color: var(--button-foreground);
  }

  /* Regular weight and a narrow inset, so the action reads as text until the hover box shows. */
  .text {
    padding-inline: var(--space-2);
    font-weight: var(--font-weight-regular);
  }

  @media (hover: hover) {
    :is(.outline, .ghost, .text):hover:not(:disabled):not([aria-pressed="true"]):not([aria-current="page"]) {
      background-color: var(--color-action-subtle-hover);
      color: var(--button-foreground-hover);
    }
  }

  :is(.outline, .ghost, .text):active:not(:disabled):not([aria-pressed="true"]):not([aria-current="page"]) {
    background-color: var(--color-action-subtle-active);
    color: var(--button-foreground-hover);
  }

  :is(.outline, .ghost, .text)[aria-pressed="true"] {
    box-shadow: var(--button-glow);
    border-color: var(--button-selected-border);
    background-color: color-mix(in oklab, var(--button-selected-foreground) var(--color-mix-3), transparent);
    color: var(--button-selected-foreground);
  }

  /* A link to the page showing reads as the navigation's current item, as a rail's account link does
     beside the NavList, and keeps that look under the pointer. */
  :is(.ghost, .text)[aria-current="page"] {
    background-color: var(--color-navigation-selected-surface);
    color: var(--color-navigation-selected-text);
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
