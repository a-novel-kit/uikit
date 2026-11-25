<!--
@component
Renders native radio inputs sharing one form name and an external value controller.
Use `createValueController` with a selected option value or `undefined`.
-->
<script lang="ts" module>
  import type { Content } from "./content";
  import type { ValueController } from "./controllers.svelte";
  import type { SelectionOption } from "./types";

  import type { Snippet } from "svelte";
  import type { HTMLFieldsetAttributes } from "svelte/elements";

  /** A labeled value available to a radio group. */
  export interface RadioOption<Value extends string> extends SelectionOption<Value> {
    /** Supporting content shown below the label. */
    description?: Content;
  }

  /** External state contract for a radio group. */
  export type RadioGroupController<Value extends string> = ValueController<Value | undefined>;

  /** Props for a native single-choice radio group. */
  export interface RadioGroupProps<Value extends string> extends Omit<HTMLFieldsetAttributes, "value"> {
    /** Fieldset legend naming the group. */
    legend?: Content;
    /** Values available for selection. */
    options: readonly RadioOption<Value>[];
    /** State owner that decides whether selection requests take effect. */
    controller: RadioGroupController<Value>;
    /** Direction in which options are arranged. */
    orientation?: "vertical" | "horizontal";
    /** Shared form name for the radio inputs. */
    name?: string;
    /** Replaces the visible option copy while `label` remains its accessible name. */
    renderOption?: Snippet<[RadioOption<Value>]>;
  }
</script>

<script lang="ts" generics="Value extends string">
  import ChoiceLabel from "./internal/ChoiceLabel.svelte";
  import RenderContent from "./internal/RenderContent.svelte";

  const generatedName = $props.id();

  let {
    legend,
    options,
    controller,
    orientation = "vertical",
    name = generatedName,
    renderOption,
    class: className = "",
    ...rest
  }: RadioGroupProps<Value> = $props();

  let fieldset: HTMLFieldSetElement;

  function handleChange(event: Event) {
    const target = event.currentTarget as HTMLInputElement;
    controller.setValue(target.value as Value);

    for (const input of fieldset.querySelectorAll<HTMLInputElement>(`input[type="radio"]`)) {
      input.checked = input.value === controller.state.value;
    }
  }
</script>

<fieldset bind:this={fieldset} class="group {orientation} {className}" {...rest}>
  {#if legend}<legend><RenderContent content={legend} /></legend>{/if}
  <div class="options">
    {#each options as option (option.value)}
      <label>
        <input
          type="radio"
          {name}
          value={option.value}
          checked={controller.state.value === option.value}
          defaultChecked={controller.state.value === option.value}
          onchange={handleChange}
          disabled={option.disabled}
          aria-label={option.label}
          lang={option.lang}
          form={rest.form}
        />
        {#if renderOption}
          <ChoiceLabel>{@render renderOption(option)}</ChoiceLabel>
        {:else}
          <ChoiceLabel label={option.label} description={option.description} lang={option.lang} />
        {/if}
      </label>
    {/each}
  </div>
</fieldset>

<style>
  .group {
    display: grid;
    gap: var(--space-3);
    margin: 0;
    border: 0;
    padding: 0;
    min-inline-size: 0;
  }

  legend {
    margin-block-end: var(--space-2);
    padding: 0;
    color: var(--color-text-secondary);
    font: var(--text-ui-strong);
  }

  .options {
    display: flex;
    gap: var(--space-3);
  }
  .vertical .options {
    flex-direction: column;
  }
  .horizontal .options {
    flex-flow: row wrap;
  }

  label {
    display: inline-flex;
    align-items: flex-start;
    gap: var(--space-3);
    cursor: pointer;
  }

  input {
    display: grid;
    flex: none;
    place-content: center;
    appearance: none;
    transition:
      background-color var(--motion-state),
      border-color var(--motion-state),
      box-shadow var(--motion-state);
    cursor: inherit;
    margin: 0;
    outline: none;
    border: var(--border-width-thin) solid var(--color-control-border);
    border-radius: var(--radius-round);
    background: var(--color-control-surface);
    padding: 0;
    inline-size: var(--icon-size-md);
    block-size: var(--icon-size-md);
    color: var(--color-control-on-mark);
  }

  input::before {
    transform: scale(0);
    transition: transform var(--motion-mark);
    border-radius: var(--radius-round);
    background: currentColor;
    inline-size: var(--size-2);
    block-size: var(--size-2);
    content: "";
  }

  @media (hover: hover) {
    input:hover:not(:disabled):not(:checked):not(:focus-visible) {
      border-color: var(--color-control-border-hover);
      background: var(--color-control-surface-hover);
    }
  }

  input:checked {
    border-color: var(--color-control-on);
    background: var(--color-control-on);
  }

  input:checked::before {
    transform: scale(1);
  }

  input:focus-visible {
    outline: none;
    box-shadow: var(--shadow-focus-ring);
    border-color: var(--color-control-border-focus);
    background: var(--color-control-surface-focus);
  }

  input:focus-visible:checked {
    background: var(--color-control-on);
  }

  @media (forced-colors: active) {
    input:focus-visible {
      outline: var(--border-width-strong) solid Highlight;
      outline-offset: var(--focus-ring-offset);
    }
  }

  input:disabled {
    border-color: transparent;
    background: var(--color-action-disabled-surface);
    color: var(--color-action-disabled-text);
  }

  label:has(input:disabled) {
    cursor: not-allowed;
  }
</style>
