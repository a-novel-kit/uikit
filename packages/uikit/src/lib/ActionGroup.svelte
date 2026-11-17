<!--
@component
Lays out actions at their natural width, side by side at the end of the line, and stacked full width where it has
less than 35rem, as on a phone or in a small dialog. Put the primary action last: source order is kept, so it ends
the line when there is room and sits under the thumb on a phone. Use ButtonGroup when the controls also need a
named group. It takes its parent's full width.
-->
<script lang="ts" module>
  import type { HTMLAttributes } from "svelte/elements";

  /** Responsive layout for composed buttons and links. */
  export type ActionGroupProps = HTMLAttributes<HTMLDivElement>;
</script>

<script lang="ts">
  let { class: className = "", children, ...rest }: ActionGroupProps = $props();
</script>

<!-- The outer box measures the space the actions get, so they stack by that width, not the screen's. -->
<div class="group {className}" {...rest}>
  <div class="actions">
    {@render children?.()}
  </div>
</div>

<style>
  /* The box measures the width it is given, so it takes its parent's full width: in a parent that sizes by content,
     such as an end-aligned Stack or an Inline beside a heading, a measuring box would otherwise shrink to nothing. */
  .group {
    flex-grow: 1;
    align-self: stretch;
    container-type: inline-size;
    min-inline-size: 0;
  }
  .actions {
    display: grid;
    gap: var(--space-3);
  }
  @container (width >= 35rem) {
    .actions {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      align-items: center;
    }
  }
</style>
