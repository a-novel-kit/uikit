<script lang="ts" module>
  import type { Content } from "./content";

  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  export interface PageHeaderProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
    title: Content;
    description?: Content;
    eyebrow?: Content;
    actions?: Snippet;
    as?: "header" | "div";
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  }
</script>

<script lang="ts">
  import RenderContent from "./Content.svelte";

  let {
    title,
    description,
    eyebrow,
    actions,
    as = "header",
    headingLevel = 1,
    class: className = "",
    ...rest
  }: PageHeaderProps = $props();
</script>

<svelte:element this={as} class="page-header {className}" {...rest}>
  <div class="copy">
    {#if eyebrow}<p class="eyebrow"><RenderContent content={eyebrow} /></p>{/if}
    <svelte:element this={`h${headingLevel}`} class="title"><RenderContent content={title} /></svelte:element>
    {#if description}<p class="description"><RenderContent content={description} /></p>{/if}
  </div>
  {#if actions}<div class="actions">{@render actions()}</div>{/if}
</svelte:element>

<style>
  .page-header {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: flex-end;
    gap: var(--space-6);
    padding-block: var(--space-4);
    min-inline-size: 0;
  }

  .copy {
    display: grid;
    gap: var(--space-2);
    min-inline-size: 0;
    max-inline-size: var(--layout-readable-measure);
  }

  .title,
  p {
    margin: 0;
  }

  .title {
    color: var(--color-text-primary);
    font-size: clamp(var(--font-size-2xl), 4vw, var(--font-size-4xl));
    line-height: var(--line-height-tight);
    font-family: var(--font-family-display);
    letter-spacing: var(--letter-spacing-tight);
  }

  .eyebrow {
    color: var(--color-text-accent);
    font-weight: var(--font-weight-bold);
    font-size: var(--font-size-xs);
    font-family: var(--font-family-mono);
    letter-spacing: var(--letter-spacing-wide);
    text-transform: uppercase;
  }

  .description {
    color: var(--color-text-muted);
    font-size: var(--font-size-md);
    line-height: var(--line-height-normal);
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }
</style>
