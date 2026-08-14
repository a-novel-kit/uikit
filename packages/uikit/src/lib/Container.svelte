<script lang="ts" module>
  import type { HTMLAttributes } from "svelte/elements";

  export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
    /** Maximum inline size. Readable uses the prose measure. */
    size?: "sm" | "md" | "lg" | "readable" | "full";
    /** Applies the standard responsive page gutter. */
    gutter?: boolean;
  }
</script>

<script lang="ts">
  let { size = "lg", gutter = true, class: className = "", children, ...rest }: ContainerProps = $props();
</script>

<div class="container size-{size} {gutter ? 'gutter' : ''} {className}" {...rest}>
  {@render children?.()}
</div>

<style>
  .container {
    box-sizing: border-box;
    margin-inline: auto;
    inline-size: 100%;
  }

  .gutter {
    padding-inline: var(--layout-gutter);
  }
  .size-sm {
    max-inline-size: var(--layout-container-sm);
  }
  .size-md {
    max-inline-size: var(--layout-container-md);
  }
  .size-lg {
    max-inline-size: var(--layout-container-lg);
  }
  .size-readable {
    max-inline-size: var(--layout-readable-measure);
  }
  .size-full {
    max-inline-size: none;
  }
</style>
