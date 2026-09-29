<script lang="ts">
  import { Button, Dialog, type DialogProps, IconButton, Stack } from "../src/lib";

  import { X } from "@lucide/svelte";

  let {
    controller,
    presentation = "centered",
    title = "Workspace details and sharing preferences",
    long = false,
  }: Pick<DialogProps, "controller" | "presentation"> & { title?: DialogProps["title"]; long?: boolean } = $props();
</script>

<Button onclick={controller.open}>Open details</Button>
<Dialog
  {controller}
  {presentation}
  {title}
  description="These settings apply to everyone who can access this workspace."
>
  {#snippet headerActions()}
    <IconButton label="Close details" variant="ghost" tone="neutral" size="sm" onclick={controller.close}>
      <X size="var(--icon-size-sm)" />
    </IconButton>
  {/snippet}
  <Stack gap="4">
    {#each Array.from({ length: long ? 30 : 1 }, (_, index) => index) as index (index)}
      <p style="margin: 0">Workspace details {index + 1}</p>
    {/each}
    <Button>Last action</Button>
  </Stack>
  {#snippet actions()}<Button onclick={controller.close}>Done</Button>{/snippet}
</Dialog>
