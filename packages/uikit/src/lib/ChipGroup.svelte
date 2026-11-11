<!--
@component
Picks any number of short options under a label, as a field does: each option is a chip in the field's well, lit
when chosen. Each chip is a native checkbox, so the keyboard, assistive technology and the form need nothing else:
the form receives every chosen value under `name`, in the options' order, except a disabled option's, which a form
never sends; the controller keeps the order of choice.

```svelte
<script lang="ts">
  import { ChipGroup } from "@a-novel-kit/uikit";
</script>

<ChipGroup legend="Genres" hint="Up to 10." name="genres" options={[{ value: "fantasy", label: "Fantasy" }]} />
```
-->
<script lang="ts" module>
  import type { Content } from "./content";
  import type { ValueController } from "./controllers.svelte";
  import type { SelectionOption } from "./types";

  import type { HTMLFieldsetAttributes } from "svelte/elements";

  /** External state contract for a chip group; the value holds the chosen option values. */
  export type ChipGroupController = ValueController<readonly string[]>;

  /** Props for a group of options that each turn on and off. */
  export interface ChipGroupProps extends Omit<HTMLFieldsetAttributes, "children"> {
    /** Visible name of the group, set as a field's label. */
    legend: Content;
    /** Supporting content rendered below the chips, before any error. */
    hint?: Content;
    /** Validation message; its presence outlines the group as invalid. */
    error?: Content;
    /** Form name of every chip. */
    name: string;
    /** The options, in the order they show. */
    options: readonly SelectionOption<string>[];
    /** The color a chosen chip lights in: the brand blue by default, or the rarer accent magenta. */
    tone?: "brand" | "accent";
    /** State owner of the chosen values; each group has its own by default. */
    controller?: ChipGroupController;
  }
</script>

<script lang="ts">
  import RenderContent from "./Content.svelte";
  import { createValueController } from "./controllers.svelte";

  const id = $props.id();

  let {
    legend,
    hint,
    error,
    name,
    options,
    tone = "brand",
    controller = createValueController<readonly string[]>({ initialValue: [] }),
    class: className = "",
    "aria-describedby": describedBy,
    ...rest
  }: ChipGroupProps = $props();

  const chosen = $derived(controller.state.value);
  const hintId = $derived(hint ? `${id}-hint` : undefined);
  const errorId = $derived(error ? `${id}-error` : undefined);

  // The checkbox flips before its change event, so it takes back whatever the controller refuses.
  function choose(input: HTMLInputElement) {
    const others = chosen.filter((value) => value !== input.value);
    controller.setValue(input.checked ? [...others, input.value] : others);
    input.checked = controller.state.value.includes(input.value);
  }
</script>

<fieldset
  class="chip-group {tone} {className}"
  class:invalid={Boolean(error)}
  {...rest}
  aria-describedby={[describedBy, hintId, errorId].filter(Boolean).join(" ") || undefined}
>
  <legend><RenderContent content={legend} /></legend>
  <div class="chips">
    {#each options as option (option.value)}
      <label class="chip" lang={option.lang}>
        <input
          type="checkbox"
          {name}
          value={option.value}
          checked={chosen.includes(option.value)}
          defaultChecked={chosen.includes(option.value)}
          disabled={option.disabled}
          aria-invalid={error ? true : undefined}
          form={rest.form}
          onchange={(event) => choose(event.currentTarget)}
        />
        {option.label}
      </label>
    {/each}
  </div>
  {#if hint}<div id={hintId} class="hint"><RenderContent content={hint} /></div>{/if}
  {#if error}<div id={errorId} class="error"><RenderContent content={error} /></div>{/if}
</fieldset>

<style>
  .chip-group {
    display: grid;
    gap: var(--space-2);
    margin: 0;
    border: 0;
    padding: 0;
    min-inline-size: 0;
  }

  /* The name reads as a field's label: regular, above the well. */
  legend {
    margin-block-end: var(--space-2);
    padding: 0;
    color: var(--color-text-secondary);
    font-weight: var(--font-weight-regular);
    font-size: var(--font-size-sm);
    line-height: var(--line-height-compact);
    font-family: var(--font-family-interface);
  }

  /* The chips sit in a field's well, which outlines only an error. */
  /* As a medium field: a button's height and the same inset, growing with its rows. */
  .chips {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-1-5);
    box-sizing: border-box;
    border: var(--border-width-thin) solid var(--color-field-border);
    border-radius: var(--radius-md);
    background: var(--color-control-surface);
    padding: var(--space-1) var(--space-3);
    min-block-size: var(--control-height-md);
  }

  .invalid .chips {
    border-color: var(--color-feedback-error-border);
    background: var(--color-control-surface-invalid);
  }

  /* A chip takes a badge's size and type, so a chosen one reads as the tag it becomes. A real checkbox
     covers it, unseen. */
  .chip {
    display: inline-flex;
    position: relative;
    align-items: center;
    transition:
      background-color var(--duration-fast) var(--easing-standard),
      box-shadow var(--duration-fast) var(--easing-standard),
      color var(--duration-fast) var(--easing-standard);
    cursor: pointer;
    border-radius: var(--radius-sm);
    background: var(--color-action-neutral);
    padding-inline: var(--space-1-5);
    padding-block: calc(var(--space-1) / var(--multiplier-2));
    color: var(--color-text-secondary);
    font-size: var(--font-size-xs);
    line-height: var(--line-height-compact);
    font-family: var(--font-family-interface);
    user-select: none;
    overflow-wrap: anywhere;
  }

  /* The unseen checkbox covers the chip, and reaches past a short chip's edges to the 24px minimum target. */
  .chip input {
    position: absolute;
    opacity: 0;
    cursor: inherit;
    margin: 0;
    inset: min(0px, calc((100% - var(--icon-size-lg)) / 2));
  }

  @media (hover: hover) {
    .chip:hover:not(:has(:checked, :disabled)) {
      background: var(--color-action-neutral-hover);
      color: var(--color-text-primary);
    }
  }

  .brand {
    --chip-chosen: var(--color-feedback-info-text);
  }

  .accent {
    --chip-chosen: var(--color-accent-secondary);
  }

  .chip:has(:checked) {
    box-shadow: 0 0 var(--space-3) color-mix(in oklab, var(--chip-chosen) var(--color-mix-2), transparent);
    background: var(--chip-chosen);
    color: var(--color-text-inverse);
  }

  /* The ring stays clear of the next chip, the chips' gap apart. */
  .chip:has(:focus-visible) {
    outline: var(--focus-ring-width) solid var(--color-focus-ring);
    outline-offset: var(--border-width-strong);
  }

  /* A disabled group dims its well, as a disabled TagInput does, and its chips keep their choice visible. */
  .chip:has(:disabled) {
    cursor: not-allowed;
  }

  .chip-group:disabled:not(.invalid) .chips {
    background: var(--color-control-surface-disabled);
  }

  .chip:has(:disabled:not(:checked)) {
    background: var(--color-control-surface-disabled);
    color: var(--color-control-disabled-text);
  }

  /* A chosen option that is disabled stays visible, dimmed: the form will not send it. */
  .chip:has(:checked:disabled) {
    opacity: var(--opacity-disabled);
    box-shadow: none;
  }

  .hint,
  .error {
    margin: 0;
    font-size: var(--font-size-sm);
    line-height: var(--line-height-compact);
  }

  /* As a field's hint: quieter than the label and slightly inset. */
  .hint {
    padding-inline: var(--space-1);
    color: var(--color-text-hint);
    font-size: var(--font-size-xs);
  }

  .error {
    color: var(--color-feedback-error-text);
  }

  /* Forced colors drop the chip's fill, so a border keeps its shape, as Badge does. */
  @media (forced-colors: active) {
    .chip {
      border: var(--border-width-thin) solid CanvasText;
    }

    /* The choice fills the chip, so the outline stays free for the focus ring. */
    .chip:has(:checked) {
      box-shadow: none;
      background: Highlight;
      color: HighlightText;
      forced-color-adjust: none;
    }

    /* The fill is not forced, so neither is the ring around it. */
    .chip:has(:focus-visible) {
      outline-color: Highlight;
    }

    .chip:has(:disabled:not(:checked)) {
      border-color: GrayText;
      color: GrayText;
    }

    .chip:has(:checked:disabled) {
      background: GrayText;
      color: Canvas;
    }
  }
</style>
