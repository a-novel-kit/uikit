<script module lang="ts">
  import { Container, DowntimeBanner, DowntimeState, Link, Stack } from "@a-novel-kit/uikit";

  import { defineMeta } from "@storybook/addon-svelte-csf";

  const { Story } = defineMeta({
    title: "Feedback/Planned maintenance",
    component: DowntimeBanner,
    tags: ["!autodocs"],
    parameters: { layout: "fullscreen" },
  });

  // Fixed times and zone keep every rendering identical; the toolbar picks the language.
  const start = new Date("2026-10-12T06:00:00Z");
  const end = new Date("2026-10-12T08:30:00Z");
</script>

{#snippet content()}
  <Container size="sm">
    <Stack gap="3">
      <h1>Your library</h1>
      <p>Pick up the story you were writing, or start a new one.</p>
    </Stack>
  </Container>
{/snippet}

{#snippet home()}<Link href="/">Back to the home page</Link>{/snippet}

<Story name="Scheduled banner" asChild>
  <div class="page">
    <DowntimeBanner {start} {end} timeZone="UTC" />
    {@render content()}
  </div>
</Story>

<Story name="Started banner" asChild>
  <div class="page">
    <DowntimeBanner {start} {end} started timeZone="UTC" />
    {@render content()}
  </div>
</Story>

<Story name="French" asChild globals={{ locale: "fr" }}>
  <div class="page">
    <DowntimeBanner {start} {end} started timeZone="Europe/Paris" />
    {@render content()}
  </div>
</Story>

<Story name="Unavailable page" asChild>
  <main class="page centered">
    <Container size="sm">
      <DowntimeState {end} timeZone="UTC" headingLevel={1} actions={home} />
    </Container>
  </main>
</Story>

<style>
  .page {
    display: grid;
    align-content: start;
    gap: var(--space-6);
    box-sizing: border-box;
    background: var(--color-surface-canvas);
    min-block-size: 100dvb;
  }

  .centered {
    align-content: center;
    padding-block: var(--space-6);
  }

  h1,
  p {
    margin: 0;
  }
</style>
