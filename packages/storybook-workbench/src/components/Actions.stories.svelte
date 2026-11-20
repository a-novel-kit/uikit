<script module lang="ts">
  import { Button, ButtonGroup, IconButton, Link } from "@a-novel-kit/uikit";

  import { ExternalLink as ExternalLinkIcon, RefreshCw as RefreshIcon, Save as SaveIcon } from "@lucide/svelte";
  import { defineMeta } from "@storybook/addon-svelte-csf";

  const { Story } = defineMeta({
    title: "Components/Action controls",
    tags: ["autodocs"],
    parameters: {
      docs: {
        description: {
          component:
            "Group related actions with ButtonGroup, and expose a persistent choice with a Button's `aria-pressed`.",
        },
      },
    },
  });
</script>

<Story name="Groups and links" asChild>
  <div class="examples">
    <ButtonGroup label="Document actions">
      <Button><SaveIcon size="var(--icon-size-sm)" aria-hidden="true" />Save</Button>
      <Button variant="outline" tone="neutral">Save as</Button>
      <IconButton label="Refresh preview" variant="ghost" tone="neutral">
        <RefreshIcon size="var(--icon-size-sm)" aria-hidden="true" />
      </IconButton>
    </ButtonGroup>
    <div class="link-row">
      <Link href="#inline-example">Inline link</Link>
      <Button href="#text-example" variant="text">Text link</Button>
      <IconButton href="#external-example" label="Open component reference" variant="ghost">
        <ExternalLinkIcon size="var(--icon-size-sm)" aria-hidden="true" />
      </IconButton>
    </div>
  </div>
</Story>

<Story name="Toggle states" asChild>
  <div class="matrix-scroll">
    <table class="matrix">
      <caption>Toggle states by tone</caption>
      <thead
        ><tr
          ><th scope="col">Tone</th><th scope="col">Idle</th><th scope="col">Pressed</th><th scope="col">Disabled</th
          ></tr
        ></thead
      >
      <tbody>
        <tr>
          <th scope="row">Brand</th>
          <td><Button aria-pressed="false">Grid</Button></td>
          <td><Button aria-pressed="true">Grid</Button></td>
          <td><Button aria-pressed="false" disabled>Grid</Button></td>
        </tr>
        <tr>
          <th scope="row">Neutral</th>
          <td><Button aria-pressed="false" tone="neutral">Grid</Button></td>
          <td><Button aria-pressed="true" tone="neutral">Grid</Button></td>
          <td><Button aria-pressed="false" tone="neutral" disabled>Grid</Button></td>
        </tr>
      </tbody>
    </table>
  </div>
</Story>

<Story
  name="Surface comparison"
  asChild
  parameters={{
    docs: {
      description: {
        story:
          "Outline, ghost and text buttons tint hover and active backgrounds with their own text color. A pressed outline keeps its tone, and a pressed ghost or text control reads as the navigation's current item, on every surface.",
      },
    },
  }}
>
  <div class="surface-grid">
    {#each ["Canvas", "Island", "Glass", "Overlay"] as surface (surface)}
      <section
        class="surface-sample {surface.toLowerCase()}"
        aria-label={surface}
        data-island={surface === "Canvas" ? undefined : ""}
      >
        <h3>{surface}</h3>
        <ButtonGroup label="Document actions">
          <Button>Save</Button>
          <Button variant="outline" tone="neutral">Save as</Button>
          <Button variant="ghost">Edit</Button>
          <Button variant="outline" tone="danger">Delete</Button>
          <IconButton label="Refresh preview" variant="ghost" tone="neutral">
            <RefreshIcon size="var(--icon-size-sm)" aria-hidden="true" />
          </IconButton>
          <Button aria-pressed="true" variant="outline">Preview</Button>
          <Button aria-pressed="true" variant="ghost" tone="neutral">Guides</Button>
          <Button disabled>Publish</Button>
          <Button variant="outline" tone="neutral" disabled>Archive</Button>
        </ButtonGroup>
        <Button href="#surface-help" variant="text">Help</Button>
      </section>
    {/each}
  </div>
</Story>

<style>
  .surface-grid {
    display: grid;
    gap: var(--space-4);
  }
  .surface-sample {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-4);
    border-radius: var(--radius-lg);
    padding: var(--space-4);
  }
  .surface-sample h3 {
    margin: 0;
    inline-size: 100%;
    font-size: var(--font-size-md);
  }
  .canvas {
    background: var(--color-surface-canvas);
  }
  .island {
    background: var(--color-surface-island);
  }
  .glass {
    background: var(--color-surface-glass);
  }
  .overlay {
    background: var(--color-surface-island-strong);
  }
  .examples {
    display: grid;
    gap: var(--space-6);
  }
  .link-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-4);
  }
  .matrix-scroll {
    max-inline-size: 100%;
    overflow-x: auto;
  }
  .matrix {
    margin: 0;
    border-collapse: separate;
    border-spacing: var(--space-4) var(--space-3);
  }
  .matrix caption,
  .matrix th {
    color: var(--color-text-muted);
    font-weight: var(--font-weight-medium);
    font-size: var(--font-size-sm);
  }
  .matrix caption,
  .matrix th[scope="row"] {
    text-align: start;
  }
  .matrix th,
  .matrix td {
    border: 0;
  }
  .matrix tbody tr {
    background: transparent;
  }
  .matrix td {
    padding: 0;
    min-inline-size: calc(var(--control-height-lg) * 3);
    text-align: center;
  }
  .matrix :global(.button) {
    inline-size: 100%;
  }
</style>
