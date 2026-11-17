<!--
@component
Renders a keyboard-navigable popup of actions with an external open controller.
For a custom trigger, spread the snippet attributes onto a native button.
-->
<script lang="ts" module>
  import type { OpenController } from "./controllers.svelte";

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
    /** Leading graphic. */
    icon?: Snippet;
    /** Visual shortcut hint; the caller registers the keyboard shortcut. */
    shortcut?: string;
    /** Runs synchronously before closure is requested for an enabled action. */
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
  export type ActionMenuController = OpenController;

  /** Props for a composed menu of contextual actions. */
  export interface ActionMenuProps {
    /** Accessible name for the trigger. */
    label: string;
    /** Actions and separators shown in the menu. */
    items: ActionMenuItem[];
    /** Text in the default trigger; defaults to the translated "Actions". */
    triggerText?: string;
    /** Graphic in the default trigger. */
    triggerIcon?: Snippet;
    /** Replaces the default trigger; spread all supplied attributes onto a native button. */
    trigger?: Snippet<[ActionMenuTriggerAttributes]>;
    /**
     * Replaces visible action content, which names the item, so it must include the label. Wrap text mixed with markup
     * in one element: the content centers as a row of flex items, whose edge spaces collapse.
     */
    renderItem?: Snippet<[ActionMenuAction]>;
    /** State owner that decides whether visibility requests take effect. */
    controller: ActionMenuController;
    /** Alignment against the trigger; defaults to "end". */
    align?: "start" | "center" | "end";
    /** Prevents the default trigger from opening the menu. */
    disabled?: boolean;
    /** Adds classes to the default trigger; unused when a custom trigger is supplied. */
    class?: string;
  }
</script>

<script lang="ts">
  import Button from "./Button.svelte";
  import FloatingSurface from "./internal/FloatingSurface.svelte";
  import { closestCompositeItem, findCompositeTarget, getEnabledCompositeItems } from "./internal/focus";
  import { useMessages } from "./internal/i18n";
  import { createTypeahead, findTypeaheadMatch, isTypeaheadKey } from "./internal/typeahead";

  import { onDestroy, tick, untrack } from "svelte";

  const { t } = useMessages();

  let {
    label,
    items,
    triggerText = t("actionMenu.trigger"),
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
  const itemSelector = "[data-menu-item]";
  const typeahead = createTypeahead();

  let triggerElement = $state<HTMLElement | null>(null);
  let menuElement = $state<HTMLDivElement | null>(null);
  let activeItemIndex = $state(-1);

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
    if (disabled && controller.state.open) closeMenu();
  });

  // When the controller opens the menu without a trigger event, a composed trigger is found by the id
  // its attributes carry.
  $effect(() => {
    if (!controller.state.open || untrack(() => triggerElement)) return;
    triggerElement = document.getElementById(triggerId);
  });

  onDestroy(typeahead.dispose);

  function menuItems() {
    return menuElement ? getEnabledCompositeItems(menuElement, itemSelector) : [];
  }

  function focusItem(item: HTMLElement | undefined) {
    if (!item) return;

    activeItemIndex = Number(item.dataset.menuIndex);
    item.focus();
  }

  async function openMenu(source: HTMLElement, boundary: "first" | "last") {
    if (disabled) return;

    // A composed trigger has no binding, so the opening event supplies the anchor.
    triggerElement = source;
    controller.open();
    if (!controller.state.open) return;
    await tick();
    focusItem(boundary === "first" ? menuItems()[0] : menuItems().at(-1));
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

  /** Focuses the next enabled action whose label starts with the typed characters. */
  function handleTypeahead(key: string) {
    const enabledItems = menuItems();
    const currentIndex = enabledItems.findIndex((item) => Number(item.dataset.menuIndex) === activeItemIndex);
    const labels = enabledItems.map((item) => item.dataset.label);
    const index = findTypeaheadMatch(labels, currentIndex, typeahead.type(key));
    if (index >= 0) focusItem(enabledItems[index]);
  }

  function handleMenuKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu(true);
      return;
    }

    if (event.key === "Tab") {
      closeMenu();
      return;
    }

    const current = closestCompositeItem(event.target, itemSelector);
    if (!current) return;

    const next = findCompositeTarget(menuItems(), current, event.key, "vertical", true);
    if (next) {
      event.preventDefault();
      focusItem(next);
    } else if (isTypeaheadKey(event)) {
      handleTypeahead(event.key);
    }
  }

  function handleMenuFocusIn(event: FocusEvent) {
    const item = closestCompositeItem(event.target, itemSelector);
    if (item) activeItemIndex = Number(item.dataset.menuIndex);
  }

  function handleSurfaceOpenChange(nextOpen: boolean) {
    if (nextOpen) controller.open();
    else controller.close();
    if (!controller.state.open) activeItemIndex = -1;
  }

  function selectAction(action: ActionMenuAction) {
    if (action.disabled) return;

    action.onSelect?.();
    closeMenu(true);
  }
</script>

{#if trigger}
  {@render trigger(triggerAttributes)}
{:else}
  <Button
    variant="outline"
    tone="neutral"
    class={className}
    {...triggerAttributes}
    {@attach (element: HTMLElement) => {
      triggerElement = element;
    }}
  >
    {#if triggerIcon}<span class="trigger-icon" aria-hidden="true">{@render triggerIcon()}</span>{/if}
    {#if triggerText}<span>{triggerText}</span>{/if}
  </Button>
{/if}

<FloatingSurface
  open={controller.state.open}
  bind:element={menuElement}
  source={triggerElement}
  id={menuId}
  class="a-novel-menu-content {align}"
  role="menu"
  aria-label={label}
  onkeydown={handleMenuKeyDown}
  onfocusin={handleMenuFocusIn}
  onOpenChange={handleSurfaceOpenChange}
>
  <div class="a-novel-menu-group" role="group" aria-label={label}>
    {#each items as item, index (item.id)}
      {#if item.kind === "separator"}
        <div class="a-novel-menu-separator" role="separator"></div>
      {:else}
        <button
          class="a-novel-menu-item {item.tone === 'danger' ? 'danger' : ''}"
          type="button"
          role="menuitem"
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
          <span class="option"
            >{#if renderItem}{@render renderItem(item)}{:else}{item.label}{/if}</span
          >
          {#if item.shortcut}<kbd aria-hidden="true">{item.shortcut}</kbd>{/if}
        </button>
      {/if}
    {/each}
  </div>
</FloatingSurface>

<style>
  /* FloatingSurface renders the menu's surface, so its rules reach it by class. The menu's radius is its items'
     radius plus the padding around them, so their corners share centers. */
  :global {
    .a-novel-menu-content {
      position-area: block-end span-inline-end;
      z-index: var(--layer-dropdown);
      -webkit-backdrop-filter: blur(var(--blur-md));
      backdrop-filter: blur(var(--blur-md));
      inset-block-start: var(--space-2);
      outline: none;
      box-shadow: var(--shadow-lg);
      border: 0;
      border-radius: calc(var(--radius-md) + var(--space-1));
      background: var(--color-surface-glass);
      padding: var(--space-1);
      min-inline-size: max(var(--floating-anchor-width, 0px), calc(var(--size-base) * 48));
      max-block-size: min(calc(100dvb - var(--space-8)), var(--control-menu-max-height));
      overflow-x: hidden;
      overflow-y: auto;
      overscroll-behavior-block: contain;
      color: var(--color-text-primary);
    }
    .a-novel-menu-content.start {
      justify-self: start;
    }
    .a-novel-menu-content.center {
      justify-self: center;
    }
    .a-novel-menu-content.end {
      position-area: block-end span-inline-start;
      justify-self: end;
    }
  }
  /* Items touch, as links of one group do; a separator sets groups apart, inset like the items. */
  .a-novel-menu-group {
    display: grid;
  }
  /* A rendered option, such as a flag beside a name, centers in its row as a box. Set on the text's
     baseline instead, an icon leading it lifts it above the row's middle. */
  .option {
    display: flex;
    align-items: center;
  }

  .a-novel-menu-item {
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
    min-block-size: calc(var(--control-height-sm) - var(--size-1));
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
    font-family: var(--font-family-interface);
    user-select: none;
    text-align: start;
  }
  .a-novel-menu-item[data-highlighted] {
    -webkit-backdrop-filter: blur(var(--blur-sm));
    backdrop-filter: blur(var(--blur-sm));
    background: var(--color-surface-glass-hover);
    color: var(--color-navigation-hover-text);
  }
  .a-novel-menu-item.danger {
    color: var(--color-feedback-error-text);
  }
  .a-novel-menu-item.danger[data-highlighted] {
    background: var(--color-feedback-error-surface);
  }
  .a-novel-menu-item[data-disabled] {
    cursor: not-allowed;
    color: var(--color-text-disabled);
  }
  .a-novel-menu-separator {
    margin-block: var(--space-2);
    background: var(--color-border-divider);
    block-size: var(--border-width-thin);
  }
  .trigger-icon,
  .item-icon {
    display: inline-flex;
    flex: none;
  }
  kbd {
    margin-inline-start: auto;
    color: var(--color-text-muted);
    font-size: var(--font-size-xs);
    font-family: var(--font-family-mono);
  }

  @media (forced-colors: active) {
    :global(.a-novel-menu-content) {
      border: var(--border-width-thin) solid CanvasText;
    }
  }
</style>
