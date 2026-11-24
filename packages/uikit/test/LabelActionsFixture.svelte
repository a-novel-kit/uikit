<script lang="ts">
  import { Button, Field, Input, Link } from "../src/lib";

  let { action }: { action: "none" | "link" | "button" } = $props();
</script>

{#snippet actions()}
  {#if action === "link"}
    <Link href="#reset">Forgot password?</Link>
  {:else}
    <Button href="#reset" variant="text" tone="brand" size="sm">Forgot password?</Button>
  {/if}
{/snippet}

<Field label="Password" labelActions={action === "none" ? undefined : actions}>
  {#snippet children(control)}<Input {...control} />{/snippet}
</Field>
