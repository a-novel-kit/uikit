<!--
@component
Fills a story with long, numbered placeholder rows, so reviewers can scroll it and see what stays in
view: sticky headers, banners and rails. For stories only; applications render their own content.
-->
<script lang="ts">
  let {
    rows = 40,
  }: {
    /** How many placeholder rows to render. */
    rows?: number;
  } = $props();
</script>

<!-- Numbers only, so the filler reads the same in every story language. -->
<ol class="scroll-preview" aria-label="Scroll preview">
  {#each { length: rows }, row (row)}
    <li>{row + 1}</li>
  {/each}
</ol>

<style>
  .scroll-preview {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  li {
    padding-inline: var(--space-4);
    padding-block: var(--space-3);
    color: var(--color-text-muted);
    font-size: var(--font-size-sm);
    font-family: var(--font-family-interface);
  }

  li:nth-child(even) {
    background: var(--color-surface-subtle);
  }
</style>
