<script lang="ts" module>
  import type { HTMLAttributes } from "svelte/elements";

  export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    tone?: "neutral" | "brand" | "success" | "warning" | "danger";
  }
</script>

<script lang="ts">
  let { tone = "neutral", class: className = "", children, ...rest }: BadgeProps = $props();
</script>

<span class="badge {tone} {className}" {...rest}>{@render children?.()}</span>

<style>
  .badge {
    display: inline-flex;
    align-items: center;
    border-radius: var(--radius-xl);
    background: var(--badge-surface);
    padding-inline: var(--space-2);
    min-block-size: var(--space-5);
    color: var(--badge-text);
    font-weight: var(--font-weight-bold);
    font-size: var(--font-size-xs);
    line-height: var(--line-height-tight);
    font-family: var(--font-family-interface);
    letter-spacing: var(--letter-spacing-wide);
    text-transform: uppercase;
  }

  .neutral {
    --badge-surface: var(--color-surface-island-strong);
    --badge-text: var(--color-text-secondary);
  }

  .brand {
    --badge-surface: var(--color-feedback-info-surface);
    --badge-text: var(--color-feedback-info-text);
  }

  .success {
    --badge-surface: var(--color-feedback-success-surface);
    --badge-text: var(--color-feedback-success-text);
  }

  .warning {
    --badge-surface: var(--color-feedback-warning-surface);
    --badge-text: var(--color-feedback-warning-text);
  }

  .danger {
    --badge-surface: var(--color-feedback-error-surface);
    --badge-text: var(--color-feedback-error-text);
  }

  @media (forced-colors: active) {
    .badge {
      border: var(--border-width-thin) solid CanvasText;
    }
  }
</style>
