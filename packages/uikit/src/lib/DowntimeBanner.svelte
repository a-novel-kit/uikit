<!--
@component
Announces a planned maintenance in a compact strip that can't be dismissed. Before the maintenance
it informs with the expected time frame; once started it warns with the expected end. The wording
is generic; replace `title` and `message` to localize it.
-->
<script lang="ts" module>
  import type { Content } from "./content";

  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  /** Props for a compact planned maintenance banner. */
  export interface DowntimeBannerProps extends Omit<HTMLAttributes<HTMLDivElement>, "title" | "children"> {
    /** When the maintenance starts. */
    start: Date;
    /** When service is expected back. The banner presents it as an estimate. */
    end: Date;
    /** Whether the maintenance has started, which switches to the in-progress wording and a warning. */
    started?: boolean;
    /** Locale of the times. The runtime default when omitted. */
    locale?: Intl.LocalesArgument;
    /** IANA time zone of the times. The runtime default when omitted; set it when rendering on a server. */
    timeZone?: string;
    /** Replaces the default heading, for localization. */
    title?: Content;
    /**
     * Replaces the default sentence, for localization. Receives the formatted time frame before the
     * start, and the expected end once started.
     */
    message?: Snippet<[string]>;
  }
</script>

<script lang="ts">
  import RenderContent from "./Content.svelte";
  import FeedbackIcon from "./internal/FeedbackIcon.svelte";
  import { downtimeFormat } from "./internal/downtime";

  let {
    start,
    end,
    started = false,
    locale,
    timeZone,
    title,
    message,
    class: className = "",
    ...rest
  }: DowntimeBannerProps = $props();

  const tone = $derived(started ? "warning" : "info");
  const format = $derived(downtimeFormat(locale, timeZone));
  const when = $derived(started ? format.format(end) : format.formatRange(start, end));
</script>

<div class="banner {tone} {className}" role="status" {...rest}>
  <FeedbackIcon {tone} size="sm" />
  <p>
    <strong><RenderContent content={title ?? (started ? "Maintenance in progress" : "Scheduled maintenance")} /></strong
    >
    <span>
      {#if message}
        {@render message(when)}
      {:else if started}
        Some services may be unavailable. Expected to end: {when}.
      {:else}
        Some services may be unavailable. Expected: {when}.
      {/if}
    </span>
  </p>
</div>

<style>
  .banner {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    background-color: var(--banner-surface);
    padding-inline: var(--space-4);
    padding-block: var(--space-2);
    color: var(--color-text-primary);
    font-size: var(--font-size-sm);
    line-height: var(--line-height-compact);
    overflow-wrap: anywhere;
  }

  .info {
    --banner-surface: var(--color-feedback-info-surface);
  }

  .warning {
    --banner-surface: var(--color-feedback-warning-surface);
  }

  p {
    display: flex;
    column-gap: var(--space-2);
    flex-wrap: wrap;
    margin: 0;
    min-inline-size: 0;
  }

  span {
    color: var(--color-text-secondary);
  }

  @media (forced-colors: active) {
    .banner {
      border-block-end: var(--border-width-thin) solid CanvasText;
    }
  }
</style>
