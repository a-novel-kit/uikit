<script lang="ts" module>
  import type { HTMLAttributes } from "svelte/elements";

  export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
    /** Image source. When absent, initials are rendered. */
    src?: string;
    /** Accessible name and image alternative. */
    label: string;
    initials?: string;
    size?: "sm" | "md" | "lg";
  }
</script>

<script lang="ts">
  let { src, label, initials, size = "md", class: className = "", ...rest }: AvatarProps = $props();

  const fallback = $derived(
    initials ??
      label
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
  );
</script>

<span class="avatar {size} {className}" {...rest}>
  {#if src}
    <img {src} alt={label} />
  {:else}
    <span role="img" aria-label={label}>{fallback}</span>
  {/if}
</span>

<style>
  .avatar,
  .avatar span,
  img {
    display: inline-grid;
    place-items: center;
    box-sizing: border-box;
    border-radius: var(--radius-round);
    inline-size: 100%;
    block-size: 100%;
  }

  .avatar {
    flex: none;
    border: var(--border-width-thin) solid var(--color-border-default);
    background: var(--color-surface-selected);
    overflow: hidden;
    color: var(--color-text-accent);
    font-weight: var(--font-weight-bold);
    line-height: var(--line-height-tight);
    font-family: var(--font-family-mono);
  }

  img {
    object-fit: cover;
  }
  .sm {
    inline-size: var(--control-height-sm);
    block-size: var(--control-height-sm);
    font-size: var(--font-size-xs);
  }
  .md {
    inline-size: var(--control-height-md);
    block-size: var(--control-height-md);
    font-size: var(--font-size-sm);
  }
  .lg {
    inline-size: var(--control-height-lg);
    block-size: var(--control-height-lg);
    font-size: var(--font-size-md);
  }
</style>
