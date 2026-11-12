<!--
@component
Lays out actions at their natural width, side by side at the end of the line, and stacked full width below
35rem. Put the primary action last: source order is kept, so it ends the line on a wide screen and sits under the
thumb on a phone. Use ButtonGroup when the controls also need a named group.
-->
<script lang="ts" module>
  import type { HTMLAttributes } from "svelte/elements";

  /** Responsive layout for composed buttons and links. */
  export type ActionGroupProps = HTMLAttributes<HTMLDivElement>;
</script>

<script lang="ts">
  let { class: className = "", children, ...rest }: ActionGroupProps = $props();
</script>

<div class="actions {className}" {...rest}>
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
      justify-content: flex-end;
      align-items: center;
    }
  }
</style>
