<!--
@component
Replaces a page the reader's account may not view, with uikit's translated copy and a link home. A string or a
snippet replaces each text, and `actions` replaces the link.
-->
<script lang="ts" module>
  import type { StatusStateProps } from "./StatusState.svelte";
  import type { Content } from "./content";

  /** Props for the state of a page the reader's account may not view. */
  export interface AccessForbiddenStateProps extends Omit<StatusStateProps, "tone" | "title" | "description"> {
    /** Heading; defaults to uikit's translated "Access denied". */
    title?: Content;
    /** Supporting guidance; defaults to uikit's translated explanation that the account lacks permission. */
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
    title = t("access.forbidden.title"),
    description = t("access.forbidden.description"),
    homeHref,
    actions,
    ...rest
  }: AccessForbiddenStateProps = $props();
</script>

{#snippet home()}<Link href={homeHref}>{t("access.home")}</Link>{/snippet}

<StatusState
  tone="error"
  {title}
  {description}
  actions={actions ?? (homeHref === undefined ? undefined : home)}
  {...rest}
/>
