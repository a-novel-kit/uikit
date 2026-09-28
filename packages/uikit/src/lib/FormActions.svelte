<!--
@component
Groups form feedback above submission controls. Place after fields in a Stack with gap="4";
the additional spacing separates inputs from actions. Direct children stretch on viewports below
35rem and keep their natural width on larger screens. Form submission stays with the caller.

```svelte
<script lang="ts">
  import { Alert, Button, FormActions } from "@a-novel-kit/uikit";
</script>

<FormActions>
  {#snippet feedback()}
    <Alert tone="error" title="Changes could not be saved." />
  {/snippet}
  <Button type="submit">Save</Button>
</FormActions>
```
-->
<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  /** Layout for form-level feedback and submission controls. */
  export interface FormActionsProps extends HTMLAttributes<HTMLDivElement> {
    /** Feedback directly above the actions; omit when the form has no message. */
    feedback?: Snippet;
  }
</script>

<script lang="ts">
  let { feedback, children, class: className = "", ...rest }: FormActionsProps = $props();
</script>

<div class="form-actions {className}" {...rest}>
  {#if feedback}{@render feedback()}{/if}
  {#if children}<div class="controls">{@render children()}</div>{/if}
</div>

<style>
  .form-actions {
    display: grid;
    gap: var(--space-4);
    min-inline-size: 0;
  }
  .form-actions:not(:first-child) {
    margin-block-start: var(--space-4);
  }
  .controls {
    display: grid;
    gap: var(--space-3);
    min-inline-size: 0;
  }
  @media (min-width: 35rem) {
    .controls {
      display: flex;
      flex-wrap: wrap;
    }
  }
</style>
