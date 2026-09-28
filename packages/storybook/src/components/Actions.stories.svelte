<script module lang="ts">
  import {
    Button,
    ButtonGroup,
    IconButton,
    Link,
    ToggleButton,
    ToggleGroup,
    Toolbar,
    ToolbarButton,
    ToolbarGroup,
    ToolbarLink,
    ToolbarToggleButton,
    VisuallyHidden,
  } from "@a-novel-kit/uikit";

  import {
    Copy as CopyIcon,
    ExternalLink as ExternalLinkIcon,
    RefreshCw as RefreshIcon,
    Save as SaveIcon,
  } from "@lucide/svelte";
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, within } from "storybook/test";

  const { Story } = defineMeta({
    title: "Components/Action controls",
    tags: ["autodocs"],
    parameters: {
      docs: {
        description: {
          component:
            "Group related actions with ButtonGroup, expose persistent choices with ToggleButton, and use Toolbar for roving keyboard focus.",
        },
      },
    },
  });

  async function verifyToggle({ canvasElement }: { canvasElement: HTMLElement }) {
    const canvas = within(canvasElement);
    const grid = canvas.getByRole("button", { name: "Grid" });
    await expect(grid).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(grid);
    await expect(grid).toHaveAttribute("aria-pressed", "false");
  }

  async function verifyToolbar({ canvasElement }: { canvasElement: HTMLElement }) {
    const canvas = within(canvasElement);
    const copy = canvas.getByRole("button", { name: "Copy" });
    const refresh = canvas.getByRole("button", { name: "Refresh" });
    const preview = canvas.getByRole("button", { name: "Preview" });
    const help = canvas.getByRole("link", { name: "Help" });
    copy.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(refresh).toHaveFocus();
    await expect(help.getBoundingClientRect().height).toBe(preview.getBoundingClientRect().height);
    await expect(getComputedStyle(help).borderRadius).toBe(getComputedStyle(preview).borderRadius);
  }
</script>

<script lang="ts">
  import { fixedPressed } from "../controllers";

  const unpressed = fixedPressed();
  const pressed = fixedPressed(true);
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
      <Link href="#quiet-example" variant="quiet">Quiet link</Link>
      <Link href="#external-example" variant="quiet">
        <ExternalLinkIcon size="var(--icon-size-sm)" aria-hidden="true" />
        <VisuallyHidden>Open component reference</VisuallyHidden>
      </Link>
    </div>
  </div>
</Story>

<Story name="Toggle group" asChild play={verifyToggle}>
  <ToggleGroup label="Canvas options">
    <ToggleButton controller={unpressed} variant="ghost">Grid</ToggleButton>
    <ToggleButton controller={pressed} variant="ghost">Snap</ToggleButton>
    <ToggleButton controller={unpressed} variant="ghost" tone="neutral" disabled>Guides</ToggleButton>
  </ToggleGroup>
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
          <td><ToggleButton controller={unpressed}>Grid</ToggleButton></td>
          <td><ToggleButton controller={pressed}>Grid</ToggleButton></td>
          <td><ToggleButton controller={unpressed} disabled>Grid</ToggleButton></td>
        </tr>
        <tr>
          <th scope="row">Neutral</th>
          <td><ToggleButton controller={unpressed} tone="neutral">Grid</ToggleButton></td>
          <td><ToggleButton controller={pressed} tone="neutral">Grid</ToggleButton></td>
          <td><ToggleButton controller={unpressed} tone="neutral" disabled>Grid</ToggleButton></td>
        </tr>
      </tbody>
    </table>
  </div>
</Story>

<Story name="Toolbar" asChild play={verifyToolbar}>
  <Toolbar label="Editor tools">
    <ToolbarGroup label="Document">
      <ToolbarButton variant="ghost" tone="neutral" size="sm">
        <CopyIcon size="var(--icon-size-sm)" aria-hidden="true" />Copy
      </ToolbarButton>
      <ToolbarButton variant="ghost" tone="neutral" size="sm">
        <RefreshIcon size="var(--icon-size-sm)" aria-hidden="true" />Refresh
      </ToolbarButton>
    </ToolbarGroup>
    <span class="toolbar-separator" aria-hidden="true"></span>
    <ToolbarToggleButton controller={unpressed} variant="ghost" size="sm">Preview</ToolbarToggleButton>
    <ToolbarLink href="#toolbar-help" variant="quiet">Help</ToolbarLink>
  </Toolbar>
</Story>

<Story
  name="Surface comparison"
  asChild
  parameters={{
    docs: {
      description: {
        story:
          "Outline buttons, ghost buttons, and quiet links tint hover and active backgrounds with their own text color. Pressed controls retain their tone and emphasis on every surface.",
      },
    },
  }}
>
  <div class="surface-grid">
    {#each ["Canvas", "Island", "Glass", "Overlay"] as surface (surface)}
      <section class="surface-sample {surface.toLowerCase()}" aria-label={surface}>
        <h3>{surface}</h3>
        <ButtonGroup label="Document actions">
          <Button>Save</Button>
          <Button variant="outline" tone="neutral">Save as</Button>
          <Button variant="ghost">Edit</Button>
          <Button variant="outline" tone="danger">Delete</Button>
          <IconButton label="Refresh preview" variant="ghost" tone="neutral">
            <RefreshIcon size="var(--icon-size-sm)" aria-hidden="true" />
          </IconButton>
          <ToggleButton controller={pressed} variant="outline">Preview</ToggleButton>
          <ToggleButton controller={pressed} variant="ghost" tone="neutral">Guides</ToggleButton>
        </ButtonGroup>
        <Link href="#surface-help" variant="quiet">Help</Link>
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
    min-inline-size: calc(var(--control-height-lg) * var(--multiplier-3));
    text-align: center;
  }
  .matrix :global(.button) {
    inline-size: 100%;
  }
  .toolbar-separator {
    background: var(--color-border-default);
    inline-size: var(--border-width-thin);
    block-size: var(--control-height-sm);
  }
</style>
