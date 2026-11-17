<!--
@component
Renders a single-choice listbox with an external select controller and keyboard typeahead.
The hidden named input submits the selected value. The caller validates required selection.
Native attributes and events target the trigger; `class` styles it.
-->
<script lang="ts" module>
  import type { SelectController as SelectionController } from "./controllers.svelte";
  import type { ComponentSize, SelectionOption } from "./types";

  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes, HTMLInputAttributes } from "svelte/elements";

  /** A selectable value and its visible label. */
  export type SelectOption<Value extends string> = SelectionOption<Value>;

  /** External state contract for a select. */
  export type SelectController<Value extends string> = SelectionController<Value>;

  /** Props for a single-value select with a themed listbox. */
  export interface SelectProps<Value extends string> extends Omit<
    HTMLButtonAttributes,
    "children" | "type" | "value" | "name" | "role" | "onclick" | "onkeydown" | "onpointerdown"
  > {
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
    /**
     * Renders an option without changing its accessible text label. Wrap text mixed with markup in one element: the
     * content centers as a row of flex items, whose edge spaces collapse.
     */
    renderOption?: Snippet<[SelectOption<Value>]>;
  }
</script>

<script lang="ts" generics="Value extends string">
  import Listbox, { ListboxNavigation } from "./internal/Listbox.svelte";
  import Well from "./internal/Well.svelte";
  import { useMessages } from "./internal/i18n";
  import { resolveInvalidState } from "./internal/selection";
  import { createTypeahead, findTypeaheadMatch, isTypeaheadKey } from "./internal/typeahead";

  import { onDestroy } from "svelte";

  import { ChevronDown as ChevronDownIcon } from "@lucide/svelte";

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
    renderOption,
    id,
    class: className = "",
    "aria-invalid": ariaInvalid,
    ...rest
  }: SelectProps<Value> = $props();

  const componentId = $props.id();
  const triggerId = $derived(id ?? componentId + "-trigger");
  const listboxId = componentId + "-listbox";
  const typeahead = createTypeahead();

  let triggerElement = $state<HTMLElement | null>(null);

  const navigation = new ListboxNavigation<Value>(() => ({
    id: listboxId,
    options,
    controller,
    control: triggerElement,
    disabled,
    allowDeselect,
  }));

  const selectedIndex = $derived(options.findIndex((option) => option.value === controller.state.value));
  const selectedOption = $derived(selectedIndex >= 0 ? options[selectedIndex] : undefined);
  const isInvalid = $derived(resolveInvalidState(invalid, ariaInvalid));

  onDestroy(typeahead.dispose);

  // A tap on the trigger closes an open list by itself, as a press outside it, before the trigger's click
  // arrives. The click acts on the state the press found, so it never reopens the list it just closed.
  let openAtPress: boolean | undefined;

  function handleTriggerPointerDown() {
    openAtPress = controller.state.open;
  }

  function handleTriggerClick() {
    const wasOpen = openAtPress ?? controller.state.open;
    openAtPress = undefined;
    if (wasOpen) navigation.close();
    else navigation.open();
  }

  /** Highlights the matching option while open, and selects it while closed. */
  function handleTypeahead(key: string) {
    const labels = options.map((option) => (option.disabled ? undefined : option.label));
    const start = controller.state.open ? navigation.activeIndex : selectedIndex;
    const index = findTypeaheadMatch(labels, start, typeahead.type(key));
    if (index < 0) return;

    if (controller.state.open) navigation.activate(index);
    else controller.select(options[index].value);
  }

  function handleTriggerKeyDown(event: KeyboardEvent) {
    if (disabled) return;

    if (event.key === "Tab" && controller.state.open) {
      navigation.close();
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!controller.state.open) navigation.open(event.key === "ArrowDown" ? undefined : "last");
      else navigation.move(event.key === "ArrowDown" ? 1 : -1);
      return;
    }

    if (event.key === "Home" || event.key === "End") {
      if (!controller.state.open) return;
      event.preventDefault();
      navigation.activate(navigation.startIndex(event.key === "Home" ? "first" : "last"));
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!controller.state.open) navigation.open();
      else if (navigation.active) navigation.select(navigation.active);
      return;
    }

    if (event.key === "Escape" && controller.state.open) {
      event.preventDefault();
      navigation.close(true);
      return;
    }

    if (isTypeaheadKey(event)) handleTypeahead(event.key);
  }
</script>

<div class="select-root">
  <Well
    as="button"
    bind:element={triggerElement}
    size={controlSize}
    invalid={isInvalid}
    class={className}
    {...rest}
    id={triggerId}
    type="button"
    role="combobox"
    aria-controls={listboxId}
    aria-expanded={controller.state.open}
    aria-haspopup="listbox"
    aria-activedescendant={navigation.activeId}
    aria-invalid={isInvalid || undefined}
    aria-required={required || undefined}
    data-state={controller.state.open ? "open" : "closed"}
    {disabled}
    onpointerdown={handleTriggerPointerDown}
    onclick={handleTriggerClick}
    onkeydown={handleTriggerKeyDown}
  >
    <span class="value" class:placeholder={!selectedOption} data-select-value lang={selectedOption?.lang}>
      {#if selectedOption}
        {#if renderOption}{@render renderOption(selectedOption)}{:else}{selectedOption.label}{/if}
      {:else}
        {placeholder}
      {/if}
    </span>
    <span class="indicator" class:open={controller.state.open}>
      <ChevronDownIcon size="var(--icon-size-sm)" aria-hidden="true" />
    </span>
  </Well>

  {#if name}
    <input type="hidden" {name} value={controller.state.value ?? ""} {autocomplete} {disabled} />
  {/if}

  <Listbox {navigation} anchor={triggerElement} labelledby={triggerId} {renderOption} />
</div>

<style>
  .select-root {
    min-inline-size: 0;
  }

  /* A rendered option, such as a flag beside a name, centers in its row as a box. Set on the text's
     baseline instead, an icon leading it lifts it above the row's middle. */
  .value {
    display: flex;
    flex: 1;
    align-items: center;
    line-height: var(--line-height-compact);
  }

  .placeholder {
    color: var(--color-text-muted);
  }

  .indicator {
    display: inline-flex;
    flex: none;
    transition: transform var(--duration-fast) var(--easing-standard);
    color: var(--well-muted-text);
  }

  .indicator.open {
    transform: rotate(180deg);
  }
</style>
