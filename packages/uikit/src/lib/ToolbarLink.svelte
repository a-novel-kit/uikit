<script lang="ts" module>
  import type { LinkProps } from "./Link.svelte";

  /** A Link registered in its nearest Toolbar focus model. */
  export type ToolbarLinkProps = LinkProps;
</script>

<script lang="ts">
  import Link from "./Link.svelte";

  let { children, variant = "quiet", class: className = "", ...linkProps }: ToolbarLinkProps = $props();
</script>

<Link {...linkProps} {variant} class="toolbar-link {className}" data-composite-item="" tabindex={-1}>
  {@render children?.()}
</Link>

<style>
  :global(.link.toolbar-link) {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    gap: var(--space-2);
    box-sizing: border-box;
    border: var(--border-width-thin) solid transparent;
    border-radius: var(--radius-md);
    padding-inline: var(--space-3);
    padding-block: var(--space-1-5);
    min-block-size: var(--control-height-sm);
    font-weight: var(--font-weight-bold);
    font-size: var(--font-size-sm);
    line-height: var(--line-height-tight);
  }
</style>
