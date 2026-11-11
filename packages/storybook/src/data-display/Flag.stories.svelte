<script module lang="ts">
  import { Flag, Inline, LanguageName, Stack } from "@a-novel-kit/uikit";

  import { defineMeta } from "@storybook/addon-svelte-csf";

  const { Story } = defineMeta({
    title: "Data display/Flag",
    component: Flag,
    tags: ["!autodocs"],
  });

  const languages = [
    { locale: "en", name: "English" },
    { locale: "fr", name: "Français" },
  ] as const;
</script>

<Story name="Named" asChild>
  <Inline gap="3">
    {#each languages as language (language.locale)}
      <Flag locale={language.locale} label={language.name} />
    {/each}
  </Inline>
</Story>

<Story name="Beside its name" asChild>
  <Stack gap="2">
    {#each languages as language (language.locale)}
      <LanguageName locale={language.locale} name={language.name} />
    {/each}
  </Stack>
</Story>
