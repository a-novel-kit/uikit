<!-- Actions in the two parents that size a child by its content: an end-aligned stack, and a row beside a heading. -->
<script lang="ts">
  import { ActionGroup, Button, Inline, Stack } from "../src/lib";

  let { layout }: { layout: "an end-aligned stack" | "a row beside a heading" } = $props();
</script>

{#snippet actions()}
  <ActionGroup>
    <Button variant="ghost">Cancel</Button>
    <Button>Save</Button>
  </ActionGroup>
{/snippet}

{#if layout === "an end-aligned stack"}
  <Stack align="end">{@render actions()}</Stack>
{:else}
  <Inline justify="between"><h2>Chapter settings</h2>{@render actions()}</Inline>
{/if}
