<script lang="ts" module>
  import type { OpenController } from "./controllers.svelte";

  import type { HTMLDetailsAttributes } from "svelte/elements";

  /** External state contract for a single disclosure. */
  export type DisclosureController = OpenController;

  /** Props for a single native disclosure. */
  export interface DisclosureProps extends Omit<HTMLDetailsAttributes, "open" | "ontoggle"> {
    /** Plain-text disclosure trigger. */
    summary: string;
    /** State owner that decides whether toggle requests take effect. */
    controller: DisclosureController;
  }
</script>

<script lang="ts">
  let { summary, controller, class: className = "", children, ...rest }: DisclosureProps = $props();

  function handleToggle(event: ToggleEvent) {
    const details = event.currentTarget as HTMLDetailsElement;
    const nextOpen = event.newState === "open";
    if (nextOpen === controller.state.open) return;

    if (nextOpen) controller.open();
    else controller.close();
    if (controller.state.open !== nextOpen) queueMicrotask(() => (details.open = controller.state.open));
  }
</script>

<details class="disclosure {className}" open={controller.state.open} ontoggle={handleToggle} {...rest}>
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
