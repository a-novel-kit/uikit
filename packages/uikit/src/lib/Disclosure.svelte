<script lang="ts" module>
  import type { HTMLDetailsAttributes } from "svelte/elements";

  /** Props for a single native disclosure. */
  export interface DisclosureProps extends Omit<HTMLDetailsAttributes, "open"> {
    /** Plain-text disclosure trigger. */
    summary: string;
    /** Current expanded state. */
    open?: boolean;
  }
</script>

<script lang="ts">
  let { summary, open = $bindable(false), class: className = "", children, ...rest }: DisclosureProps = $props();
</script>

<details class="disclosure {className}" bind:open {...rest}>
  <summary>{summary}</summary>
  <div class="content">{@render children?.()}</div>
</details>

<style>
  .disclosure {
    border-block-end: var(--border-width-thin) solid var(--color-border-subtle);
    color: var(--color-text-primary);
  }
  summary {
    cursor: pointer;
    padding: var(--space-3) var(--space-1);
    color: var(--color-text-secondary);
    font-weight: var(--font-weight-bold);
    font-size: var(--font-size-sm);
    font-family: var(--font-family-interface);
  }
  summary:hover {
    color: var(--color-text-primary);
  }
  summary:focus-visible {
    outline: var(--focus-ring-width) solid var(--color-focus-ring);
    outline-offset: var(--focus-ring-offset);
    border-radius: var(--radius-sm);
  }
  .content {
    padding: var(--space-1) var(--space-1) var(--space-4);
    color: var(--color-text-muted);
    line-height: var(--line-height-normal);
  }
  .disclosure[open] summary {
    color: var(--color-text-accent);
  }
</style>
