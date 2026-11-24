<!--
@component
Renders a native anchor, underlined as in prose. The caller owns the destination URL. A link styled as a
control is a `Button` with `href`.
-->
<script lang="ts" module>
  import type { HTMLAnchorAttributes } from "svelte/elements";

  /** Props for a styled native anchor. */
  export type LinkProps = HTMLAnchorAttributes;
</script>

<script lang="ts">
  let { class: className = "", children, ...rest }: LinkProps = $props();
</script>

<a class="link {className}" {...rest}>
  {@render children?.()}
</a>

<style>
  .link {
    transition:
      color var(--motion-state),
      background-color var(--motion-state);
    border-radius: var(--radius-sm);
    color: var(--color-text-link);
    text-decoration-thickness: var(--border-width-thin);
    text-underline-offset: var(--space-1);
  }

  @media (hover: hover) {
    .link:hover {
      color: var(--color-text-link-hover);
      text-decoration-thickness: var(--border-width-strong);
    }
  }

  .link:focus-visible {
    outline: var(--focus-ring-width) solid var(--color-focus-ring);
    outline-offset: var(--focus-ring-offset);
  }
</style>
