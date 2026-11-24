<!--
@component
Wraps a native table in a keyboard-scrollable region. Supply semantic table sections and header cells;
`caption` names the table and its scrolling region.
-->
<script lang="ts" module>
  import type { HTMLTableAttributes } from "svelte/elements";

  /** Props for a responsive native data table. */
  export interface TableProps extends HTMLTableAttributes {
    /** Table caption, which also names the scrolling region. */
    caption?: string;
    /** Keeps rows compact for data-dense views. */
    density?: "compact" | "default";
  }
</script>

<script lang="ts">
  import { useMessages } from "./internal/i18n";

  const { t } = useMessages();

  let { caption, density = "default", class: className = "", children, ...rest }: TableProps = $props();
</script>

<!-- Keyboard focus lets non-pointer users scroll a table when it overflows. -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
  class="scroller"
  tabindex="0"
  role="region"
  aria-label={caption ? t("table.captioned", { caption }) : t("table.uncaptioned")}
>
  <table class="{density} {className}" {...rest}>
    {#if caption}<caption>{caption}</caption>{/if}
    {@render children?.()}
  </table>
</div>

<style>
  /* The scroller carries the table's fill under its own border: a fill on the table would be clipped over the
     border's inner edge, and thin it along each corner. */
  .scroller {
    border: var(--border-width-thin) solid var(--color-border-divider);
    border-radius: var(--radius-lg);
    background: var(--color-surface-sunken);
    max-inline-size: 100%;
    overflow: auto;
  }

  .scroller:focus-visible {
    outline: var(--focus-ring-width) solid var(--color-focus-ring);
    outline-offset: var(--focus-ring-offset);
  }

  table {
    border-collapse: collapse;
    inline-size: 100%;
    color: var(--color-text-primary);
    font: var(--text-ui);
  }

  caption {
    padding: var(--space-3) var(--space-4);
    color: var(--color-text-secondary);
    font: var(--text-ui-strong);
    text-align: start;
  }

  /* The consumer's snippet supplies the rows and cells, which Svelte does not scope to this component. */
  table :global(th),
  table :global(td) {
    vertical-align: top;
    border-block-end: var(--border-width-thin) solid var(--color-border-divider);
    padding: var(--table-padding);
    text-align: start;
  }

  table :global(th) {
    color: var(--color-text-secondary);
    font: var(--text-ui-strong);
  }
  @media (hover: hover) {
    table :global(tbody tr:hover) {
      background: var(--color-surface-glass-hover);
    }
  }
  .compact {
    --table-padding: var(--space-2) var(--space-3);
  }
  .default {
    --table-padding: var(--space-3) var(--space-4);
  }
</style>
