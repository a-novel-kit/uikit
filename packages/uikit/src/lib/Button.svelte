<!--
@component
Renders a styled native button. Defaults to `type="button"`; use `type="submit"` for form submission.
Pass `href` for navigation: it renders a native link with the same appearance. A ghost or text button
chosen with `aria-pressed`, or a ghost or text link with `aria-current="page"`, reads as the navigation's current
item.

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
     * colored text until hovered, for a quiet secondary journey beside a form. "prominent" is a solid
     * button that also draws its edge, for the rare action that must lead a whole view.
     */
    variant?: "solid" | "outline" | "ghost" | "text" | "prominent";
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

  // A prominent button is a solid one that also draws its edge.
  const look = $derived(variant === "prominent" ? "solid prominent" : variant);
  const classes = $derived(`button ${look} ${tone} ${size} ${square ? "square" : ""} ${className}`);
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
    --button-border: var(--button-foreground);
    --button-border-hover: var(--button-foreground-hover);
    --button-selected-border: var(--button-selected-foreground);
    display: inline-flex;
    justify-content: center;
    align-items: center;
    gap: var(--space-2);
    transition:
      background-color var(--motion-state),
      border-color var(--motion-state),
      box-shadow var(--motion-state),
      color var(--motion-state);
    cursor: pointer;
    box-sizing: border-box;
    box-shadow: none;
    border: var(--border-width-thin) solid transparent;
    border-radius: var(--radius-lg);
    font: var(--text-action);
    user-select: none;
    text-decoration: none;
  }

  .brand {
    --button-rest: var(--color-action-primary);
    --button-hover: var(--color-action-primary-hover);
    --button-active: var(--color-action-primary-active);
    --button-selected: var(--color-action-primary-selected);
    --button-selected-foreground: var(--color-action-primary-foreground);
    --button-foreground: var(--color-action-primary-foreground);
    --button-foreground-hover: var(--color-action-primary-foreground-hover);
  }

  .neutral {
    --button-rest: var(--color-action-neutral);
    --button-hover: var(--color-action-neutral-hover);
    --button-active: var(--color-action-neutral-active);
    --button-selected: var(--color-action-neutral-selected);
    --button-selected-foreground: var(--color-text-primary);
    --button-foreground: var(--color-text-secondary);
    --button-foreground-hover: var(--color-text-primary);
    --button-border: var(--color-border-default);
    --button-border-hover: var(--color-border-strong);
    --button-selected-border: var(--color-border-strong);
  }

  .danger {
    --button-rest: var(--color-action-danger);
    --button-hover: var(--color-action-danger-hover);
    --button-active: var(--color-action-danger-active);
    --button-selected: var(--color-action-danger-selected);
    --button-selected-foreground: var(--color-action-danger-foreground);
    --button-foreground: var(--color-action-danger-foreground);
    --button-foreground-hover: var(--color-action-danger-foreground-hover);
  }

  /* A chosen toggle is positioned for its indicator, so it paints over its neighbors' outlines; a focused button
     rises above it. */
  .button:focus-visible {
    position: relative;
    z-index: 1;
    outline: var(--focus-ring-width) solid var(--color-focus-ring);
    outline-offset: var(--focus-ring-offset);
  }

  .sm {
    padding-inline: var(--space-3);
    padding-block: var(--space-1);
    min-block-size: var(--control-height-sm);
  }
  .md {
    padding-inline: var(--space-4);
    padding-block: var(--space-1);
    min-block-size: var(--control-height-md);
  }
  .lg {
    padding-inline: var(--space-6);
    padding-block: var(--space-2);
    min-block-size: var(--control-height-lg);
    font: var(--text-action-lg);
  }

  /* A square holds only an icon, and the radius of a labeled button would round it. */
  .square {
    border-radius: var(--radius-md);
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

  /* A solid button is its tone's pair: its ink on its tint, lit under the pointer. It draws no glow: light around a
     deep tint reads as a blur, and its color already carries its weight. */
  .solid {
    background-color: var(--button-rest);
    color: var(--button-foreground);
  }

  @media (hover: hover) {
    .solid:hover:not(:disabled):not([aria-pressed="true"]) {
      background-color: var(--button-hover);
      color: var(--button-foreground-hover);
    }
  }

  .solid.brand:not(:disabled):not([aria-pressed="true"]) {
    background-image: var(--gradient-action-primary);
  }

  @media (hover: hover) {
    .solid.brand:hover:not(:disabled):not([aria-pressed="true"]) {
      background-image: var(--gradient-action-primary-hover);
    }
  }

  .solid.brand:active:not(:disabled):not([aria-pressed="true"]) {
    background-image: none;
  }

  .solid:active:not(:disabled):not([aria-pressed="true"]) {
    background-color: var(--button-active);
  }

  /* Chosen, it stays lit, on a fill the pointer never reaches. */
  .solid[aria-pressed="true"] {
    background-color: var(--button-selected);
    color: var(--button-foreground-hover);
  }

  /* The rare action that must lead a whole view draws its edge: its ink rises out of its fill within a grid step, so
     sharp that it almost reads as a border. That bends the rule against bevels, on purpose and for this action alone.
     The edge takes the lit ink under the pointer. */
  .prominent {
    --button-edge: var(--button-foreground);
    box-shadow:
      inset 0 0 0 var(--border-width-thin) color-mix(in oklab, var(--button-edge) var(--color-mix-6), transparent),
      inset 0 0 var(--size-1) var(--border-width-thin)
        color-mix(in oklab, var(--button-edge) var(--color-mix-4), transparent);
  }

  @media (hover: hover) {
    .prominent:hover:not(:disabled) {
      --button-edge: var(--button-foreground-hover);
    }
  }

  .outline {
    border-color: var(--button-border);
  }

  /* A neutral outline is a veil, which doubles on the canvas, where it is dimmest. A colored outline carries
     itself. */
  .outline.neutral {
    border-width: var(--border-width-outline);
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

  /* An outline button whose popup shows, such as ActionMenu's trigger, keeps the hover look while open: expanded is
     a persistent state, as a select keeps its focused look while its list shows. */
  .outline[aria-expanded="true"] {
    border-color: var(--button-border-hover);
    background-color: var(--color-action-subtle-hover);
    color: var(--button-foreground-hover);
  }

  .outline[aria-pressed="true"] {
    border-color: var(--button-selected-border);
    background-color: color-mix(in oklab, var(--button-selected-foreground) var(--color-mix-3), transparent);
    color: var(--button-selected-foreground);
  }

  /* A ghost or text button draws no border in any state. Chosen, or linking to the page showing, it reads as the navigation's
     current item, blue whatever its tone, as a rail's account link does beside the NavList, and keeps
     that look under the pointer. A current link carries no indicator: it stands beside NavList,
     whose current item marks its start edge. */
  :is(.ghost, .text):is([aria-pressed="true"], [aria-current="page"]) {
    background-color: var(--color-navigation-selected-surface);
    color: var(--color-navigation-selected-text);
  }

  /* A chosen toggle also carries the navigation's indicator under its label, which no hover draws, so a
     brand toggle under the pointer never reads as chosen. */
  :is(.ghost, .text)[aria-pressed="true"] {
    position: relative;
  }

  :is(.ghost, .text)[aria-pressed="true"]::before {
    position: absolute;
    inset-block: auto 0;
    inset-inline: var(--space-2);
    background: var(--color-navigation-selected-indicator);
    block-size: var(--border-width-strong);
    content: "";
  }

  /* Forced colors drop every surface, so an outline marks a chosen button of any variant and the current item, as
     NavList's does. */
  @media (forced-colors: active) {
    :is(.button[aria-pressed="true"], :is(.ghost, .text)[aria-current="page"]):not(:focus-visible) {
      outline: var(--border-width-thin) solid CanvasText;
    }

    /* Forced colors paint the indicator Canvas, so it keeps its line in the text color. */
    :is(.ghost, .text)[aria-pressed="true"]::before {
      background: CanvasText;
      forced-color-adjust: none;
    }
  }

  .button:disabled {
    opacity: 1;
    cursor: not-allowed;
    box-shadow: none;
  }

  .button:disabled:not([aria-pressed="true"]) {
    color: var(--color-action-disabled-text);
  }

  /* A disabled action draws no outline: only an inert fill. A ghost or text button has no fill to dim, so it stays
     bare text while disabled. */
  .button:is(.solid, .outline):disabled:not([aria-pressed="true"]) {
    border-color: transparent;
    background-color: var(--color-action-disabled-surface);
  }

  /* A disabled choice stays visible, dimmed, as a disabled chosen chip does. */
  .button[aria-pressed="true"]:disabled {
    opacity: var(--opacity-disabled);
  }

  /* Dimming would halve the user's own disabled color, and a disabled choice's outline and indicator take it too. */
  @media (forced-colors: active) {
    .button[aria-pressed="true"]:disabled {
      opacity: 1;
      outline-color: GrayText;
    }

    .button[aria-pressed="true"]:disabled::before {
      background: GrayText;
    }
  }
</style>
