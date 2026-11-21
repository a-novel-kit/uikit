<!--
@component
Filters labeled options and renders a single selection from an external combobox controller.
The hidden named input submits the selected value. The caller validates required selection.
Native attributes and events target the search input; `class` styles the component root.
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
  export interface ComboboxProps<Value extends string> extends Omit<
    HTMLInputAttributes,
    "children" | "type" | "value" | "name" | "role" | "onfocus" | "oninput" | "onkeydown"
  > {
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
    /** Browser autofill hint for the search input; defaults to "off". */
    autocomplete?: HTMLInputAttributes["autocomplete"];
    /**
     * Replaces visible option copy while label remains available to filtering and accessibility. Wrap text mixed with
     * markup in one element: the content centers as a row of flex items, whose edge spaces collapse.
     */
    renderOption?: Snippet<[ComboboxOption<Value>]>;
  }
</script>

<script lang="ts" generics="Value extends string">
  import FieldButton from "./internal/FieldButton.svelte";
  import Listbox, { ListboxNavigation } from "./internal/Listbox.svelte";
  import Well from "./internal/Well.svelte";
  import { useMessages } from "./internal/i18n";
  import { findEnabledBoundary, matchesSearch, resolveInvalidState } from "./internal/selection";

  import { ChevronDown as ChevronDownIcon } from "@lucide/svelte";

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
    autocomplete = "off",
    renderOption,
    id,
    class: className = "",
    "aria-invalid": ariaInvalid,
    ...rest
  }: ComboboxProps<Value> = $props();

  const componentId = $props.id();
  const inputId = $derived(id ?? componentId + "-input");
  const listboxId = componentId + "-listbox";

  let wellElement = $state<HTMLElement | null>(null);
  let inputElement = $state<HTMLInputElement | null>(null);

  const selectedOption = $derived(options.find((option) => option.value === controller.state.value));
  const inputValue = $derived(controller.state.open ? controller.state.query : (selectedOption?.label ?? ""));
  const isInvalid = $derived(resolveInvalidState(invalid, ariaInvalid));
  const filteredOptions = $derived(options.filter((option) => matchesSearch(option.label, controller.state.query)));

  const navigation = new ListboxNavigation<Value>(() => ({
    id: listboxId,
    options: filteredOptions,
    controller,
    control: inputElement,
    disabled,
    allowDeselect,
  }));

  function handleInputFocus() {
    if (!controller.state.open) navigation.open();
  }

  function handleInput(event: Event) {
    const target = event.currentTarget as HTMLInputElement;
    if (!controller.state.open && !disabled) controller.open();
    controller.setQuery(target.value);
    target.value = inputValue;
    navigation.activeIndex = findEnabledBoundary(filteredOptions, "first");
  }

  function handleInputKeyDown(event: KeyboardEvent) {
    if (disabled) return;

    if (event.key === "Tab" && controller.state.open) {
      navigation.close();
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!controller.state.open) navigation.open();
      else navigation.move(event.key === "ArrowDown" ? 1 : -1);
      return;
    }

    if (event.key === "Enter" && controller.state.open && navigation.active) {
      event.preventDefault();
      navigation.select(navigation.active);
      return;
    }

    if (event.key === "Escape" && controller.state.open) {
      event.preventDefault();
      navigation.close(true);
    }
  }

  function focusInputAndOpen() {
    if (disabled) return;

    inputElement?.focus();
    if (!controller.state.open) navigation.open();
  }

  function handleTriggerPointerDown(event: PointerEvent) {
    if (event.button === 0) event.preventDefault();
  }
</script>

<div class="combobox {className}">
  <Well bind:element={wellElement} invalid={isInvalid} data-state={controller.state.open ? "open" : "closed"}>
    <input
      bind:this={inputElement}
      {...rest}
      id={inputId}
      class="control"
      data-well-control
      type="text"
      role="combobox"
      value={inputValue}
      defaultValue={inputValue}
      {placeholder}
      {autocomplete}
      {disabled}
      aria-autocomplete="list"
      aria-controls={listboxId}
      aria-expanded={controller.state.open}
      aria-haspopup="listbox"
      aria-activedescendant={navigation.activeId}
      aria-invalid={isInvalid || undefined}
      aria-required={required || undefined}
      onfocus={handleInputFocus}
      oninput={handleInput}
      onkeydown={handleInputKeyDown}
    />
    <span data-well-end>
      <FieldButton
        aria-label={t("combobox.toggle")}
        data-state={controller.state.open ? "open" : "closed"}
        tabindex={-1}
        {disabled}
        onpointerdown={handleTriggerPointerDown}
        onclick={focusInputAndOpen}
      >
        <ChevronDownIcon size="var(--icon-size-sm)" aria-hidden="true" />
      </FieldButton>
    </span>
  </Well>

  {#if name}
    <input type="hidden" {name} value={controller.state.value ?? ""} {disabled} />
  {/if}

  <Listbox
    {navigation}
    anchor={wellElement}
    labelledby={inputId}
    {renderOption}
    empty={t("combobox.empty")}
    maxBlockSize={maxMenuHeight}
  />
</div>

<style>
  .combobox {
    min-inline-size: 0;
  }

  .control {
    flex: 1;
    appearance: none;
    outline: none;
    border: 0;
    background: transparent;
    padding: 0;
    min-inline-size: 0;
    color: var(--color-control-text);
    font: inherit;
  }

  .control::placeholder {
    color: var(--color-control-placeholder);
  }

  .control:disabled {
    color: var(--color-control-disabled-text);
  }
</style>
