<script lang="ts" module>
  import type { Content } from "./content";

  import type { Snippet } from "svelte";
  import type { HTMLDetailsAttributes } from "svelte/elements";

  /** Props for one native disclosure within an Accordion. */
  export interface AccordionItemProps extends Omit<HTMLDetailsAttributes, "children" | "name" | "open" | "ontoggle"> {
    /** Content rendered in the disclosure trigger. */
    summary: Content;
    /** Current expanded state. */
    open?: boolean;
    /** Prevents the item from being toggled. */
    disabled?: boolean;
    /** Content revealed while the item is open. */
    children?: Snippet;
    /** Runs after the expanded state changes. */
    onOpenChange?: (open: boolean) => void;
  }
</script>

<script lang="ts">
  import RenderContent from "./Content.svelte";
  import { type AccordionContext, accordionContextKey } from "./accordion";

  import { getContext } from "svelte";

  import { ChevronDownIcon } from "@a-novel-kit/uikit-icons";

  let {
    summary,
    open = $bindable(false),
    disabled = false,
    children,
    onOpenChange,
    class: className = "",
    ...rest
  }: AccordionItemProps = $props();

  const context = getContext<AccordionContext | undefined>(accordionContextKey);

  function handleToggle(event: ToggleEvent) {
    const nextOpen = event.newState === "open";
    open = nextOpen;
    onOpenChange?.(nextOpen);
  }

  function preventDisabledToggle(event: Event) {
    if (!disabled) return;
    event.preventDefault();
    event.stopPropagation();
  }
</script>

<details
  class="item {className}"
  name={context?.name}
  bind:open
  ontoggle={handleToggle}
  data-disabled={disabled || undefined}
  {...rest}
>
  <summary aria-disabled={disabled || undefined} tabindex={disabled ? -1 : undefined} onclick={preventDisabledToggle}>
    <span><RenderContent content={summary} /></span>
    <ChevronDownIcon class="indicator" size="var(--icon-size-sm)" aria-hidden="true" />
  </summary>
  <div class="content">
    {@render children?.()}
  </div>
</details>

<style>
  .item {
    border-radius: var(--radius-lg);
    background: transparent;
    overflow: clip;
    color: var(--color-text-secondary);
  }

  .item[open] {
    background: var(--color-surface-island-subtle);
  }

  summary {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-3);
    cursor: pointer;
    border-radius: var(--radius-lg);
    padding: var(--space-3) var(--space-4);
    color: var(--color-text-primary);
    font-weight: var(--font-weight-bold);
    font-family: var(--font-family-interface);
    list-style: none;
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

  :global(.indicator) {
    flex: none;
    transition: transform var(--duration-fast) var(--easing-standard);
  }

  .item[open] :global(.indicator) {
    transform: rotate(180deg);
  }

  .content {
    padding: 0 var(--space-4) var(--space-4);
    line-height: var(--line-height-normal);
  }
</style>
