<script module lang="ts">
  import type { ComponentProps } from "svelte";

  import { Button, Inline } from "@a-novel-kit/uikit";

  import { Save as SaveIcon } from "@lucide/svelte";
  import { defineMeta } from "@storybook/addon-svelte-csf";

  type Args = Omit<ComponentProps<typeof Button>, "children"> & {
    label: string;
  };

  const { Story } = defineMeta({
    title: "Components/Button",
    component: Button,
    render: template,
    args: {
      label: "Continue",
      variant: "solid",
      tone: "brand",
      size: "md",
      disabled: false,
    },
    argTypes: {
      label: {
        control: "text",
        description: "Visible action label used by this story.",
      },
      variant: {
        control: "inline-radio",
        options: ["solid", "outline", "ghost"],
        description: "Visual emphasis. Solid is primary, outline is secondary, and ghost is quiet.",
      },
      tone: {
        control: "inline-radio",
        options: ["brand", "neutral", "danger"],
        description: "Semantic intent. Danger is reserved for destructive actions.",
      },
      size: {
        control: "inline-radio",
        options: ["sm", "md", "lg"],
        description: "Control density.",
      },
      disabled: {
        control: "boolean",
        description: "Uses the native disabled state.",
      },
    },
    parameters: {
      docs: {
        description: {
          component: "A native action control with emphasis, tone, size, selected, and disabled states.",
        },
      },
    },
  });
</script>

{#snippet template({ label, ...args }: Args)}
  <Button {...args}>{label}</Button>
{/snippet}

<Story name="Playground" />
<Story name="Variants" asChild>
  <Inline gap="4" wrap role="group" aria-label="Button variants">
    <Button variant="solid">Solid</Button>
    <Button variant="outline">Outline</Button>
    <Button variant="ghost">Ghost</Button>
  </Inline>
</Story>
<Story name="Tones" asChild>
  <Inline gap="4" wrap role="group" aria-label="Button tones">
    <Button tone="brand">Brand</Button>
    <Button tone="neutral">Neutral</Button>
    <Button tone="danger">Danger</Button>
  </Inline>
</Story>
<Story name="Icon and text" asChild>
  <Button><SaveIcon size="var(--icon-size-sm)" aria-hidden="true" />Save changes</Button>
</Story>
<Story name="Sizes" asChild>
  <Inline gap="4" wrap role="group" aria-label="Button sizes">
    <Button size="sm">Small</Button>
    <Button size="md">Medium</Button>
    <Button size="lg">Large</Button>
  </Inline>
</Story>
<Story name="States" asChild>
  <div class="state-matrix-scroll">
    <table class="state-matrix">
      <caption>Button states by tone</caption>
      <thead>
        <tr>
          <th scope="col">Tone</th>
          <th scope="col">Idle</th>
          <th scope="col">Selected</th>
          <th scope="col">Disabled</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">Brand</th>
          <td><Button aria-label="Brand idle">Action</Button></td>
          <td><Button aria-pressed="true" aria-label="Brand selected">Action</Button></td>
          <td><Button disabled aria-label="Brand disabled">Action</Button></td>
        </tr>
        <tr>
          <th scope="row">Neutral</th>
          <td><Button tone="neutral" aria-label="Neutral idle">Action</Button></td>
          <td>
            <Button tone="neutral" aria-pressed="true" aria-label="Neutral selected">Action</Button>
          </td>
          <td><Button tone="neutral" disabled aria-label="Neutral disabled">Action</Button></td>
        </tr>
        <tr>
          <th scope="row">Danger</th>
          <td><Button tone="danger" aria-label="Danger idle">Action</Button></td>
          <td><span class="not-applicable">Not used</span></td>
          <td><Button tone="danger" disabled aria-label="Danger disabled">Action</Button></td>
        </tr>
      </tbody>
    </table>
  </div>
</Story>

<style>
  .state-matrix-scroll {
    max-inline-size: 100%;
    overflow-x: auto;
  }

  .state-matrix {
    margin: 0 calc(var(--space-4) * -1);
    border-collapse: separate;
    border-spacing: var(--space-4) var(--space-3);
  }

  .state-matrix caption,
  .state-matrix th {
    color: var(--color-text-muted);
    font-weight: var(--font-weight-medium);
    font-size: var(--font-size-sm);
  }

  .state-matrix caption {
    padding: 0 var(--space-4) var(--space-2);
  }

  .state-matrix th,
  .state-matrix td {
    border: 0;
  }

  .state-matrix tbody tr {
    background: transparent;
  }

  .state-matrix caption,
  .state-matrix th[scope="row"] {
    text-align: start;
  }

  .state-matrix th[scope="col"],
  .state-matrix td {
    text-align: center;
  }

  .state-matrix td {
    padding: 0;
    min-inline-size: calc(var(--control-height-lg) * var(--multiplier-3));
  }

  .state-matrix :global(.button) {
    inline-size: 100%;
  }

  .not-applicable {
    color: var(--color-text-subtle);
    font-size: var(--font-size-sm);
  }

  @media (max-width: 40rem) {
    .state-matrix {
      margin-inline: calc(var(--space-2) * -1);
      border-spacing: var(--space-2) var(--space-3);
    }

    .state-matrix td {
      min-inline-size: calc(var(--control-height-md) * var(--multiplier-2));
    }
  }
</style>
