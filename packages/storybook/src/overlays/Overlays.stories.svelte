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

  import { CircleHelp as HelpIcon } from "@lucide/svelte";
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
  import { createOpenController } from "@a-novel-kit/uikit";

  const firstDisclosureController = createOpenController({ initialOpen: true });
  const secondDisclosureController = createOpenController();
  const firstAccordionController = createOpenController({ initialOpen: true });
  const secondAccordionController = createOpenController();
  const disabledAccordionController = createOpenController();
  const dialogController = createOpenController();
  const popoverController = createOpenController();
  const tooltipController = createOpenController();
</script>

<Story name="Disclosure" asChild>
  <div class="narrow">
    <Disclosure controller={firstDisclosureController} summary="What is stored locally?"
      >Drafts and preferences are stored on this device.</Disclosure
    >
    <Disclosure controller={secondDisclosureController} summary="Can I export my data?"
      >Open account settings and choose Export data.</Disclosure
    >
  </div>
</Story>

<Story name="Accordion" asChild>
  <div class="narrow">
    <Accordion>
      <AccordionItem controller={firstAccordionController} summary="Keyboard behavior">
        Tab reaches each summary. Enter or Space toggles it; arrow keys are not required for native details.
      </AccordionItem>
      <AccordionItem controller={secondAccordionController} summary="Multiple panels"
        >Set multiple on the Accordion when more than one panel may remain open.</AccordionItem
      >
      <AccordionItem controller={disabledAccordionController} summary="Unavailable section" disabled
        >This content cannot be expanded.</AccordionItem
      >
    </Accordion>
  </div>
</Story>

<Story name="Dialog" asChild>
  <Stack gap="4" align="start">
    <Button onclick={() => dialogController.open()}>Open dialog</Button>
    <span class="muted">Press Escape or select an action to close the dialog.</span>
    <Dialog controller={dialogController} title="Archive item?" description="You can restore an archived item later.">
      {#snippet actions()}
        <Button variant="ghost" tone="neutral" onclick={() => dialogController.close()}>Cancel</Button>
        <Button tone="danger" onclick={() => dialogController.close()}>Archive</Button>
      {/snippet}
      <p class="dialog-copy">Other people will lose access until the item is restored.</p>
    </Dialog>
  </Stack>
</Story>

<Story name="Popover" asChild>
  <Popover controller={popoverController} position="bottom">
    {#snippet trigger(props)}
      <Button {...props} variant="outline" tone="neutral">Open popover</Button>
    {/snippet}
    <Stack gap="3" style="inline-size: min(20rem, 80vi)">
      <strong>Preview options</strong>
      <span class="muted">Non-modal supporting content closes on Escape or an outside click.</span>
      <Button size="sm" onclick={() => popoverController.close()}>Apply</Button>
    </Stack>
  </Popover>
</Story>

<Story name="Tooltip" asChild>
  <Tooltip controller={tooltipController} content="Open help" side="right">
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
