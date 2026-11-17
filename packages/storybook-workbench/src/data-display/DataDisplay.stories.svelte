<script module lang="ts">
  import pictureUrl from "@a-novel-kit/ui-images/files/icon/192x192/agora-icon-black.png";
  import {
    Avatar,
    Badge,
    Card,
    DescriptionList,
    Inline,
    InlineMessage,
    Prose,
    Separator,
    Stack,
    Table,
  } from "@a-novel-kit/uikit";

  import { defineMeta } from "@storybook/addon-svelte-csf";

  const avatarSizes = ["sm", "md", "lg", "xl"] as const;

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

<Story
  name="Avatar sizes"
  parameters={{
    docs: {
      description: {
        story:
          "Use `sm` to `lg` beside controls of the same height, and `xl` for a profile picture, which shrinks on phone-width screens.",
      },
    },
  }}
  asChild
>
  <Stack gap="4">
    <Inline gap="4" role="group" aria-label="Image avatars">
      {#each avatarSizes as size (size)}
        <Avatar src={pictureUrl} label="Agora" {size} />
      {/each}
    </Inline>
    <Inline gap="4" role="group" aria-label="Initials avatars">
      {#each avatarSizes as size (size)}
        <Avatar label="Ada Lovelace" {size} />
      {/each}
    </Inline>
  </Stack>
</Story>

<Story
  name="Avatar shapes"
  parameters={{
    docs: {
      description: {
        story:
          "A square avatar takes the rounded corners of the button it sits in, as an account control in a navigation rail.",
      },
    },
  }}
  asChild
>
  <Inline gap="4" role="group" aria-label="Avatar shapes">
    <Avatar src={pictureUrl} label="Agora" />
    <Avatar src={pictureUrl} label="Agora" shape="square" />
    <Avatar label="Ada Lovelace" />
    <Avatar label="Ada Lovelace" shape="square" />
  </Inline>
</Story>

{#snippet statusLabels()}
  <Inline gap="2" wrap>
    <Badge>Draft</Badge><Badge tone="brand">Active</Badge><Badge tone="accent">Fantasy</Badge><Badge tone="highlight"
      >New</Badge
    ><Badge tone="success">Ready</Badge><Badge tone="warning">Review</Badge><Badge tone="danger">Failed</Badge>
  </Inline>
{/snippet}

<Story
  name="Status labels"
  parameters={{
    docs: {
      description: {
        story:
          "Read-only labels on the canvas and a raised surface. Labels preserve casing and wrap within their container.",
      },
    },
  }}
  asChild
>
  <Stack gap="6">
    {@render statusLabels()}
    <Card>{@render statusLabels()}</Card>
  </Stack>
</Story>

{#snippet roles()}
  <Stack gap="4">
    <Inline gap="2" wrap><Badge tone="brand">Member</Badge><Badge tone="highlight">Administrator</Badge></Inline>
    <InlineMessage tone="loading">Loading account</InlineMessage>
  </Stack>
{/snippet}

<Story name="Roles and loading" asChild>
  <Stack gap="6">
    {@render roles()}
    <Card>{@render roles()}</Card>
  </Stack>
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

<Story name="Long status labels" asChild>
  <div style="max-inline-size: calc(var(--layout-container-sm) / 2)">
    <Inline gap="2" wrap>
      <Badge tone="brand">Collaborative workspace administrator</Badge>
      <Badge tone="neutral">workspace:collaborative-story-creator</Badge>
    </Inline>
  </div>
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
