<script module lang="ts">
  import { Button, Card, Container, Grid, Inline, PageHeader, SplitPane, Stack } from "@a-novel-kit/uikit";

  import { defineMeta } from "@storybook/addon-svelte-csf";

  const ghostItems = [
    { title: "The harbor lights", text: "A short one." },
    {
      title: "The cartographer",
      text: "A mapmaker who only draws places that no longer exist is hired to chart a town that has not been built yet.",
    },
    { title: "Salt and ash", text: "Two sisters, one inn, and the winter that closes the pass." },
    { title: "Notebooks", text: "A building, six floors, a single night without power." },
    {
      title: "The long table",
      text: "A family gathers every summer at the same house, and every summer someone leaves a letter under a plate. This year, the letter is addressed to the house.",
    },
    { title: "Lantern", text: "A play in three acts." },
  ];

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

<Story
  name="Nested cards"
  parameters={{
    docs: {
      description: {
        story:
          "A raised card is frosted glass the app's lamp shines through. A raised card inside it keeps the parent's glass and stands out by its shadow alone, so one group holds a card per option.",
      },
    },
  }}
  asChild
>
  <Container size="sm">
    <Card>
      <Stack gap="4">
        <strong>Credentials</strong>
        {#each ["Email and password", "Another sign-in"] as option (option)}
          <Card>
            <Stack gap="2">
              <strong>{option}</strong>
              <span class="muted">Each way to sign in sits on a card of its own.</span>
            </Stack>
          </Card>
        {/each}
      </Stack>
    </Card>
  </Container>
</Story>

<Story
  name="Ghost cards"
  parameters={{
    docs: {
      description: {
        story:
          "Each item of a collection is a ghost card: the canvas's own color under a raised card's veil and blur, ringed as a divider. It lights as a raised card under the pointer, or once something in it takes the keyboard's focus. The items run down one column before the next, each as tall as it needs.",
      },
    },
  }}
  asChild
>
  <Container size="lg">
    <ul class="mosaic">
      {#each ghostItems as item (item.title)}
        <li>
          <Card surface="ghost">
            <Stack gap="2">
              <a href="#{item.title}">{item.title}</a>
              <span class="muted">{item.text}</span>
            </Stack>
          </Card>
        </li>
      {/each}
    </ul>
  </Container>
</Story>

<Story name="Split pane" asChild>
  <Container size="lg">
    <SplitPane>
      {#snippet secondary()}
        <Card surface="subtle">
          <Stack gap="3">
            <strong>Supporting details</strong>
            <span class="muted">The secondary pane wraps below the primary pane when space runs out.</span>
          </Stack>
        </Card>
      {/snippet}
      <Stack gap="3">
        <strong>Primary content</strong>
        <p class="muted">SplitPane arranges regions without assigning landmarks or surface styling.</p>
      </Stack>
    </SplitPane>
  </Container>
</Story>

<style>
  /* The items run down one column before the next, each as tall as it needs. */
  .mosaic {
    column-gap: var(--space-4);
    columns: 3 14rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .mosaic > li {
    break-inside: avoid;
    padding-block-end: var(--space-4);
  }
  .mosaic a {
    color: var(--color-text-primary);
    font-weight: var(--font-weight-bold);
    font-family: var(--font-family-interface);
  }
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
