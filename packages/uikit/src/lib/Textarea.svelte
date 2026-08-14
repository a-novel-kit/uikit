<script lang="ts" module>
  import type { ComponentSize } from "./types";

  import type { Snippet } from "svelte";
  import type { HTMLTextareaAttributes } from "svelte/elements";

  /** Props for a multiline input with optional supporting content below it. */
  export interface TextareaProps extends HTMLTextareaAttributes {
    /** Sets the control padding and type scale. */
    controlSize?: ComponentSize;
    /** Applies the invalid surface and focus treatment. */
    invalid?: boolean;
    /** Lets supporting browsers grow the control with its content. */
    autoSize?: boolean;
    /** Renders the first item in the supporting-content stack. */
    startAdornment?: Snippet;
    /** Renders the last item in the supporting-content stack. */
    endAdornment?: Snippet;
  }
</script>

<script lang="ts">
  let {
    controlSize = "md",
    invalid = false,
    autoSize = false,
    startAdornment,
    endAdornment,
    class: className = "",
    ...rest
  }: TextareaProps = $props();
</script>

<div class="textarea {controlSize} {invalid ? 'invalid' : ''} {className}">
  <textarea class="control {autoSize ? 'auto-size' : ''}" aria-invalid={invalid || undefined} {...rest}></textarea>
  {#if startAdornment || endAdornment}
    <div class="adornments">
      {#if startAdornment}
        <div class="adornment" data-position="start">{@render startAdornment()}</div>
      {/if}
      {#if endAdornment}
        <div class="adornment" data-position="end">{@render endAdornment()}</div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .textarea {
    display: grid;
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
    inline-size: 100%;
    min-block-size: calc(var(--control-height-lg) * var(--multiplier-2));
    resize: block;
    color: var(--color-control-text);
    font: inherit;
    line-height: var(--line-height-normal);
    font-family: var(--font-family-interface);
  }

  .auto-size {
    max-block-size: calc(var(--space-24) * var(--multiplier-3));
    field-sizing: content;
  }

  .control::placeholder {
    color: var(--color-control-placeholder);
  }

  .textarea:hover:not(
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

  .textarea:has(.control:focus-visible) {
    box-shadow: var(--shadow-focus-ring);
    border-color: var(--color-control-border-focus);
    background: var(--color-control-surface-focus);
  }

  @media (forced-colors: active) {
    .textarea:has(.control:focus-visible) {
      outline: var(--border-width-strong) solid Highlight;
      outline-offset: var(--focus-ring-offset);
    }
  }

  .textarea:has(.control:disabled) {
    cursor: not-allowed;
    border-color: var(--color-border-subtle);
    background: var(--color-control-surface-disabled);
  }

  .control:disabled {
    color: var(--color-control-disabled-text);
  }

  .textarea.invalid,
  .textarea:has(.control[aria-invalid="true"], .control:user-invalid) {
    border-color: var(--color-feedback-error-border);
    background: var(--color-control-surface-invalid);
  }

  .textarea.invalid:has(.control:focus-visible),
  .textarea:has(.control[aria-invalid="true"]:focus-visible, .control:user-invalid:focus-visible) {
    box-shadow: var(--shadow-invalid-focus-ring);
    border-color: var(--color-feedback-error-border);
    background: var(--color-control-surface-invalid);
  }

  .adornments {
    display: grid;
    gap: var(--space-2);
    border-block-start: var(--border-width-thin) solid var(--color-border-subtle);
    color: var(--color-text-muted);
    font-size: var(--font-size-sm);
    line-height: var(--line-height-compact);
  }

  .adornment {
    display: flex;
    align-items: center;
    min-inline-size: 0;
  }

  .textarea:has(.control:disabled) .adornments {
    color: var(--color-control-disabled-text);
  }

  .sm .control {
    padding: var(--space-2) var(--space-3);
    font-size: var(--font-size-sm);
  }
  .sm .adornments {
    padding: var(--space-2) var(--space-3);
  }
  .md .control {
    padding: var(--space-3);
    font-size: var(--font-size-md);
  }
  .md .adornments {
    padding: var(--space-3);
  }
  .lg .control {
    padding: var(--space-4);
    font-size: var(--font-size-lg);
  }
  .lg .adornments {
    padding: var(--space-4);
  }
</style>
