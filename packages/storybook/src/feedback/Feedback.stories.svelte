<script module lang="ts">
  import {
    Alert,
    Badge,
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
  <Stack gap="4">
    <Alert title="Deployment ready" tone="info">Review the generated preview before promoting it to production.</Alert>
    <Grid minItemWidth="sm" gap="3">
      <InlineMessage tone="loading">Loading account</InlineMessage>
      <InlineMessage tone="info">Check your inbox</InlineMessage>
      <InlineMessage tone="success">Changes saved</InlineMessage>
      <InlineMessage tone="warning">Connection unstable</InlineMessage>
      <InlineMessage tone="error">Upload failed</InlineMessage>
    </Grid>
    <Inline gap="2" wrap>
      <Badge>Draft</Badge><Badge tone="brand">Active</Badge><Badge tone="success">Ready</Badge><Badge tone="warning"
        >Review</Badge
      ><Badge tone="danger">Failed</Badge>
    </Inline>
  </Stack>
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
      {#snippet actions()}<Button>Try again</Button>{/snippet}
    </Alert>
  </Stack>
</Story>

<Story name="Progress and loading" asChild>
  <Stack gap="6">
    <Progress label="Uploading assets" value={68} showValue />
    <Meter label="Storage used" value={72} min={0} max={100} low={35} high={80} optimum={20} />
    <Inline gap="4">
      <InlineMessage tone="loading">Loading account</InlineMessage>
      <Stack gap="2" style="inline-size: min(100%, 28rem)">
        <Skeleton shape="text" />
        <Skeleton shape="text" style="inline-size: 72%" />
      </Stack>
    </Inline>
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
    <p>Toasts are positioned at the viewport edge and announced without stealing focus.</p>
    <ToastRegion
      toasts={[
        { id: "saved", title: "Saved", message: "Your changes are available to collaborators.", tone: "success" },
        { id: "offline", title: "Connection lost", message: "We will retry automatically.", tone: "warning" },
      ]}
      onDismiss={() => undefined}
    />
  </div>
</Story>

<style>
  .toast-stage {
    min-block-size: 16rem;
    color: var(--color-text-muted);
  }
</style>
