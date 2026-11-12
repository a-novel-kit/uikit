<!-- A raised card holding a ghost card, for tests of a card nested in another. -->
<script lang="ts">
  import Card from "../src/lib/Card.svelte";
</script>

<Card>
  <Card surface="ghost">Lantern</Card>
</Card>
