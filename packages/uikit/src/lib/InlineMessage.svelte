<!--
@component
Announces compact feedback with a status graphic. Errors use an alert live region;
other tones use status. Override `role` for static content.
-->
<script lang="ts" module>
  import type { FeedbackState } from "./types";

  import type { HTMLAttributes } from "svelte/elements";

  /** Props for a compact inline status message. */
  export interface InlineMessageProps extends HTMLAttributes<HTMLSpanElement> {
    /** Semantic status conveyed by the message. */
    tone?: FeedbackState;
  }
</script>

<script lang="ts">
  import FeedbackIcon from "./internal/FeedbackIcon.svelte";

  let { tone = "info", class: className = "", children, ...rest }: InlineMessageProps = $props();
</script>

<span class="message {className}" role={tone === "error" ? "alert" : "status"} {...rest}>
  <FeedbackIcon {tone} size="sm" />
  {#if children}<span class="content">{@render children()}</span>{/if}
</span>

<style>
  .message {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    min-inline-size: 0;
    color: var(--color-text-primary);
    font-size: var(--font-size-sm);
    line-height: var(--line-height-compact);
  }

  .content {
    min-inline-size: 0;
    overflow-wrap: anywhere;
  }
</style>
