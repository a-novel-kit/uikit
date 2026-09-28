<!--
@component
Reveals inline content with a text or composed summary and an external open controller.
Controller methods may reject a toggle; the rendered disclosure follows the accepted state.
-->
<script lang="ts" module>
  import type { Content } from "./content";
  import type { OpenController } from "./controllers.svelte";

  import type { Snippet } from "svelte";
  import type { HTMLDetailsAttributes } from "svelte/elements";

  /** External state contract for one disclosure. */
  export type DisclosureController = OpenController;

  /** Props for an inline disclosure with a composed summary. */
  export interface DisclosureProps extends Omit<HTMLDetailsAttributes, "children" | "open" | "ontoggle"> {
    /** Content rendered in the disclosure trigger. */
    summary: Content;
    /** State owner that decides whether toggle requests take effect. */
    controller: DisclosureController;
    /** Prevents the item from being toggled. */
    disabled?: boolean;
    /** Content revealed while the item is open. */
    children?: Snippet;
  }
</script>

<script lang="ts">
  import RenderContent from "./Content.svelte";

  import { ChevronDown as ChevronDownIcon } from "@lucide/svelte";

  let { summary, controller, disabled = false, children, class: className = "", ...rest }: DisclosureProps = $props();

  function handleToggle(event: ToggleEvent) {
    const details = event.currentTarget as HTMLDetailsElement;
    const nextOpen = event.newState === "open";
    if (nextOpen === controller.state.open) return;

    if (nextOpen) controller.open();
    else controller.close();
    if (controller.state.open !== nextOpen) queueMicrotask(() => (details.open = controller.state.open));
  }

  function preventDisabledToggle(event: Event) {
    if (!disabled) return;
    event.preventDefault();
    event.stopPropagation();
  }
</script>

<details
  class="disclosure {className}"
  open={controller.state.open}
  ontoggle={handleToggle}
  data-disabled={disabled || undefined}
  {...rest}
>
  <summary aria-disabled={disabled || undefined} tabindex={disabled ? -1 : undefined} onclick={preventDisabledToggle}>
    <span class="summary"><RenderContent content={summary} /></span>
    <ChevronDownIcon class="indicator" size="var(--icon-size-sm)" aria-hidden="true" />
  </summary>
  {#if children}<div class="content">{@render children()}</div>{/if}
</details>

<style>
  .disclosure {
    border-radius: var(--radius-lg);
    background: transparent;
    color: var(--color-text-secondary);
  }

  .disclosure[open] {
    background: var(--color-surface-island-subtle);
  }

  summary {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-3);
    cursor: pointer;
    box-sizing: border-box;
    border-radius: var(--radius-lg);
    padding: var(--space-3) var(--space-4);
    min-block-size: var(--control-height-lg);
    color: var(--color-text-primary);
    font-weight: var(--font-weight-bold);
    font-size: var(--font-size-sm);
    line-height: var(--line-height-compact);
    font-family: var(--font-family-interface);
    list-style: none;
  }

  .summary {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2);
    min-inline-size: 0;
    overflow-wrap: anywhere;
  }

  summary::-webkit-details-marker {
    display: none;
  }

  summary:hover:not([aria-disabled="true"]) {
    background: var(--color-surface-glass-hover);
  }

  summary:focus-visible {
    outline: var(--focus-ring-width) solid var(--color-focus-ring);
    outline-offset: calc(var(--focus-ring-offset) * -1);
  }

  summary[aria-disabled="true"] {
    cursor: not-allowed;
    color: var(--color-text-disabled);
  }

  .disclosure > summary > :global(.indicator) {
    flex: none;
    transition: transform var(--duration-fast) var(--easing-standard);
  }

  .disclosure[open] > summary > :global(.indicator) {
    transform: rotate(180deg);
  }

  .content {
    padding: 0 var(--space-4) var(--space-4);
    line-height: var(--line-height-normal);
    overflow-wrap: anywhere;
  }
  @media (prefers-reduced-motion: reduce) {
    .disclosure > summary > :global(.indicator) {
      transition: none;
    }
  }
  @media (forced-colors: active) {
    .disclosure[open] {
      outline: var(--border-width-thin) solid CanvasText;
    }
  }
</style>
