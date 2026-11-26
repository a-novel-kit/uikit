<!--
@component
Picks an item's custom color under a label: no color, one of the swatches, or any other opaque color through the
browser's own color input. The choices pack as a grid of squares, two rows deep: a blank square for no color, the
swatches, then the square that opens the color input. They are native controls, so the keyboard, assistive
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

  import type { HTMLFieldsetAttributes } from "svelte/elements";

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
</script>

<script lang="ts">
  import { createValueController } from "./controllers.svelte";
  import { customColorStyle } from "./customColor";
  import FieldMessages, { messageIds } from "./internal/FieldMessages.svelte";
  import RenderContent from "./internal/RenderContent.svelte";
  import { type MessageKey, useMessages } from "./internal/i18n";

  import { swatches } from "@a-novel-kit/uikit-tokens/palette";

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
  // No color, the swatches and the color input, over two rows.
  const columns = Math.ceil((swatches.length + 2) / 2);

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
    <label class="choice">
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
      <span class="mark"></span>
    </label>
    {#each swatches as swatch (swatch.hex)}
      <label class="choice">
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
        <span class="mark" style:--color-mark-custom={swatch.hex}></span>
      </label>
    {/each}
    <!-- The browser's own color input covers the last square, unseen. It starts from the color showing, returns to
         it when its form resets, and the form reads it only while its color is the one chosen. -->
    <label class="choice" class:custom>
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
        <span class="mark" style={customColorStyle(value)}></span>
      {:else}
        <span class="mark"><CustomIcon class="icon" aria-hidden="true" /></span>
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

  /* A choice is a square the least size a pointer needs, on a checkbox's well, which a blank mark leaves bare: that
     is no color. Its native control covers it, unseen. */
  .choice {
    display: grid;
    position: relative;
    cursor: pointer;
    border-radius: var(--radius-sm);
    background: var(--color-control-surface);
    inline-size: var(--size-6);
    block-size: var(--size-6);
    color: var(--color-text-muted);
  }

  .choice input {
    position: absolute;
    opacity: 0;
    cursor: inherit;
    margin: 0;
    inset: 0;
    border: 0;
    padding: 0;
    inline-size: 100%;
    block-size: 100%;
  }

  /* A mark fills the square with its color, inside a checkbox's opaque rim, so a dark color keeps its shape. */
  .mark {
    display: grid;
    place-items: center;
    transition:
      margin var(--motion-state),
      border-color var(--motion-state),
      background-color var(--motion-state);
    box-sizing: border-box;
    border: var(--border-width-thin) solid var(--color-control-border);
    border-radius: inherit;
    background: var(--color-mark-custom);
    pointer-events: none;
  }

  .mark :global(.icon) {
    inline-size: var(--icon-size-sm);
    block-size: var(--icon-size-sm);
  }

  /* The pointer rings a square it can choose, a hairline away, which fits between two squares. */
  @media (hover: hover) {
    .choice:hover:not(.custom, :has(:disabled, :checked)) {
      outline: var(--border-width-thin) solid var(--color-control-border-hover);
      outline-offset: var(--border-width-thin);
      color: var(--color-text-primary);
    }
  }

  /* The chosen square draws in, inside a ring that shows around any color, so a dense grid needs no room for it.
     The ring gives the mark its shape, so the mark drops its rim, and its corner keeps the ring's center. */
  .choice:has(:checked),
  .custom {
    outline: var(--border-width-strong) solid var(--color-text-primary);
    outline-offset: calc(-1 * var(--border-width-strong));
  }

  .choice:has(:checked) .mark,
  .custom .mark {
    margin: var(--space-1);
    border-color: transparent;
    border-radius: calc(var(--radius-sm) - var(--space-1));
  }

  /* Focus colors the square's line, as it does a checkbox's: its rim, and its ring once chosen. */
  .choice:has(:focus-visible) {
    outline-color: var(--color-control-border-focus);
    box-shadow: var(--shadow-focus-ring);
  }

  .choice:has(:focus-visible):not(.custom, :has(:checked)) .mark {
    border-color: var(--color-control-border-focus);
  }

  .choice:has(:disabled) {
    opacity: var(--opacity-disabled);
    cursor: not-allowed;
  }

  @media (forced-colors: active) {
    .mark {
      forced-color-adjust: none;
    }

    .choice:has(:checked),
    .custom {
      outline-color: Highlight;
    }

    .choice:has(:focus-visible) {
      outline: var(--border-width-strong) solid Highlight;
      outline-offset: var(--focus-ring-offset);
    }
  }
</style>
