<script lang="ts" module>
  import type { HTMLAnchorAttributes } from "svelte/elements";

  export interface LinkProps extends HTMLAnchorAttributes {
    /** Inline is underlined in prose; quiet is intended for navigation chrome. */
    variant?: "inline" | "quiet";
  }
</script>

<script lang="ts">
  let { variant = "inline", class: className = "", children, ...rest }: LinkProps = $props();
</script>

<a class="link {variant} {className}" {...rest}>
  {@render children?.()}
</a>

<style>
  .link {
    transition:
      color var(--duration-fast) var(--easing-standard),
      background-color var(--duration-fast) var(--easing-standard);
    border-radius: var(--radius-sm);
    color: var(--color-text-link);
    font-family: inherit;
    text-underline-offset: var(--space-1);
  }

  .inline {
    text-decoration-thickness: var(--border-width-thin);
  }
  .quiet {
    padding: var(--space-1) var(--space-2);
    text-decoration: none;
  }

  .link:hover {
    color: var(--color-text-link-hover);
    text-decoration-thickness: var(--border-width-strong);
  }

  .quiet:hover {
    background: var(--color-navigation-hover-surface);
  }

  .link:focus-visible {
    outline: var(--focus-ring-width) solid var(--color-focus-ring);
    outline-offset: var(--focus-ring-offset);
  }
</style>
