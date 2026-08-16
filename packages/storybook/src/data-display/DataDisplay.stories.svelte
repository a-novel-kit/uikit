<script module lang="ts">
  import { Avatar, Badge, Card, DescriptionList, Inline, Prose, Separator, Stack, Table } from "@a-novel-kit/uikit";

  import { defineMeta } from "@storybook/addon-svelte-csf";

  const { Story } = defineMeta({
    title: "Data display/Content",
    tags: ["autodocs"],
    parameters: {
      docs: {
        description: {
          component: "Components for identity, status, tables, separators, and readable prose.",
        },
      },
    },
  });
</script>

<Story name="Identity and metadata" asChild>
  <Card>
    <Inline gap="4">
      <Avatar label="Ada Lovelace" size="lg" />
      <Stack gap="1">
        <strong>Ada Lovelace</strong>
        <Inline gap="2"><span class="muted">Maintainer</span><Badge tone="success">Online</Badge></Inline>
      </Stack>
    </Inline>
  </Card>
</Story>

<Story name="Description list" asChild>
  <DescriptionList columns={3}>
    <div><dt>Owner</dt><dd>Ada Lovelace</dd></div>
    <div><dt>Visibility</dt><dd>Organization</dd></div>
    <div><dt>Last updated</dt><dd>14 August 2026</dd></div>
    <div><dt>Language</dt><dd>English</dd></div>
    <div><dt>Words</dt><dd>84,210</dd></div>
    <div><dt>Status</dt><dd><Badge tone="success">Ready</Badge></dd></div>
  </DescriptionList>
</Story>

<Story name="Table" asChild>
  <Table caption="Recent environments">
    <thead>
      <tr><th scope="col">Environment</th><th scope="col">Status</th><th scope="col">Updated</th></tr>
    </thead>
    <tbody>
      <tr><td>Production</td><td><Badge tone="success">Healthy</Badge></td><td>2 minutes ago</td></tr>
      <tr><td>Preview</td><td><Badge tone="brand">Building</Badge></td><td>8 minutes ago</td></tr>
      <tr><td>Development</td><td><Badge>Idle</Badge></td><td>Yesterday</td></tr>
    </tbody>
  </Table>
</Story>

<Story name="Prose" asChild>
  <Prose>
    <h2>Readable content remains distinct</h2>
    <p>
      Prose uses the story face and a constrained measure for sustained reading. Place ordinary semantic HTML inside.
    </p>
    <blockquote>Components establish the frame; content establishes meaning.</blockquote>
    <Separator decorative />
    <p
      >Links retain a visible <a href="#example">text affordance</a>, and inline <code>code</code> uses the shared mono face.</p
    >
  </Prose>
</Story>

<style>
  strong {
    color: var(--color-text-primary);
  }
  .muted {
    color: var(--color-text-muted);
  }
</style>
