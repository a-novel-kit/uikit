<script lang="ts" module>
  import type { ComponentSize, SelectionOption } from "./types";

  import type { Snippet } from "svelte";
  import type { HTMLInputAttributes } from "svelte/elements";

  /** A selectable value and its visible label. */
  export type SelectOption<Value extends string> = SelectionOption<Value>;

  /** Props for a single-value select with a themed listbox. */
  export interface SelectProps<Value extends string> {
    /** Options shown in the menu. */
    options: readonly SelectOption<Value>[];
    /** Selected option value. */
    value?: Value | undefined;
    /** Text shown before a value is selected. */
    placeholder?: string;
    /** Name used for form submission. */
    name?: string;
    /** Browser autofill hint forwarded to the hidden form input. */
    autocomplete?: HTMLInputAttributes["autocomplete"];
    /** Sets the control height and type scale. */
    controlSize?: ComponentSize;
    /** Applies the invalid surface and focus treatment. */
    invalid?: boolean;
    /** Requires a value during form validation. */
    required?: boolean;
    /** Prevents opening or changing the select. */
    disabled?: boolean;
    /** Lets an optional select return to its unset state. */
    allowDeselect?: boolean;
    /** Identifies the trigger and connects it to a label. */
    id?: string;
    /** Identifies elements that describe the trigger. */
    "aria-describedby"?: string;
    /** Sets an accessible name when no visible label targets the trigger. */
    "aria-label"?: string;
    /** Reports validation state to assistive technology. */
    "aria-invalid"?: HTMLInputAttributes["aria-invalid"];
    /** Includes the trigger in sequential keyboard navigation. */
    tabindex?: number;
    /** Runs after the selected value changes. */
    onValueChange?: (value: Value | undefined) => void;
    /** Renders an option without changing its accessible text label. */
    renderOption?: Snippet<[SelectOption<Value>]>;
    /** Adds classes to the trigger. */
    class?: string;
  }
</script>

<script lang="ts" generics="Value extends string">
  import { normalizeSelectionValue, resolveInvalidState, toSelectionItems } from "./selection";

  import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "@a-novel-kit/uikit-icons";

  import { Select as SelectPrimitive } from "bits-ui";

  let {
    options,
    value: externalValue = $bindable(),
    placeholder = "Select an option",
    name,
    autocomplete,
    controlSize = "md",
    invalid = false,
    required = false,
    disabled = false,
    allowDeselect = false,
    id,
    "aria-describedby": ariaDescribedBy,
    "aria-label": ariaLabel,
    "aria-invalid": ariaInvalid,
    tabindex,
    class: className = "",
    onValueChange,
    renderOption,
  }: SelectProps<Value> = $props();

  let primitiveValue = $derived(externalValue ?? "");

  const items = $derived(toSelectionItems(options));
  const isInvalid = $derived(resolveInvalidState(invalid, ariaInvalid));

  function handleValueChange(nextValue: string) {
    const normalizedValue = normalizeSelectionValue<Value>(nextValue);
    externalValue = normalizedValue;
    onValueChange?.(normalizedValue);
  }
</script>

<SelectPrimitive.Root
  type="single"
  {items}
  bind:value={primitiveValue}
  {name}
  {autocomplete}
  {required}
  {disabled}
  loop
  {allowDeselect}
  onValueChange={handleValueChange}
>
  <SelectPrimitive.Trigger
    class="agora-select-trigger {controlSize} {isInvalid ? 'invalid' : ''} {allowDeselect
      ? 'deselectable'
      : ''} {className}"
    {id}
    aria-describedby={ariaDescribedBy}
    aria-label={ariaLabel}
    aria-invalid={isInvalid || undefined}
    {tabindex}
  >
    <SelectPrimitive.Value {placeholder}>
      {#snippet children({ selection })}
        {#if selection.type === "single" && selection.selected}
          {@const selectedOption = options.find((candidate) => candidate.value === selection.selected?.value)}
          {#if renderOption && selectedOption}
            {@render renderOption(selectedOption)}
          {:else}
            {selection.selected.label}
          {/if}
        {:else}
          {placeholder}
        {/if}
      {/snippet}
    </SelectPrimitive.Value>
    <ChevronDownIcon class="agora-select-indicator" size="var(--icon-size-sm)" aria-hidden="true" />
  </SelectPrimitive.Trigger>
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content class="agora-select-content" sideOffset={8}>
      <SelectPrimitive.ScrollUpButton class="agora-select-scroll-button">
        <ChevronUpIcon size="var(--icon-size-sm)" aria-hidden="true" />
      </SelectPrimitive.ScrollUpButton>
      <SelectPrimitive.Viewport class="agora-select-viewport">
        {#each options as option (option.value)}
          <SelectPrimitive.Item
            class="agora-select-item {allowDeselect ? 'deselectable' : ''}"
            aria-disabled={option.disabled || undefined}
            value={option.value}
            label={option.label}
            disabled={option.disabled}
          >
            {#snippet children({ selected })}
              <span>
                {#if renderOption}{@render renderOption(option)}{:else}{option.label}{/if}
              </span>
              {#if selected}<CheckIcon size="var(--icon-size-sm)" aria-hidden="true" />{/if}
            {/snippet}
          </SelectPrimitive.Item>
        {/each}
      </SelectPrimitive.Viewport>
      <SelectPrimitive.ScrollDownButton class="agora-select-scroll-button">
        <ChevronDownIcon size="var(--icon-size-sm)" aria-hidden="true" />
      </SelectPrimitive.ScrollDownButton>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
</SelectPrimitive.Root>

<style>
  :global(.agora-select-trigger) {
    display: inline-flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-3);
    appearance: none;
    transition:
      background-color var(--duration-fast) var(--easing-standard),
      border-color var(--duration-fast) var(--easing-standard),
      box-shadow var(--duration-fast) var(--easing-standard);
    cursor: pointer;
    box-sizing: border-box;
    border: var(--border-width-thin) solid var(--color-control-border);
    border-radius: var(--radius-md);
    background: var(--color-control-surface);
    inline-size: 100%;
    min-inline-size: 0;
    color: var(--color-control-text);
    font: inherit;
    line-height: var(--line-height-compact);
    font-family: var(--font-family-interface);
    text-align: start;
  }

  :global(.agora-select-trigger:hover:not(:disabled, :focus-visible, [aria-invalid="true"])) {
    border-color: var(--color-control-border-hover);
    background: var(--color-control-surface-hover);
  }

  :global(.agora-select-trigger:focus-visible) {
    outline: none;
    box-shadow: var(--shadow-focus-ring);
    border-color: var(--color-control-border-focus);
    background: var(--color-control-surface-focus);
  }

  :global(.agora-select-trigger[data-placeholder] [data-select-value]) {
    color: var(--color-text-muted);
  }

  :global(.agora-select-indicator) {
    flex: none;
    transition: transform var(--duration-fast) var(--easing-standard);
    color: var(--color-text-muted);
  }

  :global(.agora-select-trigger[data-state="open"] .agora-select-indicator) {
    transform: rotate(180deg);
  }

  @media (forced-colors: active) {
    :global(.agora-select-trigger:focus-visible) {
      outline: var(--border-width-strong) solid Highlight;
      outline-offset: var(--focus-ring-offset);
    }

    :global(.agora-select-content) {
      border: var(--border-width-thin) solid CanvasText;
    }
  }

  :global(.agora-select-trigger:disabled) {
    cursor: not-allowed;
    border-color: var(--color-border-subtle);
    background: var(--color-control-surface-disabled);
    color: var(--color-control-disabled-text);
  }

  :global(.agora-select-trigger:disabled .agora-select-indicator) {
    color: var(--color-control-disabled-text);
  }

  :global(.agora-select-trigger.invalid),
  :global(.agora-select-trigger[aria-invalid="true"]) {
    border-color: var(--color-feedback-error-border);
    background: var(--color-control-surface-invalid);
  }

  :global(.agora-select-trigger.invalid:focus-visible),
  :global(.agora-select-trigger[aria-invalid="true"]:focus-visible) {
    box-shadow: var(--shadow-invalid-focus-ring);
    border-color: var(--color-feedback-error-border);
    background: var(--color-control-surface-invalid);
  }

  :global(.agora-select-trigger.sm) {
    padding-inline: var(--space-3);
    min-block-size: var(--control-height-sm);
    font-size: var(--font-size-sm);
  }
  :global(.agora-select-trigger.md) {
    padding-inline: var(--space-3);
    min-block-size: var(--control-height-md);
    font-size: var(--font-size-md);
  }
  :global(.agora-select-trigger.lg) {
    padding-inline: var(--space-4);
    min-block-size: var(--control-height-lg);
    font-size: var(--font-size-lg);
  }

  :global(.agora-select-content) {
    z-index: var(--layer-dropdown);
    outline: none;
    box-shadow: var(--shadow-lg);
    border: 0;
    border-radius: var(--radius-lg);
    background: var(--color-surface-island-strong);
    inline-size: var(--bits-select-anchor-width);
    min-inline-size: var(--bits-select-anchor-width);
    max-block-size: min(var(--bits-select-content-available-height), var(--control-menu-max-height));
    overflow: hidden;
    color: var(--color-text-primary);
  }

  :global(.agora-select-viewport) {
    display: grid;
    gap: var(--space-1);
    padding: var(--space-1);
    overflow: auto;
  }

  :global(.agora-select-item) {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    cursor: pointer;
    outline: none;
    border-radius: var(--radius-md);
    padding: var(--space-1) var(--space-3);
    min-block-size: calc(var(--control-height-sm) - var(--space-1));
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
    font-family: var(--font-family-interface);
    user-select: none;
  }

  :global(.agora-select-item > :last-child:not(:first-child)) {
    margin-inline-start: auto;
    color: var(--color-text-accent);
  }

  :global(.agora-select-item[data-highlighted]:not([data-selected]):not([data-disabled])) {
    background: var(--color-surface-glass-hover);
    color: var(--color-navigation-hover-text);
  }

  :global(.agora-select-item[data-selected]) {
    cursor: default;
    background: var(--color-navigation-selected-surface);
    color: var(--color-navigation-selected-text);
  }

  :global(.agora-select-item[data-selected].deselectable) {
    cursor: pointer;
  }

  :global(.agora-select-item[data-disabled]) {
    cursor: not-allowed;
    color: var(--color-text-disabled);
  }

  :global(.agora-select-scroll-button) {
    display: grid;
    flex: none;
    place-items: center;
    block-size: var(--control-height-sm);
    color: var(--color-text-muted);
  }

  @supports (backdrop-filter: blur(0)) or (-webkit-backdrop-filter: blur(0)) {
    :global(.agora-select-content) {
      -webkit-backdrop-filter: blur(var(--blur-md));
      backdrop-filter: blur(var(--blur-md));
      background: var(--color-surface-glass);
    }

    :global(.agora-select-item[data-highlighted]:not([data-selected]):not([data-disabled])) {
      -webkit-backdrop-filter: blur(var(--blur-sm));
      backdrop-filter: blur(var(--blur-sm));
    }
  }
</style>
