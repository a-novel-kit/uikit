<!--
@component
Replaces a page whose address matches none, with uikit's translated copy and a link home. A string or a snippet
replaces each text, and `actions` replaces the link.
-->
<script lang="ts" module>
  import type { StatusStateProps } from "./StatusState.svelte";
  import type { Content } from "./content";

  /** Props for the state of an address that matches no page. */
  export interface PageNotFoundStateProps extends Omit<StatusStateProps, "tone" | "title" | "description"> {
    /** Heading; defaults to uikit's translated "Page not found". */
    title?: Content;
    /** Supporting guidance; defaults to uikit's translated explanation that the address matches no page. */
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
    title = t("access.notFound.title"),
    description = t("access.notFound.description"),
    homeHref,
    actions,
    ...rest
  }: PageNotFoundStateProps = $props();
</script>

{#snippet home()}<Link href={homeHref}>{t("access.home")}</Link>{/snippet}

<StatusState
  tone="error"
  {title}
  {description}
  actions={actions ?? (homeHref === undefined ? undefined : home)}
  {...rest}
/>
