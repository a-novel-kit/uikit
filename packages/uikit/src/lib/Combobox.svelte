<!--
@component
Filters labeled options and renders a single selection from an external combobox controller.
The hidden named input submits the selected value. The caller validates required selection.
-->
<script lang="ts" module>
  import type { ComboboxController as SelectionController } from "./controllers.svelte";
  import type { SelectionOption } from "./types";

  import type { Snippet } from "svelte";
  import type { HTMLInputAttributes } from "svelte/elements";

  /** A value available to the searchable selection control. */
  export type ComboboxOption<Value extends string> = SelectionOption<Value>;

  /** External state contract for a combobox. */
  export type ComboboxController<Value extends string> = SelectionController<Value>;

  /** Props for a searchable single-value selection control. */
  export interface ComboboxProps<Value extends string> {
    /** Values available for search and selection. */
    options: readonly ComboboxOption<Value>[];
    /** State owner that decides whether visibility, query, or selection requests take effect. */
    controller: ComboboxController<Value>;
    /** Creates a hidden input with this form name; an unset value submits an empty string. */
    name?: string;
    /** Empty search input text; defaults to the translated "Search options". */
    placeholder?: string;
    /** Sets aria-required; the caller validates selection before submitting. Defaults to false. */
    required?: boolean;
    /** Prevents searching or changing the value. */
    disabled?: boolean;
    /** Applies the invalid surface and focus treatment. */
    invalid?: boolean;
    /** Selecting the current option clears its value when true; defaults to false. */
    allowDeselect?: boolean;
    /** Maximum height of the options menu before it scrolls. Defaults to the menu-height token. */
    maxMenuHeight?: string;
    /** Identifies the input and connects it to a label. */
    id?: string;
    /** Browser autofill hint for the search input; defaults to "off". */
    autocomplete?: HTMLInputAttributes["autocomplete"];
    /** Identifies elements that describe the input. */
    "aria-describedby"?: string;
    /** Sets an accessible name when no visible label targets the input. */
    "aria-label"?: string;
    /** Reports validation state to assistive technology. */
    "aria-invalid"?: HTMLInputAttributes["aria-invalid"];
    /** Adds classes to the component root. */
    class?: string;
    /** Replaces visible option copy while label remains available to filtering and accessibility. */
    renderOption?: Snippet<[ComboboxOption<Value>]>;
  }
</script>

<script lang="ts" generics="Value extends string">
  import FloatingSurface from "./internal/FloatingSurface.svelte";
  import { useMessages } from "./internal/i18n";
  import { findEnabledBoundary, findNextEnabledIndex, resolveInvalidState } from "./selection";

  import { tick } from "svelte";

  import { Check as CheckIcon, ChevronDown as ChevronDownIcon } from "@lucide/svelte";

  const { t } = useMessages();

  let {
    options,
    controller,
    name,
    placeholder = t("combobox.placeholder"),
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
    renderOption,
  }: ComboboxProps<Value> = $props();

  const componentId = $props.id();
  const inputId = $derived(id ?? componentId + "-input");
  const listboxId = componentId + "-listbox";

  let activeIndex = $state(-1);
  let inputElement = $state<HTMLInputElement | null>(null);
  let listboxElement = $state<HTMLDivElement | null>(null);
  let anchorWidth = $state("0px");

  const selectedOption = $derived(options.find((option) => option.value === controller.state.value));
  const inputValue = $derived(controller.state.open ? controller.state.query : (selectedOption?.label ?? ""));
  const isInvalid = $derived(resolveInvalidState(invalid, ariaInvalid));
  const filteredOptions = $derived.by(() => {
    const query = controller.state.query.toLocaleLowerCase();
    return query === "" ? options : options.filter((option) => option.label.toLocaleLowerCase().includes(query));
  });

  // Runs before the DOM update, so the surface renders at the anchor's width in the flush that opens it.
  $effect.pre(() => {
    if (controller.state.open && inputElement) anchorWidth = inputElement.getBoundingClientRect().width + "px";
  });

  $effect(() => {
    if (!controller.state.open) return;
    const active = filteredOptions[activeIndex];
    if (!active || active.disabled) activeIndex = findEnabledBoundary(filteredOptions, "first");
  });

  $effect(() => {
    if (disabled && controller.state.open) closeListbox();
  });

  function optionId(index: number) {
    return componentId + "-option-" + index;
  }

  function scrollActiveOption() {
    if (activeIndex < 0) return;
    const option = listboxElement?.querySelector<HTMLElement>('[data-option-index="' + activeIndex + '"]');
    option?.scrollIntoView?.({ block: "nearest" });
  }

  function setActiveIndex(index: number) {
    activeIndex = index;
    void tick().then(scrollActiveOption);
  }

  /** Opens on the selected option when it is visible and enabled, otherwise on the first enabled option. */
  function openListbox() {
    if (disabled) return;

    const selectedIndex = filteredOptions.findIndex((option) => option.value === controller.state.value);
    const startOnSelection = selectedIndex >= 0 && !filteredOptions[selectedIndex].disabled;
    setActiveIndex(startOnSelection ? selectedIndex : findEnabledBoundary(filteredOptions, "first"));
    controller.open();
  }

  function closeListbox(focusInput = false) {
    controller.close();
    if (controller.state.open) return;
    activeIndex = -1;
    if (focusInput) inputElement?.focus();
  }

  function ensureOpenForInput() {
    if (controller.state.open || disabled) return;

    controller.open();
  }

  function moveActive(direction: -1 | 1) {
    if (activeIndex >= 0) setActiveIndex(findNextEnabledIndex(filteredOptions, activeIndex, direction));
    else setActiveIndex(findEnabledBoundary(filteredOptions, direction === 1 ? "first" : "last"));
  }

  function selectOption(option: ComboboxOption<Value>) {
    if (option.disabled) return;

    controller.select(allowDeselect && controller.state.value === option.value ? undefined : option.value);
    closeListbox(true);
  }

  function handleInputFocus() {
    if (!controller.state.open) openListbox();
  }

  function handleInput(event: Event) {
    const target = event.currentTarget as HTMLInputElement;
    ensureOpenForInput();
    controller.setQuery(target.value);
    target.value = inputValue;
    activeIndex = findEnabledBoundary(filteredOptions, "first");
  }

  function handleInputKeyDown(event: KeyboardEvent) {
    if (disabled) return;

    if (event.key === "Tab" && controller.state.open) {
      closeListbox();
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!controller.state.open) openListbox();
      else moveActive(event.key === "ArrowDown" ? 1 : -1);
      return;
    }

    if (event.key === "Enter" && controller.state.open && activeIndex >= 0 && filteredOptions[activeIndex]) {
      event.preventDefault();
      selectOption(filteredOptions[activeIndex]);
      return;
    }

    if (event.key === "Escape" && controller.state.open) {
      event.preventDefault();
      closeListbox(true);
    }
  }

  function focusInputAndOpen() {
    if (disabled) return;

    inputElement?.focus();
    if (!controller.state.open) openListbox();
  }

  function handleTriggerPointerDown(event: PointerEvent) {
    if (event.button === 0) event.preventDefault();
  }

  function handleSurfaceOpenChange(nextOpen: boolean) {
    if (nextOpen) controller.open();
    else closeListbox();
  }
</script>

<div class="combobox {className}">
  <div class="input-wrap" class:invalid={isInvalid}>
    <input
      bind:this={inputElement}
      id={inputId}
      class="a-novel-combobox-input"
      type="text"
      role="combobox"
      value={inputValue}
      {placeholder}
      {autocomplete}
      {disabled}
      aria-autocomplete="list"
      aria-controls={listboxId}
      aria-describedby={ariaDescribedBy}
      aria-expanded={controller.state.open}
      aria-haspopup="listbox"
      aria-label={ariaLabel}
      aria-activedescendant={controller.state.open && activeIndex >= 0 ? optionId(activeIndex) : undefined}
      aria-invalid={isInvalid || undefined}
      aria-required={required || undefined}
      onfocus={handleInputFocus}
      oninput={handleInput}
      onkeydown={handleInputKeyDown}
    />
    <button
      class="a-novel-combobox-trigger"
      type="button"
      aria-label={t("combobox.toggle")}
      data-state={controller.state.open ? "open" : "closed"}
      tabindex={-1}
      {disabled}
      onpointerdown={handleTriggerPointerDown}
      onclick={focusInputAndOpen}
    >
      <ChevronDownIcon size="var(--icon-size-sm)" aria-hidden="true" />
    </button>
  </div>

  {#if name}
    <input type="hidden" {name} value={controller.state.value ?? ""} {disabled} />
  {/if}

  <FloatingSurface
    open={controller.state.open}
    bind:element={listboxElement}
    source={inputElement}
    id={listboxId}
    class="a-novel-combobox-content"
    role="listbox"
    aria-labelledby={inputId}
    style="--a-novel-combobox-anchor-width: {anchorWidth}; {maxMenuHeight
      ? '--a-novel-combobox-menu-max-height: ' + maxMenuHeight
      : ''}"
    onOpenChange={handleSurfaceOpenChange}
  >
    {#each filteredOptions as option, index (option.value)}
      <button
        id={optionId(index)}
        class="a-novel-combobox-item {allowDeselect ? 'deselectable' : ''}"
        type="button"
        tabindex={-1}
        role="option"
        aria-label={option.label}
        aria-selected={controller.state.value === option.value}
        aria-disabled={option.disabled || undefined}
        data-option-index={index}
        data-highlighted={activeIndex === index || undefined}
        data-selected={controller.state.value === option.value || undefined}
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
        {#if controller.state.value === option.value}
          <CheckIcon size="var(--icon-size-sm)" aria-hidden="true" />
        {/if}
      </button>
    {:else}
      <span class="empty">{t("combobox.empty")}</span>
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
  .a-novel-combobox-input {
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
  .a-novel-combobox-input:hover:not(:disabled, :focus-visible, [aria-invalid="true"], :user-invalid) {
    border-color: var(--color-control-border-hover);
    background: var(--color-control-surface-hover);
  }
  .a-novel-combobox-input:focus-visible {
    outline: none;
    border-color: var(--color-control-border-focus);
    background: var(--color-control-surface-focus);
  }
  .a-novel-combobox-input[aria-invalid="true"],
  .a-novel-combobox-input:user-invalid {
    border-color: var(--color-feedback-error-border);
    background: var(--color-control-surface-invalid);
  }
  .a-novel-combobox-input[aria-invalid="true"]:focus-visible,
  .a-novel-combobox-input:user-invalid:focus-visible {
    border-color: var(--color-feedback-error-border);
    background: var(--color-control-surface-invalid);
  }
  .a-novel-combobox-input::placeholder {
    color: var(--color-control-placeholder);
  }
  .a-novel-combobox-input:disabled {
    cursor: not-allowed;
    border-color: var(--color-border-subtle);
    background: var(--color-control-surface-disabled);
    color: var(--color-control-disabled-text);
  }
  .a-novel-combobox-trigger {
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
  .input-wrap:not(:focus-within) .a-novel-combobox-trigger:hover:not(:disabled) {
    background: var(--color-action-ghost-hover);
    color: var(--color-text-primary);
  }
  .a-novel-combobox-trigger:focus-visible {
    outline: none;
    color: var(--color-text-primary);
  }
  .a-novel-combobox-trigger:disabled {
    cursor: not-allowed;
    color: var(--color-text-disabled);
  }

  :global(.a-novel-combobox-content) {
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
    inline-size: var(--a-novel-combobox-anchor-width);
    min-inline-size: var(--a-novel-combobox-anchor-width);
    max-block-size: min(
      calc(100dvb - var(--space-8)),
      var(--a-novel-combobox-menu-max-height, var(--control-menu-max-height))
    );
    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior-block: contain;
    color: var(--color-text-primary);
  }
  :global(.a-novel-combobox-item) {
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
  :global(.a-novel-combobox-item > :last-child:not(:first-child)) {
    margin-inline-start: auto;
    color: var(--color-text-accent);
  }
  :global(.a-novel-combobox-item[data-highlighted]:not([data-selected]):not([data-disabled])) {
    background: var(--color-surface-glass-hover);
    color: var(--color-navigation-hover-text);
  }
  :global(.a-novel-combobox-item[data-selected]) {
    cursor: default;
    background: var(--color-navigation-selected-surface);
    color: var(--color-navigation-selected-text);
  }
  :global(.a-novel-combobox-item[data-selected][data-highlighted]) {
    background: var(--color-navigation-selected-surface);
  }
  :global(.a-novel-combobox-item[data-selected].deselectable:not([data-disabled])) {
    cursor: pointer;
  }
  :global(.a-novel-combobox-item[data-disabled]) {
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
    :global(.a-novel-combobox-content) {
      -webkit-backdrop-filter: blur(var(--blur-md));
      backdrop-filter: blur(var(--blur-md));
      background: var(--color-surface-glass);
    }

    :global(.a-novel-combobox-item[data-highlighted]:not([data-selected]):not([data-disabled])) {
      -webkit-backdrop-filter: blur(var(--blur-sm));
      backdrop-filter: blur(var(--blur-sm));
    }
  }

  @media (forced-colors: active) {
    .a-novel-combobox-input:focus-visible,
    .a-novel-combobox-trigger:focus-visible {
      outline: var(--border-width-strong) solid Highlight;
      outline-offset: calc(var(--focus-ring-offset) * -1);
    }

    :global(.a-novel-combobox-content) {
      border: var(--border-width-thin) solid CanvasText;
    }
  }
</style>
