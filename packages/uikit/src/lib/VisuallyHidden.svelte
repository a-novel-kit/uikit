<script lang="ts" module>
  import type { HTMLAttributes } from "svelte/elements";

  /** Native attributes for content available only to assistive technology. */
  export type VisuallyHiddenProps = HTMLAttributes<HTMLSpanElement>;
</script>

<script lang="ts">
  let { class: className = "", children, ...rest }: VisuallyHiddenProps = $props();
</script>

<span class="visually-hidden {className}" {...rest}>{@render children?.()}</span>

<style>
  .visually-hidden {
    position: absolute;
    clip-path: inset(50%);
    border: 0;
    padding: 0;
    inline-size: var(--border-width-thin);
    block-size: var(--border-width-thin);
    overflow: hidden;
    white-space: nowrap;
  }
</style>
