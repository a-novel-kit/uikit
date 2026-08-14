<script lang="ts" module>
  import type { Content } from "./content";

  import type { HTMLInputAttributes } from "svelte/elements";

  /** Props for a native checkbox with optional supporting content. */
  export interface CheckboxProps extends Omit<HTMLInputAttributes, "type" | "checked"> {
    /** Optional label content. */
    label?: Content;
    /** Supporting content shown below the label. */
    description?: Content;
    /** Current checked state. */
    checked?: boolean;
    /** Displays a mixed state without changing the submitted value. */
    indeterminate?: boolean;
  }
</script>

<script lang="ts">
  import RenderContent from "./Content.svelte";

  let {
    label,
    description,
    checked = $bindable(false),
    indeterminate = false,
    class: className = "",
    ...rest
  }: CheckboxProps = $props();

  let input: HTMLInputElement;

  $effect(() => {
    if (input) input.indeterminate = indeterminate;
  });
</script>

<label class="choice {className}">
  <input bind:this={input} bind:checked type="checkbox" {...rest} />
  {#if label || description}
    <span class="copy">
      {#if label}<span class="label"><RenderContent content={label} /></span>{/if}
      {#if description}<span class="description"><RenderContent content={description} /></span>{/if}
    </span>
  {/if}
</label>

<style>
  .choice {
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
    border-radius: var(--radius-sm);
    background: var(--color-control-surface);
    padding: 0;
    inline-size: var(--icon-size-md);
    block-size: var(--icon-size-md);
    color: var(--color-action-primary-text);
  }

  input::before {
    transform: rotate(45deg) scale(0);
    transition: transform var(--duration-fast) var(--easing-emphasized);
    box-sizing: border-box;
    border: solid currentColor;
    border-width: 0 var(--border-width-strong) var(--border-width-strong) 0;
    inline-size: var(--space-1-5);
    block-size: var(--space-2);
    content: "";
  }

  input:hover:not(:disabled):not(:checked):not(:indeterminate):not(:focus-visible) {
    border-color: var(--color-control-border-hover);
    background: var(--color-control-surface-hover);
  }

  input:checked,
  input:indeterminate {
    box-shadow: var(--shadow-action-selected);
    border-color: var(--color-action-primary-selected);
    background: var(--color-action-primary);
  }

  input:checked::before {
    transform: rotate(45deg) scale(1);
  }

  input:indeterminate::before {
    transform: scale(1);
    border: 0;
    background: currentColor;
    inline-size: var(--space-2);
    block-size: var(--border-width-strong);
  }

  input:focus-visible {
    outline: none;
    box-shadow: var(--shadow-focus-ring);
    border-color: var(--color-control-border-focus);
    background: var(--color-control-surface-focus);
  }

  input:focus-visible:is(:checked, :indeterminate) {
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
  .choice:has(input:disabled) {
    cursor: not-allowed;
    color: var(--color-text-disabled);
  }
  .choice:has(input:disabled) .description {
    color: var(--color-text-disabled);
  }
</style>
