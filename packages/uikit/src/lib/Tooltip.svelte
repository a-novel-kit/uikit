<script lang="ts" module>
  import type { Content } from "./content";
  import type { OpenController as StateController } from "./controllers.svelte";

  import type { Snippet } from "svelte";

  /** Attributes applied to a composed tooltip trigger. */
  export interface TooltipTriggerAttributes {
    /** Identifies the tooltip that describes the trigger. */
    "aria-describedby": string;
    /** Exposes visibility for trigger styling. */
    "data-state": "open" | "closed";
    /** Starts the delayed tooltip on pointer entry. */
    onpointerenter: (event: PointerEvent) => void;
    /** Closes the tooltip after pointer exit. */
    onpointerleave: (event: PointerEvent) => void;
    /** Starts the delayed tooltip when the trigger receives focus. */
    onfocus: (event: FocusEvent) => void;
    /** Closes the tooltip when the trigger loses focus. */
    onblur: (event: FocusEvent) => void;
    /** Closes the tooltip with Escape. */
    onkeydown: (event: KeyboardEvent) => void;
  }

  /** External state contract for a tooltip. */
  export type TooltipController = StateController;

  /** Props for a short description attached to a trigger. */
  export interface TooltipProps {
    /** Description shown in the tooltip. */
    content: Content;
    /** State owner that decides whether visibility requests take effect. */
    controller: TooltipController;
    /** Renders the trigger with its required attributes. */
    trigger: Snippet<[TooltipTriggerAttributes]>;
    /** Preferred side of the trigger. */
    side?: "top" | "right" | "bottom" | "left";
    /** Delay in milliseconds before the tooltip opens. */
    delayDuration?: number;
    /** Prevents the tooltip from opening. */
    disabled?: boolean;
  }
</script>

<script lang="ts">
  import RenderContent from "./Content.svelte";
  import FloatingSurface from "./internal/FloatingSurface.svelte";

  import { onDestroy } from "svelte";

  let { content, controller, trigger, side = "top", delayDuration = 400, disabled = false }: TooltipProps = $props();

  const componentId = $props.id();
  const tooltipId = componentId + "-tooltip";

  let hovered = false;
  let focused = false;
  let source = $state<HTMLElement | null>(null);
  let openTimer: ReturnType<typeof setTimeout> | undefined;

  const triggerAttributes = $derived<TooltipTriggerAttributes>({
    "aria-describedby": tooltipId,
    "data-state": controller.state.open ? "open" : "closed",
    onpointerenter: handlePointerEnter,
    onpointerleave: handlePointerLeave,
    onfocus: handleFocus,
    onblur: handleBlur,
    onkeydown: handleKeyDown,
  });

  $effect(() => {
    if (!disabled) return;

    clearTimeout(openTimer);
    controller.close();
  });

  function scheduleOpen(element: HTMLElement) {
    if (disabled) return;

    source = element;
    clearTimeout(openTimer);
    openTimer = setTimeout(() => {
      if (hovered || focused) controller.open();
    }, delayDuration);
  }

  function closeIfInactive() {
    if (hovered || focused) return;

    clearTimeout(openTimer);
    controller.close();
  }

  function handlePointerEnter(event: PointerEvent) {
    hovered = true;
    scheduleOpen(event.currentTarget as HTMLElement);
  }

  function handlePointerLeave() {
    hovered = false;
    closeIfInactive();
  }

  function handleFocus(event: FocusEvent) {
    focused = true;
    scheduleOpen(event.currentTarget as HTMLElement);
  }

  function handleBlur() {
    focused = false;
    closeIfInactive();
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key !== "Escape" || !controller.state.open) return;

    event.preventDefault();
    clearTimeout(openTimer);
    controller.close();
  }

  onDestroy(() => clearTimeout(openTimer));
</script>

{@render trigger(triggerAttributes)}

<FloatingSurface
  open={controller.state.open}
  {source}
  mode="manual"
  id={tooltipId}
  class="agora-tooltip {side}"
  role="tooltip"
  onOpenChange={(open) => (open ? controller.open() : controller.close())}
>
  <RenderContent {content} />
</FloatingSurface>

<style>
  :global(.agora-tooltip) {
    z-index: var(--layer-dropdown);
    box-shadow: var(--shadow-md);
    border: 0;
    border-radius: var(--radius-md);
    background: var(--color-surface-island-strong);
    padding: var(--space-2) var(--space-3);
    max-inline-size: calc(var(--space-base) * var(--multiplier-64));
    pointer-events: none;
    color: var(--color-text-primary);
    font-size: var(--font-size-xs);
    line-height: var(--line-height-compact);
    font-family: var(--font-family-interface);
  }
  :global(.agora-tooltip.top) {
    position-area: block-start span-inline-end;
    justify-self: start;
    inset-block-end: var(--space-2);
  }
  :global(.agora-tooltip.right) {
    position-area: inline-end span-block-end;
    align-self: start;
    inset-inline-start: var(--space-2);
  }
  :global(.agora-tooltip.bottom) {
    position-area: block-end span-inline-end;
    justify-self: start;
    inset-block-start: var(--space-2);
  }
  :global(.agora-tooltip.left) {
    position-area: inline-start span-block-end;
    align-self: start;
    inset-inline-end: var(--space-2);
  }
  :global(.agora-tooltip::before) {
    position: absolute;
    transform: rotate(45deg);
    background: inherit;
    inline-size: var(--space-2);
    block-size: var(--space-2);
    content: "";
  }
  :global(.agora-tooltip.top::before) {
    inset-block-end: calc(var(--space-1) * -1);
    inset-inline-start: calc(50% - var(--space-1));
  }
  :global(.agora-tooltip.right::before) {
    inset-block-start: calc(50% - var(--space-1));
    inset-inline-start: calc(var(--space-1) * -1);
  }
  :global(.agora-tooltip.bottom::before) {
    inset-block-start: calc(var(--space-1) * -1);
    inset-inline-start: calc(50% - var(--space-1));
  }
  :global(.agora-tooltip.left::before) {
    inset-block-start: calc(50% - var(--space-1));
    inset-inline-end: calc(var(--space-1) * -1);
  }

  @supports (backdrop-filter: blur(0)) or (-webkit-backdrop-filter: blur(0)) {
    :global(.agora-tooltip) {
      -webkit-backdrop-filter: blur(var(--blur-md));
      backdrop-filter: blur(var(--blur-md));
      background: var(--color-surface-glass);
    }
  }

  @media (forced-colors: active) {
    :global(.agora-tooltip) {
      border: var(--border-width-thin) solid CanvasText;
    }
  }
</style>
