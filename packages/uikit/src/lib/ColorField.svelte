<!--
@component
Picks an item's custom color under a label, as a field does: no color, one of the swatches, or any other opaque color
through the browser's own color input. The choices are native controls, so the keyboard, assistive technology
and the form need nothing else: arrow keys move through no color and the swatches, Tab reaches the color input, and
the form receives the six-digit hex value under `name`, or an empty value for no color. Draw the chosen color with
`customColorStyle`.

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
    /** Validation message; its presence outlines the field as invalid. */
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
  import Well from "./internal/Well.svelte";
  import { type MessageKey, useMessages } from "./internal/i18n";

  import { swatches } from "@a-novel-kit/uikit-tokens/palette";

  import { Palette as CustomIcon, Ban as NoColorIcon } from "@lucide/svelte";

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
  <Well as="div" invalid={Boolean(error)} hover={false}>
    <div class="choices">
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
        <NoColorIcon class="icon" aria-hidden="true" />
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
      <!-- The browser's own color input covers the last choice, unseen. It starts from the color showing, returns to
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
          <CustomIcon class="icon" aria-hidden="true" />
        {/if}
      </label>
    </div>
  </Well>
  <FieldMessages {id} {hint} {error} />
</fieldset>

<style>
  .color-field {
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
    font: var(--text-ui);
  }

  /* The choices overlap the well's line and inset, as a button at a field's end does: they sit a space-1 from its
     edge on every side, so one row keeps a medium field's height. They wrap on a narrow field. */
  .choices {
    display: flex;
    flex: 1;
    flex-wrap: wrap;
    gap: var(--space-1);
    margin: calc(-1 * var(--border-width-outline)) calc(-1 * (var(--space-2) + var(--border-width-outline)));
    min-inline-size: 0;
  }

  /* A choice is a button inside a field: a square with no border, lit by a soft box under the pointer. Its native
     control covers it, unseen. */
  .choice {
    display: grid;
    position: relative;
    flex: none;
    place-items: center;
    transition:
      background-color var(--motion-state),
      color var(--motion-state);
    cursor: pointer;
    /* The field's radius less its inset, so both corners share centers. */
    border-radius: calc(var(--radius-lg) - var(--space-1));
    inline-size: var(--control-height-nested);
    block-size: var(--control-height-nested);
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

  .choice :global(.icon) {
    inline-size: var(--icon-size-md);
    block-size: var(--icon-size-md);
    pointer-events: none;
  }

  /* A mark carries its own fill, so its rim stays opaque, as an avatar's does: a dark color still shows its shape. */
  .mark {
    box-sizing: border-box;
    border: var(--border-width-thin) solid var(--color-control-border);
    border-radius: var(--radius-round);
    background: var(--color-mark-custom);
    inline-size: var(--icon-size-md);
    block-size: var(--icon-size-md);
    pointer-events: none;
  }

  @media (hover: hover) {
    .choice:hover:not(:has(:disabled)) {
      background: var(--color-action-subtle-hover);
      color: var(--color-text-primary);
    }
  }

  /* The chosen color wears a ring, which shows around any color. No color has no mark to ring, so it lights. */
  .choice:has(:checked) .mark,
  .custom .mark {
    outline: var(--border-width-strong) solid var(--color-text-primary);
    outline-offset: var(--border-width-thin);
  }

  .choice:has(:checked):not(:has(.mark)) {
    background: var(--color-action-subtle-active);
    color: var(--color-text-primary);
  }

  .choice:has(:focus-visible) {
    outline: var(--focus-ring-width) solid var(--color-focus-ring);
    outline-offset: var(--border-width-strong);
  }

  .choice:has(:disabled) {
    opacity: var(--opacity-disabled);
    cursor: not-allowed;
  }

  @media (forced-colors: active) {
    .mark {
      forced-color-adjust: none;
    }

    .choice:has(:checked) .mark,
    .custom .mark {
      outline-color: Highlight;
    }

    .choice:has(:focus-visible) {
      outline-color: Highlight;
    }
  }
</style>
