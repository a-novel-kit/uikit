<script lang="ts" module>
  import type { Snippet } from "svelte";

  import type { Toolbar as ToolbarTypes } from "bits-ui";

  /** Props for a roving-focus group of three or more related controls. */
  export interface ToolbarProps extends Omit<
    ToolbarTypes.RootProps,
    "aria-label" | "children" | "loop" | "orientation"
  > {
    /** Accessible name for the toolbar. */
    label: string;
    /** Axis along which controls and keyboard navigation are arranged. */
    orientation?: "horizontal" | "vertical";
    /** Wraps keyboard navigation from the last control to the first. */
    loop?: boolean;
    /** Toolbar controls and groups. */
    children: Snippet;
  }
</script>

<script lang="ts">
  import { Toolbar as ToolbarPrimitive } from "bits-ui";

  let {
    label,
    orientation = "horizontal",
    loop = true,
    children,
    class: className = "",
    ...rest
  }: ToolbarProps = $props();
</script>

<ToolbarPrimitive.Root class="toolbar {orientation} {className}" aria-label={label} {orientation} {loop} {...rest}>
  {@render children()}
</ToolbarPrimitive.Root>

<style>
  :global(.toolbar) {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    border-radius: var(--radius-lg);
    background: var(--color-surface-island-subtle);
    padding: var(--space-1);
    max-inline-size: 100%;
  }

  :global(.toolbar.horizontal) {
    flex-flow: row wrap;
  }

  :global(.toolbar.vertical) {
    flex-direction: column;
    align-items: stretch;
  }
</style>
