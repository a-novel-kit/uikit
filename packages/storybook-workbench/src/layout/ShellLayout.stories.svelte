<script module lang="ts">
  import Localized from "../Localized.svelte";

  import { Container, DowntimeBanner, IconButton, NavList, ShellLayout } from "@a-novel-kit/uikit";
  import { reviewStoryGlobals } from "@a-novel-kit/uikit-storybook";
  import ScrollPreview from "@a-novel-kit/uikit-storybook/ScrollPreview.svelte";

  import { FolderOpen, House, Menu, PanelLeftClose, PanelLeftOpen } from "@lucide/svelte";
  import { defineMeta } from "@storybook/addon-svelte-csf";

  const { Story } = defineMeta({
    title: "Layout/Shell layout",
    component: ShellLayout,
    tags: ["!autodocs"],
    parameters: { layout: "fullscreen" },
  });

  // Fixed times and zone keep every rendering identical.
  const start = new Date("2026-10-12T06:00:00Z");
  const end = new Date("2026-10-12T08:30:00Z");
</script>

{#snippet homeIcon()}<House size="var(--icon-size-sm)" />{/snippet}
{#snippet projectsIcon()}<FolderOpen size="var(--icon-size-sm)" />{/snippet}

<!-- What an app renders into the layout: its landmarks, links and labels. -->
{#snippet navigation(compact: boolean)}
  <nav aria-label="Agora">
    <NavList
      {compact}
      items={[
        { href: "#home", label: "Home", icon: homeIcon },
        { href: "#projects", label: "Projects", current: true, icon: projectsIcon },
      ]}
    />
  </nav>
{/snippet}

{#snippet rail(compact: boolean)}
  <aside class="rail" class:compact aria-label="Navigation">
    <div class="rail-header">
      {#if !compact}<strong>Agora</strong>{/if}
      <IconButton
        label={compact ? "Expand navigation" : "Collapse navigation"}
        variant="ghost"
        tone="neutral"
        size="sm"
      >
        {#if compact}<PanelLeftOpen size="var(--icon-size-sm)" />{:else}<PanelLeftClose
            size="var(--icon-size-sm)"
          />{/if}
      </IconButton>
    </div>
    {@render navigation(compact)}
  </aside>
{/snippet}

{#snippet expanded()}{@render rail(false)}{/snippet}
{#snippet collapsed()}{@render rail(true)}{/snippet}

{#snippet header()}
  <header class="header">
    <strong>Agora</strong>
    <IconButton label="Open navigation" variant="ghost" tone="neutral" size="sm">
      <Menu size="var(--icon-size-sm)" />
    </IconButton>
  </header>
{/snippet}

{#snippet banner()}<DowntimeBanner {start} {end} started timeZone="UTC" />{/snippet}

{#snippet page()}
  <main class="page">
    <Container size="sm">
      <h1><Localized en="Your projects" fr="Vos projets" /></h1>
    </Container>
    <ScrollPreview />
  </main>
{/snippet}

<Story name="Expanded rail" asChild>
  <ShellLayout rail={expanded} {header}>{@render page()}</ShellLayout>
</Story>

<Story name="Collapsed rail" asChild>
  <ShellLayout collapsed rail={collapsed} {header}>{@render page()}</ShellLayout>
</Story>

<Story name="Banner on desktop" globals={reviewStoryGlobals.desktop} asChild>
  <ShellLayout rail={expanded} {header} {banner}>{@render page()}</ShellLayout>
</Story>

<Story name="Banner on mobile" globals={reviewStoryGlobals.mobile} asChild>
  <ShellLayout rail={expanded} {header} {banner}>{@render page()}</ShellLayout>
</Story>

<style>
  .rail {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    gap: var(--space-4);
    min-block-size: 0;
  }

  .rail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-inline-start: var(--space-2);
  }

  .compact .rail-header {
    justify-content: center;
    padding: 0;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-inline-start: var(--space-2);
  }

  .page {
    display: grid;
    gap: var(--space-6);
    padding-block-start: var(--space-6);
  }

  h1 {
    margin: 0;
  }
</style>
