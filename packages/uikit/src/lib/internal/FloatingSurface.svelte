<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  /** Props for content promoted to the browser top layer. */
  export interface FloatingSurfaceProps extends Omit<
    HTMLAttributes<HTMLDivElement>,
    "children" | "popover" | "ontoggle"
  > {
    /** Current surface visibility. */
    open: boolean;
    /** Element used as the positioning anchor and popover invoker. */
    source?: HTMLElement | null;
    /** Native popover dismissal behavior. */
    mode?: "auto" | "manual";
    /** Exposes the rendered surface element to its owner. */
    element?: HTMLDivElement | null;
    /** Content rendered inside the surface. */
    children?: Snippet;
    /** Runs when native popover dismissal changes visibility. */
    onOpenChange?: (open: boolean) => void;
  }
</script>

<script lang="ts">
  let {
    open,
    source = null,
    mode = "auto",
    element = $bindable(null),
    children,
    onOpenChange,
    class: className = "",
    ...rest
  }: FloatingSurfaceProps = $props();

  const supportsPopover = typeof HTMLElement !== "undefined" && "showPopover" in HTMLElement.prototype;

  // The browser reads the anchor when the surface shows, so a source that arrives later shows it again.
  let anchoredSource: HTMLElement | null = null;

  $effect(() => {
    if (!open || !element || typeof element.showPopover !== "function") return;
    if (element.matches(":popover-open")) {
      if (!source || source === anchoredSource) return;
      element.hidePopover();
    }

    anchoredSource = source;
    element.showPopover(source ? { source } : undefined);
  });

  function handleToggle(event: ToggleEvent) {
    const nextOpen = event.newState === "open";
    if (nextOpen === open) return;

    onOpenChange?.(nextOpen);
    queueMicrotask(() => {
      if (!element || open === nextOpen) return;
      if (open) element.showPopover(source ? { source } : undefined);
      else element.hidePopover();
    });
  }
</script>

{#if open}
  <div
    bind:this={element}
    class="floating-surface {className}"
    popover={supportsPopover ? mode : undefined}
    ontoggle={handleToggle}
    {...rest}
  >
    {@render children?.()}
  </div>
{/if}

<style>
  .floating-surface {
    position: fixed;
    z-index: var(--layer-dropdown);
    box-sizing: border-box;
    margin: 0;
  }

  /* An anchored surface keeps its owner's inset, which sets its distance from the source. */
  @supports (position-area: block-end) {
    .floating-surface {
      position-try-fallbacks: flip-block, flip-inline;
    }
  }

  @supports not (position-area: block-end) {
    .floating-surface {
      transform: translate(-50%, -50%);
      inset: 50% auto auto 50%;
    }
  }
</style>
