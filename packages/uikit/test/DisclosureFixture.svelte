<script lang="ts">
  import { Accordion, AccordionItem, Badge, type OpenController } from "../src/lib";

  let {
    first,
    second,
    multiple = false,
  }: { first: OpenController; second: OpenController; multiple?: boolean } = $props();
</script>

<Accordion {multiple}>
  <AccordionItem controller={first}>
    {#snippet summary()}Sharing <Badge>Private</Badge>{/snippet}
    Only invited people can view this workspace.
  </AccordionItem>
  <AccordionItem controller={second} summary="Export preferences">
    Export a copy while keeping your original.
  </AccordionItem>
</Accordion>
