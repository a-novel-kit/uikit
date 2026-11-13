<!-- A consent request on a page that opens a modal dialog, as Account's login opens on a page that needs one. -->
<script lang="ts">
  import { ConsentBanner, type ConsentController, Dialog, type DialogController } from "../src/lib";

  let { consent, dialog }: { consent: ConsentController; dialog: DialogController } = $props();
</script>

<ConsentBanner controller={consent} title="Error reports"
  >Your browser sends us a report when a page fails.</ConsentBanner
>
<Dialog controller={dialog} title="Log in"><p style="margin: 0">Log in to continue.</p></Dialog>
