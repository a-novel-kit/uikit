<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  /** Attributes that connect a button to its native popover. */
  export interface PopoverTriggerAttributes {
    /** Identifier of the popover controlled by the trigger. */
    popovertarget: string;
    /** Native action performed by the trigger. */
    popovertargetaction: "toggle";
  }

  /** Props for non-modal content anchored to a composed trigger. */
  export interface PopoverProps extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "popover" | "ontoggle"> {
    /** Renders the trigger with its required native popover attributes. */
    trigger: Snippet<[PopoverTriggerAttributes]>;
    /** Content shown in the popover. */
    children?: Snippet;
    /** Current popover visibility. */
    open?: boolean;
    /** Preferred side of the trigger. */
    position?: "top" | "right" | "bottom" | "left";
    /** Runs after the popover visibility changes. */
    onOpenChange?: (open: boolean) => void;
  }
</script>

<script lang="ts">
  let {
    trigger,
    children,
    open = $bindable(false),
    position = "bottom",
    onOpenChange,
    class: className = "",
    ...rest
  }: PopoverProps = $props();

  const popoverId = $props.id();
  const triggerAttributes: PopoverTriggerAttributes = {
    popovertarget: popoverId,
    popovertargetaction: "toggle",
  };

  let popoverElement: HTMLDivElement;

  $effect(() => {
    if (!popoverElement) return;

    const isOpen = popoverElement.matches(":popover-open");
    if (open === isOpen) return;

    if (open) {
      const source = document.querySelector(`[popovertarget="${CSS.escape(popoverId)}"]`);
      popoverElement.showPopover(source instanceof HTMLElement ? { source } : undefined);
    } else {
      popoverElement.hidePopover();
    }
  });

  function handleToggle(event: ToggleEvent) {
    const nextOpen = event.newState === "open";
    open = nextOpen;
    onOpenChange?.(nextOpen);
  }
</script>

{@render trigger(triggerAttributes)}

<div
  bind:this={popoverElement}
  id={popoverId}
  class="popover {position} {className}"
  popover="auto"
  ontoggle={handleToggle}
  {...rest}
>
  {@render children?.()}
</div>

<style>
  .popover {
    position: fixed;
    transform: translate(-50%, -50%);
    z-index: var(--layer-dropdown);
    box-sizing: border-box;
    margin: 0;
    inset: 50% auto auto 50%;
    box-shadow: var(--shadow-lg);
    border: 0;
    border-radius: var(--radius-lg);
    background: var(--color-surface-island-strong);
    padding: var(--space-4);
    inline-size: max-content;
    max-inline-size: min(calc(100vi - var(--space-8)), var(--layout-container-sm));
    max-block-size: calc(100dvb - var(--space-8));
    overflow: auto;
    color: var(--color-text-primary);
  }

  @supports (position-area: block-end) {
    .popover {
      position-try-fallbacks: flip-block, flip-inline;
      transform: none;
      margin: 0;
      inset: unset;
    }

    .top {
      position-area: block-start span-inline-end;
      justify-self: start;
      inset-block-end: var(--space-2);
    }
    .right {
      position-area: inline-end span-block-end;
      align-self: start;
      inset-inline-start: var(--space-2);
    }
    .bottom {
      position-area: block-end span-inline-end;
      justify-self: start;
      inset-block-start: var(--space-2);
    }
    .left {
      position-area: inline-start span-block-end;
      align-self: start;
      inset-inline-end: var(--space-2);
    }
  }

  @supports (backdrop-filter: blur(0)) or (-webkit-backdrop-filter: blur(0)) {
    .popover {
      -webkit-backdrop-filter: blur(var(--blur-md));
      backdrop-filter: blur(var(--blur-md));
      background: var(--color-surface-glass);
    }
  }

  @media (forced-colors: active) {
    .popover {
      border: var(--border-width-thin) solid CanvasText;
    }
  }
</style>
