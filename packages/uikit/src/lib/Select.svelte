<!--
@component
Renders a single-choice listbox with an external select controller and keyboard typeahead.
The hidden named input submits the selected value. The caller validates required selection.
-->
<script lang="ts" module>
  import type { SelectController as SelectionController } from "./controllers.svelte";
  import type { ComponentSize, SelectionOption } from "./types";

  import type { Snippet } from "svelte";
  import type { HTMLInputAttributes } from "svelte/elements";

  /** A selectable value and its visible label. */
  export type SelectOption<Value extends string> = SelectionOption<Value>;

  /** External state contract for a select. */
  export type SelectController<Value extends string> = SelectionController<Value>;

  /** Props for a single-value select with a themed listbox. */
  export interface SelectProps<Value extends string> {
    /** Options shown in the menu. */
    options: readonly SelectOption<Value>[];
    /** State owner that decides whether visibility or selection requests take effect. */
    controller: SelectController<Value>;
    /** Text shown without a selected option; defaults to the translated "Select an option". */
    placeholder?: string;
    /** Creates a hidden input with this form name; an unset value submits an empty string. */
    name?: string;
    /** Browser autofill hint forwarded to the hidden form input. */
    autocomplete?: HTMLInputAttributes["autocomplete"];
    /** Sets the control height and type scale. */
    controlSize?: ComponentSize;
    /** Applies the invalid surface and focus treatment. */
    invalid?: boolean;
    /** Sets aria-required; the caller validates selection before submitting. Defaults to false. */
    required?: boolean;
    /** Prevents opening or changing the select. */
    disabled?: boolean;
    /** Selecting the current option clears its value when true; defaults to false. */
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
    /** Renders an option without changing its accessible text label. */
    renderOption?: Snippet<[SelectOption<Value>]>;
    /** Adds classes to the trigger. */
    class?: string;
  }
</script>

<script lang="ts" generics="Value extends string">
  import FloatingSurface from "./internal/FloatingSurface.svelte";
  import { useMessages } from "./internal/i18n";
  import { createTypeahead, findTypeaheadMatch, isTypeaheadKey } from "./internal/typeahead";
  import { findEnabledBoundary, findNextEnabledIndex, resolveInvalidState } from "./selection";

  import { onDestroy, tick } from "svelte";

  import { Check as CheckIcon, ChevronDown as ChevronDownIcon } from "@lucide/svelte";

  const { t } = useMessages();

  let {
    options,
    controller,
    placeholder = t("select.placeholder"),
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
    renderOption,
  }: SelectProps<Value> = $props();

  const componentId = $props.id();
  const triggerId = $derived(id ?? componentId + "-trigger");
  const listboxId = componentId + "-listbox";
  const typeahead = createTypeahead();

  let activeIndex = $state(-1);
  let triggerElement = $state<HTMLButtonElement | null>(null);
  let listboxElement = $state<HTMLDivElement | null>(null);
  let anchorWidth = $state("0px");

  const selectedIndex = $derived(options.findIndex((option) => option.value === controller.state.value));
  const selectedOption = $derived(selectedIndex >= 0 ? options[selectedIndex] : undefined);
  const isInvalid = $derived(resolveInvalidState(invalid, ariaInvalid));

  $effect(() => {
    if (controller.state.open && triggerElement) anchorWidth = triggerElement.getBoundingClientRect().width + "px";
  });

  $effect(() => {
    if (disabled && controller.state.open) closeListbox();
  });

  onDestroy(typeahead.dispose);

  function optionId(index: number) {
    return componentId + "-option-" + index;
  }

  function rememberTrigger(element: HTMLButtonElement) {
    triggerElement = element;
    anchorWidth = element.getBoundingClientRect().width + "px";
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

  /** Opens on the selected option, or on the first or last enabled option when `boundary` is set. */
  function openListbox(element: HTMLButtonElement, boundary?: "first" | "last") {
    if (disabled) return;

    rememberTrigger(element);
    const startOnSelection = boundary === undefined && selectedIndex >= 0 && !options[selectedIndex].disabled;
    setActiveIndex(startOnSelection ? selectedIndex : findEnabledBoundary(options, boundary ?? "first"));
    controller.open();
  }

  function closeListbox(focusTrigger = false) {
    controller.close();
    if (controller.state.open) return;
    activeIndex = -1;
    if (focusTrigger) triggerElement?.focus();
  }

  function moveActive(direction: -1 | 1) {
    if (activeIndex >= 0) setActiveIndex(findNextEnabledIndex(options, activeIndex, direction));
    else setActiveIndex(findEnabledBoundary(options, direction === 1 ? "first" : "last"));
  }

  function selectOption(option: SelectOption<Value>) {
    if (option.disabled) return;

    controller.select(allowDeselect && controller.state.value === option.value ? undefined : option.value);
    closeListbox(true);
  }

  function handleTriggerClick(event: MouseEvent) {
    if (controller.state.open) closeListbox();
    else openListbox(event.currentTarget as HTMLButtonElement);
  }

  /** Highlights the matching option while open, and selects it while closed. */
  function handleTypeahead(key: string) {
    const labels = options.map((option) => (option.disabled ? undefined : option.label));
    const start = controller.state.open ? activeIndex : selectedIndex;
    const index = findTypeaheadMatch(labels, start, typeahead.type(key));
    if (index < 0) return;

    if (controller.state.open) setActiveIndex(index);
    else controller.select(options[index].value);
  }

  function handleTriggerKeyDown(event: KeyboardEvent) {
    if (disabled) return;
    const trigger = event.currentTarget as HTMLButtonElement;

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!controller.state.open) openListbox(trigger, event.key === "ArrowDown" ? undefined : "last");
      else moveActive(event.key === "ArrowDown" ? 1 : -1);
      return;
    }

    if (event.key === "Home" || event.key === "End") {
      if (!controller.state.open) return;
      event.preventDefault();
      setActiveIndex(findEnabledBoundary(options, event.key === "Home" ? "first" : "last"));
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!controller.state.open) openListbox(trigger);
      else if (activeIndex >= 0 && options[activeIndex]) selectOption(options[activeIndex]);
      return;
    }

    if (event.key === "Escape" && controller.state.open) {
      event.preventDefault();
      closeListbox(true);
      return;
    }

    if (isTypeaheadKey(event)) handleTypeahead(event.key);
  }

  function handleSurfaceOpenChange(nextOpen: boolean) {
    if (nextOpen) controller.open();
    else controller.close();
    if (!controller.state.open) activeIndex = -1;
  }
</script>

<div class="select-root">
  <button
    bind:this={triggerElement}
    id={triggerId}
    class="a-novel-select-trigger {controlSize} {className}"
    class:invalid={isInvalid}
    class:deselectable={allowDeselect}
    type="button"
    role="combobox"
    aria-controls={listboxId}
    aria-describedby={ariaDescribedBy}
    aria-expanded={controller.state.open}
    aria-haspopup="listbox"
    aria-label={ariaLabel}
    aria-activedescendant={controller.state.open && activeIndex >= 0 ? optionId(activeIndex) : undefined}
    aria-invalid={isInvalid || undefined}
    aria-required={required || undefined}
    data-placeholder={selectedOption ? undefined : ""}
    data-state={controller.state.open ? "open" : "closed"}
    {disabled}
    {tabindex}
    onclick={handleTriggerClick}
    onkeydown={handleTriggerKeyDown}
  >
    <span data-select-value>
      {#if selectedOption}
        {#if renderOption}{@render renderOption(selectedOption)}{:else}{selectedOption.label}{/if}
      {:else}
        {placeholder}
      {/if}
    </span>
    <ChevronDownIcon class="a-novel-select-indicator" size="var(--icon-size-sm)" aria-hidden="true" />
  </button>

  {#if name}
    <input type="hidden" {name} value={controller.state.value ?? ""} {autocomplete} {disabled} />
  {/if}

  <FloatingSurface
    open={controller.state.open}
    bind:element={listboxElement}
    source={triggerElement}
    id={listboxId}
    class="a-novel-select-content"
    role="listbox"
    aria-labelledby={triggerId}
    style="--a-novel-select-anchor-width: {anchorWidth}"
    onOpenChange={handleSurfaceOpenChange}
  >
    {#each options as option, index (option.value)}
      <button
        id={optionId(index)}
        class="a-novel-select-item {allowDeselect ? 'deselectable' : ''}"
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
    {/each}
  </FloatingSurface>
</div>

<style>
  .select-root {
    min-inline-size: 0;
  }

  .a-novel-select-trigger {
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

  .a-novel-select-trigger:hover:not(:disabled, :focus-visible, [aria-invalid="true"]) {
    border-color: var(--color-control-border-hover);
    background: var(--color-control-surface-hover);
  }

  .a-novel-select-trigger:focus-visible {
    outline: none;
    box-shadow: var(--shadow-focus-ring);
    border-color: var(--color-control-border-focus);
    background: var(--color-control-surface-focus);
  }

  .a-novel-select-trigger[data-placeholder] [data-select-value] {
    color: var(--color-text-muted);
  }

  :global(.a-novel-select-indicator) {
    flex: none;
    transition: transform var(--duration-fast) var(--easing-standard);
    color: var(--color-text-muted);
  }

  .a-novel-select-trigger[data-state="open"] :global(.a-novel-select-indicator) {
    transform: rotate(180deg);
  }

  .a-novel-select-trigger:disabled {
    cursor: not-allowed;
    border-color: var(--color-border-subtle);
    background: var(--color-control-surface-disabled);
    color: var(--color-control-disabled-text);
  }

  .a-novel-select-trigger:disabled :global(.a-novel-select-indicator) {
    color: var(--color-control-disabled-text);
  }

  .a-novel-select-trigger.invalid,
  .a-novel-select-trigger[aria-invalid="true"] {
    border-color: var(--color-feedback-error-border);
    background: var(--color-control-surface-invalid);
  }

  .a-novel-select-trigger.invalid:focus-visible,
  .a-novel-select-trigger[aria-invalid="true"]:focus-visible {
    box-shadow: var(--shadow-invalid-focus-ring);
    border-color: var(--color-feedback-error-border);
    background: var(--color-control-surface-invalid);
  }

  .a-novel-select-trigger.sm {
    padding-inline: var(--space-3);
    min-block-size: var(--control-height-sm);
    font-size: var(--font-size-sm);
  }
  .a-novel-select-trigger.md {
    padding-inline: var(--space-3);
    min-block-size: var(--control-height-md);
    font-size: var(--font-size-md);
  }
  .a-novel-select-trigger.lg {
    padding-inline: var(--space-4);
    min-block-size: var(--control-height-lg);
    font-size: var(--font-size-lg);
  }

  :global(.a-novel-select-content) {
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
    inline-size: var(--a-novel-select-anchor-width);
    min-inline-size: var(--a-novel-select-anchor-width);
    max-block-size: min(calc(100dvb - var(--space-8)), var(--control-menu-max-height));
    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior-block: contain;
    color: var(--color-text-primary);
  }

  :global(.a-novel-select-item) {
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

  :global(.a-novel-select-item > :last-child:not(:first-child)) {
    margin-inline-start: auto;
    color: var(--color-text-accent);
  }

  :global(.a-novel-select-item[data-highlighted]:not([data-selected]):not([data-disabled])) {
    background: var(--color-surface-glass-hover);
    color: var(--color-navigation-hover-text);
  }

  :global(.a-novel-select-item[data-selected]) {
    cursor: default;
    background: var(--color-navigation-selected-surface);
    color: var(--color-navigation-selected-text);
  }

  :global(.a-novel-select-item[data-selected].deselectable) {
    cursor: pointer;
  }

  :global(.a-novel-select-item[data-disabled]) {
    cursor: not-allowed;
    color: var(--color-text-disabled);
  }

  @supports (backdrop-filter: blur(0)) or (-webkit-backdrop-filter: blur(0)) {
    :global(.a-novel-select-content) {
      -webkit-backdrop-filter: blur(var(--blur-md));
      backdrop-filter: blur(var(--blur-md));
      background: var(--color-surface-glass);
    }

    :global(.a-novel-select-item[data-highlighted]:not([data-selected]):not([data-disabled])) {
      -webkit-backdrop-filter: blur(var(--blur-sm));
      backdrop-filter: blur(var(--blur-sm));
    }
  }

  @media (forced-colors: active) {
    .a-novel-select-trigger:focus-visible {
      outline: var(--border-width-strong) solid Highlight;
      outline-offset: var(--focus-ring-offset);
    }

    :global(.a-novel-select-content) {
      border: var(--border-width-thin) solid CanvasText;
    }
  }
</style>
