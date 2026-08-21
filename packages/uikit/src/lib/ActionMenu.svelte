<script lang="ts" module>
  import type { OpenController as StateController } from "./controllers.svelte";

  import type { Snippet } from "svelte";

  /** An invokable item in an ActionMenu. */
  export interface ActionMenuAction {
    /** Item discriminator; omitted for actions. */
    kind?: "action";
    /** Stable identifier for keyed rendering. */
    id: string;
    /** Plain-text label used for display and accessibility. */
    label: string;
    /** Prevents the action from being invoked. */
    disabled?: boolean;
    /** Semantic treatment for destructive actions. */
    tone?: "neutral" | "danger";
    /** Optional leading graphic. */
    icon?: Snippet;
    /** Optional keyboard shortcut hint. */
    shortcut?: string;
    /** Runs when the item is selected. */
    onSelect?: () => void;
  }

  /** A visual divider between groups of menu actions. */
  export interface ActionMenuSeparator {
    /** Item discriminator for separators. */
    kind: "separator";
    /** Stable identifier for keyed rendering. */
    id: string;
  }

  /** An action or visual divider accepted by ActionMenu. */
  export type ActionMenuItem = ActionMenuAction | ActionMenuSeparator;

  /** Attributes applied to a composed ActionMenu trigger. */
  export interface ActionMenuTriggerAttributes {
    /** Identifies the trigger. */
    id: string;
    /** Provides the trigger's accessible name. */
    "aria-label": string;
    /** Identifies the controlled menu. */
    "aria-controls": string;
    /** Reports menu visibility. */
    "aria-expanded": boolean;
    /** Reports the popup type. */
    "aria-haspopup": "menu";
    /** Prevents opening the menu. */
    disabled: boolean;
    /** Exposes visibility for trigger styling. */
    "data-state": "open" | "closed";
    /** Toggles the menu with a pointer. */
    onclick: (event: MouseEvent) => void;
    /** Opens the menu with standard menu-button keys. */
    onkeydown: (event: KeyboardEvent) => void;
  }

  /** External state contract for an action menu. */
  export type ActionMenuController = StateController;

  /** Props for a composed menu of contextual actions. */
  export interface ActionMenuProps {
    /** Accessible name for the trigger. */
    label: string;
    /** Actions and separators shown in the menu. */
    items: ActionMenuItem[];
    /** Default trigger text. */
    triggerText?: string;
    /** Optional graphic in the default trigger. */
    triggerIcon?: Snippet;
    /** Replaces the default trigger and receives its required attributes. */
    trigger?: Snippet<[ActionMenuTriggerAttributes]>;
    /** Replaces visible action content while preserving its text label. */
    renderItem?: Snippet<[ActionMenuAction]>;
    /** State owner that decides whether visibility requests take effect. */
    controller: ActionMenuController;
    /** Alignment of the menu against its trigger. */
    align?: "start" | "center" | "end";
    /** Prevents the default trigger from opening the menu. */
    disabled?: boolean;
    /** Adds classes to the component root. */
    class?: string;
  }
</script>

<script lang="ts">
  import { getEnabledCompositeItems, moveCompositeFocus } from "./focus";
  import FloatingSurface from "./internal/FloatingSurface.svelte";

  import { onDestroy, tick } from "svelte";

  let {
    label,
    items,
    triggerText = "Actions",
    triggerIcon,
    trigger,
    renderItem,
    controller,
    align = "end",
    disabled = false,
    class: className = "",
  }: ActionMenuProps = $props();

  const componentId = $props.id();
  const triggerId = componentId + "-trigger";
  const menuId = componentId + "-menu";

  let triggerElement = $state<HTMLElement | null>(null);
  let menuElement = $state<HTMLDivElement | null>(null);
  let activeItemIndex = $state(-1);
  let anchorWidth = $state("0px");
  let typeaheadBuffer = "";
  let typeaheadTimer: ReturnType<typeof setTimeout> | undefined;

  const triggerAttributes = $derived<ActionMenuTriggerAttributes>({
    id: triggerId,
    "aria-label": label,
    "aria-controls": menuId,
    "aria-expanded": controller.state.open,
    "aria-haspopup": "menu",
    disabled,
    "data-state": controller.state.open ? "open" : "closed",
    onclick: handleTriggerClick,
    onkeydown: handleTriggerKeyDown,
  });

  $effect(() => {
    if (!controller.state.open || !triggerElement) return;

    anchorWidth = triggerElement.getBoundingClientRect().width + "px";
  });

  $effect(() => {
    if (disabled && controller.state.open) closeMenu();
  });

  function rememberTrigger(element: HTMLElement) {
    triggerElement = element;
    anchorWidth = element.getBoundingClientRect().width + "px";
  }

  function menuItems() {
    return menuElement ? getEnabledCompositeItems(menuElement, "[data-menu-item]") : [];
  }

  function focusMenuItem(boundary: "first" | "last") {
    const enabledItems = menuItems();
    const item = boundary === "first" ? enabledItems[0] : enabledItems.at(-1);
    if (!item) return;

    activeItemIndex = Number(item.dataset.menuIndex);
    item.focus();
  }

  async function openMenu(source: HTMLElement, boundary: "first" | "last") {
    if (disabled) return;

    rememberTrigger(source);
    controller.open();
    if (!controller.state.open) return;
    await tick();
    focusMenuItem(boundary);
  }

  function closeMenu(focusTrigger = false) {
    controller.close();
    if (controller.state.open) return;
    activeItemIndex = -1;
    if (focusTrigger) triggerElement?.focus();
  }

  function handleTriggerClick(event: MouseEvent) {
    const source = event.currentTarget as HTMLElement;
    if (controller.state.open) closeMenu();
    else void openMenu(source, "first");
  }

  function handleTriggerKeyDown(event: KeyboardEvent) {
    const source = event.currentTarget as HTMLElement;
    if (event.key === "ArrowUp") {
      event.preventDefault();
      void openMenu(source, "last");
      return;
    }

    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      void openMenu(source, "first");
    }
  }

  function focusItem(item: HTMLElement) {
    activeItemIndex = Number(item.dataset.menuIndex);
    item.focus();
  }

  function handleTypeahead(key: string) {
    clearTimeout(typeaheadTimer);
    typeaheadBuffer += key.toLocaleLowerCase();
    typeaheadTimer = setTimeout(() => (typeaheadBuffer = ""), 500);

    const enabledItems = menuItems();
    const currentIndex = enabledItems.findIndex((item) => Number(item.dataset.menuIndex) === activeItemIndex);
    for (let offset = 1; offset <= enabledItems.length; offset += 1) {
      const index = (Math.max(currentIndex, -1) + offset) % enabledItems.length;
      const item = enabledItems[index];
      if (item?.dataset.label?.toLocaleLowerCase().startsWith(typeaheadBuffer)) {
        focusItem(item);
        return;
      }
    }
  }

  function handleMenuKeyDown(event: KeyboardEvent) {
    const current = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-menu-item]") : null;

    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu(true);
      return;
    }

    if (event.key === "Tab") {
      closeMenu();
      return;
    }

    if (!current) return;

    const enabledItems = menuItems();
    let next: HTMLElement | undefined;

    if (event.key === "Home") next = enabledItems[0];
    else if (event.key === "End") next = enabledItems.at(-1);
    else if (event.key === "ArrowDown") next = moveCompositeFocus(enabledItems, current, 1, true);
    else if (event.key === "ArrowUp") next = moveCompositeFocus(enabledItems, current, -1, true);
    else if (!event.altKey && !event.ctrlKey && !event.metaKey && event.key.length === 1) {
      handleTypeahead(event.key);
      return;
    }

    if (!next) return;
    event.preventDefault();
    focusItem(next);
  }

  function selectAction(action: ActionMenuAction) {
    if (action.disabled) return;

    action.onSelect?.();
    closeMenu(true);
  }

  onDestroy(() => clearTimeout(typeaheadTimer));
</script>

{#if trigger}
  {@render trigger(triggerAttributes)}
{:else}
  <button
    bind:this={triggerElement}
    id={triggerId}
    class="agora-menu-trigger {className}"
    type="button"
    aria-controls={menuId}
    aria-expanded={controller.state.open}
    aria-haspopup="menu"
    aria-label={label}
    data-state={controller.state.open ? "open" : "closed"}
    {disabled}
    onclick={handleTriggerClick}
    onkeydown={handleTriggerKeyDown}
  >
    {#if triggerIcon}<span class="trigger-icon" aria-hidden="true">{@render triggerIcon()}</span>{/if}
    {#if triggerText}<span>{triggerText}</span>{/if}
  </button>
{/if}

<FloatingSurface
  open={controller.state.open}
  bind:element={menuElement}
  source={triggerElement}
  id={menuId}
  class="agora-menu-content {align}"
  role="menu"
  aria-label={label}
  style="--agora-menu-anchor-width: {anchorWidth}"
  onkeydown={handleMenuKeyDown}
  onfocusin={(event) => {
    const item = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-menu-item]") : null;
    if (item) activeItemIndex = Number(item.dataset.menuIndex);
  }}
  onOpenChange={(nextOpen) => {
    if (nextOpen) controller.open();
    else controller.close();
    if (!controller.state.open) activeItemIndex = -1;
  }}
>
  <div class="agora-menu-group" role="group" aria-label={label}>
    {#each items as item, index (item.id)}
      {#if item.kind === "separator"}
        <div class="agora-menu-separator" role="separator"></div>
      {:else}
        <button
          class="agora-menu-item {item.tone === 'danger' ? 'danger' : ''}"
          type="button"
          role="menuitem"
          aria-label={item.label}
          data-menu-item=""
          data-menu-index={index}
          data-label={item.label}
          data-highlighted={activeItemIndex === index || undefined}
          data-disabled={item.disabled || undefined}
          disabled={item.disabled}
          tabindex={-1}
          onpointermove={() => {
            if (!item.disabled) activeItemIndex = index;
          }}
          onclick={() => selectAction(item)}
        >
          {#if item.icon}<span class="item-icon" aria-hidden="true">{@render item.icon()}</span>{/if}
          <span
            >{#if renderItem}{@render renderItem(item)}{:else}{item.label}{/if}</span
          >
          {#if item.shortcut}<kbd>{item.shortcut}</kbd>{/if}
        </button>
      {/if}
    {/each}
  </div>
</FloatingSurface>

<style>
  :global(.agora-menu-trigger) {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    gap: var(--space-2);
    transition:
      background-color var(--duration-fast) var(--easing-standard),
      border-color var(--duration-fast) var(--easing-standard),
      box-shadow var(--duration-fast) var(--easing-standard);
    cursor: pointer;
    box-sizing: border-box;
    border: var(--border-width-thin) solid var(--color-border-default);
    border-radius: var(--radius-md);
    background: var(--color-action-neutral);
    padding: var(--space-2) var(--space-4);
    min-block-size: var(--control-height-md);
    color: var(--color-action-neutral-text);
    font-weight: var(--font-weight-bold);
    font-size: var(--font-size-md);
    font-family: var(--font-family-interface);
  }
  :global(.agora-menu-trigger:hover:not(:disabled, [data-state="open"])) {
    border-color: var(--color-border-strong);
    background: var(--color-action-neutral-hover);
  }
  :global(.agora-menu-trigger[data-state="open"]) {
    box-shadow: var(--shadow-glow-brand);
    border-color: var(--color-border-selected);
    background: var(--color-action-neutral-selected);
  }
  :global(.agora-menu-trigger:focus-visible) {
    outline: var(--focus-ring-width) solid var(--color-focus-ring);
    outline-offset: var(--focus-ring-offset);
  }
  :global(.agora-menu-trigger:disabled) {
    cursor: not-allowed;
    border-color: var(--color-action-disabled-border);
    background: var(--color-action-disabled-surface);
    color: var(--color-action-disabled-text);
  }
  :global(.agora-menu-content) {
    position-area: block-end span-inline-end;
    z-index: var(--layer-dropdown);
    inset-block-start: var(--space-2);
    outline: none;
    box-shadow: var(--shadow-lg);
    border: 0;
    border-radius: var(--radius-lg);
    background: var(--color-surface-island-strong);
    padding: var(--space-1);
    min-inline-size: max(var(--agora-menu-anchor-width), calc(var(--space-base) * var(--multiplier-48)));
    max-block-size: min(calc(100dvb - var(--space-8)), var(--control-menu-max-height));
    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior-block: contain;
    color: var(--color-text-primary);
  }
  :global(.agora-menu-content.start) {
    justify-self: start;
  }
  :global(.agora-menu-content.center) {
    justify-self: center;
  }
  :global(.agora-menu-content.end) {
    justify-self: end;
  }
  :global(.agora-menu-group) {
    display: grid;
    gap: var(--space-1);
  }
  :global(.agora-menu-item) {
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
  :global(.agora-menu-item[data-highlighted]) {
    background: var(--color-surface-glass-hover);
    color: var(--color-navigation-hover-text);
  }
  :global(.agora-menu-item.danger) {
    color: var(--color-feedback-error-text);
  }
  :global(.agora-menu-item.danger[data-highlighted]) {
    background: var(--color-feedback-error-surface);
  }
  :global(.agora-menu-item[data-disabled]) {
    cursor: not-allowed;
    color: var(--color-text-disabled);
  }
  :global(.agora-menu-separator) {
    margin: 0 var(--space-1);
    background: var(--color-border-subtle);
    block-size: var(--border-width-thin);
  }
  .trigger-icon,
  .item-icon {
    display: inline-flex;
    flex: none;
  }
  kbd {
    margin-inline-start: auto;
    color: var(--color-text-subtle);
    font-size: var(--font-size-xs);
    font-family: var(--font-family-mono);
  }

  @supports (backdrop-filter: blur(0)) or (-webkit-backdrop-filter: blur(0)) {
    :global(.agora-menu-content) {
      -webkit-backdrop-filter: blur(var(--blur-md));
      backdrop-filter: blur(var(--blur-md));
      background: var(--color-surface-glass);
    }

    :global(.agora-menu-item[data-highlighted]) {
      -webkit-backdrop-filter: blur(var(--blur-sm));
      backdrop-filter: blur(var(--blur-sm));
    }
  }

  @media (forced-colors: active) {
    :global(.agora-menu-content) {
      border: var(--border-width-thin) solid CanvasText;
    }
  }
</style>
