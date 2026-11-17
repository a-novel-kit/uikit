<script module lang="ts">
  import type { StatusStateProps } from "@a-novel-kit/uikit";
  import { AuthorizationBoundary, Button, Container, StatusState } from "@a-novel-kit/uikit";

  import { defineMeta } from "@storybook/addon-svelte-csf";

  const { Story } = defineMeta({
    title: "Access/Authorization",
    component: AuthorizationBoundary,
    tags: ["!autodocs"],
    parameters: { layout: "fullscreen" },
  });
</script>

{#snippet login()}<Button>Login</Button>{/snippet}
{#snippet retry()}<Button>Try again</Button>{/snippet}

{#snippet page(props: StatusStateProps)}
  <main class="page">
    <Container size="sm">
      <StatusState {...props} headingLevel={1} />
    </Container>
  </main>
{/snippet}

<Story name="Anonymous" asChild>
  {@render page({
    title: "Agora account required",
    description: "Only signed-in users can view this page.",
    role: "presentation",
    actions: login,
  })}
</Story>
<Story name="Forbidden" asChild>
  {@render page({
    tone: "error",
    title: "Access denied",
    description: "You do not have permission to view this page.",
    role: "presentation",
  })}
</Story>
<Story name="Pending" asChild>{@render page({ tone: "loading", title: "Checking access" })}</Story>
<Story name="Unavailable" asChild>
  {@render page({
    tone: "error",
    title: "Unable to check access",
    description: "The service is temporarily unavailable.",
    actions: retry,
  })}
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
