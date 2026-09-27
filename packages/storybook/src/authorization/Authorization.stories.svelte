<script module lang="ts">
  import type { AuthorizationController, AuthorizationStatus } from "@a-novel-kit/uikit";
  import { AuthorizationBoundary, Button, Container, EmptyState, Stack } from "@a-novel-kit/uikit";
  import { reviewStoryGlobals } from "@a-novel-kit/uikit-storybook";

  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";

  const fixed = (status: AuthorizationStatus): AuthorizationController => ({ state: { status }, resolve() {} });
  const { Story } = defineMeta({
    title: "Access/Authorization",
    component: AuthorizationBoundary,
    tags: ["!autodocs"],
    parameters: { layout: "fullscreen" },
  });

  async function verifyDenied({ canvasElement }: { canvasElement: HTMLElement }) {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText("Protected content")).not.toBeInTheDocument();
    await expect(canvas.getByRole("heading", { name: "Access denied" })).toBeVisible();
  }
</script>

{#snippet page(status: AuthorizationStatus)}
  <main class="page">
    <Container size="sm">
      <AuthorizationBoundary controller={fixed(status)}>
        <EmptyState title="Protected content" />
        {#snippet fallback(decision)}
          {#if decision === "anonymous"}
            <EmptyState title="Account required">
              {#snippet actions()}<Button>Login</Button>{/snippet}
            </EmptyState>
          {:else if decision === "forbidden"}
            <EmptyState title="Access denied" />
          {:else if decision === "unavailable"}
            <EmptyState title="Unable to check access" description="The service is temporarily unavailable.">
              {#snippet actions()}<Button>Try again</Button>{/snippet}
            </EmptyState>
          {:else}
            <EmptyState title="Checking access" />
          {/if}
        {/snippet}
      </AuthorizationBoundary>
    </Container>
  </main>
{/snippet}

<Story name="Allowed" asChild>{@render page("allowed")}</Story>
<Story name="Anonymous" asChild>{@render page("anonymous")}</Story>
<Story
  name="Forbidden — desktop"
  exportName="ForbiddenDesktop"
  globals={reviewStoryGlobals.desktop}
  asChild
  play={verifyDenied}>{@render page("forbidden")}</Story
>
<Story
  name="Forbidden — mobile"
  exportName="ForbiddenMobile"
  globals={reviewStoryGlobals.mobile}
  asChild
  play={verifyDenied}>{@render page("forbidden")}</Story
>
<Story name="Pending" asChild>{@render page("pending")}</Story>
<Story name="Unavailable" asChild>{@render page("unavailable")}</Story>
<Story name="Conditional content" asChild>
  <Container size="sm">
    <Stack gap="4">
      <h2>Document actions</h2>
      <AuthorizationBoundary controller={fixed("allowed")}><Button>Edit document</Button></AuthorizationBoundary>
      <AuthorizationBoundary controller={fixed("forbidden")}>
        <Button tone="danger">Delete document</Button>
        {#snippet fallback()}<p>Only the document owner can delete it.</p>{/snippet}
      </AuthorizationBoundary>
    </Stack>
  </Container>
</Story>

<style>
  .page {
    display: grid;
    align-items: center;
    background: var(--color-surface-canvas);
    padding-block: var(--space-6);
    min-block-size: 100dvb;
  }
</style>
