<script lang="ts" module>
  import type { Content } from "./content";

  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
    title: Content;
    description?: Content;
    illustration?: Snippet;
    actions?: Snippet;
  }
</script>

<script lang="ts">
  import RenderContent from "./Content.svelte";

  let { title, description, illustration, actions, class: className = "", ...rest }: EmptyStateProps = $props();
</script>

<div class="empty {className}" {...rest}>
  {#if illustration}<div class="illustration" aria-hidden="true">{@render illustration()}</div>{/if}
  <h2><RenderContent content={title} /></h2>
  {#if description}<p><RenderContent content={description} /></p>{/if}
  {#if actions}<div class="actions">{@render actions()}</div>{/if}
</div>

<style>
  .empty {
    display: grid;
    justify-items: center;
    gap: var(--space-3);
    padding: var(--space-12) var(--layout-gutter);
    text-align: center;
  }

  .illustration {
    color: var(--color-graphic-brand);
  }
  h2 {
    margin: 0;
    color: var(--color-text-primary);
    font-size: var(--font-size-2xl);
    font-family: var(--font-family-display);
  }
  p {
    margin: 0;
    max-inline-size: var(--layout-readable-measure);
    color: var(--color-text-muted);
    line-height: var(--line-height-normal);
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--space-2);
    margin-block-start: var(--space-2);
  }
</style>
