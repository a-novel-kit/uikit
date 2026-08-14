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
  import { CopyIcon, ExternalLinkIcon, RefreshIcon, SaveIcon } from "@a-novel-kit/uikit-icons";

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
    await expect(grid).toHaveAttribute("aria-pressed", "true");
  }

  async function verifyToolbar({ canvasElement }: { canvasElement: HTMLElement }) {
    const canvas = within(canvasElement);
    const copy = canvas.getByRole("button", { name: "Copy" });
    const refresh = canvas.getByRole("button", { name: "Refresh" });
    copy.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(refresh).toHaveFocus();
  }
</script>

<script lang="ts">
  let gridPressed = $state(false);
  let snapPressed = $state(true);
  let previewPressed = $state(false);
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
    <ToggleButton bind:pressed={gridPressed} variant="ghost">Grid</ToggleButton>
    <ToggleButton bind:pressed={snapPressed} variant="ghost">Snap</ToggleButton>
    <ToggleButton variant="ghost" tone="neutral" disabled>Guides</ToggleButton>
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
          <td><ToggleButton>Grid</ToggleButton></td>
          <td><ToggleButton pressed>Grid</ToggleButton></td>
          <td><ToggleButton disabled>Grid</ToggleButton></td>
        </tr>
        <tr>
          <th scope="row">Neutral</th>
          <td><ToggleButton tone="neutral">Grid</ToggleButton></td>
          <td><ToggleButton tone="neutral" pressed>Grid</ToggleButton></td>
          <td><ToggleButton tone="neutral" disabled>Grid</ToggleButton></td>
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
    <ToolbarToggleButton bind:pressed={previewPressed} variant="ghost" size="sm">Preview</ToolbarToggleButton>
    <ToolbarLink href="#toolbar-help" variant="quiet">Help</ToolbarLink>
  </Toolbar>
</Story>

<style>
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
  .matrix tbody tr:hover {
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
