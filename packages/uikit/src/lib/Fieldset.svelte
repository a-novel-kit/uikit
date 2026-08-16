<script lang="ts" module>
  import type { Content } from "./content";

  import type { HTMLFieldsetAttributes } from "svelte/elements";

  /** Props for a native group of related form controls. */
  export interface FieldsetProps extends HTMLFieldsetAttributes {
    /** Optional fieldset legend. */
    legend?: Content;
    /** Supporting content shown after the legend. */
    description?: Content;
  }
</script>

<script lang="ts">
  import RenderContent from "./Content.svelte";

  let { legend, description, class: className = "", children, ...rest }: FieldsetProps = $props();
</script>

<fieldset class="fieldset {className}" {...rest}>
  {#if legend}<legend><RenderContent content={legend} /></legend>{/if}
  {#if description}<div class="description"><RenderContent content={description} /></div>{/if}
  <div class="content">{@render children?.()}</div>
</fieldset>

<style>
  .fieldset {
    display: grid;
    gap: var(--space-3);
    margin: 0;
    border: 0;
    border-radius: var(--radius-lg);
    background: var(--color-surface-island-subtle);
    padding: var(--space-4);
    min-inline-size: 0;
  }

  legend {
    padding: 0;
    color: var(--color-text-primary);
    font-weight: var(--font-weight-bold);
    font-size: var(--font-size-md);
  }

  .description {
    margin: 0;
    color: var(--color-text-muted);
    font-size: var(--font-size-sm);
    line-height: var(--line-height-normal);
  }

  .content {
    display: grid;
    gap: var(--space-3);
  }

  @media (forced-colors: active) {
    .fieldset {
      border: var(--border-width-thin) solid CanvasText;
    }
  }
</style>
