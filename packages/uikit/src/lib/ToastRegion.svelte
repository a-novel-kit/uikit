<!--
@component
Displays application-owned notifications at the viewport's lower inline-end corner.
The caller manages their lifetime and removes dismissed entries; no automatic timeout runs here.
-->
<script lang="ts" module>
  import type { Content } from "./content";
  import type { FeedbackTone } from "./types";

  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  /** A transient message displayed by ToastRegion. */
  export interface ToastMessage {
    /** Stable identifier used when dismissing the message. */
    id: string;
    /** Optional toast heading. */
    title?: Content;
    /** Primary toast content. */
    message: Content;
    /** Semantic status conveyed by the toast. */
    tone?: FeedbackTone;
    /** Optional action rendered after the message. */
    action?: Snippet;
    /** Accessible dismiss name; defaults to "Dismiss notification". Visible button text remains "Dismiss". */
    dismissLabel?: string;
  }

  /** Props for the live region that displays transient messages. */
  export interface ToastRegionProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
    /** Messages to display, keyed by unique IDs; the caller manages expiry and removal. */
    toasts: ToastMessage[];
    /** Accessible name for the notification region. */
    label?: string;
    /** Shows dismiss controls and receives the requested toast ID. The caller removes that entry. */
    onDismiss?: (id: string) => void;
  }
</script>

<script lang="ts">
  import RenderContent from "./Content.svelte";
  import FeedbackIcon from "./internal/FeedbackIcon.svelte";

  let { toasts, label = "Notifications", onDismiss, class: className = "", ...rest }: ToastRegionProps = $props();
</script>

<section class="region {className}" aria-label={label} {...rest}>
  {#each toasts as toast (toast.id)}
    <div class="toast" role={toast.tone === "error" ? "alert" : "status"}>
      <FeedbackIcon tone={toast.tone ?? "info"} />
      <div class="message">
        {#if toast.title}<strong><RenderContent content={toast.title} /></strong>{/if}
        <p><RenderContent content={toast.message} /></p>
        {#if toast.action}<div class="action">{@render toast.action()}</div>{/if}
      </div>
      {#if onDismiss}
        <button
          type="button"
          aria-label={toast.dismissLabel ?? "Dismiss notification"}
          onclick={() => onDismiss?.(toast.id)}>Dismiss</button
        >
      {/if}
    </div>
  {/each}
</section>

<style>
  .region {
    display: grid;
    position: fixed;
    gap: var(--space-2);
    z-index: var(--layer-toast);
    inset-block-end: var(--space-4);
    inset-inline-end: var(--space-4);
    inline-size: min(calc(100vi - var(--space-8)), calc(var(--space-base) * var(--multiplier-80)));
    pointer-events: none;
  }
  .toast {
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
    box-shadow: var(--shadow-lg);
    border-radius: var(--radius-lg);
    background: var(--color-surface-island-strong);
    padding-inline: var(--space-4);
    padding-block: var(--space-4);
    pointer-events: auto;
    color: var(--color-text-primary);
  }
  .message {
    flex: 1;
    align-self: center;
    min-inline-size: 0;
    overflow-wrap: anywhere;
  }
  strong {
    display: block;
    margin-block-end: var(--space-1);
    font-size: var(--font-size-sm);
    line-height: var(--line-height-compact);
    font-family: var(--font-family-interface);
  }
  p {
    margin: 0;
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
    line-height: var(--line-height-normal);
  }
  .action {
    margin-block-start: var(--space-2);
  }
  button {
    cursor: pointer;
    border: 0;
    border-radius: var(--radius-sm);
    background: transparent;
    padding: var(--space-2);
    color: var(--color-text-muted);
    font: inherit;
    font-size: var(--font-size-xs);
    font-family: var(--font-family-interface);
  }
  button:hover {
    background: var(--color-action-ghost-hover);
    color: var(--color-text-primary);
  }
  button:focus-visible {
    outline: var(--focus-ring-width) solid var(--color-focus-ring);
    outline-offset: var(--focus-ring-offset);
  }

  @supports (backdrop-filter: blur(0)) or (-webkit-backdrop-filter: blur(0)) {
    .toast {
      -webkit-backdrop-filter: blur(var(--blur-md));
      backdrop-filter: blur(var(--blur-md));
      background: var(--color-surface-glass);
    }
  }

  @media (forced-colors: active) {
    .toast {
      border: var(--border-width-thin) solid CanvasText;
    }
  }
</style>
