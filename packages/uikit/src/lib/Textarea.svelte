<!--
@component
Styles a native multiline input. Native attributes and events target the textarea;
`class` styles the surrounding surface and adornments render below the input.
-->
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
  import Well from "./internal/Well.svelte";
  import { resolveInvalidState } from "./internal/selection";

  let {
    controlSize = "md",
    invalid = false,
    autoSize = false,
    startAdornment,
    endAdornment,
    class: className = "",
    "aria-invalid": ariaInvalid,
    ...rest
  }: TextareaProps = $props();

  const isInvalid = $derived(resolveInvalidState(invalid, ariaInvalid));
</script>

<Well as="div" size={controlSize} invalid={isInvalid} flush class={className}>
  <div class="body {controlSize}">
    <textarea
      class="control {autoSize ? 'auto-size' : ''}"
      data-well-control
      {...rest}
      aria-invalid={isInvalid || undefined}></textarea>
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
</Well>

<style>
  /* The textarea fills its well, so it pads itself and its scrollbar reaches the well's edge. */
  .body {
    display: grid;
    flex: 1;
    align-self: stretch;
    min-inline-size: 0;
  }

  .control {
    appearance: none;
    box-sizing: border-box;
    outline: none;
    border: 0;
    background: transparent;
    inline-size: 100%;
    /* off-scale: a field of several lines opens two large controls tall */
    min-block-size: calc(var(--control-height-lg) * 2);
    resize: block;
    color: var(--color-control-text);
    font: var(--text-body);
  }

  .sm .control {
    font: var(--text-body-sm);
  }

  .lg .control {
    /* off-scale: a large field's text grows with it */
    font: var(--font-weight-regular) var(--font-size-lg) / var(--line-height-normal) var(--font-family-interface);
  }

  .auto-size {
    max-block-size: var(--control-menu-max-height);
    field-sizing: content;
  }

  .control::placeholder {
    color: var(--color-control-placeholder);
  }

  .control:disabled {
    color: var(--color-control-disabled-text);
  }

  .adornments {
    display: grid;
    gap: var(--space-2);
    border-block-start: var(--border-width-thin) solid var(--color-border-divider);
    color: var(--well-muted-text);
    font: var(--text-ui);
  }

  .adornment {
    display: flex;
    align-items: center;
    min-inline-size: 0;
  }

  .sm .control,
  .sm .adornments {
    padding: var(--space-2) var(--space-3);
  }
  .md .control,
  .md .adornments {
    padding: var(--space-3);
  }
  .lg .control,
  .lg .adornments {
    padding: var(--space-4);
  }
</style>
