<!--
@component
Renders an immediate on/off control driven by `createCheckedController` or a compatible controller.
Provide a visible label or an accessible name.
-->
<script lang="ts" module>
  import type { Content } from "./content";
  import type { CheckedController } from "./controllers.svelte";

  import type { HTMLInputAttributes } from "svelte/elements";

  /** External state contract for a switch. */
  export type SwitchController = CheckedController;

  /** Props for a native checkbox presented as an immediate on/off switch. */
  export interface SwitchProps extends Omit<
    HTMLInputAttributes,
    "type" | "role" | "checked" | "defaultChecked" | "onchange"
  > {
    /** Label content beside the switch. */
    label?: Content;
    /** Supporting content shown below the label. */
    description?: Content;
    /** State owner that decides whether toggle requests take effect. */
    controller: SwitchController;
  }
</script>

<script lang="ts">
  import ChoiceLabel from "./internal/ChoiceLabel.svelte";

  let { label, description, controller, class: className = "", ...rest }: SwitchProps = $props();

  function handleChange(event: Event) {
    const target = event.currentTarget as HTMLInputElement;
    controller.setChecked(target.checked);
    target.checked = controller.state.checked;
  }
</script>

<label class="switch {className}">
  <ChoiceLabel {label} {description} />
  <input
    checked={controller.state.checked}
    defaultChecked={controller.state.checked}
    type="checkbox"
    role="switch"
    onchange={handleChange}
    {...rest}
  />
</label>

<style>
  .switch {
    display: inline-flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-4);
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
    box-sizing: border-box;
    margin: 0;
    border: var(--border-width-thin) solid var(--color-control-border);
    border-radius: var(--radius-xl);
    background: var(--color-action-neutral);
    inline-size: var(--size-10);
    block-size: var(--size-6);
  }

  input::before {
    transform: translateX(calc(var(--size-2) * -1));
    transition:
      background-color var(--motion-state),
      transform var(--motion-state);
    border-radius: var(--radius-round);
    background: var(--color-text-secondary);
    inline-size: var(--size-4);
    block-size: var(--size-4);
    content: "";
  }

  @media (hover: hover) {
    input:hover:not(:disabled, :focus-visible, :checked) {
      border-color: var(--color-control-border-hover);
      background: var(--color-action-neutral-hover);
    }
  }

  input:checked {
    border-color: var(--color-control-on);
    background: var(--color-control-on);
  }

  input:checked::before {
    transform: translateX(var(--size-2));
    background: var(--color-control-on-mark);
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

  .switch:has(input:disabled) {
    cursor: not-allowed;
  }
  input:disabled {
    border-color: transparent;
    background: var(--color-action-disabled-surface);
  }
</style>
