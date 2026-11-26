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
  import { hold, overModal } from "./internal/overModal.svelte";
  import { holdPage } from "./internal/pageHold";

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

  // Open as a modal, it leaves the page inert, so while it is the topmost one it shows the page's requests too.
  const self = Symbol(dialogId);
  let leaveTop: (() => void) | undefined;
  const hosting = $derived(overModal.dialogs.at(-1) === self);
  // A request it shows stays fixed to the screen, where a moving dialog would carry it along, so while one waits the
  // dialog fades without rising. It keys on waiting requests, not on hosting: showDialog's focus starts the rise first.
  const steady = $derived(modal && overModal.requests.length > 0);
  // A modal dialog inside a shadow root, which its page rules cannot reach, holds the page itself until it fades out.
  let heldPage: ReturnType<typeof holdPage>;

  function leave() {
    leaveTop?.();
    heldPage?.leave();
    leaveTop = heldPage = undefined;
  }

  $effect(() => leave);

  $effect(() => {
    if (!dialog) return;
    // Promote the server-rendered non-modal dialog into the browser's modal top layer.
    if (controller.state.open && modal && dialog.open && !dialog.matches(":modal")) dialog.close();
    if (controller.state.open && !dialog.open) showDialog();
    else if (!controller.state.open && dialog.open) dialog.close();
  });

  function showDialog() {
    if (!dialog) return;
    if (modal) {
      dialog.showModal();
      leaveTop ??= untrack(() => hold(overModal.dialogs, self));
      heldPage?.leave();
      heldPage = holdPage(dialog, presentation !== "fullscreen");
    } else dialog.show();
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
    if (!currentDialog.open) heldPage?.release();
    // It keeps the requests through its fade out, so they cross back to the page's own instead of blinking.
    void Promise.allSettled(currentDialog.getAnimations().map((animation) => animation.finished)).then(() => {
      if (!currentDialog.open) leave();
    });
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
  class:steady
  data-island
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
  {#if hosting}
    {#each overModal.requests as request (request)}{@render request()}{/each}
  {/if}
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
      opacity var(--motion-surface),
      translate var(--motion-surface),
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
  .dialog.steady {
    translate: none;
  }
  /* A modal dialog holds the page behind it still, as a phone would otherwise scroll it under its menu. These page rules
     reach no dialog inside a shadow root, which holds the page through holdPage instead: change both together. */
  :global(:root:has(dialog.dialog:modal)) {
    overflow: hidden;
  }
  /* A modal dialog blurs the page behind it, and the page itself takes that blur, through a filter on the root: the
     backdrop only dims. A backdrop-filter is recomputed over the whole screen for every frame drawn above it, a
     keystroke in the dialog included, where a filtered page is blurred once and then only composited: without a GPU,
     at 1080p, a dialog holds 60 frames a second against 27. The top layer, where a dialog lives, lies outside the
     root's filter, and a root's filter leaves fixed elements in place, which any other element's would unpin. The
     blur eases in and out with the dialog, so the root keeps its transition wherever a dialog exists. A fullscreen
     dialog covers the page, so it blurs nothing. */
  :global(:root:has(dialog.dialog)) {
    transition: filter var(--motion-surface);
  }
  :global(:root:has(dialog.dialog:modal[open]:not(.fullscreen))) {
    filter: blur(var(--blur-sm));
  }
  /* Under that blur, a frosted page surface's own blur sits unseen and still costs: the root is drawn slower with
     them. Each one (a card, a sticky bar, the consent banner, a toast) carries data-frost: its blur drops once the
     backdrop has faded in, so none shows unfrosted, and returns at once when the dialog closes. One inside a dialog
     keeps it, and a ghost card lit by the pointer still fades as it dims. */
  :global(:root:has(dialog.dialog:modal) [data-frost]:not(dialog *)) {
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
    transition:
      background-color var(--motion-state),
      box-shadow var(--motion-state),
      backdrop-filter 0s var(--duration-normal),
      -webkit-backdrop-filter 0s var(--duration-normal);
  }
  /* Each frame drawn on the page makes the root blur it again. What animates on the page, such as a skeleton's
     shimmer, pauses while a modal dialog holds the page inert, and carries on when the dialog closes. What the dialog
     holds keeps moving. */
  :global(:root:has(dialog.dialog:modal) :not(dialog, dialog *)),
  :global(:root:has(dialog.dialog:modal) :not(dialog, dialog *)::before),
  :global(:root:has(dialog.dialog:modal) :not(dialog, dialog *)::after) {
    animation-play-state: paused;
  }
  .dialog:focus {
    outline: none;
  }
  .dialog::backdrop {
    transition:
      opacity var(--motion-surface),
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
    .mounted.steady[open] {
      translate: none;
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
     cuts a child's focus ring. */
  .content {
    /* What scrolls toward the footer fades out over the body's end inset, where nothing sits at rest, so a long
       form never ends on a line sliced against its actions. */
    mask-image: linear-gradient(black calc(100% - var(--dialog-padding)), transparent);
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

  /* Its auto margins center the dialog, so an even height splits the space they share into whole pixels on an even
     viewport, and its text stays on them. A browser without calc-size keeps the fitted height. */
  .centered {
    /* off-scale: an even height, so what the page centers stays on whole pixels */
    block-size: calc-size(fit-content, round(up, size, 2px));
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
