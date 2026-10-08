<!--
@component
Announces a planned maintenance in a compact strip that can't be dismissed. Before the maintenance
it informs with the expected time frame; once started it warns with the expected end. The wording
is generic and translated; only the times vary.
-->
<script lang="ts" module>
  import type { HTMLAttributes } from "svelte/elements";

  /** Props for a compact planned maintenance banner. */
  export interface DowntimeBannerProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    /** When the maintenance starts. */
    start: Date;
    /** When service is expected back. The banner presents it as an estimate. */
    end: Date;
    /** Whether the maintenance has started, which switches to the in-progress wording and a warning. */
    started?: boolean;
    /** IANA time zone of the times. The runtime default when omitted; set it when rendering on a server. */
    timeZone?: string;
  }
</script>

<script lang="ts">
  import FeedbackIcon from "./internal/FeedbackIcon.svelte";
  import { downtimeFormat } from "./internal/downtime";
  import { useMessages } from "./internal/i18n";

  const { t, language } = useMessages();

  let { start, end, started = false, timeZone, class: className = "", ...rest }: DowntimeBannerProps = $props();

  const phase = $derived(started ? "started" : "scheduled");
  const format = $derived(downtimeFormat(language, timeZone));
  const when = $derived(started ? format.instant(end) : format.range(start, end));
</script>

<div class="banner {started ? 'warning' : 'info'} {className}" role="status" {...rest}>
  <FeedbackIcon tone={started ? "warning" : "info"} size="sm" />
  <p>
    <strong>{t(`downtimeBanner.${phase}.title`)}</strong>
    <span>{t(`downtimeBanner.${phase}.message`, { when })}</span>
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
    flex-wrap: wrap;
    align-items: baseline;
    gap: var(--space-1) var(--space-3);
    margin: 0;
    min-inline-size: 0;
  }

  span {
    color: var(--color-text-secondary);
    font-size: var(--font-size-xs);
  }

  @media (forced-colors: active) {
    .banner {
      border-block-end: var(--border-width-thin) solid CanvasText;
    }
  }
</style>
