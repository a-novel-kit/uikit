<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  /** Props for a native description list arranged with shared layout tokens. */
  export interface DescriptionListProps extends Omit<HTMLAttributes<HTMLDListElement>, "children"> {
    /** Maximum number of term-description columns. */
    columns?: 1 | 2 | 3;
    /** Vertical spacing between entries. */
    density?: "compact" | "default";
    /** Native term and description content. */
    children: Snippet;
  }
</script>

<script lang="ts">
  let { columns = 1, density = "default", children, class: className = "", ...rest }: DescriptionListProps = $props();
</script>

<dl class="description-list columns-{columns} {density} {className}" {...rest}>
  {@render children()}
</dl>

<style>
  .description-list {
    display: grid;
    grid-template-columns: repeat(var(--description-columns), minmax(0, 1fr));
    gap: var(--space-2);
    margin: 0;
  }

  .columns-1 {
    --description-columns: 1;
  }
  .columns-2 {
    --description-columns: 2;
  }
  .columns-3 {
    --description-columns: 3;
  }

  :global(.description-list > div) {
    display: grid;
    align-content: start;
    gap: var(--space-1);
    border-radius: var(--radius-md);
    background: var(--color-surface-island-subtle);
    padding: var(--description-padding);
    min-inline-size: 0;
  }

  .compact {
    --description-padding: var(--space-3);
  }

  .default {
    --description-padding: var(--space-4);
  }

  :global(.description-list dt) {
    color: var(--color-text-muted);
    font-weight: var(--font-weight-medium);
    font-size: var(--font-size-sm);
    font-family: var(--font-family-interface);
  }

  :global(.description-list dd) {
    margin: 0;
    color: var(--color-text-primary);
    line-height: var(--line-height-normal);
    overflow-wrap: anywhere;
  }

  @media (max-width: 48rem) {
    .description-list {
      --description-columns: 1;
    }
  }
</style>
