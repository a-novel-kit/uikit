<script lang="ts" module>
  import type { ComponentSize } from "./types";

  import type { HTMLAttributes } from "svelte/elements";

  /** Props for an indeterminate loading indicator. */
  export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
    /** Accessible description of the pending work. */
    label: string;
    /** Indicator diameter. */
    size?: ComponentSize;
  }
</script>

<script lang="ts">
  import VisuallyHidden from "./VisuallyHidden.svelte";

  let { label, size = "md", class: className = "", ...rest }: SpinnerProps = $props();
</script>

<span class="spinner {size} {className}" role="status" {...rest}>
  <VisuallyHidden>{label}</VisuallyHidden>
</span>

<style>
  .spinner {
    display: inline-block;
    animation: spin var(--duration-slow) linear infinite;
    box-sizing: border-box;
    border: var(--border-width-strong) solid var(--color-border-default);
    border-radius: var(--radius-round);
    border-block-start-color: var(--color-graphic-brand);
  }

  .sm {
    inline-size: var(--icon-size-sm);
    block-size: var(--icon-size-sm);
  }
  .md {
    inline-size: var(--icon-size-md);
    block-size: var(--icon-size-md);
  }
  .lg {
    inline-size: var(--icon-size-lg);
    block-size: var(--icon-size-lg);
  }
  @keyframes spin {
    to {
      transform: rotate(1turn);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .spinner {
      animation: none;
    }
  }
</style>
