<!--
@component
Composes a compact panel heading, optional explanation, and trailing controls.
Use titleId and descriptionId to label a containing dialog or region.
-->
<script lang="ts" module>
  import type { Content } from "./content";

  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  /** Heading and supporting content for dialogs, popovers, and compact panels. */
  export interface PanelHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, "title" | "children"> {
    /** Visible heading, as text or composed inline content. */
    title: Content;
    /** Short supporting explanation; structured content belongs in the panel body. */
    description?: Content;
    /** Controls beside the title, such as a localized close button. */
    actions?: Snippet;
    /** Identifier for the heading when the parent uses aria-labelledby. */
    titleId?: string;
    /** Identifier for the explanation when the parent uses aria-describedby. */
    descriptionId?: string;
  }
</script>

<script lang="ts">
  import RenderContent from "./Content.svelte";

  let {
    title,
    description,
    actions,
    titleId,
    descriptionId,
    class: className = "",
    ...rest
  }: PanelHeaderProps = $props();
</script>

<div class="header {className}" class:has-actions={Boolean(actions)} {...rest}>
  <h2 id={titleId}><span><RenderContent content={title} /></span></h2>
  {#if actions}<div class="actions">{@render actions()}</div>{/if}
  {#if description}<div class="description" id={descriptionId}><RenderContent content={description} /></div>{/if}
</div>

<style>
  .header {
    display: grid;
    flex: none;
    align-items: start;
    gap: var(--space-2) var(--space-4);
    min-inline-size: 0;
    overflow-wrap: anywhere;
  }
  .has-actions {
    grid-template-columns: minmax(0, 1fr) auto;
  }
  .has-actions h2 {
    min-block-size: var(--control-height-sm);
  }
  .actions {
    display: flex;
    align-self: center;
    gap: var(--space-2);
  }
  h2 {
    display: flex;
    align-items: center;
    margin: 0;
    color: var(--color-text-primary);
    font-size: var(--font-size-xl);
    line-height: var(--line-height-compact);
    font-family: var(--font-family-display);
    text-wrap: balance;
  }
  .description {
    grid-column: 1 / -1;
    color: var(--color-text-muted);
    font-size: var(--font-size-sm);
    line-height: var(--line-height-normal);
  }
</style>
