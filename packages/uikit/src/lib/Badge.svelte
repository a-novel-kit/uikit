<!--
@component
Labels a category or status compactly. Use InlineMessage when changes need live announcements.
-->
<script lang="ts" module>
  import type { HTMLAttributes } from "svelte/elements";

  /** Props for a compact categorical label or status. */
  export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    /** Semantic treatment of the badge. */
    tone?: "neutral" | "brand" | "success" | "warning" | "danger";
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
    box-shadow: 0 0 var(--space-3) color-mix(in oklab, var(--badge-accent) var(--color-mix-2), transparent);
    border-radius: var(--radius-sm);
    background: var(--badge-accent);
    padding-inline: var(--space-1-5);
    padding-block: calc(var(--space-1) / var(--multiplier-2));
    inline-size: fit-content;
    max-inline-size: 100%;
    color: var(--color-text-inverse);
    font-weight: var(--font-weight-bold);
    font-size: var(--font-size-xs);
    line-height: var(--line-height-compact);
    font-family: var(--font-family-interface);
    letter-spacing: var(--letter-spacing-normal);
    text-transform: none;
    overflow-wrap: break-word;
  }

  .neutral {
    --badge-accent: var(--color-text-secondary);
  }

  .brand {
    --badge-accent: var(--color-feedback-info-text);
  }

  .success {
    --badge-accent: var(--color-feedback-success-text);
  }

  .warning {
    --badge-accent: var(--color-feedback-warning-text);
  }

  .danger {
    --badge-accent: var(--color-feedback-error-text);
  }

  @media (forced-colors: active) {
    .badge {
      border: var(--border-width-thin) solid CanvasText;
    }
  }
</style>
