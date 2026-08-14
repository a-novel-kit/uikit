<script lang="ts" module>
  import type { SelectionOption } from "./types";

  import type { Snippet } from "svelte";
  import type { HTMLInputAttributes } from "svelte/elements";

  /** A value available to the searchable selection control. */
  export type ComboboxOption<Value extends string> = SelectionOption<Value>;

  /** Props for a searchable single-value selection control. */
  export interface ComboboxProps<Value extends string> {
    /** Values available for search and selection. */
    options: readonly ComboboxOption<Value>[];
    /** Currently selected value. */
    value?: Value | undefined;
    /** Name used for form submission. */
    name?: string;
    /** Text shown when the search input is empty. */
    placeholder?: string;
    /** Requires a value during form validation. */
    required?: boolean;
    /** Prevents searching or changing the value. */
    disabled?: boolean;
    /** Applies the invalid surface and focus treatment. */
    invalid?: boolean;
    /** Lets an optional combobox return to its unset state. */
    allowDeselect?: boolean;
    /** Maximum height of the options menu before it scrolls. Defaults to the menu-height token. */
    maxMenuHeight?: string;
    /** Identifies the input and connects it to a label. */
    id?: string;
    /** Browser autofill hint for the search input. */
    autocomplete?: HTMLInputAttributes["autocomplete"];
    /** Identifies elements that describe the input. */
    "aria-describedby"?: string;
    /** Sets an accessible name when no visible label targets the input. */
    "aria-label"?: string;
    /** Reports validation state to assistive technology. */
    "aria-invalid"?: HTMLInputAttributes["aria-invalid"];
    /** Adds classes to the component root. */
    class?: string;
    /** Runs after the selected value changes. */
    onValueChange?: (value: Value | undefined) => void;
    /** Replaces visible option copy while label remains available to filtering and accessibility. */
    renderOption?: Snippet<[ComboboxOption<Value>]>;
  }
</script>

<script lang="ts" generics="Value extends string">
  import { normalizeSelectionValue, resolveInvalidState, toSelectionItems } from "./selection";

  import { CheckIcon, ChevronDownIcon } from "@a-novel-kit/uikit-icons";

  import { Combobox as ComboboxPrimitive } from "bits-ui";

  let {
    options,
    value: externalValue = $bindable(),
    name,
    placeholder = "Search options",
    required = false,
    disabled = false,
    invalid = false,
    allowDeselect = false,
    maxMenuHeight,
    id,
    autocomplete = "off",
    "aria-describedby": ariaDescribedBy,
    "aria-label": ariaLabel,
    "aria-invalid": ariaInvalid,
    class: className = "",
    onValueChange,
    renderOption,
  }: ComboboxProps<Value> = $props();

  let searchValue = $state("");
  let open = $state(false);
  let inputElement = $state<HTMLInputElement | null>(null);
  let primitiveValue = $derived(externalValue ?? "");

  const items = $derived(toSelectionItems(options));
  const isInvalid = $derived(resolveInvalidState(invalid, ariaInvalid));
  const filteredOptions = $derived(
    searchValue === ""
      ? options
      : options.filter((option) => option.label.toLocaleLowerCase().includes(searchValue.toLocaleLowerCase()))
  );

  function handleValueChange(nextValue: string) {
    const normalizedValue = normalizeSelectionValue<Value>(nextValue);
    externalValue = normalizedValue;
    onValueChange?.(normalizedValue);
  }

  function handleInputFocus() {
    if (!disabled) open = true;
  }

  function focusInputAndOpen() {
    if (disabled) return;
    inputElement?.focus();
    open = true;
  }

  function handleTriggerPointerDown(event: PointerEvent) {
    event.preventDefault();
    if (event.button === 0) focusInputAndOpen();
  }

  function handleTriggerKeyDown(event: KeyboardEvent) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    focusInputAndOpen();
  }
</script>

<div class="combobox {className}">
  <ComboboxPrimitive.Root
    type="single"
    {items}
    bind:open
    bind:value={primitiveValue}
    {name}
    {required}
    {disabled}
    {allowDeselect}
    loop
    onValueChange={handleValueChange}
    onOpenChangeComplete={(open) => {
      if (!open) searchValue = "";
    }}
  >
    <div class="input-wrap" class:invalid={isInvalid}>
      <ComboboxPrimitive.Input
        bind:ref={inputElement}
        class="agora-combobox-input"
        {id}
        {placeholder}
        aria-describedby={ariaDescribedBy}
        aria-label={ariaLabel}
        aria-invalid={isInvalid || undefined}
        {autocomplete}
        onfocus={handleInputFocus}
        oninput={(event) => (searchValue = event.currentTarget.value)}
      />
      <ComboboxPrimitive.Trigger
        class="agora-combobox-trigger"
        aria-label="Show options"
        tabindex={-1}
        onpointerdown={handleTriggerPointerDown}
        onkeydown={handleTriggerKeyDown}
        onclick={focusInputAndOpen}
      >
        <ChevronDownIcon size="var(--icon-size-sm)" aria-hidden="true" />
      </ComboboxPrimitive.Trigger>
    </div>
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Content
        class="agora-combobox-content"
        sideOffset={8}
        style={maxMenuHeight ? `--agora-combobox-menu-max-height: ${maxMenuHeight}` : undefined}
      >
        <ComboboxPrimitive.Viewport class="agora-combobox-viewport">
          {#each filteredOptions as option (option.value)}
            <ComboboxPrimitive.Item
              class="agora-combobox-item {allowDeselect ? 'deselectable' : ''}"
              value={option.value}
              label={option.label}
              disabled={option.disabled}
            >
              {#snippet children({ selected })}
                <span
                  >{#if renderOption}{@render renderOption(option)}{:else}{option.label}{/if}</span
                >
                {#if selected}<CheckIcon size="var(--icon-size-sm)" aria-hidden="true" />{/if}
              {/snippet}
            </ComboboxPrimitive.Item>
          {:else}
            <span class="empty">No matching options</span>
          {/each}
        </ComboboxPrimitive.Viewport>
      </ComboboxPrimitive.Content>
    </ComboboxPrimitive.Portal>
  </ComboboxPrimitive.Root>
</div>

<style>
  .combobox,
  .input-wrap {
    min-inline-size: 0;
  }
  .input-wrap {
    position: relative;
    border-radius: var(--radius-md);
  }
  .input-wrap:focus-within {
    box-shadow: var(--shadow-focus-ring);
  }
  .input-wrap.invalid:focus-within {
    box-shadow: var(--shadow-invalid-focus-ring);
  }
  :global(.agora-combobox-input) {
    appearance: none;
    transition:
      background-color var(--duration-fast) var(--easing-standard),
      border-color var(--duration-fast) var(--easing-standard),
      box-shadow var(--duration-fast) var(--easing-standard);
    box-sizing: border-box;
    border: var(--border-width-thin) solid var(--color-control-border);
    border-radius: var(--radius-md);
    background: var(--color-control-surface);
    padding: var(--space-2) var(--control-height-md) var(--space-2) var(--space-3);
    inline-size: 100%;
    min-block-size: var(--control-height-md);
    color: var(--color-control-text);
    font: inherit;
    font-size: var(--font-size-md);
    font-family: var(--font-family-interface);
  }
  :global(.agora-combobox-input:hover:not(:disabled, :focus-visible, [aria-invalid="true"], :user-invalid)) {
    border-color: var(--color-control-border-hover);
    background: var(--color-control-surface-hover);
  }
  :global(.agora-combobox-input:focus-visible) {
    outline: none;
    border-color: var(--color-control-border-focus);
    background: var(--color-control-surface-focus);
  }
  :global(.agora-combobox-input[aria-invalid="true"]),
  :global(.agora-combobox-input:user-invalid) {
    border-color: var(--color-feedback-error-border);
    background: var(--color-control-surface-invalid);
  }
  :global(.agora-combobox-input[aria-invalid="true"]:focus-visible),
  :global(.agora-combobox-input:user-invalid:focus-visible) {
    border-color: var(--color-feedback-error-border);
    background: var(--color-control-surface-invalid);
  }
  :global(.agora-combobox-input::placeholder) {
    color: var(--color-control-placeholder);
  }
  :global(.agora-combobox-input:disabled) {
    cursor: not-allowed;
    border-color: var(--color-border-subtle);
    background: var(--color-control-surface-disabled);
    color: var(--color-control-disabled-text);
  }
  :global(.agora-combobox-trigger) {
    display: grid;
    position: absolute;
    place-items: center;
    cursor: pointer;
    inset-block: 0;
    inset-inline-end: 0;
    border: 0;
    border-radius: 0 var(--radius-md) var(--radius-md) 0;
    border-inline-start: var(--border-width-thin) solid var(--color-border-subtle);
    background: transparent;
    inline-size: var(--control-height-md);
    color: var(--color-text-muted);
  }
  .input-wrap:not(:focus-within) :global(.agora-combobox-trigger:hover:not([data-disabled])) {
    background: var(--color-action-ghost-hover);
    color: var(--color-text-primary);
  }
  :global(.agora-combobox-trigger:focus-visible) {
    outline: none;
    color: var(--color-text-primary);
  }

  @media (forced-colors: active) {
    :global(.agora-combobox-input:focus-visible),
    :global(.agora-combobox-trigger:focus-visible) {
      outline: var(--border-width-strong) solid Highlight;
      outline-offset: calc(var(--focus-ring-offset) * -1);
    }

    :global(.agora-combobox-content) {
      border: var(--border-width-thin) solid CanvasText;
    }
  }
  :global(.agora-combobox-trigger[data-disabled]) {
    cursor: not-allowed;
    color: var(--color-text-disabled);
  }
  :global(.agora-combobox-content) {
    z-index: var(--layer-dropdown);
    outline: none;
    box-shadow: var(--shadow-lg);
    border: 0;
    border-radius: var(--radius-lg);
    background: var(--color-surface-island-strong);
    inline-size: var(--bits-combobox-anchor-width);
    min-inline-size: var(--bits-combobox-anchor-width);
    max-block-size: min(
      var(--bits-combobox-content-available-height),
      var(--agora-combobox-menu-max-height, var(--control-menu-max-height))
    );
    overflow: hidden;
    color: var(--color-text-primary);
  }
  :global(.agora-combobox-viewport) {
    display: grid;
    gap: var(--space-1);
    padding: var(--space-1);
    max-block-size: min(
      var(--bits-combobox-content-available-height),
      var(--agora-combobox-menu-max-height, var(--control-menu-max-height))
    );
    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior-block: contain;
  }
  :global(.agora-combobox-item) {
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
  :global(.agora-combobox-item > :last-child:not(:first-child)) {
    margin-inline-start: auto;
    color: var(--color-text-accent);
  }
  :global(.agora-combobox-item[data-highlighted]:not([data-selected]):not([data-disabled])) {
    background: var(--color-surface-glass-hover);
    color: var(--color-navigation-hover-text);
  }
  :global(.agora-combobox-item[data-selected]) {
    cursor: default;
    background: var(--color-navigation-selected-surface);
    color: var(--color-navigation-selected-text);
  }
  :global(.agora-combobox-item[data-selected][data-highlighted]) {
    background: var(--color-navigation-selected-surface);
  }
  :global(.agora-combobox-item[data-selected].deselectable:not([data-disabled])) {
    cursor: pointer;
  }
  :global(.agora-combobox-item[data-disabled]) {
    cursor: not-allowed;
    color: var(--color-text-disabled);
  }
  .empty {
    display: block;
    padding: var(--space-3);
    color: var(--color-text-muted);
    font-size: var(--font-size-sm);
    font-family: var(--font-family-interface);
  }

  @supports (backdrop-filter: blur(0)) or (-webkit-backdrop-filter: blur(0)) {
    :global(.agora-combobox-content) {
      -webkit-backdrop-filter: blur(var(--blur-md));
      backdrop-filter: blur(var(--blur-md));
      background: var(--color-surface-glass);
    }

    :global(.agora-combobox-item[data-highlighted]:not([data-selected]):not([data-disabled])) {
      -webkit-backdrop-filter: blur(var(--blur-sm));
      backdrop-filter: blur(var(--blur-sm));
    }
  }
</style>
