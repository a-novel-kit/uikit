<script lang="ts" module>
  import type { Content } from "./content";

  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  /** Accessibility attributes passed from Field to its composed control. */
  export interface FieldControlProps {
    /** Stable identifier targeted by the generated label. */
    id: string;
    /** Identifiers for the generated hint and error content. */
    "aria-describedby"?: string;
    /** Indicates that the field currently has an error. */
    "aria-invalid"?: true;
    /** Indicates that the field is required. */
    required?: true;
  }

  /** Props for composing a label, control, hint, and validation error. */
  export interface FieldProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    /** Optional control label. */
    label?: Content;
    /** Optional supporting content shown before an error. */
    hint?: Content;
    /** Optional validation message. */
    error?: Content;
    /** Marks the composed control as required. */
    required?: boolean;
    /** Stable identifier used by the label and supporting content. */
    controlId?: string;
    /** Renders the control with generated accessibility attributes. */
    children: Snippet<[FieldControlProps]>;
  }
</script>

<script lang="ts">
  import RenderContent from "./Content.svelte";

  const generatedId = $props.id();

  let {
    label,
    hint,
    error,
    required = false,
    controlId = generatedId,
    class: className = "",
    children,
    ...rest
  }: FieldProps = $props();

  const hintId = $derived(hint ? `${controlId}-hint` : undefined);
  const errorId = $derived(error ? `${controlId}-error` : undefined);
  const describedBy = $derived([hintId, errorId].filter(Boolean).join(" ") || undefined);
</script>

<div class="field {className}" {...rest}>
  {#if label}
    <label for={controlId}>
      <RenderContent content={label} />
      {#if required}<span class="required" aria-hidden="true">*</span>{/if}
    </label>
  {/if}
  {@render children({
    id: controlId,
    "aria-describedby": describedBy,
    "aria-invalid": error ? true : undefined,
    required: required ? true : undefined,
  })}
  {#if hint}<div id={hintId} class="hint"><RenderContent content={hint} /></div>{/if}
  {#if error}<div id={errorId} class="error"><RenderContent content={error} /></div>{/if}
</div>

<style>
  .field {
    display: grid;
    gap: var(--space-2);
    min-inline-size: 0;
  }

  label {
    color: var(--color-text-secondary);
    font-weight: var(--font-weight-bold);
    font-size: var(--font-size-sm);
    line-height: var(--line-height-compact);
    font-family: var(--font-family-interface);
  }

  .required {
    margin-inline-start: var(--space-1);
    color: var(--color-feedback-error-text);
  }

  .hint,
  .error {
    margin: 0;
    font-size: var(--font-size-sm);
    line-height: var(--line-height-compact);
  }

  .hint {
    color: var(--color-text-muted);
  }
  .error {
    color: var(--color-feedback-error-text);
  }
</style>
