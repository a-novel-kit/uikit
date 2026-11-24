<!--
@component
Composes a label, control, hint, and error. Spread the child snippet attributes onto the control
so its accessible name, description, required state, and invalid state stay connected.

```svelte
<script lang="ts">
  import { Field, Input } from "@a-novel-kit/uikit";
</script>

<Field label="Email" required>
  {#snippet children(attributes)}
    <Input {...attributes} name="email" type="email" />
  {/snippet}
</Field>
```
-->
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
    /** Visible label for the control. */
    label?: Content;
    /** Controls at the end of the label row, such as a quiet text button that opens password recovery. */
    labelActions?: Snippet;
    /** Supporting content rendered below the control, before any error. */
    hint?: Content;
    /** Validation message; its presence marks the control invalid. */
    error?: Content;
    /** Marks the composed control as required. */
    required?: boolean;
    /** Control identifier; defaults to a generated ID stable across server rendering and hydration. */
    controlId?: string;
    /** Renders the control; spread all supplied attributes onto its native input or trigger. */
    children: Snippet<[FieldControlProps]>;
  }
</script>

<script lang="ts">
  import FieldMessages, { messageIds } from "./internal/FieldMessages.svelte";
  import RenderContent from "./internal/RenderContent.svelte";

  const generatedId = $props.id();

  let {
    label,
    labelActions,
    hint,
    error,
    required = false,
    controlId = generatedId,
    class: className = "",
    children,
    ...rest
  }: FieldProps = $props();

  const controlProps = $derived<FieldControlProps>({
    id: controlId,
    "aria-describedby": messageIds({ id: controlId, hint, error }),
    "aria-invalid": error ? true : undefined,
    required: required ? true : undefined,
  });
</script>

<div class="field {className}" {...rest}>
  {#if label || labelActions}
    <div class="label-row">
      {#if label}
        <label for={controlId}>
          <RenderContent content={label} />
          {#if required}<span class="required" aria-hidden="true">*</span>{/if}
        </label>
      {/if}
      {#if labelActions}<div class="label-actions">{@render labelActions()}</div>{/if}
    </div>
  {/if}
  {@render children(controlProps)}
  <FieldMessages id={controlId} {hint} {error} />
</div>

<style>
  .field {
    display: grid;
    gap: var(--space-2);
    min-inline-size: 0;
  }

  /* The label row keeps its actions at the end and wraps them under a long label. */
  .label-row {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: baseline;
    gap: var(--space-1) var(--space-4);
  }

  /* The label row's actions end where the field does. */
  .label-actions {
    display: flex;
    gap: var(--space-3);
    margin-inline-start: auto;
    font: var(--text-ui);
  }

  /* A small button stands taller than the label. Its box overhangs the row by half the difference each way, so a
     label row keeps one height with or without it. Any other action, such as a link, is no taller than its line. */
  .label-actions:has(> :global(.button)) {
    /* off-scale: half the difference between the label's line and a small control, each way */
    margin-block: calc((1lh - var(--control-height-sm)) / 2);
  }

  /* A text button insets its label by a step and its hairline border. Last in the row, its box overhangs the field's
     end by that inset, so its text ends where the field does. A link is its own text and takes no overhang: it once
     ended 7px past the field. */
  .label-actions:has(> :global(.button.text:last-child)) {
    margin-inline-end: calc(-1 * (var(--space-2) + var(--border-width-thin)));
  }

  /* A label names one control, so it stays regular: bold is kept for actions and group names. */
  label {
    color: var(--color-text-secondary);
    font: var(--text-ui);
  }

  .required {
    margin-inline-start: var(--space-1);
    color: var(--color-feedback-error-text);
  }
</style>
