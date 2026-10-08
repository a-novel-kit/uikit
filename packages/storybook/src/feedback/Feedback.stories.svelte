<script module lang="ts">
  import {
    Alert,
    Button,
    EmptyState,
    Grid,
    Inline,
    InlineMessage,
    Meter,
    Progress,
    Skeleton,
    Spinner,
    Stack,
    ToastRegion,
  } from "@a-novel-kit/uikit";

  import { Folder as FolderIcon } from "@lucide/svelte";
  import { defineMeta } from "@storybook/addon-svelte-csf";

  const { Story } = defineMeta({
    title: "Feedback/Status",
    tags: ["!autodocs"],
    parameters: {
      docs: {
        description: {
          component: "Components for messages, progress, loading, empty content, and transient notifications.",
        },
      },
    },
  });
</script>

{#snippet folderIcon()}<FolderIcon size="var(--space-12)" />{/snippet}
{#snippet emptyActions()}<Button>Create folder</Button>{/snippet}

<Story name="Messages" asChild>
  <Grid minItemWidth="sm" gap="3">
    <InlineMessage tone="loading">Loading account</InlineMessage>
    <InlineMessage tone="info">Check your inbox</InlineMessage>
    <InlineMessage tone="success">Changes saved</InlineMessage>
    <InlineMessage tone="warning">Connection unstable</InlineMessage>
    <InlineMessage tone="error">Upload failed</InlineMessage>
  </Grid>
</Story>

<Story name="Compact indicators" asChild>
  <Inline gap="3">
    <InlineMessage tone="loading" aria-label="Loading account" />
    <InlineMessage tone="error" aria-label="Account unavailable" />
  </Inline>
</Story>

<Story name="Section messages" asChild>
  <Stack gap="4">
    <Alert tone="loading" title="Loading account" />
    <Alert tone="info" title="Check your inbox">Follow the link to finish creating your account.</Alert>
    <Alert tone="success" title="Password updated">Use your new password next time you log in.</Alert>
    <Alert tone="warning" title="You are offline">Your changes are stored on this device.</Alert>
    <Alert tone="error" title="Account unavailable">
      The service could not be reached.
      {#snippet actions()}<Button size="sm">Try again</Button>{/snippet}
    </Alert>
  </Stack>
</Story>

<Story name="Tight spaces" asChild>
  <Stack gap="3" style="inline-size: min(100%, 14rem)">
    <Alert tone="loading">Loading account</Alert>
    <Alert tone="warning">Account unavailable during maintenance.</Alert>
    <Alert tone="error">Account unavailable. Try again in a few minutes.</Alert>
  </Stack>
</Story>

<Story name="Progress and loading" asChild>
  <Stack gap="6">
    <Progress label="Uploading assets" value={68} showValue />
    <Meter label="Storage used" value={72} min={0} max={100} low={35} high={80} optimum={20} />
    <Stack gap="3">
      <InlineMessage tone="loading">Loading account</InlineMessage>
      <Stack gap="2" style="inline-size: min(100%, 28rem)">
        <Skeleton shape="text" />
        <Skeleton shape="text" style="inline-size: 72%" />
      </Stack>
    </Stack>
    <Inline gap="4">
      <Spinner label="Loading" size="sm" />
      <Spinner label="Loading" />
      <Spinner label="Loading" size="lg" />
    </Inline>
  </Stack>
</Story>

<Story name="Empty state" asChild>
  <EmptyState
    title="No folders yet"
    description="Create a folder to organize related files."
    illustration={folderIcon}
    actions={emptyActions}
  />
</Story>

<Story name="Toast region" asChild parameters={{ layout: "fullscreen" }}>
  <div class="toast-stage">
    <ToastRegion
      toasts={[
        { id: "shared", title: "Invitation sent", message: "Your collaborator will receive an email.", tone: "info" },
        { id: "saved", title: "Saved", message: "Your changes are available to collaborators.", tone: "success" },
        { id: "offline", title: "Connection lost", message: "We will retry automatically.", tone: "warning" },
        { id: "failed", title: "Upload failed", message: "This file exceeds the size limit.", tone: "error" },
      ]}
      onDismiss={() => undefined}
    />
  </div>
</Story>

<style>
  .toast-stage {
    min-block-size: 100dvb;
  }
</style>
