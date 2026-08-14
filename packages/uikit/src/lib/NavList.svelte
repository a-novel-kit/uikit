<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  export interface NavigationItem {
    label: string;
    href: string;
    current?: boolean;
    disabled?: boolean;
    badge?: string | number;
    icon?: Snippet;
  }

  export interface NavListProps extends Omit<HTMLAttributes<HTMLUListElement>, "children"> {
    items: NavigationItem[];
    orientation?: "horizontal" | "vertical";
    renderItem?: Snippet<[NavigationItem]>;
  }
</script>

<script lang="ts">
  let { items, orientation = "vertical", renderItem, class: className = "", ...rest }: NavListProps = $props();
</script>

<ul class="nav {orientation} {className}" {...rest}>
  {#each items as item (item.href)}
    <li>
      {#if item.disabled}
        <span class="item" aria-disabled="true">
          {#if item.icon}<span class="icon" aria-hidden="true">{@render item.icon()}</span>{/if}
          <span class="label"
            >{#if renderItem}{@render renderItem(item)}{:else}{item.label}{/if}</span
          >
          {#if item.badge !== undefined}<span class="badge">{item.badge}</span>{/if}
        </span>
      {:else}
        <a class="item" href={item.href} aria-current={item.current ? "page" : undefined}>
          {#if item.icon}<span class="icon" aria-hidden="true">{@render item.icon()}</span>{/if}
          <span class="label"
            >{#if renderItem}{@render renderItem(item)}{:else}{item.label}{/if}</span
          >
          {#if item.badge !== undefined}<span class="badge">{item.badge}</span>{/if}
        </a>
      {/if}
    </li>
  {/each}
</ul>

<style>
  .nav {
    display: flex;
    gap: var(--space-1);
    margin: 0;
    padding: 0;
    font-family: var(--font-family-interface);
    list-style: none;
  }

  .vertical {
    flex-direction: column;
  }
  .horizontal {
    flex-flow: row wrap;
    align-items: center;
  }

  .item {
    display: flex;
    position: relative;
    align-items: center;
    gap: var(--space-2);
    transition:
      background-color var(--duration-fast) var(--easing-standard),
      color var(--duration-fast) var(--easing-standard);
    box-sizing: border-box;
    border: 0;
    border-radius: var(--radius-md);
    padding: var(--space-2) var(--space-3);
    min-block-size: var(--control-height-sm);
    overflow: hidden;
    color: var(--color-navigation-text);
    font-weight: var(--font-weight-medium);
    font-size: var(--font-size-sm);
    line-height: var(--line-height-compact);
    text-decoration: none;
  }

  a.item:hover:not([aria-current="page"]) {
    background: var(--color-navigation-hover-surface);
    color: var(--color-navigation-hover-text);
  }
  a.item:focus-visible {
    outline: var(--focus-ring-width) solid var(--color-focus-ring);
    outline-offset: var(--focus-ring-offset);
  }
  a.item[aria-current="page"] {
    background: var(--color-navigation-selected-surface);
    color: var(--color-navigation-selected-text);
  }
  a.item[aria-current="page"]::before {
    position: absolute;
    inset-block: var(--space-2);
    inset-inline-start: 0;
    box-shadow: var(--shadow-indicator-brand);
    background: var(--color-navigation-selected-indicator);
    inline-size: var(--border-width-strong);
    content: "";
  }
  .horizontal a.item[aria-current="page"]::before {
    inset-block: auto 0;
    inset-inline: var(--space-2);
    inline-size: auto;
    block-size: var(--border-width-strong);
  }

  .item[aria-disabled="true"] {
    cursor: not-allowed;
    color: var(--color-text-disabled);
  }
  .icon {
    display: inline-flex;
    flex: none;
  }
  .label {
    min-inline-size: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .badge {
    margin-inline-start: auto;
    border-radius: var(--radius-round);
    background: var(--color-surface-island-strong);
    padding-inline: var(--space-1-5);
    min-inline-size: var(--space-5);
    color: var(--color-text-secondary);
    font-size: var(--font-size-xs);
    line-height: var(--space-5);
    text-align: center;
  }

  @media (forced-colors: active) {
    a.item[aria-current="page"] {
      outline: var(--border-width-thin) solid CanvasText;
    }
  }
</style>
