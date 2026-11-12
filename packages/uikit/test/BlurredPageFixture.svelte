<!-- A frosted page under a dialog holding a card of its own, for tests of the page's blurs under a modal. -->
<script lang="ts">
  import Card from "../src/lib/Card.svelte";
  import Dialog from "../src/lib/Dialog.svelte";
  import type { DialogController } from "../src/lib/Dialog.svelte";
  import StickyBar from "../src/lib/StickyBar.svelte";

  let { controller }: { controller: DialogController } = $props();
</script>

<StickyBar edge="start" data-testid="page-bar">Tabs</StickyBar>
<Card data-testid="page-card">Lantern</Card>
<Dialog {controller} title="Edit">
  <Card data-testid="dialog-card">Inside</Card>
</Dialog>
