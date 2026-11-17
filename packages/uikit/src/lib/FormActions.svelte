<!--
@component
Groups form feedback above submission controls. Place after fields in a Stack with gap="4";
the additional spacing separates inputs from actions. The actions sit side by side at the end of the line at their
natural width, and stack full width where the form gives them less than 35rem, as a dialog's actions do. It takes its
parent's full width. Form submission stays with the caller.

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
  import ActionGroup from "./ActionGroup.svelte";

  let { feedback, children, class: className = "", ...rest }: FormActionsProps = $props();
</script>

<div class="form-actions {className}" {...rest}>
  {#if feedback}{@render feedback()}{/if}
  {#if children}<ActionGroup {children} />{/if}
</div>

<style>
  /* Its actions measure the width they get, so it takes its parent's full width, even in a parent that sizes by
     content. */
  .form-actions {
    display: grid;
    flex-grow: 1;
    align-content: start;
    align-self: stretch;
    gap: var(--space-4);
    min-inline-size: 0;
  }
  .form-actions:not(:first-child) {
    margin-block-start: var(--space-4);
  }
</style>
