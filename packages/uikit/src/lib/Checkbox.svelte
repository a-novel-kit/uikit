<!--
@component
Renders a native checkbox driven by `createCheckedController` or a compatible controller.
Provide `label` or an accessible name; native input attributes are forwarded to the checkbox.
-->
<script lang="ts" module>
  import type { Content } from "./content";
  import type { CheckedController } from "./controllers.svelte";

  import type { HTMLInputAttributes } from "svelte/elements";

  /** External state contract for a checkbox. */
  export type CheckboxController = CheckedController;

  /** Props for a native checkbox with optional supporting content. */
  export interface CheckboxProps extends Omit<HTMLInputAttributes, "type" | "checked" | "defaultChecked" | "onchange"> {
    /** Label content beside the checkbox. */
    label?: Content;
    /** Supporting content shown below the label. */
    description?: Content;
    /** State owner that decides whether selection requests take effect. */
    controller: CheckboxController;
    /** Displays a mixed state without changing the submitted value. */
    indeterminate?: boolean;
  }
</script>

<script lang="ts">
  import ChoiceLabel from "./internal/ChoiceLabel.svelte";

  let {
    label,
    description,
    controller,
    indeterminate = false,
    class: className = "",
    ...rest
  }: CheckboxProps = $props();

  let input: HTMLInputElement;

  $effect(() => {
    if (input) input.indeterminate = indeterminate;
  });

  function handleChange(event: Event) {
    const target = event.currentTarget as HTMLInputElement;
    controller.setChecked(target.checked);
    target.checked = controller.state.checked;
  }
</script>

<label class="choice {className}">
  <input
    bind:this={input}
    checked={controller.state.checked}
    defaultChecked={controller.state.checked}
    type="checkbox"
    onchange={handleChange}
    {...rest}
  />
  <ChoiceLabel {label} {description} />
</label>

<style>
  .choice {
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
    border-radius: var(--radius-sm);
    background: var(--color-control-surface);
    padding: 0;
    inline-size: var(--icon-size-md);
    block-size: var(--icon-size-md);
    color: var(--color-control-on-mark);
  }

  input::before {
    transform: rotate(45deg) scale(0);
    transition: transform var(--motion-mark);
    box-sizing: border-box;
    border: solid currentColor;
    border-width: 0 var(--border-width-strong) var(--border-width-strong) 0;
    inline-size: var(--size-1-5);
    block-size: var(--size-2);
    content: "";
  }

  @media (hover: hover) {
    input:hover:not(:disabled):not(:checked):not(:indeterminate):not(:focus-visible) {
      border-color: var(--color-control-border-hover);
      background: var(--color-control-surface-hover);
    }
  }

  input:checked,
  input:indeterminate {
    box-shadow: var(--shadow-action-selected);
    border-color: var(--color-control-on);
    background: var(--color-control-on);
  }

  input:checked::before {
    transform: rotate(45deg) scale(1);
  }

  input:indeterminate::before {
    transform: scale(1);
    border: 0;
    background: currentColor;
    inline-size: var(--size-2);
    block-size: var(--border-width-strong);
  }

  input:focus-visible {
    outline: none;
    box-shadow: var(--shadow-focus-ring);
    border-color: var(--color-control-border-focus);
    background: var(--color-control-surface-focus);
  }

  input:focus-visible:is(:checked, :indeterminate) {
    background: var(--color-control-on);
  }

  @media (forced-colors: active) {
    input:focus-visible {
      outline: var(--border-width-strong) solid Highlight;
      outline-offset: var(--focus-ring-offset);
    }
  }

  input:disabled {
    box-shadow: none;
    border-color: transparent;
    background: var(--color-action-disabled-surface);
    color: var(--color-action-disabled-text);
  }

  .choice:has(input:disabled) {
    cursor: not-allowed;
  }
</style>
