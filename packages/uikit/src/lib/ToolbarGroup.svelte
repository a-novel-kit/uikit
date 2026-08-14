<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  /** Props for naming a related subset of controls inside a Toolbar. */
  export interface ToolbarGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    /** Accessible name for the control subset. */
    label: string;
    /** Related toolbar controls. */
    children: Snippet;
  }
</script>

<script lang="ts">
  let { label, children, class: className = "", ...rest }: ToolbarGroupProps = $props();
</script>

<div class="toolbar-group {className}" role="group" aria-label={label} {...rest}>
  {@render children()}
</div>

<style>
  .toolbar-group {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
  }
</style>
