<script lang="ts">
  import { Badge, Disclosure, type OpenController } from "../src/lib";

  let {
    first,
    second,
    multiple = false,
  }: { first: OpenController; second: OpenController; multiple?: boolean } = $props();

  // Disclosures sharing a name keep one open at a time, as native details elements do.
  const name = $derived(multiple ? undefined : "preferences");
</script>

<Disclosure controller={first} {name}>
  {#snippet summary()}Sharing <Badge>Private</Badge>{/snippet}
  Only invited people can view this workspace.
</Disclosure>
<Disclosure controller={second} {name} summary="Export preferences"
  >Export a copy while keeping your original.</Disclosure
>
