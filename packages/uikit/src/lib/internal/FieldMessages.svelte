<!--
Renders a field's hint and error under its control, each with the id `messageIds` lists for the control.
-->
<script lang="ts" module>
  import type { Content } from "../content";

  /** A field's messages, either of which may be absent. */
  export interface FieldMessagesProps {
    /** Prefix of the messages' ids, shared with `messageIds`. */
    id: string;
    /** Supporting content, quieter than the label. */
    hint?: Content;
    /** Validation message. */
    error?: Content;
  }

  /** Lists the ids of the messages FieldMessages renders for `id`, after `others`, as `aria-describedby` takes them. */
  export function messageIds(
    { id, hint, error }: FieldMessagesProps,
    ...others: (string | null | undefined)[]
  ): string | undefined {
    const ids = [...others, hint ? id + "-hint" : undefined, error ? id + "-error" : undefined];
    return ids.filter(Boolean).join(" ") || undefined;
  }
</script>

<script lang="ts">
  import RenderContent from "./RenderContent.svelte";

  let { id, hint, error }: FieldMessagesProps = $props();
</script>

{#if hint}<div id="{id}-hint" class="hint"><RenderContent content={hint} /></div>{/if}
{#if error}<div id="{id}-error" class="error"><RenderContent content={error} /></div>{/if}

<style>
  .hint,
  .error {
    margin: 0;
    font: var(--text-meta);
  }

  .hint {
    color: var(--color-text-muted);
  }

  .error {
    color: var(--color-feedback-error-text);
  }
</style>
