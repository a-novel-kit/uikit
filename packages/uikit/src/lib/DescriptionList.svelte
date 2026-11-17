<!--
@component
Renders a description list in up to `columns` columns, one where it has less than 48rem. It takes its parent's full
width. Wrap each related `dt`
and `dd` pair in a `div`.
-->
<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  /** Props for a native description list arranged with shared layout tokens. */
  export interface DescriptionListProps extends Omit<HTMLAttributes<HTMLDListElement>, "children"> {
    /** Maximum number of term-description columns. */
    columns?: 1 | 2 | 3;
    /** Vertical spacing between entries. */
    density?: "compact" | "default";
    /** Term-description pairs, each grouped in a div containing dt and dd elements. */
    children: Snippet;
  }
</script>

<script lang="ts">
  let { columns = 1, density = "default", children, class: className = "", ...rest }: DescriptionListProps = $props();
</script>

<!-- The outer box measures the space the list gets, so its columns follow that width, not the screen's. -->
<div class="container" style:--description-columns={columns}>
  <dl class="description-list {density} {className}" {...rest}>
    {@render children()}
  </dl>
</div>

<style>
  .description-list {
    display: grid;
    grid-template-columns: repeat(var(--description-columns), minmax(0, 1fr));
    gap: var(--space-2);
    margin: 0;
  }

  /* The box measures the width it is given, so it takes its parent's full width, even in a parent that sizes by
     content. */
  .container {
    flex-grow: 1;
    align-self: stretch;
    container-type: inline-size;
  }

  .description-list > :global(div) {
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

  .description-list :global(dt) {
    color: var(--color-text-muted);
    font-weight: var(--font-weight-bold);
    font-size: var(--font-size-sm);
    font-family: var(--font-family-interface);
  }

  .description-list :global(dd) {
    margin: 0;
    color: var(--color-text-primary);
    line-height: var(--line-height-normal);
    overflow-wrap: anywhere;
  }

  @container (width < 48rem) {
    .description-list {
      --description-columns: 1;
    }
  }
</style>
