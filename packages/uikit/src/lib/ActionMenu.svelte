<script lang="ts" module>
  import type { Snippet } from "svelte";

  export interface ActionMenuAction {
    kind?: "action";
    id: string;
    label: string;
    disabled?: boolean;
    tone?: "neutral" | "danger";
    icon?: Snippet;
    shortcut?: string;
    onSelect?: () => void;
  }

  export interface ActionMenuSeparator {
    kind: "separator";
    id: string;
  }

  export type ActionMenuItem = ActionMenuAction | ActionMenuSeparator;

  export interface ActionMenuProps {
    label: string;
    items: ActionMenuItem[];
    triggerText?: string;
    triggerIcon?: Snippet;
    trigger?: Snippet<[Record<string, unknown>]>;
    renderItem?: Snippet<[ActionMenuAction]>;
    open?: boolean;
    align?: "start" | "center" | "end";
    disabled?: boolean;
    class?: string;
  }
</script>

<script lang="ts">
  import { DropdownMenu } from "bits-ui";

  let {
    label,
    items,
    triggerText = "Actions",
    triggerIcon,
    trigger,
    renderItem,
    open = $bindable(false),
    align = "end",
    disabled = false,
    class: className = "",
  }: ActionMenuProps = $props();
</script>

<DropdownMenu.Root bind:open>
  {#if trigger}
    <DropdownMenu.Trigger {disabled}>
      {#snippet child({ props })}
        {@render trigger(props)}
      {/snippet}
    </DropdownMenu.Trigger>
  {:else}
    <DropdownMenu.Trigger class={`agora-menu-trigger ${className}`} type="button" aria-label={label} {disabled}>
      {#if triggerIcon}<span class="trigger-icon" aria-hidden="true">{@render triggerIcon()}</span>{/if}
      {#if triggerText}<span>{triggerText}</span>{/if}
    </DropdownMenu.Trigger>
  {/if}
  <DropdownMenu.Portal>
    <DropdownMenu.Content class="agora-menu-content" {align} sideOffset={8} loop>
      <DropdownMenu.Group class="agora-menu-group" aria-label={label}>
        {#each items as item (item.id)}
          {#if item.kind === "separator"}
            <DropdownMenu.Separator class="agora-menu-separator" />
          {:else}
            <DropdownMenu.Item
              class="agora-menu-item {item.tone === 'danger' ? 'danger' : ''}"
              textValue={item.label}
              disabled={item.disabled}
              onSelect={() => item.onSelect?.()}
            >
              {#if item.icon}<span class="item-icon" aria-hidden="true">{@render item.icon()}</span>{/if}
              <span
                >{#if renderItem}{@render renderItem(item)}{:else}{item.label}{/if}</span
              >
              {#if item.shortcut}<kbd>{item.shortcut}</kbd>{/if}
            </DropdownMenu.Item>
          {/if}
        {/each}
      </DropdownMenu.Group>
    </DropdownMenu.Content>
  </DropdownMenu.Portal>
</DropdownMenu.Root>

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
    transform-origin: var(--bits-dropdown-menu-content-transform-origin);
    z-index: var(--layer-dropdown);
    outline: none;
    box-shadow: var(--shadow-lg);
    border: 0;
    border-radius: var(--radius-lg);
    background: var(--color-surface-island-strong);
    padding: var(--space-1);
    min-inline-size: max(var(--bits-dropdown-menu-anchor-width), calc(var(--space-base) * var(--multiplier-48)));
    max-block-size: min(var(--bits-dropdown-menu-content-available-height), var(--control-menu-max-height));
    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior-block: contain;
    color: var(--color-text-primary);
  }
  :global(.agora-menu-group) {
    display: grid;
    gap: var(--space-1);
  }
  :global(.agora-menu-item) {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    cursor: pointer;
    outline: none;
    border-radius: var(--radius-md);
    padding: var(--space-1) var(--space-3);
    min-block-size: calc(var(--control-height-sm) - var(--space-1));
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
    font-family: var(--font-family-interface);
    user-select: none;
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
