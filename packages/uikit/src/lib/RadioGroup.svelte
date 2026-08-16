<script lang="ts" module>
  import type { Content } from "./content";
  import type { SelectionOption } from "./types";

  import type { Snippet } from "svelte";
  import type { HTMLFieldsetAttributes } from "svelte/elements";

  /** A labeled value available to a radio group. */
  export interface RadioOption<Value extends string> extends SelectionOption<Value> {
    /** Supporting content shown below the label. */
    description?: Content;
  }

  /** Props for a native single-choice radio group. */
  export interface RadioGroupProps<Value extends string> extends Omit<HTMLFieldsetAttributes, "value"> {
    /** Optional fieldset legend. */
    legend?: Content;
    /** Values available for selection. */
    options: readonly RadioOption<Value>[];
    /** Currently selected value. */
    value?: Value;
    /** Direction in which options are arranged. */
    orientation?: "vertical" | "horizontal";
    /** Shared form name for the radio inputs. */
    name?: string;
    /** Replaces the visible option copy while `label` remains its accessible name. */
    renderOption?: Snippet<[RadioOption<Value>]>;
  }
</script>

<script lang="ts" generics="Value extends string">
  import RenderContent from "./Content.svelte";

  const generatedName = $props.id();

  let {
    legend,
    options,
    value = $bindable(),
    orientation = "vertical",
    name = generatedName,
    renderOption,
    class: className = "",
    ...rest
  }: RadioGroupProps<Value> = $props();
</script>

<fieldset class="group {orientation} {className}" {...rest}>
  {#if legend}<legend><RenderContent content={legend} /></legend>{/if}
  <div class="options">
    {#each options as option (option.value)}
      <label>
        <input
          type="radio"
          {name}
          value={option.value}
          bind:group={value}
          disabled={option.disabled}
          aria-label={option.label}
        />
        <span class="copy">
          {#if renderOption}
            {@render renderOption(option)}
          {:else}
            <span class="label">{option.label}</span>
            {#if option.description}
              <span class="description"><RenderContent content={option.description} /></span>
            {/if}
          {/if}
        </span>
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
    color: var(--color-text-secondary);
    font-weight: var(--font-weight-bold);
    font-size: var(--font-size-sm);
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
    color: var(--color-text-primary);
  }

  input {
    display: grid;
    flex: none;
    place-content: center;
    appearance: none;
    transition:
      background-color var(--duration-fast) var(--easing-standard),
      border-color var(--duration-fast) var(--easing-standard),
      box-shadow var(--duration-fast) var(--easing-standard);
    cursor: inherit;
    margin: 0;
    outline: none;
    border: var(--border-width-thin) solid var(--color-control-border);
    border-radius: var(--radius-round);
    background: var(--color-control-surface);
    padding: 0;
    inline-size: var(--icon-size-md);
    block-size: var(--icon-size-md);
    color: var(--color-action-primary-text);
  }

  input::before {
    transform: scale(0);
    transition: transform var(--duration-fast) var(--easing-emphasized);
    border-radius: var(--radius-round);
    background: currentColor;
    inline-size: var(--space-2);
    block-size: var(--space-2);
    content: "";
  }

  input:hover:not(:disabled):not(:checked):not(:focus-visible) {
    border-color: var(--color-control-border-hover);
    background: var(--color-control-surface-hover);
  }

  input:checked {
    box-shadow: var(--shadow-action-selected);
    border-color: var(--color-action-primary-selected);
    background: var(--color-action-primary);
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
    background: var(--color-action-primary);
  }

  @media (forced-colors: active) {
    input:focus-visible {
      outline: var(--border-width-strong) solid Highlight;
      outline-offset: var(--focus-ring-offset);
    }
  }

  input:disabled {
    box-shadow: none;
    border-color: var(--color-action-disabled-border);
    background: var(--color-action-disabled-surface);
    color: var(--color-action-disabled-text);
  }

  .copy {
    display: grid;
    gap: var(--space-1);
  }
  .label {
    font-weight: var(--font-weight-bold);
    font-size: var(--font-size-sm);
  }
  .description {
    color: var(--color-text-muted);
    font-size: var(--font-size-sm);
    line-height: var(--line-height-compact);
  }
  label:has(input:disabled) {
    cursor: not-allowed;
    color: var(--color-text-disabled);
  }
  label:has(input:disabled) .description {
    color: var(--color-text-disabled);
  }
</style>
