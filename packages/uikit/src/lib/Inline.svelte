<!--
@component
Arranges content horizontally with tokenized spacing. Enable `wrap` for narrow containers.
-->
<script lang="ts" module>
  import type { LayoutGap } from "./types";

  import type { HTMLAttributes } from "svelte/elements";

  /** Props for a horizontal layout with optional wrapping and tokenized spacing. */
  export interface InlineProps extends HTMLAttributes<HTMLDivElement> {
    /** Space between direct children, expressed on the public spacing scale. */
    gap?: LayoutGap;
    /** Cross-axis alignment. */
    align?: "start" | "center" | "end" | "stretch";
    /** Main-axis distribution. */
    justify?: "start" | "center" | "end" | "between";
    /** Allows children to wrap when the container narrows; defaults to false. */
    wrap?: boolean;
  }
</script>

<script lang="ts">
  let {
    gap = "2",
    align = "center",
    justify = "start",
    wrap = false,
    class: className = "",
    children,
    ...rest
  }: InlineProps = $props();
</script>

<div
  class="inline {className}"
  class:wrap
  style:--inline-gap="var(--space-{gap})"
  style:--inline-align={align}
  style:--inline-justify={justify === "between" ? "space-between" : justify}
  {...rest}
>
  {@render children?.()}
</div>

<style>
  .inline {
    display: flex;
    flex-direction: row;
    justify-content: var(--inline-justify);
    align-items: var(--inline-align);
    gap: var(--inline-gap);
    min-inline-size: 0;
  }

  .wrap {
    flex-wrap: wrap;
  }
</style>
