<script lang="ts" module>
  import type { HTMLAnchorAttributes } from "svelte/elements";

  export interface SkipLinkProps extends HTMLAnchorAttributes {
    href?: string;
  }
</script>

<script lang="ts">
  let { href = "#main-content", class: className = "", children, ...rest }: SkipLinkProps = $props();
</script>

<a class="skip-link {className}" {href} {...rest}>{@render children?.()}</a>

<style>
  .skip-link {
    position: fixed;
    translate: 0 calc(-100% - var(--space-4));
    z-index: var(--layer-toast);
    transition: translate var(--duration-fast) var(--easing-standard);
    inset-block-start: var(--space-2);
    inset-inline-start: var(--space-2);
    border: var(--border-width-thin) solid var(--color-focus-ring);
    border-radius: var(--radius-md);
    background: var(--color-surface-overlay);
    padding: var(--space-2) var(--space-3);
    color: var(--color-text-primary);
    font-weight: var(--font-weight-bold);
    font-family: var(--font-family-interface);
    text-decoration: none;
  }
  .skip-link:focus {
    translate: 0;
    outline: var(--focus-ring-width) solid var(--color-focus-ring);
    outline-offset: var(--focus-ring-offset);
  }
</style>
