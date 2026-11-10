<script module lang="ts">
  import type { Attachment } from "svelte/attachments";

  import { Button, Container, Inline, NavList, Pagination, Stack, StickyBar } from "@a-novel-kit/uikit";
  import ScrollPreview from "@a-novel-kit/uikit-storybook/ScrollPreview.svelte";

  import { defineMeta } from "@storybook/addon-svelte-csf";

  const { Story } = defineMeta({
    title: "Layout/Sticky bar",
    component: StickyBar,
    tags: ["!autodocs"],
    parameters: { layout: "fullscreen" },
  });

  /** Opens the story scrolled, with rows already under a bar at the top of the page. */
  const scrolled: Attachment = () => window.scrollTo({ top: 320, behavior: "instant" });

  const sections = [
    { href: "#information", label: "Information", current: true },
    { href: "#privacy", label: "Privacy" },
    { href: "#preferences", label: "Preferences" },
    { href: "#devices", label: "Devices" },
  ];
</script>

{#snippet title()}
  <div class="heading">
    <Stack gap="2">
      <h1>Your projects</h1>
      <p>Every story you have started, most recently edited first.</p>
    </Stack>
  </div>
{/snippet}

{#snippet actions()}
  <div class="bar-row">
    <Inline gap="2" justify="between">
      <strong>12 projects</strong>
      <Button size="sm">New project</Button>
    </Inline>
  </div>
{/snippet}

{#snippet pages()}
  <div class="bar-row">
    <Inline justify="center">
      <Pagination currentPage={2} totalPages={4} getHref={(page) => `#page-${page}`} />
    </Inline>
  </div>
{/snippet}

<Story name="Start edge" asChild>
  <div class="page" {@attach scrolled}>
    {@render title()}
    <StickyBar edge="start" bleed>{@render actions()}</StickyBar>
    <ScrollPreview />
  </div>
</Story>

<Story name="End edge" asChild>
  <div class="page">
    {@render title()}
    <ScrollPreview />
    <StickyBar edge="end" bleed>{@render pages()}</StickyBar>
  </div>
</Story>

<Story name="Inside the column" asChild>
  <Container size="sm">
    <div {@attach scrolled}>
      {@render title()}
      <StickyBar edge="start">{@render actions()}</StickyBar>
      <ScrollPreview />
    </div>
  </Container>
</Story>

<Story name="Navigation" asChild>
  <div class="page" {@attach scrolled}>
    {@render title()}
    <StickyBar edge="start" as="nav" aria-label="Account sections" bleed>
      <NavList orientation="horizontal" items={sections} />
    </StickyBar>
    <ScrollPreview />
  </div>
</Story>

<Story name="Under a shell" asChild>
  <div class="page shell" {@attach scrolled}>
    <header><strong>Agora Studio</strong></header>
    {@render title()}
    <StickyBar edge="start" bleed>{@render actions()}</StickyBar>
    <ScrollPreview />
  </div>
</Story>

<style>
  h1,
  p {
    margin: 0;
  }

  .page {
    box-sizing: border-box;
    background: var(--color-surface-canvas);
    padding-inline: var(--layout-gutter);
    min-block-size: 100dvb;
  }

  .heading {
    padding-block: var(--space-6);
  }

  .bar-row {
    padding-block: var(--space-2);
  }

  /* The shell's own bar, which the page's bar stays under. */
  .shell {
    --shell-sticky-top: var(--space-12);
  }

  header {
    display: flex;
    position: fixed;
    align-items: center;
    z-index: var(--layer-sticky);
    box-sizing: border-box;
    inset-block-start: 0;
    inset-inline: 0;
    background: var(--color-surface-island-strong);
    padding-inline: var(--layout-gutter);
    block-size: var(--shell-sticky-top);
  }
</style>
