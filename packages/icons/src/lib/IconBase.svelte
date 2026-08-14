<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { SVGAttributes } from "svelte/elements";

  export interface IconProps extends Omit<SVGAttributes<SVGSVGElement>, "children"> {
    /** Square rendered size. Components inherit surrounding text color. */
    size?: number | string;
    strokeWidth?: number | string;
    /** Use only when the icon has no adjacent visible label. */
    label?: string;
    children: Snippet;
  }
</script>

<script lang="ts">
  let { size = "1em", strokeWidth = 2, label, class: className = "", children, ...rest }: IconProps = $props();

  const titleId = $props.id();
</script>

<svg
  class="icon {className}"
  xmlns="http://www.w3.org/2000/svg"
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width={strokeWidth}
  stroke-linecap="round"
  stroke-linejoin="round"
  role={label ? "img" : undefined}
  aria-hidden={label ? undefined : "true"}
  aria-labelledby={label ? titleId : undefined}
  {...rest}
>
  {#if label}<title id={titleId}>{label}</title>{/if}
  {@render children()}
</svg>

<style>
  .icon {
    display: inline-block;
    flex: none;
    vertical-align: -0.125em;
  }
</style>
