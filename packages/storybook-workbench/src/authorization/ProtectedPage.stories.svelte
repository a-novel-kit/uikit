<script module lang="ts">
  import Localized from "../Localized.svelte";

  import type { AuthorizationStatus } from "@a-novel-kit/uikit";
  import {
    AccessForbiddenState,
    Container,
    Link,
    PageErrorState,
    PageNotFoundState,
    ProtectedPage,
  } from "@a-novel-kit/uikit";

  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect } from "storybook/test";

  const { Story } = defineMeta({
    title: "Access/Protected pages",
    component: ProtectedPage,
    tags: ["!autodocs"],
    parameters: { layout: "fullscreen" },
  });

  /** A fixed decision, so the story keeps its state. */
  const decided = (status: AuthorizationStatus) => ({ state: { status } });
</script>

{#snippet projects()}
  <div class="content">
    <Container size="sm"><h1><Localized en="Your projects" fr="Vos projets" /></h1></Container>
  </div>
{/snippet}

{#snippet publicAccount()}
  <div class="content">
    <Container size="sm">
      <h1><Localized en="Your account" fr="Votre compte" /></h1>
      <p>
        <Localized
          en="Your details show again once Agora reaches its account service."
          fr="Vos informations s’afficheront dès qu’Agora joindra son service de comptes."
        />
      </p>
    </Container>
  </div>
{/snippet}

{#snippet locked()}<Localized en="This project is locked" fr="Ce projet est verrouillé" />{/snippet}

{#snippet lockedReason()}
  <Localized
    en="Its owner keeps it private while they rework it."
    fr="Son propriétaire le garde privé pendant qu’il le retravaille."
  />
{/snippet}

{#snippet owner()}
  <Link href="/projects/1/owner"><Localized en="Contact its owner" fr="Contacter son propriétaire" /></Link>
{/snippet}

<Story
  name="Checking access"
  asChild
  play={async ({ canvas }) => {
    await expect(canvas.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    await expect(canvas.getByRole("status")).toBeVisible();
    await expect(canvas.queryByRole("link")).toBeNull();
  }}
>
  <ProtectedPage controller={decided("pending")} homeHref="/" retryHref="/projects" children={projects} />
</Story>

<Story
  name="Access denied"
  asChild
  play={async ({ canvas }) => {
    await expect(canvas.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    await expect(canvas.getByRole("link")).toHaveAttribute("href", "/");
  }}
>
  <ProtectedPage controller={decided("forbidden")} homeHref="/" retryHref="/projects" children={projects} />
</Story>

<Story
  name="Access unavailable"
  asChild
  play={async ({ canvas }) => {
    await expect(canvas.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    await expect(canvas.getByRole("link")).toHaveAttribute("href", "/projects");
    await expect(canvas.getByRole("link")).toHaveAttribute("data-sveltekit-reload");
  }}
>
  <ProtectedPage controller={decided("unavailable")} homeHref="/" retryHref="/projects" children={projects} />
</Story>

<Story
  name="Public content during an outage"
  asChild
  play={async ({ canvas }) => {
    await expect(canvas.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    await expect(canvas.queryByRole("alert")).toBeNull();
  }}
>
  <ProtectedPage
    controller={decided("unavailable")}
    homeHref="/"
    retryHref="/account"
    children={projects}
    unavailable={publicAccount}
  />
</Story>

<Story
  name="Page not found"
  asChild
  play={async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(canvas.getByRole("link")).toHaveAttribute("href", "/");
  }}
>
  <main class="page"><PageNotFoundState homeHref="/" headingLevel={1} /></main>
</Story>

<Story
  name="Page error"
  asChild
  play={async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(canvas.getByRole("link")).toHaveAttribute("href", "/");
  }}
>
  <main class="page"><PageErrorState homeHref="/" headingLevel={1} /></main>
</Story>

<Story name="Own copy" asChild>
  <main class="page">
    <AccessForbiddenState title={locked} description={lockedReason} actions={owner} headingLevel={1} />
  </main>
</Story>

<style>
  .page {
    display: grid;
    place-items: center;
    box-sizing: border-box;
    padding: var(--space-6);
    min-block-size: 100dvb;
  }

  .content {
    padding-block: var(--space-6);
  }

  h1,
  p {
    margin: 0 0 var(--space-2);
  }
</style>
