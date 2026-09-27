<!--
@component
Presents prominent feedback with an optional message and actions.
Errors use an alert live region; other tones use status. Override `role` for static content.
-->
<script lang="ts" module>
  import type { Content } from "./content";
  import type { FeedbackState } from "./types";

  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  /** Props for a prominent status message with optional actions. */
  export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
    /** Semantic status conveyed by the alert. */
    tone?: FeedbackState;
    /** Alert heading. */
    title: Content;
    /** Replaces the default status graphic. */
    icon?: Snippet;
    /** Optional controls rendered after the message. */
    actions?: Snippet;
  }
</script>

<script lang="ts">
  import RenderContent from "./Content.svelte";
  import FeedbackIcon from "./internal/FeedbackIcon.svelte";

  let { tone = "info", title, icon, actions, class: className = "", children, ...rest }: AlertProps = $props();

  const liveRole = $derived(tone === "error" ? "alert" : "status");
</script>

<div class="alert {tone} {className}" role={liveRole} {...rest}>
  <FeedbackIcon {tone} children={icon} />
  <div class="content">
    <strong><RenderContent content={title} /></strong>
    {#if children}<div class="message">{@render children()}</div>{/if}
    {#if actions}<div class="actions">{@render actions()}</div>{/if}
  </div>
</div>

<style>
  .alert {
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
    border-radius: var(--radius-lg);
    border-inline-start: var(--border-width-strong) solid var(--alert-accent);
    background: var(--alert-surface);
    padding-inline: var(--space-4);
    padding-block: var(--space-4);
    color: var(--color-text-primary);
    overflow-wrap: anywhere;
  }

  .info,
  .loading {
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

  .content {
    display: grid;
    align-self: center;
    gap: var(--space-2);
    min-inline-size: 0;
  }
  strong {
    font-size: var(--font-size-sm);
    line-height: var(--line-height-compact);
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
