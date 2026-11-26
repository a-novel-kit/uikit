<!--
@component
Picks an item's custom color under a label: no color, one of the swatches, or any other opaque color through the
browser's own color input. The choices pack as a grid of squares, two rows deep: a blank square for no color, the
swatches, then the square that opens the color input. A swatch rests dimmed toward its hue's tint, and the chosen one
shows its color at full strength, inside the line a chosen outline button draws. They are native controls, so the keyboard, assistive
technology and the form need nothing else: arrow keys move through no color and the swatches, Tab reaches the color
input, and the form receives the six-digit hex value under `name`, or an empty value for no color. Draw the chosen
color with `customColorStyle`.

```svelte
<script lang="ts">
  import { ColorField, createValueController } from "@a-novel-kit/uikit";

  const color = createValueController<string | undefined>({ initialValue: undefined });
</script>

<ColorField legend="Color" name="color" controller={color} />
```
-->
<script lang="ts" module>
  import type { Content } from "./content";
  import type { ValueController } from "./controllers.svelte";
  import { customColorStyle } from "./customColor";

  import type { HTMLFieldsetAttributes } from "svelte/elements";

  import { swatches } from "@a-novel-kit/uikit-tokens/palette";

  /** External state contract for a color field: a six-digit hex value, or `undefined` for no color. */
  export type ColorFieldController = ValueController<string | undefined>;

  /** Props for a field that picks an item's custom color. */
  export interface ColorFieldProps extends Omit<HTMLFieldsetAttributes, "children"> {
    /** Visible name of the field, set as a field's label. */
    legend: Content;
    /** Supporting content rendered below the choices, before any error. */
    hint?: Content;
    /** Validation message rendered below the choices, after any hint. */
    error?: Content;
    /** Form name of the chosen color. */
    name: string;
    /** State owner of the chosen color; each field has its own by default. */
    controller?: ColorFieldController;
  }

  /** How each swatch draws, worked out once: the swatches never change. */
  const swatchStyles = swatches.map((swatch) => customColorStyle(swatch.hex));
  /** No color, the swatches and the color input, over two rows. */
  const columns = Math.ceil((swatches.length + 2) / 2);
</script>

<script lang="ts">
  import { createValueController } from "./controllers.svelte";
  import FieldMessages, { messageIds } from "./internal/FieldMessages.svelte";
  import RenderContent from "./internal/RenderContent.svelte";
  import { type MessageKey, useMessages } from "./internal/i18n";

  import { Palette as CustomIcon } from "@lucide/svelte";

  const id = $props.id();

  let {
    legend,
    hint,
    error,
    name,
    controller = createValueController<string | undefined>({ initialValue: undefined }),
    class: className = "",
    "aria-describedby": describedBy,
    ...rest
  }: ColorFieldProps = $props();

  const { t } = useMessages();

  const value = $derived(controller.state.value?.toLowerCase());
  const custom = $derived(value !== undefined && !swatches.some((swatch) => swatch.hex === value));

  let fieldset: HTMLFieldSetElement;

  // A radio checks itself before its change event, so each takes back whatever the controller refuses.
  function choose(input: HTMLInputElement) {
    controller.setValue(input.value || undefined);

    for (const radio of fieldset.querySelectorAll<HTMLInputElement>(`input[type="radio"]`)) {
      radio.checked = radio.value === (controller.state.value?.toLowerCase() ?? "");
    }
  }
</script>

<fieldset
  bind:this={fieldset}
  class="color-field {className}"
  {...rest}
  aria-describedby={messageIds({ id, hint, error }, describedBy)}
>
  <legend><RenderContent content={legend} /></legend>
  <div class="choices" style:grid-template-columns="repeat({columns}, var(--size-6))">
    <label class="choice blank">
      <input
        type="radio"
        {name}
        value=""
        checked={value === undefined}
        defaultChecked={value === undefined}
        aria-label={t("colorField.none")}
        form={rest.form}
        onchange={(event) => choose(event.currentTarget)}
      />
    </label>
    {#each swatches as swatch, index (swatch.hex)}
      <label class="choice swatch" style={swatchStyles[index]}>
        <input
          type="radio"
          {name}
          value={swatch.hex}
          checked={value === swatch.hex}
          defaultChecked={value === swatch.hex}
          aria-label={t(`colorField.swatch.${swatch.name}` as MessageKey)}
          form={rest.form}
          onchange={(event) => choose(event.currentTarget)}
        />
      </label>
    {/each}
    <!-- The browser's own color input covers the last square, unseen. It starts from the color showing, returns to
         it when its form resets, and the form reads it only while its color is the one chosen. -->
    <label class="choice" style={custom ? customColorStyle(value) : undefined}>
      <input
        type="color"
        name={custom ? name : undefined}
        {value}
        defaultValue={value}
        aria-label={t("colorField.custom")}
        aria-current={custom ? "true" : undefined}
        form={rest.form}
        oninput={(event) => controller.setValue(event.currentTarget.value)}
      />
      {#if custom}
        <span class="mark"></span>
      {:else}
        <CustomIcon class="icon" aria-hidden="true" />
      {/if}
    </label>
  </div>
  <FieldMessages {id} {hint} {error} />
</fieldset>

<style>
  /* A field stretched by what holds it keeps its parts packed at its start. */
  .color-field {
    display: grid;
    align-content: start;
    gap: var(--space-2);
    margin: 0;
    border: 0;
    padding: 0;
    min-inline-size: 0;
  }

  /* The name reads as a field's label: regular, above the choices. */
  legend {
    margin-block-end: var(--space-2);
    padding: 0;
    color: var(--color-text-secondary);
    font: var(--text-ui);
  }

  /* The squares pack as a grid, as close as the lines of one item. */
  .choices {
    display: grid;
    place-content: start;
    gap: var(--space-1);
  }

  /* A choice is a square, the least size a pointer needs, filled as a neutral action is unless it has a hue. It
     keeps room for an outline's line, as a button does. Its native control covers it, unseen. */
  .choice {
    display: grid;
    position: relative;
    place-items: center;
    transition:
      background-color var(--motion-state),
      border-color var(--motion-state),
      color var(--motion-state);
    cursor: pointer;
    box-sizing: border-box;
    border: var(--border-width-outline) solid transparent;
    border-radius: var(--radius-sm);
    background: var(--color-tint-custom);
    inline-size: var(--size-6);
    block-size: var(--size-6);
    color: var(--color-text-secondary);
  }

  /* The control takes the square's own size from over its line, so the whole square is its target. */
  .choice input {
    position: absolute;
    opacity: 0;
    cursor: inherit;
    margin: 0;
    inset-block-start: calc(-1 * var(--border-width-outline));
    inset-inline-start: calc(-1 * var(--border-width-outline));
    border: 0;
    padding: 0;
    inline-size: var(--size-6);
    block-size: var(--size-6);
  }

  .choice :global(.icon) {
    inline-size: var(--icon-size-sm);
    block-size: var(--icon-size-sm);
    pointer-events: none;
  }

  /* A swatch rests part of the way from its hue's tint to its color: dim enough for the chosen one to stand out,
     and bright enough to tell two neighbors apart. */
  .swatch {
    background: color-mix(in oklab, var(--color-mark-custom) var(--color-mix-6), var(--color-tint-custom));
  }

  /* A color outside the swatches shows as it was picked, small, on its own tint: a dark one keeps its shape. */
  .mark {
    background: var(--color-mark-custom);
    inline-size: var(--size-3);
    block-size: var(--size-3);
    pointer-events: none;
  }

  /* The pointer lights a square a step, as it lights an action, and never as far as the chosen one. */
  @media (hover: hover) {
    .choice:hover:not(:has(:disabled, :checked)) {
      background: var(--color-tint-custom-lit);
      color: var(--color-text-primary);
    }

    .swatch:hover:not(:has(:disabled, :checked)) {
      background: color-mix(in oklab, var(--color-mark-custom) var(--color-mix-8), var(--color-tint-custom));
    }
  }

  /* The chosen square takes a chosen outline button's line, at an outline's weight. Its light alone was too faint
     a mark on the darker hues. */
  .choice:has(:checked, [aria-current]) {
    border-color: var(--color-border-strong);
  }

  /* The chosen swatch also shows its color at full strength. */
  .swatch:has(:checked) {
    background: var(--color-mark-custom);
  }

  /* No color has none to show at full strength, so its square takes a chosen neutral action's fill. */
  .blank:has(:checked) {
    background: var(--color-action-neutral-selected);
  }

  /* The keyboard's focus keeps its line, a hairline away so it shows around its own color too. */
  .choice:has(:focus-visible) {
    outline: var(--focus-ring-width) solid var(--color-focus-ring);
    outline-offset: var(--border-width-thin);
  }

  .choice:has(:disabled) {
    opacity: var(--opacity-disabled);
    cursor: not-allowed;
  }

  /* Forced colors replace every fill, so there the squares keep their colors, and the chosen one's line stands
     out. */
  @media (forced-colors: active) {
    .choice,
    .mark {
      forced-color-adjust: none;
    }

    .choice:has(:checked, [aria-current]) {
      border-color: Highlight;
    }

    .choice:has(:focus-visible) {
      outline: var(--focus-ring-width) solid Highlight;
      outline-offset: var(--border-width-thin);
    }
  }
</style>
