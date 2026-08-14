<script lang="ts" module>
  import type { Content } from "./content";

  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  export interface BreadcrumbItem {
    label: string;
    href?: string;
  }

  export interface BreadcrumbsProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
    items: BreadcrumbItem[];
    label?: string;
    separator?: Content;
    renderItem?: Snippet<[BreadcrumbItem]>;
  }
</script>

<script lang="ts">
  import RenderContent from "./Content.svelte";

  let {
    items,
    label = "Breadcrumb",
    separator = "/",
    renderItem,
    class: className = "",
    ...rest
  }: BreadcrumbsProps = $props();
</script>

<nav class="breadcrumbs {className}" aria-label={label} {...rest}>
  <ol>
    {#each items as item, index (item.href ?? item.label)}
      <li>
        {#if item.href && index < items.length - 1}
          <a href={item.href}
            >{#if renderItem}{@render renderItem(item)}{:else}{item.label}{/if}</a
          >
        {:else}
          <span aria-current={index === items.length - 1 ? "page" : undefined}
            >{#if renderItem}{@render renderItem(item)}{:else}{item.label}{/if}</span
          >
        {/if}
        {#if index < items.length - 1}<span class="separator" aria-hidden="true"
            ><RenderContent content={separator} /></span
          >{/if}
      </li>
    {/each}
  </ol>
</nav>

<style>
  ol {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2);
    margin: 0;
    padding: 0;
    list-style: none;
  }
  li {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    color: var(--color-text-muted);
    font-size: var(--font-size-sm);
    font-family: var(--font-family-interface);
  }
  .separator {
    color: var(--color-border-strong);
  }
  a {
    color: var(--color-text-secondary);
    text-decoration: none;
  }
  a:hover {
    color: var(--color-text-link-hover);
    text-decoration: underline;
    text-underline-offset: var(--space-1);
  }
  a:focus-visible {
    outline: var(--focus-ring-width) solid var(--color-focus-ring);
    outline-offset: var(--focus-ring-offset);
    border-radius: var(--radius-sm);
  }
  [aria-current="page"] {
    color: var(--color-text-primary);
    font-weight: var(--font-weight-medium);
  }
</style>
