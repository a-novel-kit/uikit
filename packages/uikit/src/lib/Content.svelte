<script lang="ts">
  import type { Content } from "./content";

  let { content }: { content: Content } = $props();
</script>

{#if typeof content === "string"}
  {content}
{:else}
  {@render content()}
{/if}
