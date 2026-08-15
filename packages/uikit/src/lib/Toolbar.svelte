<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  /** Props for a roving-focus group of three or more related controls. */
  export interface ToolbarProps extends Omit<
    HTMLAttributes<HTMLDivElement>,
    "children" | "role" | "aria-label" | "aria-orientation" | "onkeydown" | "onfocusin"
  > {
    /** Accessible name for the toolbar. */
    label: string;
    /** Axis along which controls and keyboard navigation are arranged. */
    orientation?: "horizontal" | "vertical";
    /** Wraps keyboard navigation from the last control to the first. */
    loop?: boolean;
    /** Toolbar controls and groups. */
    children: Snippet;
    /** Runs before the toolbar handles a key. */
    onkeydown?: (event: KeyboardEvent) => void;
    /** Runs before the toolbar updates its active tab stop. */
    onfocusin?: (event: FocusEvent) => void;
  }
</script>

<script lang="ts">
  import { getEnabledCompositeItems, moveCompositeFocus } from "./focus";

  import { onMount } from "svelte";

  let {
    label,
    orientation = "horizontal",
    loop = true,
    children,
    onkeydown,
    onfocusin,
    class: className = "",
    ...rest
  }: ToolbarProps = $props();

  let toolbarElement: HTMLDivElement;

  function syncTabStops(preferred?: HTMLElement) {
    const items = getEnabledCompositeItems(toolbarElement);
    const current =
      (preferred && items.includes(preferred) ? preferred : undefined) ??
      items.find((item) => item.tabIndex === 0) ??
      items[0];

    for (const item of items) item.tabIndex = item === current ? 0 : -1;
  }

  function handleFocusIn(event: FocusEvent) {
    onfocusin?.(event);
    if (event.defaultPrevented) return;

    const item = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-composite-item]") : null;
    if (item && toolbarElement.contains(item)) syncTabStops(item);
  }

  function handleKeyDown(event: KeyboardEvent) {
    onkeydown?.(event);
    if (event.defaultPrevented) return;

    const current = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-composite-item]") : null;
    if (!current || !toolbarElement.contains(current)) return;

    const items = getEnabledCompositeItems(toolbarElement);
    let next: HTMLElement | undefined;

    if (event.key === "Home") next = items[0];
    else if (event.key === "End") next = items.at(-1);
    else if (orientation === "horizontal" && event.key === "ArrowRight")
      next = moveCompositeFocus(items, current, 1, loop);
    else if (orientation === "horizontal" && event.key === "ArrowLeft")
      next = moveCompositeFocus(items, current, -1, loop);
    else if (orientation === "vertical" && event.key === "ArrowDown")
      next = moveCompositeFocus(items, current, 1, loop);
    else if (orientation === "vertical" && event.key === "ArrowUp") next = moveCompositeFocus(items, current, -1, loop);

    if (!next) return;
    event.preventDefault();
    syncTabStops(next);
    next.focus();
  }

  onMount(() => {
    syncTabStops();

    const observer = new MutationObserver(() => syncTabStops());
    observer.observe(toolbarElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["disabled", "aria-disabled"],
    });

    return () => observer.disconnect();
  });
</script>

<div
  bind:this={toolbarElement}
  class="toolbar {orientation} {className}"
  role="toolbar"
  aria-label={label}
  aria-orientation={orientation}
  onkeydown={handleKeyDown}
  onfocusin={handleFocusIn}
  {...rest}
>
  {@render children()}
</div>

<style>
  .toolbar {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    border-radius: var(--radius-lg);
    background: var(--color-surface-island-subtle);
    padding: var(--space-1);
    max-inline-size: 100%;
  }

  .horizontal {
    flex-flow: row wrap;
  }

  .vertical {
    flex-direction: column;
    align-items: stretch;
  }
</style>
