<script module lang="ts">
  import { Button, Card, Container, Grid, Inline, PageHeader, SplitPane, Stack } from "@a-novel-kit/uikit";

  import { defineMeta } from "@storybook/addon-svelte-csf";

  const { Story } = defineMeta({
    title: "Layout/Primitives",
    tags: ["autodocs"],
    parameters: {
      docs: {
        description: {
          component: "Layout primitives arrange and constrain content with the shared spacing scale.",
        },
      },
    },
  });
</script>

<Story name="Stack and inline" asChild>
  <Container size="md">
    <Stack gap="6">
      <PageHeader
        as="div"
        headingLevel={2}
        eyebrow="Layout primitive"
        title="Structure before decoration"
        description="Stack controls vertical rhythm; Inline aligns related controls and wraps when space runs out."
      >
        {#snippet actions()}
          <Button variant="ghost" tone="neutral">Cancel</Button>
          <Button>Save layout</Button>
        {/snippet}
      </PageHeader>
      <Inline gap="3" wrap>
        <Button size="sm">Primary</Button>
        <Button size="sm" variant="outline">Secondary</Button>
        <Button size="sm" variant="ghost" tone="neutral">Quiet action</Button>
      </Inline>
    </Stack>
  </Container>
</Story>

<Story name="Intrinsic grid" asChild>
  <Container size="lg">
    <Grid minItemWidth="sm" gap="4">
      {#each ["Canvas", "Raised", "Overlay"] as surface, index (surface)}
        <Card surface={index === 0 ? "subtle" : index === 1 ? "raised" : "overlay"}>
          <Stack gap="2">
            <strong>{surface}</strong>
            <span class="muted">Cards wrap when the available width changes.</span>
          </Stack>
        </Card>
      {/each}
    </Grid>
  </Container>
</Story>

<Story name="Split pane" asChild>
  <Container size="lg">
    <SplitPane asideLabel="Inspector">
      {#snippet aside()}
        <Stack gap="3">
          <strong>Inspector</strong>
          <span class="muted">Secondary content moves below the primary pane at narrow widths.</span>
        </Stack>
      {/snippet}
      <Stack gap="3">
        <strong>Primary workspace</strong>
        <p class="muted">Primary workspace content.</p>
      </Stack>
    </SplitPane>
  </Container>
</Story>

<style>
  strong {
    color: var(--color-text-primary);
    font-family: var(--font-family-interface);
  }
  .muted {
    margin: 0;
    color: var(--color-text-muted);
    line-height: var(--line-height-normal);
  }
</style>
