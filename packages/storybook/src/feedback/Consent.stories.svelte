<script module lang="ts">
  import Localized from "../Localized.svelte";
  import { fixedConsent } from "../controllers";

  import { ConsentBanner, Container, Link, Stack } from "@a-novel-kit/uikit";

  import { defineMeta } from "@storybook/addon-svelte-csf";

  const { Story } = defineMeta({
    title: "Feedback/Consent request",
    component: ConsentBanner,
    tags: ["!autodocs"],
    parameters: { layout: "fullscreen" },
  });
</script>

{#snippet page()}
  <Container size="sm">
    <Stack gap="3">
      <h1><Localized en="Your library" fr="Votre bibliothèque" /></h1>
      <p>
        <Localized
          en="Pick up the story you were writing, or start a new one."
          fr="Reprenez l’histoire que vous écriviez, ou commencez-en une nouvelle."
        />
      </p>
    </Stack>
  </Container>
{/snippet}

{#snippet title()}<Localized en="Error and performance reports" fr="Rapports d’erreurs et de performances" />{/snippet}

{#snippet message()}
  <Localized
    en="With your consent, your browser sends Agora a report when a page fails or loads slowly. Reports go to Sentry, our monitoring service, and never serve advertising."
    fr="Avec votre accord, votre navigateur envoie à Agora un rapport quand une page échoue ou se charge lentement. Ces rapports passent par Sentry, notre service de supervision, et ne servent jamais à la publicité."
  />
  <Link href="#privacy"><Localized en="Privacy policy" fr="Politique de confidentialité" /></Link>
{/snippet}

<Story name="Request" asChild>
  <div class="page">
    {@render page()}
    <ConsentBanner controller={fixedConsent()} {title} children={message} />
  </div>
</Story>

<Story name="French" asChild globals={{ locale: "fr" }}>
  <div class="page">
    {@render page()}
    <ConsentBanner controller={fixedConsent()} {title} children={message} />
  </div>
</Story>

<Story name="Answered" asChild>
  <div class="page">
    {@render page()}
    <ConsentBanner controller={fixedConsent(false)} {title} children={message} />
  </div>
</Story>

<style>
  .page {
    padding-block: var(--space-8);
    min-block-size: 100dvb;
  }
</style>
