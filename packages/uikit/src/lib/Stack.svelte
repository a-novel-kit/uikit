<!--
@component
Arranges content vertically with tokenized spacing and cross-axis alignment.
-->
<script lang="ts" module>
  import type { LayoutGap } from "./types";

  import type { HTMLAttributes } from "svelte/elements";

  /** Props for a vertical layout with tokenized spacing. */
  export interface StackProps extends HTMLAttributes<HTMLDivElement> {
    /** Space between direct children, expressed on the public spacing scale. */
    gap?: LayoutGap;
    /** Cross-axis alignment. */
    align?: "start" | "center" | "end" | "stretch";
  }
</script>

<script lang="ts">
  let { gap = "4", align = "stretch", class: className = "", children, ...rest }: StackProps = $props();
</script>

<div class="stack {className}" style:--stack-gap="var(--space-{gap})" style:--stack-align={align} {...rest}>
  {@render children?.()}
</div>

<style>
  .stack {
    display: flex;
    flex-direction: column;
    align-items: var(--stack-align);
    gap: var(--stack-gap);
    min-inline-size: 0;
  }
</style>
