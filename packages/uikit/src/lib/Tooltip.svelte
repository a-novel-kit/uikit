<script lang="ts" module>
  import type { Content } from "./content";

  import type { Snippet } from "svelte";

  /** Primitive attributes applied to a composed tooltip trigger. */
  export type TooltipTriggerAttributes = Record<string, unknown>;

  /** Props for a short description attached to a trigger. */
  export interface TooltipProps {
    /** Description shown in the tooltip. */
    content: Content;
    /** Renders the trigger with its required primitive attributes. */
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

  import { Tooltip as TooltipPrimitive } from "bits-ui";

  let { content, trigger, side = "top", delayDuration = 400, disabled = false }: TooltipProps = $props();
</script>

<TooltipPrimitive.Provider {delayDuration}>
  <TooltipPrimitive.Root {disabled}>
    <TooltipPrimitive.Trigger>
      {#snippet child({ props })}
        {@render trigger(props)}
      {/snippet}
    </TooltipPrimitive.Trigger>
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content class="agora-tooltip" {side} sideOffset={8}>
        <RenderContent {content} />
        <TooltipPrimitive.Arrow class="agora-tooltip-arrow" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  </TooltipPrimitive.Root>
</TooltipPrimitive.Provider>

<style>
  :global(.agora-tooltip) {
    transform-origin: var(--bits-tooltip-content-transform-origin);
    z-index: var(--layer-dropdown);
    box-shadow: var(--shadow-md);
    border: 0;
    border-radius: var(--radius-md);
    background: var(--color-surface-island-strong);
    padding: var(--space-2) var(--space-3);
    max-inline-size: calc(var(--space-base) * var(--multiplier-64));
    color: var(--color-text-primary);
    font-size: var(--font-size-xs);
    line-height: var(--line-height-compact);
    font-family: var(--font-family-interface);
  }
  :global(.agora-tooltip-arrow) {
    fill: var(--color-surface-island-strong);
  }

  @supports (backdrop-filter: blur(0)) or (-webkit-backdrop-filter: blur(0)) {
    :global(.agora-tooltip) {
      -webkit-backdrop-filter: blur(var(--blur-md));
      backdrop-filter: blur(var(--blur-md));
      background: var(--color-surface-glass);
    }

    :global(.agora-tooltip-arrow) {
      fill: var(--color-surface-glass);
    }
  }

  @media (forced-colors: active) {
    :global(.agora-tooltip) {
      border: var(--border-width-thin) solid CanvasText;
    }
  }
</style>
