<script module lang="ts">
  import { IconBase } from "@a-novel-kit/uikit-icons";

  import {
    Plus as AddIcon,
    ArrowRight as ArrowRightIcon,
    Calendar as CalendarIcon,
    Check as CheckIcon,
    X as CloseIcon,
    Copy as CopyIcon,
    Trash2 as DeleteIcon,
    Download as DownloadIcon,
    Pencil as EditIcon,
    AlertCircle as ErrorIcon,
    ExternalLink as ExternalLinkIcon,
    File as FileIcon,
    Filter as FilterIcon,
    Folder as FolderIcon,
    CircleHelp as HelpIcon,
    EyeOff as HiddenIcon,
    House as HomeIcon,
    Info as InfoIcon,
    LoaderCircle as LoadingIcon,
    Lock as LockIcon,
    Mail as MailIcon,
    Menu as MenuIcon,
    Ellipsis as MoreIcon,
    Bell as NotificationIcon,
    RefreshCw as RefreshIcon,
    Save as SaveIcon,
    Search as SearchIcon,
    Settings as SettingsIcon,
    LogOut as SignOutIcon,
    Upload as UploadIcon,
    User as UserIcon,
    Users as UsersIcon,
    Eye as VisibleIcon,
    AlertTriangle as WarningIcon,
  } from "@lucide/svelte";
  import { defineMeta } from "@storybook/addon-svelte-csf";

  const icons = [
    ["HomeIcon", HomeIcon],
    ["MenuIcon", MenuIcon],
    ["SearchIcon", SearchIcon],
    ["SettingsIcon", SettingsIcon],
    ["UserIcon", UserIcon],
    ["UsersIcon", UsersIcon],
    ["NotificationIcon", NotificationIcon],
    ["MoreIcon", MoreIcon],
    ["AddIcon", AddIcon],
    ["EditIcon", EditIcon],
    ["DeleteIcon", DeleteIcon],
    ["CheckIcon", CheckIcon],
    ["CloseIcon", CloseIcon],
    ["ArrowRightIcon", ArrowRightIcon],
    ["RefreshIcon", RefreshIcon],
    ["SaveIcon", SaveIcon],
    ["CopyIcon", CopyIcon],
    ["UploadIcon", UploadIcon],
    ["DownloadIcon", DownloadIcon],
    ["ExternalLinkIcon", ExternalLinkIcon],
    ["VisibleIcon", VisibleIcon],
    ["HiddenIcon", HiddenIcon],
    ["LockIcon", LockIcon],
    ["MailIcon", MailIcon],
    ["CalendarIcon", CalendarIcon],
    ["FolderIcon", FolderIcon],
    ["FileIcon", FileIcon],
    ["FilterIcon", FilterIcon],
    ["LoadingIcon", LoadingIcon],
    ["InfoIcon", InfoIcon],
    ["WarningIcon", WarningIcon],
    ["ErrorIcon", ErrorIcon],
    ["HelpIcon", HelpIcon],
    ["SignOutIcon", SignOutIcon],
  ] as const;

  const { Story } = defineMeta({
    title: "Icons/Catalog",
    tags: ["autodocs"],
    parameters: {
      docs: {
        description: {
          component: "Import standard SVG components from @lucide/svelte. Use IconBase for custom 24-unit glyphs.",
        },
      },
    },
  });
</script>

<Story name="Interface vocabulary" asChild>
  <div class="icon-grid">
    {#each icons as [name, Icon] (name)}
      <div class="icon-cell">
        <Icon size="var(--icon-size-lg)" aria-hidden="true" />
        <code>{name}</code>
      </div>
    {/each}
  </div>
</Story>

<Story name="Custom icon contract" asChild>
  <div class="custom-example">
    <IconBase size="var(--space-12)" label="Example custom diamond">
      <path d="M12 2 22 12 12 22 2 12Z" />
      <path d="m8 12 3 3 5-6" />
    </IconBase>
    <div><strong>24-unit canvas</strong><p>Inherits currentColor and the shared stroke contract.</p></div>
  </div>
</Story>

<style>
  .icon-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
    gap: var(--space-3);
  }
  .icon-cell {
    display: grid;
    justify-items: center;
    gap: var(--space-3);
    border: var(--border-width-thin) solid var(--color-border-subtle);
    border-radius: var(--radius-lg);
    background: var(--color-surface-sunken);
    padding: var(--space-4);
    color: var(--color-text-secondary);
  }
  code {
    color: var(--color-text-muted);
    font-size: var(--font-size-xs);
    font-family: var(--font-family-mono);
  }
  .custom-example {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    color: var(--color-graphic-brand);
  }
  strong {
    color: var(--color-text-primary);
  }
  p {
    margin: var(--space-1) 0 0;
    color: var(--color-text-muted);
  }
</style>
