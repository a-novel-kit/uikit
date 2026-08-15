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
  import FloatingSurface from "./internal/FloatingSurface.svelte";
  import { findEnabledBoundary, findNextEnabledIndex, resolveInvalidState } from "./selection";

  import { tick } from "svelte";

  import { Check as CheckIcon, ChevronDown as ChevronDownIcon } from "@lucide/svelte";

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

  const componentId = $props.id();
  const inputId = $derived(id ?? componentId + "-input");
  const listboxId = componentId + "-listbox";

  let inputValue = $state("");
  let searchTerm = $state("");
  let open = $state(false);
  let activeIndex = $state(-1);
  let inputElement = $state<HTMLInputElement | null>(null);
  let listboxElement = $state<HTMLDivElement | null>(null);
  let anchorWidth = $state("0px");

  const selectedOption = $derived(options.find((option) => option.value === externalValue));
  const isInvalid = $derived(resolveInvalidState(invalid, ariaInvalid));
  const filteredOptions = $derived(
    searchTerm === ""
      ? options
      : options.filter((option) => option.label.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase()))
  );

  $effect(() => {
    if (!open) inputValue = selectedOption?.label ?? "";
  });

  $effect(() => {
    if (!open) return;
    if (activeIndex >= 0 && filteredOptions[activeIndex] && !filteredOptions[activeIndex]?.disabled) return;

    activeIndex = findEnabledBoundary(filteredOptions, "first");
  });

  $effect(() => {
    if (disabled && open) closeListbox();
  });

  function optionId(index: number) {
    return componentId + "-option-" + index;
  }

  function rememberAnchor() {
    if (!inputElement) return;
    anchorWidth = inputElement.getBoundingClientRect().width + "px";
  }

  function scrollActiveOption() {
    if (activeIndex < 0) return;
    const option = listboxElement?.querySelector<HTMLElement>('[data-option-index="' + activeIndex + '"]');
    option?.scrollIntoView?.({ block: "nearest" });
  }

  async function openListbox() {
    if (disabled) return;

    rememberAnchor();
    searchTerm = "";
    const selectedIndex = filteredOptions.findIndex((option) => option.value === externalValue);
    activeIndex =
      selectedIndex >= 0 && !filteredOptions[selectedIndex]?.disabled
        ? selectedIndex
        : findEnabledBoundary(filteredOptions, "first");
    open = true;
    await tick();
    scrollActiveOption();
  }

  function closeListbox(focusInput = false) {
    open = false;
    activeIndex = -1;
    searchTerm = "";
    inputValue = selectedOption?.label ?? "";
    if (focusInput) inputElement?.focus();
  }

  function ensureOpenForInput() {
    if (open || disabled) return;

    rememberAnchor();
    open = true;
  }

  function moveActive(direction: -1 | 1) {
    const boundary = direction === 1 ? "first" : "last";
    activeIndex =
      activeIndex < 0
        ? findEnabledBoundary(filteredOptions, boundary)
        : findNextEnabledIndex(filteredOptions, activeIndex, direction);
    void tick().then(scrollActiveOption);
  }

  function updateValue(nextValue: Value | undefined) {
    if (externalValue === nextValue) return;

    externalValue = nextValue;
    onValueChange?.(nextValue);
  }

  function selectOption(option: ComboboxOption<Value>) {
    if (option.disabled) return;

    updateValue(allowDeselect && externalValue === option.value ? undefined : option.value);
    closeListbox(true);
  }

  function handleInputFocus() {
    if (!open) void openListbox();
  }

  function handleInput(event: Event) {
    inputValue = (event.currentTarget as HTMLInputElement).value;
    searchTerm = inputValue;
    ensureOpenForInput();
    activeIndex = findEnabledBoundary(filteredOptions, "first");
  }

  function handleInputKeyDown(event: KeyboardEvent) {
    if (disabled) return;

    if (event.key === "Tab" && open) {
      closeListbox();
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) void openListbox();
      else moveActive(event.key === "ArrowDown" ? 1 : -1);
      return;
    }

    if (event.key === "Enter" && open && activeIndex >= 0 && filteredOptions[activeIndex]) {
      event.preventDefault();
      selectOption(filteredOptions[activeIndex]);
      return;
    }

    if (event.key === "Escape" && open) {
      event.preventDefault();
      closeListbox(true);
    }
  }

  function focusInputAndOpen() {
    if (disabled) return;

    inputElement?.focus();
    if (!open) void openListbox();
  }

  function handleTriggerPointerDown(event: PointerEvent) {
    event.preventDefault();
    if (event.button === 0) focusInputAndOpen();
  }
</script>

<div class="combobox {className}">
  <div class="input-wrap" class:invalid={isInvalid}>
    <input
      bind:this={inputElement}
      id={inputId}
      class="agora-combobox-input"
      type="text"
      role="combobox"
      value={inputValue}
      {placeholder}
      {autocomplete}
      {disabled}
      aria-autocomplete="list"
      aria-controls={listboxId}
      aria-describedby={ariaDescribedBy}
      aria-expanded={open}
      aria-haspopup="listbox"
      aria-label={ariaLabel}
      aria-activedescendant={open && activeIndex >= 0 ? optionId(activeIndex) : undefined}
      aria-invalid={isInvalid || undefined}
      aria-required={required || undefined}
      onfocus={handleInputFocus}
      oninput={handleInput}
      onkeydown={handleInputKeyDown}
    />
    <button
      class="agora-combobox-trigger"
      type="button"
      aria-label="Show options"
      data-state={open ? "open" : "closed"}
      tabindex={-1}
      {disabled}
      onpointerdown={handleTriggerPointerDown}
      onclick={focusInputAndOpen}
    >
      <ChevronDownIcon size="var(--icon-size-sm)" aria-hidden="true" />
    </button>
  </div>

  {#if name}
    <input type="hidden" {name} value={externalValue ?? ""} {disabled} />
  {/if}

  <FloatingSurface
    bind:open
    bind:element={listboxElement}
    source={inputElement}
    id={listboxId}
    class="agora-combobox-content"
    role="listbox"
    aria-labelledby={inputId}
    style="--agora-combobox-anchor-width: {anchorWidth}; {maxMenuHeight
      ? '--agora-combobox-menu-max-height: ' + maxMenuHeight
      : ''}"
    onOpenChange={(nextOpen) => {
      if (!nextOpen) closeListbox();
    }}
  >
    {#each filteredOptions as option, index (option.value)}
      <button
        id={optionId(index)}
        class="agora-combobox-item {allowDeselect ? 'deselectable' : ''}"
        type="button"
        tabindex={-1}
        role="option"
        aria-label={option.label}
        aria-selected={externalValue === option.value}
        aria-disabled={option.disabled || undefined}
        data-option-index={index}
        data-highlighted={activeIndex === index || undefined}
        data-selected={externalValue === option.value || undefined}
        data-disabled={option.disabled || undefined}
        disabled={option.disabled}
        onpointermove={() => {
          if (!option.disabled) activeIndex = index;
        }}
        onpointerdown={(event) => event.preventDefault()}
        onclick={() => selectOption(option)}
      >
        <span
          >{#if renderOption}{@render renderOption(option)}{:else}{option.label}{/if}</span
        >
        {#if externalValue === option.value}
          <CheckIcon size="var(--icon-size-sm)" aria-hidden="true" />
        {/if}
      </button>
    {:else}
      <span class="empty">No matching options</span>
    {/each}
  </FloatingSurface>
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
  .agora-combobox-input {
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
  .agora-combobox-input:hover:not(:disabled, :focus-visible, [aria-invalid="true"], :user-invalid) {
    border-color: var(--color-control-border-hover);
    background: var(--color-control-surface-hover);
  }
  .agora-combobox-input:focus-visible {
    outline: none;
    border-color: var(--color-control-border-focus);
    background: var(--color-control-surface-focus);
  }
  .agora-combobox-input[aria-invalid="true"],
  .agora-combobox-input:user-invalid {
    border-color: var(--color-feedback-error-border);
    background: var(--color-control-surface-invalid);
  }
  .agora-combobox-input[aria-invalid="true"]:focus-visible,
  .agora-combobox-input:user-invalid:focus-visible {
    border-color: var(--color-feedback-error-border);
    background: var(--color-control-surface-invalid);
  }
  .agora-combobox-input::placeholder {
    color: var(--color-control-placeholder);
  }
  .agora-combobox-input:disabled {
    cursor: not-allowed;
    border-color: var(--color-border-subtle);
    background: var(--color-control-surface-disabled);
    color: var(--color-control-disabled-text);
  }
  .agora-combobox-trigger {
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
  .input-wrap:not(:focus-within) .agora-combobox-trigger:hover:not(:disabled) {
    background: var(--color-action-ghost-hover);
    color: var(--color-text-primary);
  }
  .agora-combobox-trigger:focus-visible {
    outline: none;
    color: var(--color-text-primary);
  }
  .agora-combobox-trigger:disabled {
    cursor: not-allowed;
    color: var(--color-text-disabled);
  }

  :global(.agora-combobox-content) {
    display: grid;
    position-area: block-end span-inline-end;
    justify-self: start;
    gap: var(--space-1);
    z-index: var(--layer-dropdown);
    inset-block-start: var(--space-2);
    outline: none;
    box-shadow: var(--shadow-lg);
    border: 0;
    border-radius: var(--radius-lg);
    background: var(--color-surface-island-strong);
    padding: var(--space-1);
    inline-size: var(--agora-combobox-anchor-width);
    min-inline-size: var(--agora-combobox-anchor-width);
    max-block-size: min(
      calc(100dvb - var(--space-8)),
      var(--agora-combobox-menu-max-height, var(--control-menu-max-height))
    );
    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior-block: contain;
    color: var(--color-text-primary);
  }
  :global(.agora-combobox-item) {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    appearance: none;
    cursor: pointer;
    outline: none;
    border: 0;
    border-radius: var(--radius-md);
    background: transparent;
    padding: var(--space-1) var(--space-3);
    inline-size: 100%;
    min-block-size: calc(var(--control-height-sm) - var(--space-1));
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
    font-family: var(--font-family-interface);
    user-select: none;
    text-align: start;
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

  @media (forced-colors: active) {
    .agora-combobox-input:focus-visible,
    .agora-combobox-trigger:focus-visible {
      outline: var(--border-width-strong) solid Highlight;
      outline-offset: calc(var(--focus-ring-offset) * -1);
    }

    :global(.agora-combobox-content) {
      border: var(--border-width-thin) solid CanvasText;
    }
  }
</style>
