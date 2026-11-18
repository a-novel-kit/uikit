<!--
@component
Presents centered loading or outcome feedback with a heading and optional actions.
The surrounding layout owns page height and vertical centering. Errors use an alert live region;
other tones use status. Override `role` for static content.
-->
<script lang="ts" module>
  import type { Content } from "./content";
  import type { FeedbackState } from "./types";

  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  /** Props for centered loading or outcome feedback in a page or dialog. */
  export interface StatusStateProps extends Omit<HTMLAttributes<HTMLDivElement>, "title" | "children"> {
    /** Status conveyed by the graphic and live region. */
    tone?: FeedbackState;
    /** Primary status message. */
    title: Content;
    /** Supporting guidance that adds information to the title. */
    description?: Content;
    /** Heading level within the surrounding document. */
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
    /** Recovery or continuation controls. */
    actions?: Snippet;
  }
</script>

<script lang="ts">
  import FeedbackIcon from "./internal/FeedbackIcon.svelte";
  import RenderContent from "./internal/RenderContent.svelte";

  let {
    tone = "info",
    title,
    description,
    headingLevel = 2,
    actions,
    class: className = "",
    ...rest
  }: StatusStateProps = $props();
</script>

<div class="status {className}" role={tone === "error" ? "alert" : "status"} {...rest}>
  <FeedbackIcon {tone} size="lg" />
  <div class="copy">
    <svelte:element this={`h${headingLevel}`} class="title"><RenderContent content={title} /></svelte:element>
    {#if description}<p><RenderContent content={description} /></p>{/if}
  </div>
  {#if actions}<div class="actions">{@render actions()}</div>{/if}
</div>

<style>
  /* A page centers its state, so an even height splits the space around it into whole pixels on an even viewport,
     and its text stays on them. A browser without calc-size keeps the auto height. */
  .status {
    display: grid;
    justify-items: center;
    gap: var(--space-4);
    min-inline-size: 0;
    block-size: calc-size(auto, round(up, size, 2px));
    text-align: center;
    overflow-wrap: anywhere;
  }
  .copy {
    display: grid;
    justify-items: center;
    gap: var(--space-2);
    min-inline-size: 0;
  }
  .title,
  p {
    margin: 0;
    max-inline-size: var(--layout-readable-measure);
  }
  .title {
    color: var(--color-text-primary);
    font-weight: var(--font-weight-bold);
    font-size: var(--font-size-lg);
    line-height: var(--line-height-compact);
  }
  p {
    color: var(--color-text-secondary);
    line-height: var(--line-height-normal);
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--space-2);
    margin-block-start: var(--space-1);
    max-inline-size: 100%;
  }
</style>
