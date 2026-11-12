<!--
@component
Renders a native modal dialog driven by `createOpenController` or a compatible controller.
Escape and backdrop interaction request closure; the controller decides whether it closes.
Supply a localized close control through `headerActions`.
An initially open dialog is visible without JavaScript; modal focus and backdrop behavior begin on hydration.
Opening focuses the dialog itself, so no control shows a focus ring until the reader moves on; a
child with `autofocus` takes focus instead. Opening and closing fade the dialog and its backdrop.

```svelte
<script lang="ts">
  import { Button, Dialog, IconButton, createOpenController } from "@a-novel-kit/uikit";
  import { X } from "@lucide/svelte";
  const dialog = createOpenController();
</script>

<Button onclick={dialog.open}>Details</Button>
<Dialog controller={dialog} title="Details">
  <p>Additional information.</p>
  {#snippet headerActions()}
    <IconButton label="Close dialog" variant="ghost" tone="neutral" size="sm" onclick={dialog.close}>
      <X size="var(--icon-size-sm)" />
    </IconButton>
  {/snippet}
</Dialog>
```
-->
<script lang="ts" module>
  import type { Content } from "./content";
  import type { OpenController } from "./controllers.svelte";

  import type { Snippet } from "svelte";
  import type { HTMLDialogAttributes } from "svelte/elements";

  /** External state contract for a dialog. */
  export type DialogController = OpenController;

  /** Props for a native modal or non-modal dialog. */
  export interface DialogProps extends Omit<HTMLDialogAttributes, "children" | "open" | "title" | "onclose"> {
    /** State owner that decides whether close requests take effect. */
    controller: DialogController;
    /** Dialog heading. */
    title: Content;
    /** Supporting content shown below the heading. */
    description?: Content;
    /** Controls beside the heading, such as a localized close button. */
    headerActions?: Snippet;
    /** Controls rendered after the dialog body. */
    actions?: Snippet;
    /** Centered by default; fullscreen fills the viewport with a scrollable body. */
    presentation?: "centered" | "fullscreen";
    /** Width of a centered dialog; sm suits a short form or a confirmation. Defaults to md. */
    size?: "sm" | "md";
    /** Uses native modal focus trapping and an inert background; defaults to true. */
    modal?: boolean;
    /** Requests controller.close() on backdrop clicks; defaults to true. The controller may refuse. */
    closeOnBackdrop?: boolean;
    /** Dialog body content. */
    children?: Snippet;
  }
</script>

<script lang="ts">
  import ActionGroup from "./ActionGroup.svelte";
  import PanelHeader from "./PanelHeader.svelte";

  import { onMount, untrack } from "svelte";

  let {
    controller,
    title,
    description,
    headerActions,
    actions,
    presentation = "centered",
    size = "md",
    modal = true,
    closeOnBackdrop = true,
    class: className = "",
    children,
    ...rest
  }: DialogProps = $props();

  const dialogId = $props.id();
  const titleId = `${dialogId}-title`;
  const descriptionId = `${dialogId}-description`;
  let dialog: HTMLDialogElement | undefined;
  const initiallyOpen = untrack(() => controller.state.open);
  // A dialog open from its first render, as a link to it opens it, is there at once; later openings fade in.
  let mounted = $state(false);
  onMount(() => (mounted = true));

  $effect(() => {
    if (!dialog) return;
    // Promote the server-rendered non-modal dialog into the browser's modal top layer.
    if (controller.state.open && modal && dialog.open && !dialog.matches(":modal")) dialog.close();
    if (controller.state.open && !dialog.open) showDialog();
    else if (!controller.state.open && dialog.open) dialog.close();
  });

  function showDialog() {
    if (!dialog) return;
    if (modal) dialog.showModal();
    else dialog.show();
    // The browser would focus the first control, usually the close button, and light its ring on
    // every opening. Focus the dialog itself unless content asks for autofocus; Tab reaches the rest.
    if (!dialog.querySelector("[autofocus]")) dialog.focus();
  }

  function handleCancel(event: Event) {
    event.preventDefault();
    controller.close();
  }

  // Reopens the dialog when the controller refuses a close the browser already performed.
  function handleClose(event: Event) {
    const currentDialog = event.currentTarget as HTMLDialogElement;
    if (currentDialog.open || !controller.state.open) return;

    controller.close();
    if (controller.state.open) queueMicrotask(showDialog);
  }

  function handleBackdrop(event: MouseEvent) {
    if (closeOnBackdrop && event.target === event.currentTarget) controller.close();
  }
</script>

<dialog
  bind:this={dialog}
  open={initiallyOpen}
  tabindex="-1"
  class="dialog {presentation} {size} {className}"
  class:mounted
  aria-labelledby={titleId}
  aria-describedby={description ? descriptionId : undefined}
  oncancel={handleCancel}
  onclose={handleClose}
  onclick={handleBackdrop}
  {...rest}
>
  <div class="panel">
    <PanelHeader {title} {description} {titleId} {descriptionId} actions={headerActions} />
    {#if children}<div class="content">{@render children()}</div>{/if}
    {#if actions}<footer><ActionGroup children={actions} /></footer>{/if}
  </div>
</dialog>

<style>
  /* Opening fades the dialog and its backdrop in as the dialog rises a little; closing plays it back.
     A browser without discrete transitions opens and closes it at once. */
  .dialog {
    --dialog-padding: var(--space-4);
    --dialog-margin: var(--space-2);
    --dialog-width: var(--layout-container-sm);
    --dialog-rise: var(--space-2);
    position: fixed;
    z-index: var(--layer-modal);
    transition:
      opacity var(--duration-normal) var(--easing-standard),
      translate var(--duration-normal) var(--easing-standard),
      overlay var(--duration-normal) allow-discrete,
      display var(--duration-normal) allow-discrete;
    box-sizing: border-box;
    margin: auto;
    inset: 0;
    box-shadow: var(--shadow-lg);
    border: 0;
    border-radius: var(--radius-xl);
    background: var(--color-surface-island-strong);
    padding: 0;
    inline-size: min(calc(100vi - 2 * var(--dialog-margin)), var(--dialog-width));
    max-inline-size: none;
    max-block-size: calc(100dvb - 2 * var(--dialog-margin));
    overflow: auto;
    overscroll-behavior: contain;
    color: var(--color-text-primary);
  }
  .dialog:not([open]) {
    translate: 0 var(--dialog-rise);
    opacity: 0;
  }
  /* A modal dialog holds the page behind it still, as a phone would otherwise scroll it under its menu. */
  :global(:root:has(dialog.dialog:modal)) {
    overflow: hidden;
  }
  .dialog:focus {
    outline: none;
  }
  .dialog::backdrop {
    backdrop-filter: blur(var(--blur-sm));
    transition:
      opacity var(--duration-normal) var(--easing-standard),
      overlay var(--duration-normal) allow-discrete,
      display var(--duration-normal) allow-discrete;
    background: var(--color-overlay-backdrop);
  }
  .dialog:not([open])::backdrop {
    opacity: 0;
  }
  @starting-style {
    .mounted[open] {
      translate: 0 var(--dialog-rise);
      opacity: 0;
    }
    .mounted[open]::backdrop {
      opacity: 0;
    }
  }
  .panel {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
    box-sizing: border-box;
    padding: var(--dialog-padding);
    min-inline-size: 0;
    max-block-size: calc(100dvb - 2 * var(--dialog-margin));
  }
  /* The body scrolls on its own, out to the dialog's sides and bottom, so only the dialog's own edge
     cuts a child's focus ring or the glow of an action. */
  .content {
    margin: calc(-1 * var(--space-2)) calc(-1 * var(--dialog-padding)) calc(-1 * var(--dialog-padding));
    padding: var(--space-2) var(--dialog-padding) var(--dialog-padding);
    min-inline-size: 0;
    min-block-size: var(--control-height-md);
    overflow: auto;
  }
  footer {
    flex: none;
    padding-block-start: var(--space-1);
  }

  .sm {
    --dialog-width: var(--layout-container-xs);
  }

  @media (min-width: 48rem) {
    .dialog {
      --dialog-padding: var(--space-6);
      --dialog-margin: var(--space-4);
    }
  }

  /* A fullscreen dialog covers the page as a phone's navigation menu does, and only fades. Its thin
     edge matches the compact app header it covers, so its title and close button open where the
     header's controls were. */
  .fullscreen {
    --dialog-padding: var(--space-2);
    --dialog-margin: var(--space-0);
    --dialog-rise: var(--space-0);
    margin: 0;
    box-shadow: none;
    border-radius: 0;
    inline-size: 100vi;
    block-size: 100dvb;
    max-block-size: none;
  }
  .fullscreen .panel {
    padding-block-start: var(--space-1);
    block-size: 100%;
  }
  .fullscreen .content {
    display: grid;
    flex: 1;
  }

  @media (forced-colors: active) {
    .dialog {
      border: var(--border-width-thin) solid CanvasText;
    }
  }
</style>
