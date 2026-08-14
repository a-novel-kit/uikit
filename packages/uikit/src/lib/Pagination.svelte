<script lang="ts" module>
  import type { HTMLAttributes } from "svelte/elements";

  export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
    currentPage: number;
    totalPages: number;
    /** Returns an application-owned URL. Without it, controls are buttons. */
    getHref?: (page: number) => string;
    onPageChange?: (page: number) => void;
    label?: string;
  }
</script>

<script lang="ts">
  let {
    currentPage,
    totalPages,
    getHref,
    onPageChange,
    label = "Pagination",
    class: className = "",
    ...rest
  }: PaginationProps = $props();

  const pages = $derived.by(() => {
    const clampedTotal = Math.max(1, Math.floor(totalPages));
    const clampedCurrent = Math.min(clampedTotal, Math.max(1, Math.floor(currentPage)));
    const visible = new Set([1, clampedTotal, clampedCurrent - 1, clampedCurrent, clampedCurrent + 1]);
    const result: Array<number | string> = [];
    let previous = 0;

    for (const page of [...visible].filter((page) => page >= 1 && page <= clampedTotal).sort((a, b) => a - b)) {
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

<nav class="pagination {className}" aria-label={label} {...rest}>
  <ul>
    <li>
      {#if getHref}
        {#if currentPage <= 1}
          <span class="control text" aria-disabled="true">Previous</span>
        {:else}
          <a class="control text" href={getHref(currentPage - 1)} onclick={() => change(currentPage - 1)}>Previous</a>
        {/if}
      {:else}
        <button class="control text" type="button" disabled={currentPage <= 1} onclick={() => change(currentPage - 1)}
          >Previous</button
        >
      {/if}
    </li>
    {#each pages as page (page)}
      <li>
        {#if typeof page === "string"}
          <span class="ellipsis" aria-hidden="true">…</span>
        {:else if getHref}
          <a
            class="control"
            href={getHref(page)}
            aria-current={page === currentPage ? "page" : undefined}
            onclick={() => change(page)}>{page}</a
          >
        {:else}
          <button
            class="control"
            type="button"
            aria-current={page === currentPage ? "page" : undefined}
            onclick={() => change(page)}>{page}</button
          >
        {/if}
      </li>
    {/each}
    <li>
      {#if getHref}
        {#if currentPage >= totalPages}
          <span class="control text" aria-disabled="true">Next</span>
        {:else}
          <a class="control text" href={getHref(currentPage + 1)} onclick={() => change(currentPage + 1)}>Next</a>
        {/if}
      {:else}
        <button
          class="control text"
          type="button"
          disabled={currentPage >= totalPages}
          onclick={() => change(currentPage + 1)}>Next</button
        >
      {/if}
    </li>
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
  .control {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    box-sizing: border-box;
    border: var(--border-width-thin) solid transparent;
    border-radius: var(--radius-md);
    background: transparent;
    padding-inline: var(--space-2);
    min-inline-size: var(--control-height-sm);
    min-block-size: var(--control-height-sm);
    color: var(--color-text-secondary);
    font: inherit;
    font-size: var(--font-size-sm);
    font-family: var(--font-family-interface);
    text-decoration: none;
  }
  .text {
    padding-inline: var(--space-3);
  }
  .control:hover:not([aria-disabled="true"]):not(:disabled) {
    background: var(--color-action-ghost-hover);
    color: var(--color-text-primary);
  }
  .control:focus-visible {
    outline: var(--focus-ring-width) solid var(--color-focus-ring);
    outline-offset: var(--focus-ring-offset);
  }
  .control[aria-current="page"] {
    box-shadow: var(--shadow-glow-brand);
    border-color: var(--color-navigation-selected-indicator);
    background: var(--color-navigation-selected-surface);
    color: var(--color-navigation-selected-text);
  }
  .control[aria-disabled="true"],
  .control:disabled {
    cursor: not-allowed;
    pointer-events: none;
    color: var(--color-text-disabled);
  }
  .ellipsis {
    display: inline-grid;
    place-items: center;
    min-inline-size: var(--control-height-sm);
    min-block-size: var(--control-height-sm);
    color: var(--color-text-muted);
  }
</style>
