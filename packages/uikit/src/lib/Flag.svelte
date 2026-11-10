<!--
@component
The flag that marks a language, at an icon's size. English takes the United States' flag.
With a `label`, the flag is an image of that name. Without one it is decorative, for a flag beside the language's name.
-->
<script lang="ts" module>
  import type { SVGAttributes } from "svelte/elements";

  /** Props for the flag that marks a language. */
  export interface FlagProps extends SVGAttributes<SVGSVGElement> {
    /** The language the flag marks. */
    locale: "en" | "fr";
    /** Accessible name of the flag, such as the language's name. Omit it when text beside the flag names the language. */
    label?: string;
  }
</script>

<script lang="ts">
  let { locale, label, class: className = "", ...rest }: FlagProps = $props();

  // Thirteen stripes, red at the top and the bottom.
  const stripeHeight = 20 / 13;
  const redStripes = [0, 2, 4, 6, 8, 10, 12];
</script>

<!-- A flag is an image, so it keeps its own colors. -->
<svg
  class="flag {className}"
  viewBox="0 0 30 20"
  preserveAspectRatio="xMidYMid slice"
  role={label ? "img" : undefined}
  aria-hidden={label ? undefined : "true"}
  {...rest}
>
  {#if label}<title>{label}</title>{/if}
  {#if locale === "fr"}
    <rect width="10" height="20" fill="oklch(0.4537 0.1453 254.19)" />
    <rect x="10" width="10" height="20" fill="oklch(1 0 0)" />
    <rect x="20" width="10" height="20" fill="oklch(0.6323 0.2123 28.65)" />
  {:else}
    <rect width="30" height="20" fill="oklch(1 0 0)" />
    {#each redStripes as stripe (stripe)}
      <rect y={stripe * stripeHeight} width="30" height={stripeHeight} fill="oklch(0.4992 0.1781 20.69)" />
    {/each}
    <rect width="12" height={7 * stripeHeight} fill="oklch(0.3794 0.0855 282.41)" />
  {/if}
</svg>

<style>
  .flag {
    display: block;
    flex: none;
    /* A light hairline, so a flag's dark edge stays apart from the dark page. */
    box-shadow: 0 0 0 var(--border-width-thin) var(--color-border-strong);
    border-radius: var(--radius-sm);
    inline-size: var(--icon-size-md);
    block-size: var(--icon-size-sm);
  }
</style>
