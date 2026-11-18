<!--
Renders the copy beside a checkbox, a switch or a radio: its label over its description, dimmed with a disabled
control. Children replace both, as a radio group's rendered option does.
-->
<script lang="ts" module>
  import type { Content } from "../content";

  import type { Snippet } from "svelte";

  /** Props for the copy that names a choice. */
  export interface ChoiceLabelProps {
    /** Names the choice. */
    label?: Content;
    /** Supporting content shown below the label. */
    description?: Content;
    /** Language of the label when it differs from the page's. */
    lang?: string;
    /** Replaces the label and description. */
    children?: Snippet;
  }
</script>

<script lang="ts">
  import RenderContent from "./RenderContent.svelte";

  let { label, description, lang, children }: ChoiceLabelProps = $props();
</script>

{#if children || label || description}
  <span class="copy">
    {#if children}
      {@render children()}
    {:else}
      {#if label}<span class="label" {lang}><RenderContent content={label} /></span>{/if}
      {#if description}<span class="description"><RenderContent content={description} /></span>{/if}
    {/if}
  </span>
{/if}

<style>
  .copy {
    display: grid;
    gap: var(--space-1);
    color: var(--color-text-primary);
  }

  /* A label names one control, so it stays regular: bold is kept for actions and group names. */
  .label {
    font-weight: var(--font-weight-regular);
    font-size: var(--font-size-sm);
    line-height: var(--line-height-compact);
  }

  .description {
    color: var(--color-text-muted);
    font-size: var(--font-size-sm);
    line-height: var(--line-height-compact);
  }

  :global(label:has(> input:disabled)) .copy,
  :global(label:has(> input:disabled)) .description {
    color: var(--color-text-disabled);
  }
</style>
