<!--
@component
Announces form errors and links each message to its control.
Mount after validation and enable `focusOnMount` when focus should move to the summary.
-->
<script lang="ts" module>
  import type { Content } from "./content";

  import type { HTMLAttributes } from "svelte/elements";

  /** A validation problem linked to its control. */
  export interface ErrorSummaryItem {
    /** Stable identifier for rendering the error. */
    id: string;
    /** Fragment link to the invalid control. */
    href: string;
    /** Human-readable validation message. */
    message: Content;
  }

  /** Props for a focusable summary of form validation errors. */
  export interface ErrorSummaryProps extends Omit<HTMLAttributes<HTMLElement>, "title" | "children"> {
    /** Summary heading; defaults to the translated "There is a problem". */
    title?: Content;
    /** Optional guidance shown before the error list. */
    description?: Content;
    /** Validation problems linked to their controls. */
    errors: readonly ErrorSummaryItem[];
    /** Semantic level of the generated heading. */
    headingLevel?: 2 | 3 | 4 | 5 | 6;
    /** Focuses once when enabled; defaults to false. Mount after validation to announce the new errors. */
    focusOnMount?: boolean;
  }
</script>

<script lang="ts">
  import RenderContent from "./Content.svelte";
  import FeedbackIcon from "./internal/FeedbackIcon.svelte";
  import { useMessages } from "./internal/i18n";

  import { tick } from "svelte";

  const { t } = useMessages();

  let {
    title = t("errorSummary.title"),
    description,
    errors,
    headingLevel = 2,
    focusOnMount = false,
    class: className = "",
    ...rest
  }: ErrorSummaryProps = $props();

  const summaryId = $props.id();
  const titleId = `${summaryId}-title`;
  let summaryElement: HTMLElement;
  let hasFocused = false;

  $effect(() => {
    if (!focusOnMount || hasFocused) return;
    hasFocused = true;
    void tick().then(() => summaryElement?.focus());
  });
</script>

<section
  bind:this={summaryElement}
  class="error-summary {className}"
  role="alert"
  aria-labelledby={titleId}
  tabindex="-1"
  {...rest}
>
  <FeedbackIcon tone="error" size="sm" />
  <div class="content">
    <svelte:element this={`h${headingLevel}`} id={titleId} class="title"
      ><RenderContent content={title} /></svelte:element
    >
    {#if description}<p><RenderContent content={description} /></p>{/if}
    <ul>
      {#each errors as error (error.id)}
        <li><a href={error.href}><RenderContent content={error.message} /></a></li>
      {/each}
    </ul>
  </div>
</section>

<style>
  .error-summary {
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
    border-radius: var(--radius-md);
    background: var(--color-feedback-error-surface);
    padding-inline: var(--space-4);
    padding-block: var(--space-2);
    color: var(--color-text-primary);
  }

  .error-summary:focus-visible {
    outline: var(--focus-ring-width) solid var(--color-feedback-error-text);
    outline-offset: var(--focus-ring-offset);
  }

  .content {
    display: grid;
    gap: var(--space-1);
    min-inline-size: 0;
    overflow-wrap: anywhere;
  }

  .title,
  p,
  ul {
    margin: 0;
  }

  .title {
    font-weight: var(--font-weight-bold);
    font-size: var(--font-size-sm);
    line-height: var(--line-height-compact);
  }

  p {
    color: var(--color-text-secondary);
    font-size: var(--font-size-xs);
    line-height: var(--line-height-compact);
  }

  ul {
    display: grid;
    gap: var(--space-2);
    padding-inline-start: var(--space-5);
    font-size: var(--font-size-sm);
  }

  a {
    color: var(--color-feedback-error-text);
    font-weight: var(--font-weight-medium);
    text-underline-offset: var(--space-1);
  }

  a:hover {
    color: var(--color-action-danger-hover);
    text-decoration-thickness: var(--border-width-strong);
  }

  a:focus-visible {
    outline: var(--focus-ring-width) solid var(--color-focus-ring);
    outline-offset: var(--focus-ring-offset);
    border-radius: var(--radius-sm);
  }

  @media (forced-colors: active) {
    .error-summary {
      border: var(--border-width-thin) solid CanvasText;
    }
  }
</style>
