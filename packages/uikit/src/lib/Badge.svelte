<!--
@component
Labels a category or status compactly. Use InlineMessage when changes need live announcements.
-->
<script lang="ts" module>
  import type { HTMLAttributes } from "svelte/elements";

  /** Props for a compact categorical label or status. */
  export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    /** Semantic treatment of the badge. `accent` sets a distinction apart in magenta, rarer than `brand`. */
    tone?: "neutral" | "brand" | "accent" | "highlight" | "success" | "warning" | "danger";
  }
</script>

<script lang="ts">
  let { tone = "neutral", class: className = "", children, ...rest }: BadgeProps = $props();
</script>

<span class="badge {tone} {className}" {...rest}>{@render children?.()}</span>

<style>
  .badge {
    display: inline-block;
    box-sizing: border-box;
    box-shadow: 0 0 var(--size-3) color-mix(in oklab, var(--badge-fill) var(--color-mix-2), transparent);
    border-radius: var(--radius-sm);
    background: var(--badge-fill);
    padding-inline: var(--size-1-5);
    padding-block: calc(var(--size-1) / var(--multiplier-2));
    inline-size: fit-content;
    max-inline-size: 100%;
    color: var(--color-label-text);
    font-weight: var(--font-weight-regular);
    font-size: var(--font-size-xs);
    line-height: var(--line-height-compact);
    font-family: var(--font-family-interface);
    letter-spacing: var(--letter-spacing-normal);
    text-transform: none;
    overflow-wrap: break-word;
  }

  .neutral {
    --badge-fill: var(--color-label-neutral);
  }

  .brand {
    --badge-fill: var(--color-label-brand);
  }

  .accent {
    --badge-fill: var(--color-label-accent);
  }

  .highlight {
    --badge-fill: var(--color-label-highlight);
  }

  .success {
    --badge-fill: var(--color-label-success);
  }

  .warning {
    --badge-fill: var(--color-label-warning);
  }

  .danger {
    --badge-fill: var(--color-label-danger);
  }

  @media (forced-colors: active) {
    .badge {
      border: var(--border-width-thin) solid CanvasText;
    }
  }
</style>
