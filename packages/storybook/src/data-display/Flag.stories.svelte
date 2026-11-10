<script module lang="ts">
  import { Flag, Inline, Stack } from "@a-novel-kit/uikit";

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
      <Inline gap="2">
        <Flag locale={language.locale} />
        <span>{language.name}</span>
      </Inline>
    {/each}
  </Stack>
</Story>
