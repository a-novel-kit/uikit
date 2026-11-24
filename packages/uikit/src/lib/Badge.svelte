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
    box-shadow: 0 0 var(--size-3)
      color-mix(in oklab, var(--badge-glow, var(--badge-ink)) var(--color-mix-2), transparent);
    border-radius: var(--radius-sm);
    background: var(--badge-fill);
    padding-inline: var(--space-2);
    /* off-scale: half a grid step above and below its line stands a badge on the 4px grid */
    padding-block: calc(var(--size-1) / 2);
    inline-size: fit-content;
    max-inline-size: 100%;
    color: var(--badge-ink);
    font: var(--text-tag);
    letter-spacing: var(--letter-spacing-normal);
    text-transform: none;
    overflow-wrap: break-word;
  }

  /* A tone is one of the three hues' pairs, its ink on its tint, under a faint glow of the ink. A success is a
     highlight; a warning and a danger share the accent's magenta. A neutral badge has no light of its own: one veil
     under secondary text, as a chip not chosen. */
  .neutral {
    --badge-fill: var(--color-action-neutral);
    --badge-ink: var(--color-text-secondary);
    --badge-glow: transparent;
  }

  .brand {
    --badge-fill: var(--color-tint-brand);
    --badge-ink: var(--color-ink-brand);
  }

  .accent,
  .warning,
  .danger {
    --badge-fill: var(--color-tint-pressure);
    --badge-ink: var(--color-ink-pressure);
  }

  .highlight,
  .success {
    --badge-fill: var(--color-tint-signal);
    --badge-ink: var(--color-ink-signal);
  }

  @media (forced-colors: active) {
    .badge {
      border: var(--border-width-thin) solid CanvasText;
    }
  }
</style>
