<!--
@component
Replaces a page that failed to display for a reason no other state names, with uikit's translated copy and a link
home. A string or a snippet replaces each text, and `actions` replaces the link.
-->
<script lang="ts" module>
  import type { StatusStateProps } from "./StatusState.svelte";
  import type { Content } from "./content";

  /** Props for the state of a page that failed to display. */
  export interface PageErrorStateProps extends Omit<StatusStateProps, "tone" | "title" | "description"> {
    /** Heading; defaults to uikit's translated "Page unavailable". */
    title?: Content;
    /** Supporting guidance; defaults to uikit's translated explanation that the page could not be displayed. */
    description?: Content;
    /** Destination of the link home. `actions` replaces the link. */
    homeHref?: string;
  }
</script>

<script lang="ts">
  import Link from "./Link.svelte";
  import StatusState from "./StatusState.svelte";
  import { useMessages } from "./internal/i18n";

  const { t } = useMessages();

  let {
    title = t("access.error.title"),
    description = t("access.error.description"),
    homeHref,
    actions,
    ...rest
  }: PageErrorStateProps = $props();
</script>

{#snippet home()}<Link href={homeHref}>{t("access.home")}</Link>{/snippet}

<StatusState
  tone="error"
  {title}
  {description}
  actions={actions ?? (homeHref === undefined ? undefined : home)}
  {...rest}
/>
