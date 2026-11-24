<!--
@component
Groups related native form controls with an optional legend and supporting description.
-->
<script lang="ts" module>
  import type { Content } from "./content";

  import type { HTMLFieldsetAttributes } from "svelte/elements";

  /** Props for a native group of related form controls. */
  export interface FieldsetProps extends HTMLFieldsetAttributes {
    /** Fieldset legend. */
    legend?: Content;
    /** Supporting content shown after the legend. */
    description?: Content;
  }
</script>

<script lang="ts">
  import RenderContent from "./internal/RenderContent.svelte";

  let { legend, description, class: className = "", children, ...rest }: FieldsetProps = $props();
</script>

<fieldset class="fieldset {className}" data-island {...rest}>
  {#if legend}<legend><RenderContent content={legend} /></legend>{/if}
  {#if description}<div class="description"><RenderContent content={description} /></div>{/if}
  <div class="content">{@render children?.()}</div>
</fieldset>

<style>
  .fieldset {
    display: grid;
    gap: var(--space-2);
    margin: 0;
    border: 0;
    border-radius: var(--radius-lg);
    background: var(--color-surface-island-subtle);
    padding: var(--space-4);
    min-inline-size: 0;
  }

  /* A browser sets a legend on its fieldset's top edge, half outside the island's tone. Floated, it lays out as the
     island's first row instead. */
  legend {
    float: inline-start;
    padding: 0;
    color: var(--color-text-primary);
    font: var(--text-ui-strong);
  }

  .description {
    margin: 0;
    color: var(--color-text-secondary);
    font: var(--text-body-sm);
  }

  /* With the grid's gap, the content sits a sibling's distance under the group's name and explanation. */
  .content {
    display: grid;
    gap: var(--space-4);
    margin-block-start: var(--space-2);
  }

  @media (forced-colors: active) {
    .fieldset {
      border: var(--border-width-thin) solid CanvasText;
    }
  }
</style>
