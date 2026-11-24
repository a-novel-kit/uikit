<!--
Draws a field's well: its surface, its ring and every state a field shows, at a control size. The well wraps its
control, which carries `data-well-control`, or is the control itself, as a select's trigger is. A group of buttons or
icons at the field's end carries `data-well-end`. Content inside reads the well's current surface from
`--well-surface`, and the color of its secondary text, which dims with the well, from `--well-muted-text`.
-->
<script lang="ts" module>
  import type { ComponentSize } from "../types";

  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";

  /** Props for a field's well; other attributes go to its element. */
  export interface WellProps extends Omit<HTMLButtonAttributes, "children"> {
    /** The element the well is: a wrapper around its control by default (a `div` around block content), or the
     * control itself. */
    as?: "span" | "div" | "button";
    /** Sets the well's height, inset and type scale. */
    size?: ComponentSize;
    /** Applies the invalid surface and focus treatment. */
    invalid?: boolean;
    /** Lightens the well under the pointer; a well of separate choices leaves that to each choice. */
    hover?: boolean;
    /** Drops the inset, for content that fills the well and pads itself, as a textarea does. */
    flush?: boolean;
    /** The well's element, for its owner to anchor a list to. */
    element?: HTMLElement | null;
    /** The control and what surrounds it. */
    children: Snippet;
  }
</script>

<script lang="ts">
  let {
    as = "span",
    size = "md",
    invalid = false,
    hover = true,
    flush = false,
    element = $bindable(null),
    class: className = "",
    children,
    ...rest
  }: WellProps = $props();
</script>

<svelte:element
  this={as}
  bind:this={element}
  class="well {size} {className}"
  class:invalid
  class:hover
  class:flush
  {...rest}
>
  {@render children()}
</svelte:element>

<style>
  .well {
    display: flex;
    position: relative;
    align-items: center;
    gap: var(--space-2);
    appearance: none;
    transition:
      background-color var(--motion-state),
      border-color var(--motion-state),
      box-shadow var(--motion-state);
    box-sizing: border-box;
    border: var(--border-width-outline) solid var(--color-field-border);
    border-radius: var(--radius-lg);
    background: var(--well-surface);
    inline-size: 100%;
    min-inline-size: 0;
    color: var(--color-control-text);
    text-align: start;
    --well-surface: var(--color-control-surface);
    --well-muted-text: var(--color-text-muted);
  }

  button.well {
    cursor: pointer;
  }

  /* A small well keeps a small button's height around a tag. */
  .sm {
    /* off-scale: half a step above and below, so a small well keeps a small button's height around a tag */
    padding: calc(var(--space-1) / 2) var(--space-3);
    min-block-size: var(--control-height-sm);
    font: var(--text-ui);
  }
  .md {
    padding: var(--space-1) var(--space-3);
    min-block-size: var(--control-height-md);
    font: var(--text-field);
  }
  .lg {
    padding: var(--space-2) var(--space-4);
    min-block-size: var(--control-height-lg);
    font: var(--text-field-lg);
  }
  .flush {
    padding: 0;
  }

  /* The end group overlaps the well's inset: its zero-height margin box keeps the field at its own height, and it
     sits as far from the inline end as from the block edges of a medium field. */
  :where(.well) :global([data-well-end]) {
    display: inline-flex;
    flex: none;
    gap: var(--space-1);
    margin-inline-end: calc(-1 * (var(--space-2) + var(--border-width-thin)));
    /* off-scale: minus half the nested control's height each way, so the group adds none to the field */
    margin-block: calc(var(--control-height-nested) / -2);
  }

  /* The states run from the weakest: a disabled field keeps its error look, and its border stays a well's. */
  @media (hover: hover) {
    .hover:hover:not(
        .invalid,
        :disabled,
        :focus-visible,
        [data-state="open"],
        :has(:global([data-well-control]):is(:disabled, [readonly], :focus-visible, :user-invalid))
      ) {
      --well-surface: var(--color-control-surface-hover);
    }
  }

  /* An open select reads as a focused field for as long as its list shows, whether or not the browser shows its
     focus: a tap or a click focuses a button without it. */
  .well:is(:focus-visible, [data-state="open"], :has(:global([data-well-control]:focus-visible))) {
    outline: none;
    box-shadow: var(--shadow-focus-ring);
    border-color: var(--color-control-border-focus);
    --well-surface: var(--color-control-surface-focus);
  }

  /* A disabled fieldset disables its controls without their owners knowing, so the well follows their state. */
  .well:is(:disabled, :has(:global([data-well-control]:disabled))),
  :global(fieldset:disabled) .well {
    cursor: not-allowed;
    color: var(--color-control-disabled-text);
    --well-surface: var(--color-control-surface-disabled);
    --well-muted-text: var(--color-control-disabled-text);
  }

  /* An error, or a required field the form found empty, keeps its look while focused. */
  .well:is(.invalid, :has(:global([data-well-control]:user-invalid))) {
    border-color: var(--color-feedback-error-border);
    --well-surface: var(--color-control-surface-invalid);
  }

  .well:is(.invalid, :has(:global([data-well-control]:user-invalid))):is(
      :focus-visible,
      [data-state="open"],
      :has(:global([data-well-control]:focus-visible))
    ) {
    box-shadow: var(--shadow-invalid-focus-ring);
  }

  @media (forced-colors: active) {
    .well:is(:focus-visible, :has(:global([data-well-control]:focus-visible))) {
      outline: var(--border-width-strong) solid Highlight;
      outline-offset: var(--focus-ring-offset);
    }

    .well:is(:disabled, :has(:global([data-well-control]:disabled))),
    :global(fieldset:disabled) .well {
      color: GrayText;
      --well-muted-text: GrayText;
    }
  }
</style>
