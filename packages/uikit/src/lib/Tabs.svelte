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
  import { Tabs as TabsPrimitive } from "bits-ui";

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

  $effect(() => {
    if (!value && tabs[0]) value = tabs[0].value;
  });
</script>

<TabsPrimitive.Root
  class="agora-tabs {orientation} {className}"
  bind:value
  {orientation}
  {activationMode}
  {loop}
  {onValueChange}
>
  <TabsPrimitive.List class="agora-tabs-list" aria-label={label}>
    {#each tabs as tab (tab.value)}
      <TabsPrimitive.Trigger class="agora-tabs-trigger" value={tab.value} disabled={tab.disabled}>
        {#if tab.icon}<span class="tab-icon" aria-hidden="true">{@render tab.icon()}</span>{/if}
        {#if renderTab}{@render renderTab(tab)}{:else}{tab.label}{/if}
      </TabsPrimitive.Trigger>
    {/each}
  </TabsPrimitive.List>
  {#each tabs as tab (tab.value)}
    <TabsPrimitive.Content class="agora-tabs-content" value={tab.value}>
      {@render children(tab)}
    </TabsPrimitive.Content>
  {/each}
</TabsPrimitive.Root>

<style>
  :global(.agora-tabs) {
    display: flex;
    min-inline-size: 0;
  }
  :global(.agora-tabs.horizontal) {
    flex-direction: column;
  }
  :global(.agora-tabs.vertical) {
    flex-direction: row;
    align-items: flex-start;
  }
  :global(.agora-tabs-list) {
    display: flex;
    gap: var(--space-1);
    border-block-end: var(--border-width-thin) solid var(--color-border-subtle);
  }
  :global(.agora-tabs.vertical .agora-tabs-list) {
    flex: none;
    flex-direction: column;
    border-inline-end: var(--border-width-thin) solid var(--color-border-subtle);
    border-block-end: 0;
  }
  :global(.agora-tabs-trigger) {
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
  :global(.agora-tabs.vertical .agora-tabs-trigger) {
    border-inline-end: var(--border-width-strong) solid transparent;
    border-block-end: 0;
    inline-size: 100%;
  }
  :global(.agora-tabs-trigger:hover:not([data-disabled], [data-state="active"])) {
    background: var(--color-navigation-hover-surface);
    color: var(--color-navigation-hover-text);
  }
  :global(.agora-tabs-trigger[data-state="active"]) {
    border-color: transparent;
    color: var(--color-navigation-selected-text);
  }
  :global(.agora-tabs-trigger[data-state="active"]::after) {
    position: absolute;
    inset-block-end: calc(var(--border-width-strong) * -1);
    inset-inline: 0;
    box-shadow: var(--shadow-indicator-brand);
    background: var(--color-navigation-selected-indicator);
    block-size: var(--border-width-strong);
    content: "";
  }
  :global(.agora-tabs.vertical .agora-tabs-trigger[data-state="active"]::after) {
    inset-block: 0;
    inset-inline-end: calc(var(--border-width-strong) * -1);
    inset-inline-start: auto;
    inline-size: var(--border-width-strong);
    block-size: auto;
  }
  :global(.agora-tabs-trigger:focus-visible) {
    outline: var(--focus-ring-width) solid var(--color-focus-ring);
    outline-offset: calc(var(--focus-ring-offset) * -1);
    border-radius: var(--radius-sm);
  }
  :global(.agora-tabs-trigger[data-disabled]) {
    cursor: not-allowed;
    color: var(--color-text-disabled);
  }
  :global(.agora-tabs-content) {
    padding-block: var(--space-4);
    min-inline-size: 0;
    color: var(--color-text-secondary);
  }
  :global(.agora-tabs.vertical .agora-tabs-content) {
    flex: 1;
    padding-inline: var(--space-4);
    padding-block: 0;
  }
  .tab-icon {
    display: inline-flex;
  }
</style>
