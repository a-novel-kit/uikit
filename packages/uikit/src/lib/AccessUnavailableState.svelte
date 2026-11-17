<!--
@component
Replaces a protected page while the app cannot check the reader's access, as during an authentication outage. It
shows uikit's translated copy, which tells the reader their session stays, and a link that reloads the page. A
string or a snippet replaces each text, and `actions` replaces the link.
-->
<script lang="ts" module>
  import type { StatusStateProps } from "./StatusState.svelte";
  import type { Content } from "./content";

  /** Props for the state of a page whose access cannot be checked for now. */
  export interface AccessUnavailableStateProps extends Omit<StatusStateProps, "tone" | "title" | "description"> {
    /** Heading; defaults to uikit's translated "Access temporarily unavailable". */
    title?: Content;
    /** Supporting guidance; defaults to uikit's translated explanation that the session stays and a reload will work. */
    description?: Content;
    /** The page's own address, which the link reloads. `actions` replaces the link. */
    retryHref?: string;
  }
</script>

<script lang="ts">
  import Link from "./Link.svelte";
  import StatusState from "./StatusState.svelte";
  import { useMessages } from "./internal/i18n";

  const { t } = useMessages();

  let {
    title = t("access.unavailable.title"),
    description = t("access.unavailable.description"),
    retryHref,
    actions,
    ...rest
  }: AccessUnavailableStateProps = $props();
</script>

<!-- SvelteKit reloads the page from the server, which checks access again. -->
{#snippet retry()}<Link href={retryHref} data-sveltekit-reload>{t("access.retry")}</Link>{/snippet}

<StatusState
  tone="error"
  {title}
  {description}
  actions={actions ?? (retryHref === undefined ? undefined : retry)}
  {...rest}
/>
