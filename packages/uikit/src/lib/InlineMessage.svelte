<script lang="ts" module>
  import type { FeedbackTone } from "./types";

  import type { HTMLAttributes } from "svelte/elements";

  /** Props for a compact inline status message. */
  export interface InlineMessageProps extends HTMLAttributes<HTMLSpanElement> {
    /** Semantic status conveyed by the message. */
    tone?: FeedbackTone;
  }
</script>

<script lang="ts">
  let { tone = "info", class: className = "", children, ...rest }: InlineMessageProps = $props();
</script>

<span class="message {tone} {className}" role={tone === "error" ? "alert" : "status"} {...rest}>
  {@render children?.()}
</span>

<style>
  .message {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    color: var(--message-color);
    font-size: var(--font-size-sm);
    line-height: var(--line-height-compact);
  }

  .message::before {
    flex: none;
    border-radius: var(--radius-round);
    background: currentColor;
    inline-size: var(--space-2);
    block-size: var(--space-2);
    content: "";
  }

  .info {
    --message-color: var(--color-feedback-info-text);
  }
  .success {
    --message-color: var(--color-feedback-success-text);
  }
  .warning {
    --message-color: var(--color-feedback-warning-text);
  }
  .error {
    --message-color: var(--color-feedback-error-text);
  }
</style>
