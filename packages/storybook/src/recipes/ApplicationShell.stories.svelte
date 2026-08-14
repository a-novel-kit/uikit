<script module lang="ts">
  import {
    AppShell,
    Avatar,
    Badge,
    Button,
    Card,
    Grid,
    IconButton,
    Inline,
    NavList,
    PageHeader,
    SkipLink,
    Stack,
  } from "@a-novel-kit/uikit";
  import { HomeIcon, NotificationIcon, SettingsIcon, UsersIcon } from "@a-novel-kit/uikit-icons";

  import { defineMeta } from "@storybook/addon-svelte-csf";

  const { Story } = defineMeta({
    title: "Recipes/Application shell",
    tags: ["autodocs"],
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component: "AppShell composes header, navigation, main, aside, and footer landmarks into a responsive page.",
        },
      },
    },
  });
</script>

{#snippet homeIcon()}<HomeIcon size="var(--icon-size-sm)" />{/snippet}
{#snippet usersIcon()}<UsersIcon size="var(--icon-size-sm)" />{/snippet}
{#snippet settingsIcon()}<SettingsIcon size="var(--icon-size-sm)" />{/snippet}
{#snippet shellHeader()}
  <div class="shell-header">
    <a class="wordmark" href="#home">AGORA</a>
    <Inline gap="2">
      <IconButton label="Notifications" variant="ghost" tone="neutral"
        ><NotificationIcon size="var(--icon-size-md)" /></IconButton
      >
      <Avatar label="Morgan Reed" size="sm" />
    </Inline>
  </div>
{/snippet}
{#snippet shellNavigation()}
  <NavList
    items={[
      { href: "#home", label: "Overview", current: true, icon: homeIcon },
      { href: "#team", label: "Team", badge: 8, icon: usersIcon },
      { href: "#settings", label: "Settings", icon: settingsIcon },
    ]}
  />
{/snippet}
{#snippet shellAside()}
  <Stack gap="4">
    <div><span class="eyebrow">Workspace</span><h2>Northstar</h2></div>
    <Card surface="subtle" padding="sm">
      <Stack gap="2"><Badge tone="success">Healthy</Badge><span class="aside-copy">All systems operational</span></Stack
      >
    </Card>
  </Stack>
{/snippet}
{#snippet shellFooter()}<div class="shell-footer">Agora UI</div>{/snippet}
{#snippet pageActions()}<Button>Create project</Button>{/snippet}

<Story name="Responsive shell" asChild>
  <SkipLink>Skip to content</SkipLink>
  <AppShell
    header={shellHeader}
    navigation={shellNavigation}
    aside={shellAside}
    footer={shellFooter}
    navigationLabel="Primary"
    asideLabel="Workspace status"
  >
    <Stack gap="6">
      <PageHeader
        eyebrow="Overview"
        title="Good evening, Morgan"
        description="Review workspace activity and create a project."
        actions={pageActions}
      />
      <Grid minItemWidth="sm" gap="4">
        {#each [["Active projects", "12", "Three updated today"], ["Collaborators", "48", "Eight currently online"], ["Storage", "68%", "32 GB available"]] as metric (metric[0])}
          <Card>
            <Stack gap="2"
              ><span class="metric-label">{metric[0]}</span><strong>{metric[1]}</strong><span class="metric-note"
                >{metric[2]}</span
              ></Stack
            >
          </Card>
        {/each}
      </Grid>
      <Card surface="plain" padding="none">
        <Stack gap="3"><h2>Recent activity</h2><p>Your latest project updates will appear here.</p></Stack>
      </Card>
    </Stack>
  </AppShell>
</Story>

<style>
  .shell-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-4);
    padding-inline: var(--layout-gutter);
    min-block-size: var(--control-height-lg);
  }
  .wordmark {
    color: var(--color-text-accent);
    font-weight: var(--font-weight-bold);
    font-size: var(--font-size-xl);
    font-family: var(--font-family-display);
    letter-spacing: var(--letter-spacing-display);
    text-decoration: none;
  }
  .shell-footer {
    padding: var(--space-3) var(--layout-gutter);
    color: var(--color-text-muted);
    font-size: var(--font-size-xs);
  }
  .eyebrow,
  .metric-label {
    color: var(--color-text-muted);
    font-size: var(--font-size-xs);
    font-family: var(--font-family-mono);
    letter-spacing: var(--letter-spacing-wide);
    text-transform: uppercase;
  }
  h2,
  p {
    margin: 0;
  }
  h2 {
    color: var(--color-text-primary);
    font-size: var(--font-size-lg);
    font-family: var(--font-family-display);
  }
  p,
  .aside-copy,
  .metric-note {
    color: var(--color-text-muted);
    line-height: var(--line-height-normal);
  }
  strong {
    color: var(--color-text-accent);
    font-size: var(--font-size-3xl);
    line-height: var(--line-height-tight);
    font-family: var(--font-family-display);
  }
</style>
