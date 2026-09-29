<script module lang="ts">
  import {
    Accordion,
    AccordionItem,
    ActionGroup,
    Badge,
    Button,
    Dialog,
    Disclosure,
    Field,
    FormActions,
    IconButton,
    Input,
    NavList,
    PanelHeader,
    Popover,
    Stack,
    Tooltip,
  } from "@a-novel-kit/uikit";
  import type { OpenController } from "@a-novel-kit/uikit";
  import { reviewStoryGlobals } from "@a-novel-kit/uikit-storybook";

  import { X as CloseIcon, CircleHelp as HelpIcon, House as HomeIcon } from "@lucide/svelte";
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, within } from "storybook/test";

  const { Story } = defineMeta({
    title: "Overlays/Disclosure and dialog",
    component: Dialog,
    parameters: {
      docs: {
        description: {
          component:
            "Accordion and Disclosure reveal inline content. Popover, Dialog, and Tooltip layer non-modal or modal content.",
        },
      },
    },
  });

  async function verifyPinnedDialog({ canvasElement }: { canvasElement: HTMLElement }) {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Close dialog" }));
    await userEvent.keyboard("{Escape}");
    await expect(canvas.getByRole("dialog", { name: "Archive item?" })).toBeVisible();
  }
</script>

<script lang="ts">
  import { fixedOpen } from "../controllers";

  const opened = fixedOpen(true);
  const closed = fixedOpen();
  const preferenceSections = [
    {
      title: "Sharing",
      description: "Only invited people can view this workspace. Invitations remain private until accepted.",
    },
    {
      title: "Exports",
      description: "Exported copies include the latest saved changes. Your original project stays in the workspace.",
    },
    {
      title: "Notifications",
      description: "Project updates appear in your inbox. Muted projects remain available in your workspace.",
    },
    {
      title: "Version history",
      description: "Saved versions let you revisit earlier work without replacing your current draft.",
    },
    {
      title: "Storage",
      description:
        "Original files stay available while a project is archived. Removing a copy leaves the original intact.",
    },
    {
      title: "Accessibility",
      description: "The interface follows your device preferences for reduced motion and increased contrast.",
    },
  ];
</script>

{#snippet dialogExample(controller: OpenController)}
  <Dialog {controller} title="Archive item?" description="You can restore an archived item later.">
    {#snippet headerActions()}
      <IconButton label="Close dialog" variant="ghost" tone="neutral" size="sm" onclick={controller.close}>
        <CloseIcon size="var(--icon-size-sm)" />
      </IconButton>
    {/snippet}
    {#snippet actions()}
      <Button variant="ghost" tone="neutral" onclick={() => controller.close()}>Cancel</Button>
      <Button tone="danger" onclick={() => controller.close()}>Archive</Button>
    {/snippet}
    <p class="dialog-copy">Other people will lose access until the item is restored.</p>
  </Dialog>
{/snippet}

{#snippet longDialogExample(controller: OpenController)}
  <Dialog
    {controller}
    title="Review workspace access and sharing preferences"
    description="These settings apply to everyone who can access this workspace, including people invited through a shared link."
  >
    {#snippet headerActions()}
      <IconButton label="Close dialog" variant="ghost" tone="neutral" size="sm" onclick={controller.close}>
        <CloseIcon size="var(--icon-size-sm)" />
      </IconButton>
    {/snippet}
  </Dialog>
{/snippet}

{#snippet fullscreenExample(controller: OpenController)}
  <Dialog {controller} title="Workspace" presentation="fullscreen">
    {#snippet headerActions()}
      <IconButton label="Close navigation" variant="ghost" tone="neutral" size="sm" onclick={controller.close}>
        <CloseIcon size="var(--icon-size-sm)" />
      </IconButton>
    {/snippet}
    <div class="fullscreen-content">
      <nav aria-label="Workspace">
        <NavList items={[{ href: "#home", label: "Home", current: true, icon: homeIcon }]} />
      </nav>
      <Button variant="ghost" tone="neutral">Manage account</Button>
    </div>
  </Dialog>
{/snippet}

{#snippet homeIcon()}<HomeIcon size="var(--icon-size-sm)" />{/snippet}

{#snippet popoverExample(controller: OpenController)}
  <Popover {controller} position="bottom">
    {#snippet trigger(props)}
      <Button {...props} variant="outline" tone="neutral">Export options</Button>
    {/snippet}
    <Stack gap="4" style="inline-size: min(20rem, 75vi)">
      <PanelHeader title="Export a copy" description="The original stays in your workspace." />
      <ActionGroup align="end">
        <Button onclick={controller.close}>Export</Button>
      </ActionGroup>
    </Stack>
  </Popover>
{/snippet}

{#snippet tooltipExample(controller: OpenController)}
  <Tooltip {controller} content="Open help" side="right" delayDuration={0}>
    {#snippet trigger(props)}
      <IconButton {...props} label="Open help" variant="outline" tone="neutral">
        <HelpIcon size="var(--icon-size-md)" />
      </IconButton>
    {/snippet}
  </Tooltip>
{/snippet}

<Story name="Disclosure" asChild>
  <div class="narrow"
    ><Stack gap="2">
      <Disclosure controller={opened} summary="What is stored locally?"
        >Drafts and preferences are stored on this device.</Disclosure
      >
      <Disclosure controller={closed} summary="Can I export my data?"
        >Open account settings and choose Export data.</Disclosure
      >
    </Stack></div
  >
</Story>

<Story name="Accordion" asChild>
  <div class="narrow">
    <Accordion>
      <AccordionItem controller={opened}>
        {#snippet summary()}Sharing <Badge>Private</Badge>{/snippet}
        Only people you invite can view this workspace.
      </AccordionItem>
      <AccordionItem controller={closed} summary="Export preferences"
        >Choose a format and image quality for exported copies.</AccordionItem
      >
      <AccordionItem controller={closed} summary="Version history" disabled>No saved versions yet.</AccordionItem>
    </Accordion>
  </div>
</Story>

{#snippet formExample(controller: OpenController, error?: string)}
  <Dialog {controller} title="Create workspace" description="A shared place for your next project.">
    {#snippet headerActions()}
      <IconButton label="Close dialog" variant="ghost" tone="neutral" size="sm" onclick={controller.close}>
        <CloseIcon size="var(--icon-size-sm)" />
      </IconButton>
    {/snippet}
    <form onsubmit={(event) => event.preventDefault()}>
      <Stack gap="4">
        <Field label="Workspace name" {error}>
          {#snippet children(control)}<Input {...control} value="Summer sketches" invalid={Boolean(error)} />{/snippet}
        </Field>
        <Disclosure controller={opened} summary="Sharing">
          <p class="dialog-copy">Your workspace is private until you invite someone.</p>
        </Disclosure>
        <FormActions><Button type="submit">Create workspace</Button></FormActions>
      </Stack>
    </form>
  </Dialog>
{/snippet}

{#snippet scrollExample(controller: OpenController)}
  <Dialog {controller} title="Workspace preferences" description="Settings for everyone in this workspace.">
    {#snippet headerActions()}
      <IconButton label="Close dialog" variant="ghost" tone="neutral" size="sm" onclick={controller.close}>
        <CloseIcon size="var(--icon-size-sm)" />
      </IconButton>
    {/snippet}
    <Stack gap="4">
      {#each preferenceSections as section (section.title)}
        <Disclosure controller={opened} summary={section.title}>
          <p class="dialog-copy">{section.description}</p>
        </Disclosure>
      {/each}
    </Stack>
    {#snippet actions()}
      <Button variant="ghost" tone="neutral" onclick={controller.close}>Cancel</Button>
      <Button onclick={controller.close}>Save preferences</Button>
    {/snippet}
  </Dialog>
{/snippet}

<Story name="Form — desktop" exportName="FormDesktop" globals={reviewStoryGlobals.desktop} asChild>
  {@render formExample(opened)}
</Story>
<Story name="Form — mobile" exportName="FormMobile" globals={reviewStoryGlobals.mobile} asChild>
  {@render formExample(opened)}
</Story>
<Story name="Validation — desktop" exportName="ValidationDesktop" globals={reviewStoryGlobals.desktop} asChild>
  {@render formExample(opened, "This workspace name is already in use.")}
</Story>
<Story name="Validation — mobile" exportName="ValidationMobile" globals={reviewStoryGlobals.mobile} asChild>
  {@render formExample(opened, "This workspace name is already in use.")}
</Story>
<Story name="Long content — desktop" exportName="LongContentDesktop" globals={reviewStoryGlobals.desktop} asChild>
  {@render scrollExample(opened)}
</Story>
<Story name="Long content — mobile" exportName="LongContentMobile" globals={reviewStoryGlobals.mobile} asChild>
  {@render scrollExample(opened)}
</Story>

<Story
  name="Dialog — desktop"
  exportName="DialogDesktop"
  globals={reviewStoryGlobals.desktop}
  asChild
  play={verifyPinnedDialog}
>
  {@render dialogExample(opened)}
</Story>

<Story name="Dialog — mobile" exportName="DialogMobile" globals={reviewStoryGlobals.mobile} asChild>
  {@render dialogExample(opened)}
</Story>

<Story name="Long heading — desktop" exportName="LongHeadingDesktop" globals={reviewStoryGlobals.desktop} asChild>
  {@render longDialogExample(opened)}
</Story>

<Story name="Long heading — mobile" exportName="LongHeadingMobile" globals={reviewStoryGlobals.mobile} asChild>
  {@render longDialogExample(opened)}
</Story>

<Story name="Fullscreen — desktop" exportName="FullscreenDesktop" globals={reviewStoryGlobals.desktop} asChild>
  {@render fullscreenExample(opened)}
</Story>

<Story name="Fullscreen — mobile" exportName="FullscreenMobile" globals={reviewStoryGlobals.mobile} asChild>
  {@render fullscreenExample(opened)}
</Story>

<Story name="Popover — desktop" exportName="PopoverDesktop" globals={reviewStoryGlobals.desktop} asChild>
  {@render popoverExample(opened)}
</Story>

<Story name="Popover — mobile" exportName="PopoverMobile" globals={reviewStoryGlobals.mobile} asChild>
  {@render popoverExample(opened)}
</Story>

<Story name="Tooltip — desktop" exportName="TooltipDesktop" globals={reviewStoryGlobals.desktop} asChild>
  {@render tooltipExample(opened)}
</Story>

<Story name="Tooltip — mobile" exportName="TooltipMobile" globals={reviewStoryGlobals.mobile} asChild>
  {@render tooltipExample(opened)}
</Story>

<Story name="Tooltip closed" asChild>
  {@render tooltipExample(closed)}
</Story>

<style>
  .fullscreen-content {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: var(--space-6);
  }
  .narrow {
    inline-size: min(100%, var(--layout-container-sm));
  }
  .dialog-copy {
    margin: 0;
    color: var(--color-text-muted);
    line-height: var(--line-height-normal);
  }
</style>
