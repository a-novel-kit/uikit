<script module lang="ts">
  import { ActionMenu, Breadcrumbs, Card, NavList, Pagination, Stack, Tabs } from "@a-novel-kit/uikit";
  import { EditIcon, HomeIcon, MoreIcon, SettingsIcon, UsersIcon } from "@a-novel-kit/uikit-icons";

  import { defineMeta } from "@storybook/addon-svelte-csf";

  const { Story } = defineMeta({
    title: "Navigation/Patterns",
    tags: ["autodocs"],
    parameters: {
      docs: {
        description: {
          component: "Patterns for primary navigation, route context, tabs, pagination, and action menus.",
        },
      },
    },
  });
</script>

{#snippet homeIcon()}<HomeIcon size="var(--icon-size-sm)" />{/snippet}
{#snippet usersIcon()}<UsersIcon size="var(--icon-size-sm)" />{/snippet}
{#snippet settingsIcon()}<SettingsIcon size="var(--icon-size-sm)" />{/snippet}
{#snippet editIcon()}<EditIcon size="var(--icon-size-sm)" />{/snippet}
{#snippet moreIcon()}<MoreIcon size="var(--icon-size-sm)" />{/snippet}

<Story name="Primary navigation" asChild>
  <div class="nav-demo">
    <NavList
      items={[
        { href: "#home", label: "Home", current: true, icon: homeIcon },
        { href: "#team", label: "Team", badge: 8, icon: usersIcon },
        { href: "#settings", label: "Settings", icon: settingsIcon },
        { href: "#disabled", label: "Unavailable", disabled: true },
      ]}
    />
  </div>
</Story>

<Story name="Route context" asChild>
  <Stack gap="6">
    <Breadcrumbs
      items={[
        { label: "Projects", href: "#projects" },
        { label: "Northstar", href: "#northstar" },
        { label: "Settings" },
      ]}
    />
    <Pagination currentPage={6} totalPages={18} getHref={(page) => `#page-${page}`} />
  </Stack>
</Story>

<Story name="Tabs" asChild>
  <Card>
    <Tabs
      label="Account settings"
      value="profile"
      tabs={[
        { value: "profile", label: "Profile" },
        { value: "security", label: "Security" },
        { value: "billing", label: "Billing" },
      ]}
    >
      {#snippet children(tab)}
        <Stack gap="2">
          <strong>{tab.label}</strong>
          <span class="muted">The panel follows the selected tab.</span>
        </Stack>
      {/snippet}
    </Tabs>
  </Card>
</Story>

<Story name="Action menu" asChild>
  <ActionMenu
    label="Project actions"
    triggerText="Project actions"
    triggerIcon={moreIcon}
    items={[
      { id: "rename", label: "Rename", icon: editIcon, shortcut: "R" },
      { id: "settings", label: "Settings", icon: settingsIcon },
      { id: "divider", kind: "separator" },
      { id: "delete", label: "Delete", tone: "danger" },
    ]}
  />
</Story>

<style>
  .nav-demo {
    border: var(--border-width-thin) solid var(--color-border-subtle);
    border-radius: var(--radius-lg);
    background: var(--color-surface-sunken);
    padding: var(--space-3);
    inline-size: min(100%, var(--layout-sidebar));
  }
  strong {
    color: var(--color-text-primary);
  }
  .muted {
    color: var(--color-text-muted);
  }
</style>
