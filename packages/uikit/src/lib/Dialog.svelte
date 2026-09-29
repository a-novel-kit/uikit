<!--
@component
Renders a native modal dialog driven by `createOpenController` or a compatible controller.
Escape and backdrop interaction request closure; the controller decides whether it closes.
Supply a localized close control through `headerActions`.

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
    /** Optional controls rendered after the dialog body. */
    actions?: Snippet;
    /** Centered by default; fullscreen fills the viewport with a scrollable body. */
    presentation?: "centered" | "fullscreen";
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

  let {
    controller,
    title,
    description,
    headerActions,
    actions,
    presentation = "centered",
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

  $effect(() => {
    if (!dialog) return;
    if (controller.state.open && !dialog.open) {
      if (modal) dialog.showModal();
      else dialog.show();
    } else if (!controller.state.open && dialog.open) {
      dialog.close();
    }
  });

  function requestClose() {
    controller.close();
  }

  function handleCancel(event: Event) {
    event.preventDefault();
    requestClose();
  }

  function handleClose(event: Event) {
    const currentDialog = event.currentTarget as HTMLDialogElement;
    if (currentDialog.open || !controller.state.open) return;

    requestClose();
    if (controller.state.open)
      queueMicrotask(() => {
        if (modal) dialog?.showModal();
        else dialog?.show();
      });
  }

  function handleBackdrop(event: MouseEvent) {
    const currentDialog = event.currentTarget as HTMLDialogElement;

    if (closeOnBackdrop && event.target === currentDialog) requestClose();
  }
</script>

<dialog
  bind:this={dialog}
  class="dialog {presentation} {className}"
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
    {#if actions}<footer><ActionGroup align="end" children={actions} /></footer>{/if}
  </div>
</dialog>

<style>
  .dialog {
    --dialog-padding: var(--space-4);
    --dialog-margin: var(--space-2);
    box-sizing: border-box;
    margin: auto;
    box-shadow: var(--shadow-lg);
    border: 0;
    border-radius: var(--radius-xl);
    background: var(--color-surface-island-strong);
    padding: 0;
    inline-size: min(calc(100vi - 2 * var(--dialog-margin)), var(--layout-container-sm));
    max-inline-size: none;
    max-block-size: calc(100dvb - 2 * var(--dialog-margin));
    overflow: auto;
    color: var(--color-text-primary);
  }
  .dialog::backdrop {
    backdrop-filter: blur(var(--blur-sm));
    background: var(--color-overlay-backdrop);
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
  .content {
    /* Keep child focus outlines inside the independently scrolling body. */
    margin: calc(-1 * var(--space-2));
    padding: var(--space-2);
    min-inline-size: 0;
    min-block-size: var(--control-height-md);
    overflow: auto;
  }
  footer {
    flex: none;
    padding-block-start: var(--space-1);
  }

  @media (min-width: 48rem) {
    .dialog {
      --dialog-padding: var(--space-5);
      --dialog-margin: var(--space-4);
    }
  }

  .fullscreen {
    --dialog-margin: var(--space-0);
    margin: 0;
    box-shadow: none;
    border-radius: 0;
    inline-size: 100vi;
    block-size: 100dvb;
    max-block-size: none;
  }
  .fullscreen .panel {
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
