<script lang="ts" module>
  import type { Content } from "./content";

  import type { HTMLAttributes } from "svelte/elements";

  /** A validation problem linked to its control. */
  export interface ErrorSummaryItem {
    id: string;
    href: string;
    message: Content;
  }

  /** Props for a focusable summary of form validation errors. */
  export interface ErrorSummaryProps extends Omit<HTMLAttributes<HTMLElement>, "title" | "children"> {
    title?: Content;
    description?: Content;
    errors: readonly ErrorSummaryItem[];
    headingLevel?: 2 | 3 | 4 | 5 | 6;
    focusOnMount?: boolean;
  }
</script>

<script lang="ts">
  import RenderContent from "./Content.svelte";

  import { tick } from "svelte";

  let {
    title = "There is a problem",
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
  <svelte:element this={`h${headingLevel}`} id={titleId}><RenderContent content={title} /></svelte:element>
  {#if description}<p><RenderContent content={description} /></p>{/if}
  <ul>
    {#each errors as error (error.id)}
      <li><a href={error.href}><RenderContent content={error.message} /></a></li>
    {/each}
  </ul>
</section>

<style>
  .error-summary {
    display: grid;
    gap: var(--space-3);
    border-radius: var(--radius-lg);
    background: var(--color-feedback-error-surface);
    padding: var(--space-5);
    color: var(--color-text-primary);
  }

  .error-summary:focus-visible {
    outline: var(--focus-ring-width) solid var(--color-feedback-error-text);
    outline-offset: var(--focus-ring-offset);
  }

  :global(.error-summary > h2),
  :global(.error-summary > h3),
  :global(.error-summary > h4),
  :global(.error-summary > h5),
  :global(.error-summary > h6),
  p,
  ul {
    margin: 0;
  }

  :global(.error-summary > h2),
  :global(.error-summary > h3),
  :global(.error-summary > h4),
  :global(.error-summary > h5),
  :global(.error-summary > h6) {
    color: var(--color-feedback-error-text);
    font-size: var(--font-size-lg);
    font-family: var(--font-family-display);
  }

  p {
    color: var(--color-text-secondary);
    line-height: var(--line-height-normal);
  }

  ul {
    display: grid;
    gap: var(--space-2);
    padding-inline-start: var(--space-5);
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
