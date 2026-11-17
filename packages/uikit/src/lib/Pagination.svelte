<!--
@component
Renders numbered page controls as ghost buttons. The caller updates `currentPage` or supplies URLs through `getHref`.
-->
<script lang="ts" module>
  import type { HTMLAttributes } from "svelte/elements";

  /** Props for navigating a finite set of numbered pages. */
  export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
    /** One-based active page supplied by the caller; use a finite integer within totalPages. */
    currentPage: number;
    /** Number of available pages; supply a positive finite integer. */
    totalPages: number;
    /** Returns an application-owned URL. Without it, controls are buttons. */
    getHref?: (page: number) => string;
    /** Runs for both link and button activation of another in-range page; does not cancel navigation. */
    onPageChange?: (page: number) => void;
    /** Accessible name for the navigation landmark; defaults to the translated "Pagination". */
    label?: string;
  }
</script>

<script lang="ts">
  import Button from "./Button.svelte";
  import { useMessages } from "./internal/i18n";

  const { t } = useMessages();

  let {
    currentPage,
    totalPages,
    getHref,
    onPageChange,
    label = t("pagination.label"),
    class: className = "",
    ...rest
  }: PaginationProps = $props();

  const pages = $derived.by(() => {
    const clampedTotal = Math.max(1, Math.floor(totalPages));
    const clampedCurrent = Math.min(clampedTotal, Math.max(1, Math.floor(currentPage)));
    const visible = new Set([1, clampedTotal, clampedCurrent - 1, clampedCurrent, clampedCurrent + 1]);
    const inRange = [...visible].filter((page) => page >= 1 && page <= clampedTotal).sort((a, b) => a - b);
    const result: Array<number | string> = [];
    let previous = 0;

    for (const page of inRange) {
      if (previous && page - previous > 1) result.push(`ellipsis-${previous}`);
      result.push(page);
      previous = page;
    }

    return result;
  });

  function change(page: number) {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange?.(page);
  }
</script>

<!-- Every control is a small ghost button, and the current page reads as the navigation's current item. -->
{#snippet control(page: number, text: string | number, disabled = false)}
  {@const current = page === currentPage ? "page" : undefined}
  {@const kind = typeof text === "number" ? "page" : ""}
  {#if getHref && !disabled}
    <Button
      variant="ghost"
      tone="neutral"
      size="sm"
      class={kind}
      aria-current={current}
      href={getHref(page)}
      onclick={() => change(page)}>{text}</Button
    >
  {:else}
    <Button
      variant="ghost"
      tone="neutral"
      size="sm"
      class={kind}
      aria-current={current}
      {disabled}
      onclick={() => change(page)}>{text}</Button
    >
  {/if}
{/snippet}

<nav class="pagination {className}" aria-label={label} {...rest}>
  <ul>
    <li>{@render control(currentPage - 1, t("pagination.previous"), currentPage <= 1)}</li>
    {#each pages as page (page)}
      <li>
        {#if typeof page === "string"}
          <span class="ellipsis" aria-hidden="true">…</span>
        {:else}
          {@render control(page, page)}
        {/if}
      </li>
    {/each}
    <li>{@render control(currentPage + 1, t("pagination.next"), currentPage >= totalPages)}</li>
  </ul>
</nav>

<style>
  ul {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-1);
    margin: 0;
    padding: 0;
    list-style: none;
  }
  /* A page number keeps a square's width at least, so one digit still makes a full target. */
  ul :global(.page) {
    min-inline-size: var(--control-height-sm);
  }
  .ellipsis {
    display: inline-grid;
    place-items: center;
    min-inline-size: var(--control-height-sm);
    min-block-size: var(--control-height-sm);
    color: var(--color-text-muted);
  }
</style>
