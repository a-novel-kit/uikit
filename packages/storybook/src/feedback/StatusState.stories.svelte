<script module lang="ts">
  import type { FeedbackState } from "@a-novel-kit/uikit";
  import { Button, Container, StatusState } from "@a-novel-kit/uikit";

  import { defineMeta } from "@storybook/addon-svelte-csf";

  const { Story } = defineMeta({
    title: "Feedback/Status state",
    component: StatusState,
    tags: ["!autodocs"],
    parameters: { layout: "fullscreen" },
  });
</script>

{#snippet retry()}<Button>Try again</Button>{/snippet}

{#snippet page(tone: FeedbackState, title: string, description?: string)}
  <main class="page">
    <Container size="sm">
      <StatusState {tone} {title} {description} headingLevel={1} actions={tone === "error" ? retry : undefined} />
    </Container>
  </main>
{/snippet}

<Story name="Loading" asChild>{@render page("loading", "Loading account")}</Story>
<Story name="Error" asChild>{@render page("error", "Account unavailable", "The service could not be reached.")}</Story>
<Story name="Success" asChild
  >{@render page("success", "Password updated", "Use your new password next time you log in.")}</Story
>
<Story name="Warning" asChild
  >{@render page("warning", "You are offline", "Your changes are stored on this device.")}</Story
>
<Story name="Information" asChild
  >{@render page("info", "Check your inbox", "Follow the link to finish creating your account.")}</Story
>
<Story name="Long content" asChild>
  {@render page(
    "error",
    "Your reference files could not be uploaded to the workspace",
    "The connection was interrupted. Your original files are still on this device and can be uploaded again."
  )}
</Story>

<style>
  .page {
    display: grid;
    align-items: center;
    box-sizing: border-box;
    background: var(--color-surface-canvas);
    padding-block: var(--space-6);
    min-block-size: 100dvb;
  }
</style>
