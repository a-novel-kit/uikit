<script lang="ts" module>
  import type { HTMLInputAttributes } from "svelte/elements";

  /** Props for a styled native file input. */
  export interface FileInputProps extends Omit<HTMLInputAttributes, "type" | "value"> {
    controlSize?: "sm" | "md" | "lg";
    invalid?: boolean;
  }
</script>

<script lang="ts">
  let {
    controlSize = "md",
    invalid = false,
    "aria-invalid": ariaInvalid,
    class: className = "",
    ...rest
  }: FileInputProps = $props();

  const isInvalid = $derived(invalid || ariaInvalid === true || ariaInvalid === "true");
</script>

<input
  type="file"
  class="file-input {controlSize} {isInvalid ? 'invalid' : ''} {className}"
  {...rest}
  aria-invalid={isInvalid || undefined}
/>

<style>
  .file-input {
    appearance: none;
    transition:
      background-color var(--duration-fast) var(--easing-standard),
      border-color var(--duration-fast) var(--easing-standard),
      box-shadow var(--duration-fast) var(--easing-standard);
    cursor: pointer;
    box-sizing: border-box;
    border: var(--border-width-thin) solid var(--color-control-border);
    border-radius: var(--radius-md);
    background: var(--color-control-surface);
    inline-size: 100%;
    color: var(--color-text-muted);
    font-family: var(--font-family-interface);
  }

  .file-input:hover:not(:disabled, :focus-visible, [aria-invalid="true"]) {
    border-color: var(--color-control-border-hover);
    background: var(--color-control-surface-hover);
  }

  .file-input:focus-visible {
    outline: none;
    box-shadow: var(--shadow-focus-ring);
    border-color: var(--color-control-border-focus);
    background: var(--color-control-surface-focus);
  }

  .file-input[aria-invalid="true"] {
    border-color: var(--color-feedback-error-border);
    background: var(--color-control-surface-invalid);
  }

  .file-input[aria-invalid="true"]:focus-visible {
    box-shadow: var(--shadow-invalid-focus-ring);
  }

  .file-input:disabled {
    cursor: not-allowed;
    border-color: var(--color-border-subtle);
    background: var(--color-control-surface-disabled);
    color: var(--color-control-disabled-text);
  }

  .file-input::file-selector-button {
    cursor: inherit;
    border: 0;
    border-inline-end: var(--border-width-thin) solid var(--color-border-default);
    background: var(--color-action-neutral);
    color: var(--color-action-neutral-text);
    font: inherit;
    font-weight: var(--font-weight-bold);
  }

  .file-input:hover:not(:disabled, :focus-visible, [aria-invalid="true"])::file-selector-button {
    background: var(--color-action-neutral-hover);
  }

  .file-input:disabled::file-selector-button {
    border-color: var(--color-action-disabled-border);
    background: var(--color-action-disabled-surface);
    color: var(--color-action-disabled-text);
  }

  .sm {
    min-block-size: var(--control-height-sm);
    font-size: var(--font-size-sm);
  }
  .sm::file-selector-button {
    margin-inline-end: var(--space-3);
    padding: var(--space-1) var(--space-3);
    min-block-size: calc(var(--control-height-sm) - var(--border-width-strong));
  }

  .md {
    min-block-size: var(--control-height-md);
    font-size: var(--font-size-md);
  }
  .md::file-selector-button {
    margin-inline-end: var(--space-3);
    padding: var(--space-2) var(--space-4);
    min-block-size: calc(var(--control-height-md) - var(--border-width-strong));
  }

  .lg {
    min-block-size: var(--control-height-lg);
    font-size: var(--font-size-lg);
  }
  .lg::file-selector-button {
    margin-inline-end: var(--space-4);
    padding: var(--space-3) var(--space-5);
    min-block-size: calc(var(--control-height-lg) - var(--border-width-strong));
  }

  @media (forced-colors: active) {
    .file-input:focus-visible {
      outline: var(--border-width-strong) solid Highlight;
      outline-offset: var(--focus-ring-offset);
    }
  }
</style>
