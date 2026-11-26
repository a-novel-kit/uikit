<!--
Draws a custom color as its pair, the ink on the tint, beside the contrast the browser paints for it on the canvas.
A workbench block: an application draws its own items with `customColorStyle`.
-->
<script lang="ts">
  import { paintedContrast } from "./paintedContrast";

  import type { Snippet } from "svelte";

  import { customColorStyle } from "@a-novel-kit/uikit";

  interface Props {
    /** The custom color, or none. */
    color?: string;
    /** Draws the lit pair, as a label shows. */
    lit?: boolean;
    /** The text set in the ink. */
    children: Snippet;
  }

  let { color, lit = false, children }: Props = $props();

  const style = $derived(customColorStyle(color));
  let sample = $state<HTMLElement>();
  let ratio = $state<number>();

  // Measures what the browser painted, once the sample carries its style.
  $effect(() => {
    if (!sample || !style) return;

    const { backgroundColor, color: ink } = getComputedStyle(sample);
    const canvas = getComputedStyle(document.documentElement).getPropertyValue("--color-surface-canvas");
    ratio = paintedContrast(ink, backgroundColor, canvas || "black");
  });
</script>

<span class="pair" {style}>
  <span bind:this={sample} class="sample" class:lit>{@render children()}</span>
  <span class="ratio">{ratio === undefined ? "" : `${ratio.toFixed(1)}:1`}</span>
</span>

<style>
  .pair {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
  }

  .sample {
    border-radius: var(--radius-lg);
    background: var(--color-tint-custom);
    padding: var(--space-2) var(--space-4);
    color: var(--color-ink-custom);
    font: var(--text-action);
    white-space: nowrap;
  }

  .sample.lit {
    background: var(--color-tint-custom-lit);
    color: var(--color-ink-custom-lit);
  }

  .ratio {
    min-inline-size: var(--size-10);
    color: var(--color-text-muted);
    font: var(--text-meta);
    font-variant-numeric: tabular-nums;
  }
</style>
