<!--
@component
Styles a native single-line input with optional edge adornments.
Native attributes and events target the input; `class` styles the surrounding surface.
-->
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
  import Well from "./internal/Well.svelte";
  import { resolveInvalidState } from "./internal/selection";

  let {
    controlSize = "md",
    invalid = false,
    startAdornment,
    endAdornment,
    class: className = "",
    "aria-invalid": ariaInvalid,
    ...rest
  }: InputProps = $props();

  const isInvalid = $derived(resolveInvalidState(invalid, ariaInvalid));
</script>

<Well size={controlSize} invalid={isInvalid} class={className}>
  {#if startAdornment}
    <span class="adornment" data-position="start">{@render startAdornment()}</span>
  {/if}
  <input class="control" data-well-control {...rest} aria-invalid={isInvalid || undefined} />
  {#if endAdornment}
    <span class="adornment" data-position="end">{@render endAdornment()}</span>
  {/if}
</Well>

<style>
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
  }

  .control::placeholder {
    color: var(--color-control-placeholder);
  }

  .control:disabled {
    color: var(--color-control-disabled-text);
  }

  .adornment {
    display: inline-flex;
    flex: none;
    align-items: center;
    color: var(--well-muted-text);
    font: var(--text-ui);
  }
</style>
