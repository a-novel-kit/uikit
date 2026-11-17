<!--
@component
Replaces a protected page while the app checks the reader's access, with uikit's translated heading. A
string or a snippet replaces the heading.
-->
<script lang="ts" module>
  import type { StatusStateProps } from "./StatusState.svelte";
  import type { Content } from "./content";

  /** Props for the state of a page whose access is still being checked. */
  export interface AccessPendingStateProps extends Omit<StatusStateProps, "tone" | "title"> {
    /** Heading; defaults to uikit's translated "Checking access". */
    title?: Content;
  }
</script>

<script lang="ts">
  import StatusState from "./StatusState.svelte";
  import { useMessages } from "./internal/i18n";

  const { t } = useMessages();

  let { title = t("access.pending.title"), ...rest }: AccessPendingStateProps = $props();
</script>

<StatusState tone="loading" {title} {...rest} />
