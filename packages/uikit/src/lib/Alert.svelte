<script lang="ts" module>
  import type { Content } from "./content";
  import type { FeedbackTone } from "./types";

  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  /** Props for a prominent status message with optional actions. */
  export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
    /** Semantic status conveyed by the alert. */
    tone?: FeedbackTone;
    /** Alert heading. */
    title: Content;
    /** Optional leading graphic. */
    icon?: Snippet;
    /** Optional controls rendered after the message. */
    actions?: Snippet;
  }
</script>

<script lang="ts">
  import RenderContent from "./Content.svelte";

  let { tone = "info", title, icon, actions, class: className = "", children, ...rest }: AlertProps = $props();

  const liveRole = $derived(tone === "error" ? "alert" : "status");
</script>

<div class="alert {tone} {className}" role={liveRole} {...rest}>
  {#if icon}<div class="icon" aria-hidden="true">{@render icon()}</div>{/if}
  <div class="content">
    <strong><RenderContent content={title} /></strong>
    <div class="message">{@render children?.()}</div>
    {#if actions}<div class="actions">{@render actions()}</div>{/if}
  </div>
</div>

<style>
  .alert {
    display: flex;
    position: relative;
    gap: var(--space-3);
    border-radius: var(--radius-lg);
    background: var(--alert-surface);
    padding-inline: var(--space-5) var(--space-4);
    padding-block: var(--space-4);
    overflow: clip;
    color: var(--color-text-primary);
  }

  .alert::before {
    position: absolute;
    inset-block: 0;
    inset-inline-start: 0;
    background: var(--alert-accent);
    inline-size: var(--border-width-strong);
    content: "";
  }

  .info {
    --alert-surface: var(--color-feedback-info-surface);
    --alert-accent: var(--color-feedback-info-text);
  }

  .success {
    --alert-surface: var(--color-feedback-success-surface);
    --alert-accent: var(--color-feedback-success-text);
  }

  .warning {
    --alert-surface: var(--color-feedback-warning-surface);
    --alert-accent: var(--color-feedback-warning-text);
  }

  .error {
    --alert-surface: var(--color-feedback-error-surface);
    --alert-accent: var(--color-feedback-error-text);
  }

  .icon {
    flex: none;
    color: var(--alert-accent);
  }
  .content {
    display: grid;
    gap: var(--space-2);
    min-inline-size: 0;
  }
  strong {
    color: var(--alert-accent);
    font-size: var(--font-size-sm);
  }
  .message {
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
    line-height: var(--line-height-normal);
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin-block-start: var(--space-1);
  }

  @media (forced-colors: active) {
    .alert {
      border: var(--border-width-thin) solid CanvasText;
    }
  }
</style>
