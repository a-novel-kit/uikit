<!--
@component
Replaces a page, or a whole section of navigation, that is unavailable during a planned maintenance.
The wording is generic and names the expected end; replace `title` and `message` to localize it.
Pages that stay partly usable keep their content under a started `DowntimeBanner` instead.
-->
<script lang="ts" module>
  import type { Content } from "./content";

  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  /** Props for a page-level planned maintenance state. */
  export interface DowntimeStateProps extends Omit<HTMLAttributes<HTMLDivElement>, "title" | "children"> {
    /** When service is expected back. The state presents it as an estimate. */
    end: Date;
    /** Locale of the expected end. The runtime default when omitted. */
    locale?: Intl.LocalesArgument;
    /** IANA time zone of the expected end. The runtime default when omitted; set it when rendering on a server. */
    timeZone?: string;
    /** Replaces the default heading, for localization. */
    title?: Content;
    /** Replaces the default description, for localization. Receives the formatted expected end. */
    message?: Snippet<[string]>;
    /** Heading level within the surrounding document. */
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
    /** Ways out, such as a link to a page that still works. */
    actions?: Snippet;
  }
</script>

<script lang="ts">
  import StatusState from "./StatusState.svelte";
  import { downtimeFormat } from "./internal/downtime";

  let { end, locale, timeZone, title, message, ...rest }: DowntimeStateProps = $props();

  const when = $derived(downtimeFormat(locale, timeZone).format(end));
</script>

{#snippet localized()}{@render message?.(when)}{/snippet}

<StatusState
  tone="warning"
  title={title ?? "Temporarily unavailable"}
  description={message ? localized : `This page is unavailable during maintenance. Expected to end: ${when}.`}
  {...rest}
/>
