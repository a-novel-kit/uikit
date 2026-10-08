<!--
@component
Replaces a page, or a whole section of navigation, that is unavailable during a planned maintenance.
The wording is generic and translated, and names the expected end. Pages that stay partly usable keep
their content under a started `DowntimeBanner` instead.
-->
<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  /** Props for a page-level planned maintenance state. */
  export interface DowntimeStateProps extends Omit<HTMLAttributes<HTMLDivElement>, "title" | "children"> {
    /** When service is expected back. The state presents it as an estimate. */
    end: Date;
    /** IANA time zone of the expected end. The runtime default when omitted; set it when rendering on a server. */
    timeZone?: string;
    /** Heading level within the surrounding document. */
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
    /** Ways out, such as a link to a page that still works. */
    actions?: Snippet;
  }
</script>

<script lang="ts">
  import StatusState from "./StatusState.svelte";
  import { downtimeFormat } from "./internal/downtime";
  import { useMessages } from "./internal/i18n";

  const { t, language } = useMessages();

  let { end, timeZone, ...rest }: DowntimeStateProps = $props();

  const when = $derived(downtimeFormat(language, timeZone).instant(end));
</script>

<StatusState
  tone="warning"
  title={t("downtimeState.title")}
  description={t("downtimeState.message", { when })}
  {...rest}
/>
