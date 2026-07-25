<script module lang="ts">
  import type { ComponentProps } from "svelte";

  import { Button } from "@a-novel-kit/uikit";

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
        options: ["solid", "ghost"],
        description: "Visual emphasis. Solid is primary; ghost is low-emphasis.",
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
          component:
            "A native button with Agora sizing and emphasis. Native attributes are forwarded to preserve browser and assistive-technology behavior.",
        },
      },
    },
  });
</script>

{#snippet template({ label, ...args }: Args)}
  <Button {...args}>{label}</Button>
{/snippet}

<Story name="Playground" />
<Story name="Solid" args={{ label: "Create story", variant: "solid" }} />
<Story name="Ghost" args={{ label: "Not now", variant: "ghost" }} />
<Story name="Small" args={{ label: "Add", size: "sm" }} />
<Story name="Large" args={{ label: "Publish chapter", size: "lg" }} />
<Story name="Disabled" args={{ label: "Generating…", disabled: true }} />
