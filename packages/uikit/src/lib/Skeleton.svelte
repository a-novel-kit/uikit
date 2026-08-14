<script lang="ts" module>
  import type { HTMLAttributes } from "svelte/elements";

  export interface SkeletonProps extends HTMLAttributes<HTMLSpanElement> {
    shape?: "text" | "rectangle" | "circle";
  }
</script>

<script lang="ts">
  let { shape = "text", class: className = "", ...rest }: SkeletonProps = $props();
</script>

<span class="skeleton {shape} {className}" aria-hidden="true" {...rest}></span>

<style>
  .skeleton {
    display: block;
    animation: shimmer calc(var(--duration-slow) * var(--multiplier-4)) linear infinite;
    background:
      linear-gradient(
        90deg,
        transparent,
        color-mix(in oklab, var(--color-text-muted) var(--color-mix-2), transparent),
        transparent
      ),
      var(--color-surface-overlay);
    background-size: 200% 100%;
    inline-size: 100%;
    min-block-size: var(--space-4);
    overflow: hidden;
  }

  .text {
    border-radius: var(--radius-sm);
    block-size: var(--font-size-sm);
  }
  .rectangle {
    border-radius: var(--radius-md);
    min-block-size: var(--space-16);
  }
  .circle {
    border-radius: var(--radius-round);
    inline-size: var(--control-height-md);
    block-size: var(--control-height-md);
  }
  @keyframes shimmer {
    to {
      background-position-x: -200%;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .skeleton {
      animation: none;
    }
  }
</style>
