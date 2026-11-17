<!-- A frosted page under a dialog holding a card of its own, for tests of the page's blurs under a modal: a sticky
     bar, a card, a toast and the consent banner, each carrying data-frost. -->
<script lang="ts">
  import Card from "../src/lib/Card.svelte";
  import ConsentBanner from "../src/lib/ConsentBanner.svelte";
  import Dialog from "../src/lib/Dialog.svelte";
  import type { DialogController } from "../src/lib/Dialog.svelte";
  import StickyBar from "../src/lib/StickyBar.svelte";
  import ToastRegion from "../src/lib/ToastRegion.svelte";
  import { createConsentController } from "../src/lib/controllers.svelte";

  let { controller }: { controller: DialogController } = $props();
</script>

<StickyBar edge="start" data-testid="page-bar">Tabs</StickyBar>
<Card data-testid="page-card">Lantern</Card>
<ToastRegion toasts={[{ id: "saved", message: "Saved" }]} />
<ConsentBanner controller={createConsentController({ initialOpen: true })} title="Error reports">
  Reports help us fix failures.
</ConsentBanner>
<Dialog {controller} title="Edit">
  <Card data-testid="dialog-card">Inside</Card>
</Dialog>
