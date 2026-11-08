<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  /** How far from its source a surface may sit and still count as anchored to it, in pixels. */
  const anchorReach = 24;
  const placementProperties = ["position-area", "inset", "top", "left"];

  /** Whether the surface sits against its source on some side, as anchor positioning puts it. */
  function besideSource(surface: HTMLElement, source: HTMLElement) {
    const from = source.getBoundingClientRect();
    const to = surface.getBoundingClientRect();
    return (
      Math.max(to.top - from.bottom, from.top - to.bottom, to.left - from.right, from.left - to.right) <= anchorReach
    );
  }

  /** Sets the surface under its source, or above it where the screen has no room below, at its owner's gap. A second
   * pass removes any constant offset between the page's coordinates and those of the browser's fixed layer, leaving
   * out the owner's entry slide. */
  function placeBySource(surface: HTMLElement, source: HTMLElement, gap: number) {
    const from = source.getBoundingClientRect();
    const { width, height } = surface.getBoundingClientRect();
    const below = from.bottom + gap;
    const top = below + height <= innerHeight || from.top - gap - height < 0 ? below : from.top - gap - height;
    const left = Math.max(0, Math.min(from.left, innerWidth - width));

    const set = (y: number, x: number) => {
      surface.style.setProperty("position-area", "none");
      surface.style.setProperty("inset", "auto");
      surface.style.setProperty("top", `${y}px`);
      surface.style.setProperty("left", `${x}px`);
    };
    set(top, left);
    const landed = surface.getBoundingClientRect();
    const slide = getComputedStyle(surface).translate;
    const [slideX = 0, slideY = 0] = slide === "none" ? [] : slide.split(" ").map((length) => parseFloat(length));
    set(2 * top - (landed.top - slideY), 2 * left - (landed.left - slideX));
  }

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
  import { untrack } from "svelte";

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

  // A closing surface stays until its owner's exit transition ends, however it closed.
  let shown = $state(untrack(() => open));
  // A surface open from the first render, as a pinned story shows it, is there at once: only later
  // openings play their owner's entry transition.
  let still = $state(untrack(() => open));

  $effect.pre(() => {
    if (open) shown = true;
    else still = false;
  });

  $effect(() => {
    if (open || !element) return;

    const surface = element;
    if (supportsPopover && surface.matches(":popover-open")) surface.hidePopover();

    const exits = surface.getAnimations?.({ subtree: true }) ?? [];
    if (exits.length === 0) {
      shown = false;
      return;
    }
    void Promise.allSettled(exits.map((exit) => exit.finished)).then(() => {
      if (!open) shown = false;
    });
  });

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

  // A browser can leave the surface away from its source: one without anchor positioning, or Safari on iOS 26, whose
  // floating toolbars shift its fixed layer. A script then sets the surface by its source and follows the page.
  $effect(() => {
    const surface = element;
    if (!open || !surface || !source || !supportsPopover) return;

    for (const property of placementProperties) surface.style.removeProperty(property);
    const gap = parseFloat(getComputedStyle(surface).insetBlockStart) || 0;
    if (besideSource(surface, source)) return;

    const place = () => placeBySource(surface, source, gap);
    place();
    addEventListener("scroll", place, { capture: true, passive: true });
    addEventListener("resize", place);
    return () => {
      removeEventListener("scroll", place, { capture: true });
      removeEventListener("resize", place);
    };
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

{#if shown}
  <div
    bind:this={element}
    class="floating-surface {className}"
    data-animate={still ? undefined : ""}
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

  /* An anchored surface keeps its owner's inset, which sets its distance from the source. Where the browser does not
     anchor it, the script places it by its source at the same distance. */
  @supports (position-area: block-end) {
    .floating-surface {
      position-try-fallbacks: flip-block, flip-inline;
    }
  }
</style>
