<!--
@component
Switches between labeled panels using an external value controller.
Every panel stays mounted; inactive panels are hidden. Initialize the controller with an enabled tab value.
-->
<script lang="ts" module>
  import type { ValueController } from "./controllers.svelte";

  import type { Snippet } from "svelte";

  /** One selectable view in a Tabs component. */
  export interface TabItem {
    /** Stable value used by application state. */
    value: string;
    /** Plain-text label used for display and accessibility. */
    label: string;
    /** Prevents the tab from being selected. */
    disabled?: boolean;
    /** Leading graphic. */
    icon?: Snippet;
  }

  /** External state contract for tabs. */
  export type TabsController = ValueController<string>;

  /** Props for a composed tab list and its associated panels. */
  export interface TabsProps {
    /** Views available for selection. */
    tabs: TabItem[];
    /** State owner that decides whether selection requests take effect. */
    controller: TabsController;
    /** Accessible name for the tab list. */
    label: string;
    /** Axis along which tabs and keyboard navigation are arranged. */
    orientation?: "horizontal" | "vertical";
    /** Defaults to "automatic" selection on focus; manual waits for Enter, Space, or a click. */
    activationMode?: "automatic" | "manual";
    /** Wraps keyboard navigation from the last tab to the first. */
    loop?: boolean;
    /** Adds classes to the component root. */
    class?: string;
    /** Replaces visible tab copy while label remains available to accessibility and application logic. */
    renderTab?: Snippet<[TabItem]>;
    /** Renders every panel, including hidden ones; inactive content remains mounted. */
    children: Snippet<[TabItem]>;
  }
</script>

<script lang="ts">
  import { findCompositeTarget, getEnabledCompositeItems } from "./internal/focus";

  let {
    tabs,
    controller,
    label,
    orientation = "horizontal",
    activationMode = "automatic",
    loop = true,
    class: className = "",
    renderTab,
    children,
  }: TabsProps = $props();

  const componentId = $props.id();
  let listElement: HTMLDivElement;
  let focusedValue = $state("");

  const tabStopValue = $derived(
    activationMode === "automatic" ? controller.state.value : focusedValue || controller.state.value
  );

  const firstEnabledValue = $derived(tabs.find((tab) => !tab.disabled)?.value ?? "");
  const isEnabled = (value: string) => tabs.some((tab) => tab.value === value && !tab.disabled);

  $effect(() => {
    if (!isEnabled(controller.state.value)) controller.setValue(firstEnabledValue);
  });

  $effect(() => {
    if (isEnabled(focusedValue)) return;
    focusedValue = isEnabled(controller.state.value) ? controller.state.value : firstEnabledValue;
  });

  function selectTab(tab: TabItem) {
    if (tab.disabled || controller.state.value === tab.value) return;

    controller.setValue(tab.value);
  }

  function handleTabFocus(tab: TabItem) {
    if (tab.disabled) return;

    focusedValue = tab.value;
    if (activationMode === "automatic") selectTab(tab);
  }

  function handleKeyDown(event: KeyboardEvent, tab: TabItem) {
    if (activationMode === "manual" && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      selectTab(tab);
      return;
    }

    const items = getEnabledCompositeItems(listElement, "[role='tab']");
    const next = findCompositeTarget(items, event.currentTarget as HTMLElement, event.key, orientation, loop);
    if (!next) return;
    event.preventDefault();
    next.focus();
  }
</script>

<div class="a-novel-tabs {orientation} {className}">
  <div
    bind:this={listElement}
    class="a-novel-tabs-list"
    role="tablist"
    aria-label={label}
    aria-orientation={orientation}
  >
    {#each tabs as tab, index (tab.value)}
      <button
        id="{componentId}-tab-{index}"
        class="a-novel-tabs-trigger"
        type="button"
        role="tab"
        aria-label={tab.label}
        aria-controls="{componentId}-panel-{index}"
        aria-selected={controller.state.value === tab.value}
        data-composite-item=""
        data-value={tab.value}
        data-state={controller.state.value === tab.value ? "active" : "inactive"}
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
      class="a-novel-tabs-content"
      role="tabpanel"
      aria-labelledby="{componentId}-tab-{index}"
      tabindex={0}
      hidden={controller.state.value !== tab.value}
    >
      {@render children(tab)}
    </div>
  {/each}
</div>

<style>
  .a-novel-tabs {
    display: flex;
    min-inline-size: 0;
  }
  .a-novel-tabs.horizontal {
    flex-direction: column;
  }
  .a-novel-tabs.vertical {
    flex-direction: row;
    align-items: flex-start;
  }
  .a-novel-tabs-list {
    display: flex;
    gap: var(--space-1);
  }

  .a-novel-tabs.vertical .a-novel-tabs-list {
    flex: none;
    flex-direction: column;
  }

  .a-novel-tabs-trigger {
    display: inline-flex;
    position: relative;
    align-items: center;
    gap: var(--space-2);
    transition:
      background-color var(--motion-state),
      color var(--motion-state);
    cursor: pointer;
    border: 0;
    border-radius: var(--radius-lg);
    background: transparent;
    padding: var(--space-1) var(--space-3);
    min-block-size: var(--control-height-sm);
    color: var(--color-text-muted);
    font: var(--text-ui);
    user-select: none;
  }

  .a-novel-tabs.vertical .a-novel-tabs-trigger {
    inline-size: 100%;
  }

  @media (hover: hover) {
    .a-novel-tabs-trigger:hover:not([data-disabled], [data-state="active"]) {
      background: var(--color-navigation-hover-surface);
      color: var(--color-navigation-hover-text);
    }
  }

  /* The tab showing reads as the navigation's current item, as a chosen ghost button does: a tinted box and an
     indicator, under the label in a row and at the start edge in a column. The list draws no line. */
  .a-novel-tabs-trigger[data-state="active"] {
    background: var(--color-navigation-selected-surface);
    color: var(--color-navigation-selected-text);
  }

  .a-novel-tabs-trigger[data-state="active"]::after {
    position: absolute;
    inset-block: auto 0;
    inset-inline: var(--space-2);
    background: var(--color-navigation-selected-indicator);
    block-size: var(--border-width-strong);
    content: "";
  }

  .a-novel-tabs.vertical .a-novel-tabs-trigger[data-state="active"]::after {
    inset-block: var(--space-2);
    inset-inline: 0 auto;
    inline-size: var(--border-width-strong);
    block-size: auto;
  }

  .a-novel-tabs-trigger:focus-visible {
    outline: var(--focus-ring-width) solid var(--color-focus-ring);
    outline-offset: calc(var(--focus-ring-offset) * -1);
  }

  /* Forced colors paint the indicator Canvas, so it keeps its line in the text color. */
  @media (forced-colors: active) {
    .a-novel-tabs-trigger[data-state="active"]::after {
      background: CanvasText;
      forced-color-adjust: none;
    }
  }
  .a-novel-tabs-trigger[data-disabled] {
    cursor: not-allowed;
    color: var(--color-text-disabled);
  }
  .a-novel-tabs-content {
    padding-block: var(--space-4);
    min-inline-size: 0;
    color: var(--color-text-secondary);
  }
  .a-novel-tabs.vertical .a-novel-tabs-content {
    flex: 1;
    padding-inline: var(--space-4);
    padding-block: 0;
  }
  .tab-icon {
    display: inline-flex;
  }
</style>
