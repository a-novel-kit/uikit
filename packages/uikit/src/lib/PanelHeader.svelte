<!--
@component
Composes a compact panel heading, optional explanation, and trailing controls.
Use titleId and descriptionId to label a containing dialog or region. `Section` composes it over a group of content.
-->
<script lang="ts" module>
  import type { Content } from "./content";

  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  /** Heading and supporting content for dialogs and compact panels. */
  export interface PanelHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, "title" | "children"> {
    /** Visible heading, as text or composed inline content. */
    title: Content;
    /** Short supporting explanation; structured content belongs in the panel body. */
    description?: Content;
    /** Controls beside the title, such as a localized close button. */
    actions?: Snippet;
    /** Semantic level of the heading, which also steps its size down; defaults to 2. */
    headingLevel?: 2 | 3 | 4;
    /** Identifier for the heading when the parent uses aria-labelledby. */
    titleId?: string;
    /** Identifier for the explanation when the parent uses aria-describedby. */
    descriptionId?: string;
  }
</script>

<script lang="ts">
  import RenderContent from "./internal/RenderContent.svelte";

  let {
    title,
    description,
    actions,
    headingLevel = 2,
    titleId,
    descriptionId,
    class: className = "",
    ...rest
  }: PanelHeaderProps = $props();
</script>

<div class="header {className}" class:has-actions={Boolean(actions)} {...rest}>
  <svelte:element this={`h${headingLevel}`} class="title level-{headingLevel}" id={titleId}>
    <span><RenderContent content={title} /></span>
  </svelte:element>
  {#if actions}<div class="actions">{@render actions()}</div>{/if}
  {#if description}<div class="description" id={descriptionId}><RenderContent content={description} /></div>{/if}
</div>

<style>
  .header {
    display: grid;
    flex: none;
    align-items: center;
    gap: var(--space-2) var(--space-4);
    min-inline-size: 0;
    overflow-wrap: anywhere;
  }
  .has-actions {
    grid-template-columns: minmax(0, 1fr) auto;
  }
  .has-actions .title {
    min-block-size: var(--control-height-sm);
  }
  .actions {
    display: flex;
    gap: var(--space-3);
  }
  .title {
    display: flex;
    align-items: center;
    margin: 0;
    color: var(--color-text-primary);
    font: var(--text-title);
    text-wrap: balance;
  }
  .level-3 {
    font: var(--text-title-sm);
  }
  .level-4 {
    font: var(--text-title-xs);
  }
  .description {
    grid-column: 1 / -1;
    color: var(--color-text-secondary);
    font: var(--text-body-sm);
  }
</style>
