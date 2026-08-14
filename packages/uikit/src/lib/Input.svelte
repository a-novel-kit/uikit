<script lang="ts" module>
  import type { ComponentSize } from "./types";

  import type { Snippet } from "svelte";
  import type { HTMLInputAttributes } from "svelte/elements";

  /** Props for a single-line input with optional content at either edge. */
  export interface InputProps extends HTMLInputAttributes {
    /** Sets the control height and type scale. */
    controlSize?: ComponentSize;
    /** Applies the invalid surface and focus treatment. */
    invalid?: boolean;
    /** Renders content before the editable value. */
    startAdornment?: Snippet;
    /** Renders content after the editable value. */
    endAdornment?: Snippet;
  }
</script>

<script lang="ts">
  let {
    controlSize = "md",
    invalid = false,
    startAdornment,
    endAdornment,
    class: className = "",
    ...rest
  }: InputProps = $props();
</script>

<span class="input {controlSize} {invalid ? 'invalid' : ''} {className}">
  {#if startAdornment}
    <span class="adornment" data-position="start">{@render startAdornment()}</span>
  {/if}
  <input class="control" aria-invalid={invalid || undefined} {...rest} />
  {#if endAdornment}
    <span class="adornment" data-position="end">{@render endAdornment()}</span>
  {/if}
</span>

<style>
  .input {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    transition:
      background-color var(--duration-fast) var(--easing-standard),
      border-color var(--duration-fast) var(--easing-standard),
      box-shadow var(--duration-fast) var(--easing-standard);
    box-sizing: border-box;
    border: var(--border-width-thin) solid var(--color-control-border);
    border-radius: var(--radius-md);
    background: var(--color-control-surface);
    inline-size: 100%;
    min-inline-size: 0;
  }

  .control {
    appearance: none;
    box-sizing: border-box;
    outline: none;
    border: 0;
    background: transparent;
    padding: 0;
    inline-size: 100%;
    min-inline-size: 0;
    color: var(--color-control-text);
    font: inherit;
    line-height: var(--line-height-compact);
    font-family: var(--font-family-interface);
  }

  .control::placeholder {
    color: var(--color-control-placeholder);
  }

  .input:hover:not(
      :has(
        .control:disabled,
        .control:read-only,
        .control:focus-visible,
        .control[aria-invalid="true"],
        .control:user-invalid
      )
    ) {
    border-color: var(--color-control-border-hover);
    background: var(--color-control-surface-hover);
  }

  .input:has(.control:focus-visible) {
    box-shadow: var(--shadow-focus-ring);
    border-color: var(--color-control-border-focus);
    background: var(--color-control-surface-focus);
  }

  @media (forced-colors: active) {
    .input:has(.control:focus-visible) {
      outline: var(--border-width-strong) solid Highlight;
      outline-offset: var(--focus-ring-offset);
    }
  }

  .input:has(.control:disabled) {
    cursor: not-allowed;
    border-color: var(--color-border-subtle);
    background: var(--color-control-surface-disabled);
  }

  .control:disabled {
    color: var(--color-control-disabled-text);
  }

  .input.invalid,
  .input:has(.control[aria-invalid="true"], .control:user-invalid) {
    border-color: var(--color-feedback-error-border);
    background: var(--color-control-surface-invalid);
  }

  .input.invalid:has(.control:focus-visible),
  .input:has(.control[aria-invalid="true"]:focus-visible, .control:user-invalid:focus-visible) {
    box-shadow: var(--shadow-invalid-focus-ring);
    border-color: var(--color-feedback-error-border);
    background: var(--color-control-surface-invalid);
  }

  .adornment {
    display: inline-flex;
    flex: none;
    align-items: center;
    color: var(--color-text-muted);
    font-size: var(--font-size-sm);
    line-height: var(--line-height-compact);
  }

  .input:has(.control:disabled) .adornment {
    color: var(--color-control-disabled-text);
  }

  .sm {
    padding: var(--space-1) var(--space-3);
    min-block-size: var(--control-height-sm);
  }
  .sm .control {
    font-size: var(--font-size-sm);
  }
  .md {
    padding: var(--space-2) var(--space-3);
    min-block-size: var(--control-height-md);
  }
  .md .control {
    font-size: var(--font-size-md);
  }
  .lg {
    padding: var(--space-3) var(--space-4);
    min-block-size: var(--control-height-lg);
  }
  .lg .control {
    font-size: var(--font-size-lg);
  }
</style>
