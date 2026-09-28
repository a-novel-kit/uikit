<!--
@component
Lays out actions at their natural width on desktop and stacked full width below 35rem.
Preserves source order. Use ButtonGroup when the controls also need a named group.
-->
<script lang="ts" module>
  import type { HTMLAttributes } from "svelte/elements";

  /** Responsive layout for composed buttons and links. */
  export interface ActionGroupProps extends HTMLAttributes<HTMLDivElement> {
    /** Alignment on wider viewports; defaults to start. */
    align?: "start" | "end";
  }
</script>

<script lang="ts">
  let { align = "start", class: className = "", children, ...rest }: ActionGroupProps = $props();
</script>

<div class="actions {align} {className}" {...rest}>
  {@render children?.()}
</div>

<style>
  .actions {
    display: grid;
    gap: var(--space-3);
    min-inline-size: 0;
  }
  @media (min-width: 35rem) {
    .actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
    }
    .end {
      justify-content: flex-end;
    }
  }
</style>
