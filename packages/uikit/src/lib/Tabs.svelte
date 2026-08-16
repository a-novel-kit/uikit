<script lang="ts" module>
  import type { Snippet } from "svelte";

  /** One selectable view in a Tabs component. */
  export interface TabItem {
    /** Stable value used by application state. */
    value: string;
    /** Plain-text label used for display and accessibility. */
    label: string;
    /** Prevents the tab from being selected. */
    disabled?: boolean;
    /** Optional leading graphic. */
    icon?: Snippet;
  }

  /** Props for a composed tab list and its associated panels. */
  export interface TabsProps {
    /** Views available for selection. */
    tabs: TabItem[];
    /** Currently selected tab value. */
    value?: string;
    /** Accessible name for the tab list. */
    label: string;
    /** Axis along which tabs and keyboard navigation are arranged. */
    orientation?: "horizontal" | "vertical";
    /** Selects on focus automatically or waits for explicit activation. */
    activationMode?: "automatic" | "manual";
    /** Wraps keyboard navigation from the last tab to the first. */
    loop?: boolean;
    /** Adds classes to the component root. */
    class?: string;
    /** Runs after the selected tab changes. */
    onValueChange?: (value: string) => void;
    /** Replaces visible tab copy while label remains available to accessibility and application logic. */
    renderTab?: Snippet<[TabItem]>;
    /** Renders the panel for each tab while keeping tab data application-owned. */
    children: Snippet<[TabItem]>;
  }
</script>

<script lang="ts">
  import { getEnabledCompositeItems, moveCompositeFocus } from "./focus";

  let {
    tabs,
    value = $bindable(""),
    label,
    orientation = "horizontal",
    activationMode = "automatic",
    loop = true,
    class: className = "",
    onValueChange,
    renderTab,
    children,
  }: TabsProps = $props();

  const componentId = $props.id();
  let listElement: HTMLDivElement;
  let focusedValue = $state("");

  const tabStopValue = $derived(activationMode === "automatic" ? value : focusedValue || value);

  $effect(() => {
    const selected = tabs.find((tab) => tab.value === value && !tab.disabled);
    if (selected) return;

    value = tabs.find((tab) => !tab.disabled)?.value ?? "";
  });

  $effect(() => {
    const focused = tabs.find((tab) => tab.value === focusedValue && !tab.disabled);
    if (focused) return;

    focusedValue =
      tabs.find((tab) => tab.value === value && !tab.disabled)?.value ?? tabs.find((tab) => !tab.disabled)?.value ?? "";
  });

  function selectTab(tab: TabItem) {
    if (tab.disabled || value === tab.value) return;

    value = tab.value;
    onValueChange?.(tab.value);
  }

  function focusTab(element: HTMLElement) {
    element.focus();
  }

  function handleTabFocus(tab: TabItem) {
    if (tab.disabled) return;

    focusedValue = tab.value;
    if (activationMode === "automatic") selectTab(tab);
  }

  function handleKeyDown(event: KeyboardEvent, tab: TabItem) {
    const current = event.currentTarget as HTMLButtonElement;

    if (activationMode === "manual" && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      selectTab(tab);
      return;
    }

    const items = getEnabledCompositeItems(listElement, "[role='tab']");
    let next: HTMLElement | undefined;

    if (event.key === "Home") next = items[0];
    else if (event.key === "End") next = items.at(-1);
    else if (orientation === "horizontal" && event.key === "ArrowRight")
      next = moveCompositeFocus(items, current, 1, loop);
    else if (orientation === "horizontal" && event.key === "ArrowLeft")
      next = moveCompositeFocus(items, current, -1, loop);
    else if (orientation === "vertical" && event.key === "ArrowDown")
      next = moveCompositeFocus(items, current, 1, loop);
    else if (orientation === "vertical" && event.key === "ArrowUp") next = moveCompositeFocus(items, current, -1, loop);

    if (!next) return;
    event.preventDefault();
    focusTab(next);
  }
</script>

<div class="agora-tabs {orientation} {className}">
  <div bind:this={listElement} class="agora-tabs-list" role="tablist" aria-label={label} aria-orientation={orientation}>
    {#each tabs as tab, index (tab.value)}
      <button
        id="{componentId}-tab-{index}"
        class="agora-tabs-trigger"
        type="button"
        role="tab"
        aria-label={tab.label}
        aria-controls="{componentId}-panel-{index}"
        aria-selected={value === tab.value}
        data-composite-item=""
        data-value={tab.value}
        data-state={value === tab.value ? "active" : "inactive"}
        data-disabled={tab.disabled || undefined}
        tabindex={tabStopValue === tab.value ? 0 : -1}
        disabled={tab.disabled}
        onfocus={() => handleTabFocus(tab)}
        onclick={() => selectTab(tab)}
        onkeydown={(event) => handleKeyDown(event, tab)}
      >
        {#if tab.icon}<span class="tab-icon" aria-hidden="true">{@render tab.icon()}</span>{/if}
        {#if renderTab}{@render renderTab(tab)}{:else}{tab.label}{/if}
      </button>
    {/each}
  </div>
  {#each tabs as tab, index (tab.value)}
    <div
      id="{componentId}-panel-{index}"
      class="agora-tabs-content"
      role="tabpanel"
      aria-labelledby="{componentId}-tab-{index}"
      tabindex={0}
      hidden={value !== tab.value}
    >
      {@render children(tab)}
    </div>
  {/each}
</div>

<style>
  .agora-tabs {
    display: flex;
    min-inline-size: 0;
  }
  .agora-tabs.horizontal {
    flex-direction: column;
  }
  .agora-tabs.vertical {
    flex-direction: row;
    align-items: flex-start;
  }
  .agora-tabs-list {
    display: flex;
    gap: var(--space-1);
    border-block-end: var(--border-width-thin) solid var(--color-border-subtle);
  }
  .agora-tabs.vertical .agora-tabs-list {
    flex: none;
    flex-direction: column;
    border-inline-end: var(--border-width-thin) solid var(--color-border-subtle);
    border-block-end: 0;
  }
  .agora-tabs-trigger {
    display: inline-flex;
    position: relative;
    align-items: center;
    gap: var(--space-2);
    transition:
      background-color var(--duration-fast) var(--easing-standard),
      color var(--duration-fast) var(--easing-standard);
    cursor: pointer;
    border: 0;
    border-block-end: var(--border-width-strong) solid transparent;
    background: transparent;
    padding: var(--space-2) var(--space-3);
    min-block-size: var(--control-height-sm);
    color: var(--color-text-muted);
    font-weight: var(--font-weight-medium);
    font-size: var(--font-size-sm);
    font-family: var(--font-family-interface);
  }
  .agora-tabs.vertical .agora-tabs-trigger {
    border-inline-end: var(--border-width-strong) solid transparent;
    border-block-end: 0;
    inline-size: 100%;
  }
  .agora-tabs-trigger:hover:not([data-disabled], [data-state="active"]) {
    background: var(--color-navigation-hover-surface);
    color: var(--color-navigation-hover-text);
  }
  .agora-tabs-trigger[data-state="active"] {
    border-color: transparent;
    color: var(--color-navigation-selected-text);
  }
  .agora-tabs-trigger[data-state="active"]::after {
    position: absolute;
    inset-block-end: calc(var(--border-width-strong) * -1);
    inset-inline: 0;
    box-shadow: var(--shadow-indicator-brand);
    background: var(--color-navigation-selected-indicator);
    block-size: var(--border-width-strong);
    content: "";
  }
  .agora-tabs.vertical .agora-tabs-trigger[data-state="active"]::after {
    inset-block: 0;
    inset-inline-end: calc(var(--border-width-strong) * -1);
    inset-inline-start: auto;
    inline-size: var(--border-width-strong);
    block-size: auto;
  }
  .agora-tabs-trigger:focus-visible {
    outline: var(--focus-ring-width) solid var(--color-focus-ring);
    outline-offset: calc(var(--focus-ring-offset) * -1);
    border-radius: var(--radius-sm);
  }
  .agora-tabs-trigger[data-disabled] {
    cursor: not-allowed;
    color: var(--color-text-disabled);
  }
  .agora-tabs-content {
    padding-block: var(--space-4);
    min-inline-size: 0;
    color: var(--color-text-secondary);
  }
  .agora-tabs.vertical .agora-tabs-content {
    flex: 1;
    padding-inline: var(--space-4);
    padding-block: 0;
  }
  .tab-icon {
    display: inline-flex;
  }
</style>
