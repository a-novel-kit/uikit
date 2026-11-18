<!--
@component
Applies readable editorial typography to semantic article content supplied by the caller.
-->
<script lang="ts" module>
  import type { HTMLAttributes } from "svelte/elements";

  /** Native attributes for a readable long-form content wrapper. */
  export type ProseProps = HTMLAttributes<HTMLElement>;
</script>

<script lang="ts">
  let { class: className = "", children, ...rest }: ProseProps = $props();
</script>

<article class="prose {className}" {...rest}>{@render children?.()}</article>

<style>
  .prose {
    max-inline-size: var(--layout-readable-measure);
    color: var(--color-text-secondary);
    font-size: var(--font-size-lg);
    line-height: var(--line-height-loose);
    font-family: var(--font-family-story);
    text-wrap: pretty;
  }

  .prose > :global(:first-child) {
    margin-block-start: 0;
  }
  .prose > :global(:last-child) {
    margin-block-end: 0;
  }
  .prose :global(h1),
  .prose :global(h2),
  .prose :global(h3) {
    color: var(--color-text-primary);
    line-height: var(--line-height-compact);
    font-family: var(--font-family-display);
    text-wrap: balance;
  }
  /* The browser's heading margins, rounded to whole pixels so the text after a heading stays on them. */
  .prose :global(h1) {
    margin-block: round(0.67em, 1px);
  }
  .prose :global(h2) {
    margin-block: round(0.83em, 1px);
  }
  .prose :global(h3) {
    margin-block: round(1em, 1px);
  }

  .prose :global(a) {
    color: var(--color-text-link);
    text-underline-offset: var(--space-1);
  }
  .prose :global(code) {
    font-size: var(--font-size-sm);
    line-height: var(--line-height-tight);
    font-family: var(--font-family-mono);
  }
  .prose :global(blockquote) {
    margin-inline: 0;
    border-inline-start: var(--border-width-strong) solid var(--color-border-selected);
    padding-inline-start: var(--space-4);
    color: var(--color-text-muted);
  }
</style>
