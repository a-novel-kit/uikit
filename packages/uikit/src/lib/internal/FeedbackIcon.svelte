<script lang="ts">
  import Spinner from "../Spinner.svelte";
  import type { ComponentSize, FeedbackState } from "../types";

  import type { Snippet } from "svelte";

  import { CircleAlert, CircleCheck, Info, TriangleAlert } from "@lucide/svelte";

  let { tone, size = "md", children }: { tone: FeedbackState; size?: ComponentSize; children?: Snippet } = $props();
  const icons = { info: Info, success: CircleCheck, warning: TriangleAlert, error: CircleAlert };
  const Icon = $derived(tone === "loading" ? undefined : icons[tone]);
</script>

<span class="mark {tone} {size}" aria-hidden="true">
  {#if children}
    {@render children()}
  {:else if Icon}
    <Icon size="var(--feedback-icon-size)" />
  {:else}
    <Spinner label="" {size} role="presentation" />
  {/if}
</span>

<style>
  .mark {
    display: inline-grid;
    flex: none;
    place-items: center;
    border-radius: var(--radius-round);
    background: var(--feedback-surface);
    inline-size: var(--feedback-mark-size);
    block-size: var(--feedback-mark-size);
    color: var(--feedback-color);
  }
  .sm {
    --feedback-icon-size: var(--icon-size-sm);
    --feedback-mark-size: var(--space-6);
  }
  .md {
    --feedback-icon-size: var(--icon-size-md);
    --feedback-mark-size: var(--space-8);
  }
  .lg {
    --feedback-icon-size: var(--icon-size-lg);
    --feedback-mark-size: var(--space-12);
  }
  .info,
  .loading {
    --feedback-surface: var(--color-feedback-info-surface);
    --feedback-color: var(--color-feedback-info-text);
  }
  .success {
    --feedback-surface: var(--color-feedback-success-surface);
    --feedback-color: var(--color-feedback-success-text);
  }
  .warning {
    --feedback-surface: var(--color-feedback-warning-surface);
    --feedback-color: var(--color-feedback-warning-text);
  }
  .error {
    --feedback-surface: var(--color-feedback-error-surface);
    --feedback-color: var(--color-feedback-error-text);
  }
  @media (forced-colors: active) {
    .mark {
      outline: var(--border-width-thin) solid CanvasText;
    }
  }
</style>
