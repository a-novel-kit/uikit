<script lang="ts">
  import { DescriptionList, Stack } from "../src/lib";

  // An end-aligned stack sizes its children by their content, which a measuring box has none of.
  let { endAligned = false }: { endAligned?: boolean } = $props();
</script>

{#snippet list()}
  <DescriptionList columns={2}>
    <div><dt>Owner</dt><dd>Ada Lovelace</dd></div>
    <div><dt>Status</dt><dd>Ready</dd></div>
  </DescriptionList>
{/snippet}

{#if endAligned}<Stack align="end">{@render list()}</Stack>{:else}{@render list()}{/if}
