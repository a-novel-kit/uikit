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

  :global(.prose > :first-child) {
    margin-block-start: 0;
  }
  :global(.prose > :last-child) {
    margin-block-end: 0;
  }
  :global(.prose h1),
  :global(.prose h2),
  :global(.prose h3) {
    color: var(--color-text-primary);
    line-height: var(--line-height-compact);
    font-family: var(--font-family-display);
    text-wrap: balance;
  }

  :global(.prose a) {
    color: var(--color-text-link);
    text-underline-offset: var(--space-1);
  }
  :global(.prose code) {
    font-size: var(--font-size-sm);
    font-family: var(--font-family-mono);
  }
  :global(.prose blockquote) {
    margin-inline: 0;
    border-inline-start: var(--border-width-strong) solid var(--color-border-selected);
    padding-inline-start: var(--space-4);
    color: var(--color-text-muted);
  }
</style>
