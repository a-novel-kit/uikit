<script module lang="ts">
  import {
    Accordion,
    AccordionItem,
    Button,
    Dialog,
    Disclosure,
    IconButton,
    Popover,
    Stack,
    Tooltip,
  } from "@a-novel-kit/uikit";
  import { HelpIcon } from "@a-novel-kit/uikit-icons";

  import { defineMeta } from "@storybook/addon-svelte-csf";

  const { Story } = defineMeta({
    title: "Overlays/Disclosure and dialog",
    tags: ["autodocs"],
    parameters: {
      docs: {
        description: {
          component:
            "Accordion and Disclosure reveal inline content. Popover, Dialog, and Tooltip layer non-modal or modal content.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let dialogOpen = $state(false);
  let popoverOpen = $state(false);
</script>

<Story name="Disclosure" asChild>
  <div class="narrow">
    <Disclosure summary="What is stored locally?" open>Drafts and preferences are stored on this device.</Disclosure>
    <Disclosure summary="Can I export my data?">Open account settings and choose Export data.</Disclosure>
  </div>
</Story>

<Story name="Accordion" asChild>
  <div class="narrow">
    <Accordion>
      <AccordionItem summary="Keyboard behavior" open>
        Tab reaches each summary. Enter or Space toggles it; arrow keys are not required for native details.
      </AccordionItem>
      <AccordionItem summary="Multiple panels"
        >Set multiple on the Accordion when more than one panel may remain open.</AccordionItem
      >
      <AccordionItem summary="Unavailable section" disabled>This content cannot be expanded.</AccordionItem>
    </Accordion>
  </div>
</Story>

<Story name="Dialog" asChild>
  <Stack gap="4" align="start">
    <Button onclick={() => (dialogOpen = true)}>Open dialog</Button>
    <span class="muted">Press Escape or select an action to close the dialog.</span>
    <Dialog bind:open={dialogOpen} title="Archive item?" description="You can restore an archived item later.">
      {#snippet actions()}
        <Button variant="ghost" tone="neutral" onclick={() => (dialogOpen = false)}>Cancel</Button>
        <Button tone="danger" onclick={() => (dialogOpen = false)}>Archive</Button>
      {/snippet}
      <p class="dialog-copy">Other people will lose access until the item is restored.</p>
    </Dialog>
  </Stack>
</Story>

<Story name="Popover" asChild>
  <Popover bind:open={popoverOpen} position="bottom">
    {#snippet trigger(props)}
      <Button {...props} variant="outline" tone="neutral">Open popover</Button>
    {/snippet}
    <Stack gap="3" style="inline-size: min(20rem, 80vi)">
      <strong>Preview options</strong>
      <span class="muted">Non-modal supporting content closes on Escape or an outside click.</span>
      <Button size="sm" onclick={() => (popoverOpen = false)}>Apply</Button>
    </Stack>
  </Popover>
</Story>

<Story name="Tooltip" asChild>
  <Tooltip content="Open help" side="right">
    {#snippet trigger(props)}
      <IconButton {...props} label="Open help" variant="outline" tone="neutral">
        <HelpIcon size="var(--icon-size-md)" />
      </IconButton>
    {/snippet}
  </Tooltip>
</Story>

<style>
  .narrow {
    inline-size: min(100%, var(--layout-container-sm));
  }
  .muted,
  .dialog-copy {
    margin: 0;
    color: var(--color-text-muted);
    line-height: var(--line-height-normal);
  }
  strong {
    color: var(--color-text-primary);
  }
</style>
