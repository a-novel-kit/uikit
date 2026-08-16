<script lang="ts" module>
  import type { Content } from "./content";

  import type { HTMLInputAttributes } from "svelte/elements";

  /** Props for a native checkbox presented as an immediate on/off switch. */
  export interface SwitchProps extends Omit<HTMLInputAttributes, "type" | "role" | "checked"> {
    /** Optional switch label. */
    label?: Content;
    /** Supporting content shown below the label. */
    description?: Content;
    /** Current on/off state. */
    checked?: boolean;
  }
</script>

<script lang="ts">
  import RenderContent from "./Content.svelte";

  let { label, description, checked = $bindable(false), class: className = "", ...rest }: SwitchProps = $props();
</script>

<label class="switch {className}">
  {#if label || description}
    <span class="copy">
      {#if label}<span class="label"><RenderContent content={label} /></span>{/if}
      {#if description}<span class="description"><RenderContent content={description} /></span>{/if}
    </span>
  {/if}
  <input bind:checked type="checkbox" role="switch" {...rest} />
</label>

<style>
  .switch {
    display: inline-flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-4);
    cursor: pointer;
    color: var(--color-text-primary);
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
    box-sizing: border-box;
    margin: 0;
    border: var(--border-width-thin) solid var(--color-control-border);
    border-radius: var(--radius-xl);
    background: var(--color-action-neutral);
    inline-size: var(--space-10);
    block-size: var(--space-6);
  }

  input::before {
    transform: translateX(calc(var(--space-2) * -1));
    transition:
      background-color var(--duration-fast) var(--easing-standard),
      transform var(--duration-fast) var(--easing-standard);
    border-radius: var(--radius-round);
    background: var(--color-text-secondary);
    inline-size: var(--space-4);
    block-size: var(--space-4);
    content: "";
  }

  input:hover:not(:disabled, :focus-visible, :checked) {
    border-color: var(--color-control-border-hover);
    background: var(--color-action-neutral-hover);
  }

  input:checked {
    box-shadow: var(--shadow-glow-brand);
    border-color: var(--color-action-primary-selected);
    background: var(--color-action-primary);
  }

  input:checked::before {
    transform: translateX(var(--space-2));
    background: var(--color-action-primary-text);
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

  .switch:has(input:disabled) {
    cursor: not-allowed;
    color: var(--color-text-disabled);
  }
  input:disabled {
    box-shadow: none;
    border-color: var(--color-border-subtle);
    background: var(--color-action-disabled-surface);
  }
</style>
