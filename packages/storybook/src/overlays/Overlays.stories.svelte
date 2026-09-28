<script module lang="ts">
  import {
    Accordion,
    AccordionItem,
    Button,
    Dialog,
    Disclosure,
    IconButton,
    NavList,
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

  async function verifyTooltip({ canvasElement }: { canvasElement: HTMLElement }) {
    const canvas = within(canvasElement);
    await userEvent.hover(canvas.getByRole("button", { name: "Open help" }));
    await expect(canvas.getByRole("tooltip", { name: "Open help" })).toBeVisible();
  }
</script>

<script lang="ts">
  import { createOpenController } from "@a-novel-kit/uikit";

  function createLockedOpenController(): OpenController {
    const state = { open: true };

    return {
      state,
      open: () => {},
      close: () => {},
      toggle: () => {},
    };
  }

  const firstDisclosureController = createOpenController({ initialOpen: true });
  const secondDisclosureController = createOpenController();
  const firstAccordionController = createOpenController({ initialOpen: true });
  const secondAccordionController = createOpenController();
  const disabledAccordionController = createOpenController();
  const dialogDesktopController = createLockedOpenController();
  const dialogMobileController = createLockedOpenController();
  const popoverDesktopController = createLockedOpenController();
  const popoverMobileController = createLockedOpenController();
  const tooltipDesktopController = createLockedOpenController();
  const tooltipMobileController = createLockedOpenController();
  const tooltipInteractiveController = createOpenController();
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
      <Button {...props} variant="outline" tone="neutral">Open popover</Button>
    {/snippet}
    <Stack gap="3" style="inline-size: min(20rem, 80vi)">
      <strong>Preview options</strong>
      <span class="muted">Non-modal supporting content closes on Escape or an outside click.</span>
      <Button size="sm" onclick={() => controller.close()}>Apply</Button>
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

<Story name="Dialog — desktop" exportName="DialogDesktop" globals={reviewStoryGlobals.desktop} asChild>
  {@render dialogExample(dialogDesktopController)}
</Story>

<Story name="Dialog — mobile" exportName="DialogMobile" globals={reviewStoryGlobals.mobile} asChild>
  {@render dialogExample(dialogMobileController)}
</Story>

<Story name="Fullscreen — desktop" exportName="FullscreenDesktop" globals={reviewStoryGlobals.desktop} asChild>
  {@render fullscreenExample(dialogDesktopController)}
</Story>

<Story name="Fullscreen — mobile" exportName="FullscreenMobile" globals={reviewStoryGlobals.mobile} asChild>
  {@render fullscreenExample(dialogMobileController)}
</Story>

<Story name="Popover — desktop" exportName="PopoverDesktop" globals={reviewStoryGlobals.desktop} asChild>
  {@render popoverExample(popoverDesktopController)}
</Story>

<Story name="Popover — mobile" exportName="PopoverMobile" globals={reviewStoryGlobals.mobile} asChild>
  {@render popoverExample(popoverMobileController)}
</Story>

<Story name="Tooltip — desktop" exportName="TooltipDesktop" globals={reviewStoryGlobals.desktop} asChild>
  {@render tooltipExample(tooltipDesktopController)}
</Story>

<Story name="Tooltip — mobile" exportName="TooltipMobile" globals={reviewStoryGlobals.mobile} asChild>
  {@render tooltipExample(tooltipMobileController)}
</Story>

<Story name="Tooltip interaction" play={verifyTooltip} asChild>
  {@render tooltipExample(tooltipInteractiveController)}
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
