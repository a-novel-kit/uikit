<script lang="ts" module>
  import type { Content } from "./content";

  import type { Snippet } from "svelte";
  import type { HTMLDialogAttributes } from "svelte/elements";

  export interface DialogProps extends Omit<HTMLDialogAttributes, "children" | "open" | "title" | "onclose"> {
    open?: boolean;
    title: Content;
    description?: Content;
    actions?: Snippet;
    modal?: boolean;
    closeOnBackdrop?: boolean;
    onClose?: (returnValue: string) => void;
    children?: Snippet;
  }
</script>

<script lang="ts">
  import RenderContent from "./Content.svelte";

  let {
    open = $bindable(false),
    title,
    description,
    actions,
    modal = true,
    closeOnBackdrop = true,
    onClose,
    class: className = "",
    children,
    ...rest
  }: DialogProps = $props();

  const dialogId = $props.id();
  const titleId = `${dialogId}-title`;
  const descriptionId = `${dialogId}-description`;
  let dialog: HTMLDialogElement;

  $effect(() => {
    if (!dialog) return;
    if (open && !dialog.open) {
      if (modal) dialog.showModal();
      else dialog.show();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  });

  function handleClose() {
    open = false;
    onClose?.(dialog.returnValue);
  }

  function handleBackdrop(event: MouseEvent) {
    if (closeOnBackdrop && event.target === dialog) dialog.close();
  }
</script>

<dialog
  bind:this={dialog}
  class="dialog {className}"
  aria-labelledby={titleId}
  aria-describedby={description ? descriptionId : undefined}
  onclose={handleClose}
  onclick={handleBackdrop}
  {...rest}
>
  <div class="panel">
    <header>
      <h2 id={titleId}><RenderContent content={title} /></h2>
      {#if description}<p id={descriptionId}><RenderContent content={description} /></p>{/if}
    </header>
    <div class="content">{@render children?.()}</div>
    {#if actions}<footer>{@render actions()}</footer>{/if}
  </div>
</dialog>

<style>
  .dialog {
    margin: auto;
    box-shadow: var(--shadow-lg);
    border: 0;
    border-radius: var(--radius-xl);
    background: var(--color-surface-island-strong);
    padding: 0;
    max-inline-size: min(calc(100vi - var(--space-8)), var(--layout-container-sm));
    max-block-size: calc(100dvb - var(--space-8));
    overflow: auto;
    color: var(--color-text-primary);
  }
  .dialog::backdrop {
    backdrop-filter: blur(var(--blur-sm));
    background: var(--color-overlay-backdrop);
  }
  .panel {
    display: grid;
    min-inline-size: min(80vi, calc(var(--layout-container-sm) - var(--space-8)));
  }
  header,
  .content,
  footer {
    padding: var(--space-5);
  }
  footer {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: var(--space-2);
  }
  h2 {
    margin: 0;
    color: var(--color-text-primary);
    font-size: var(--font-size-xl);
    line-height: var(--line-height-tight);
    font-family: var(--font-family-display);
  }
  p {
    margin: var(--space-2) 0 0;
    color: var(--color-text-muted);
    font-size: var(--font-size-sm);
    line-height: var(--line-height-normal);
  }

  @supports (backdrop-filter: blur(0)) or (-webkit-backdrop-filter: blur(0)) {
    .dialog {
      -webkit-backdrop-filter: blur(var(--blur-lg));
      backdrop-filter: blur(var(--blur-lg));
      background: var(--color-surface-glass);
    }
  }

  @media (forced-colors: active) {
    .dialog {
      border: var(--border-width-thin) solid CanvasText;
    }
  }
</style>
