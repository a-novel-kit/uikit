<script lang="ts" module>
  import type { HTMLAttributes } from "svelte/elements";

  export interface SeparatorProps extends HTMLAttributes<HTMLElement> {
    orientation?: "horizontal" | "vertical";
    decorative?: boolean;
  }
</script>

<script lang="ts">
  let { orientation = "horizontal", decorative = false, class: className = "", ...rest }: SeparatorProps = $props();
</script>

{#if orientation === "horizontal"}
  <hr class="separator horizontal {className}" aria-hidden={decorative || undefined} {...rest} />
{:else}
  <span
    class="separator vertical {className}"
    role={decorative ? "presentation" : "separator"}
    aria-orientation={decorative ? undefined : "vertical"}
    aria-hidden={decorative || undefined}
    {...rest}
  ></span>
{/if}

<style>
  .separator {
    flex: none;
    margin: 0;
    border: 0;
    background: var(--color-border-subtle);
  }

  .horizontal {
    inline-size: 100%;
    block-size: var(--border-width-thin);
  }
  .vertical {
    align-self: stretch;
    inline-size: var(--border-width-thin);
    min-block-size: var(--icon-size-md);
  }
</style>
