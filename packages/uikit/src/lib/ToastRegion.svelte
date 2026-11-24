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
    /** Toast heading. */
    title?: Content;
    /** Primary toast content. */
    message: Content;
    /** Semantic status conveyed by the toast. */
    tone?: FeedbackTone;
    /** Action rendered after the message. */
    action?: Snippet;
    /** Accessible dismiss name; defaults to the translated "Dismiss notification". The button reads the translated "Dismiss". */
    dismissLabel?: string;
  }

  /** Props for the live region that displays transient messages. */
  export interface ToastRegionProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
    /** Messages to display, keyed by unique IDs; the caller manages expiry and removal. */
    toasts: ToastMessage[];
    /** Accessible name for the notification region; defaults to the translated "Notifications". */
    label?: string;
    /** Shows dismiss controls and receives the requested toast ID. The caller removes that entry. */
    onDismiss?: (id: string) => void;
  }
</script>

<script lang="ts">
  import Button from "./Button.svelte";
  import FeedbackIcon from "./internal/FeedbackIcon.svelte";
  import RenderContent from "./internal/RenderContent.svelte";
  import { useMessages } from "./internal/i18n";

  const { t } = useMessages();

  let {
    toasts,
    label = t("toastRegion.label"),
    onDismiss,
    class: className = "",
    ...rest
  }: ToastRegionProps = $props();
</script>

<section class="region {className}" aria-label={label} {...rest}>
  {#each toasts as toast (toast.id)}
    <div class="toast" role={toast.tone === "error" ? "alert" : "status"} data-frost data-island>
      <FeedbackIcon tone={toast.tone ?? "info"} size="sm" />
      <div class="message">
        {#if toast.title}<strong><RenderContent content={toast.title} /></strong>{/if}
        <p><RenderContent content={toast.message} /></p>
        {#if toast.action}<div class="action">{@render toast.action()}</div>{/if}
      </div>
      {#if onDismiss}
        <Button
          variant="text"
          tone="neutral"
          size="sm"
          aria-label={toast.dismissLabel ?? t("toastRegion.dismissLabel")}
          onclick={() => onDismiss?.(toast.id)}>{t("toastRegion.dismiss")}</Button
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
    /* off-scale: the viewport less the region's inset on each side */
    inline-size: min(calc(100vi - var(--space-8)), var(--layout-floating-lg));
    pointer-events: none;
  }
  .toast {
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
    -webkit-backdrop-filter: blur(var(--blur-md));
    backdrop-filter: blur(var(--blur-md));
    box-shadow: var(--shadow-lg);
    border-radius: var(--radius-lg);
    background: var(--color-surface-glass);
    padding-inline: var(--space-4);
    padding-block: var(--space-2);
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
    font: var(--text-ui-strong);
  }
  p {
    margin: 0;
    color: var(--color-text-secondary);
    font: var(--text-ui);
  }
  .action {
    margin-block-start: var(--space-2);
  }

  @media (forced-colors: active) {
    .toast {
      border: var(--border-width-thin) solid CanvasText;
    }
  }
</style>
