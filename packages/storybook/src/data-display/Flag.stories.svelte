<script module lang="ts">
  import { fixedSelect } from "../controllers";

  import { Flag, Inline, LanguageName, Select, type SelectOption, Stack } from "@a-novel-kit/uikit";

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

  const languageOptions: SelectOption<"en" | "fr">[] = languages.map(({ locale, name }) => ({
    value: locale,
    label: name,
    lang: locale,
  }));
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

{#snippet languageOption(option: SelectOption<"en" | "fr">)}
  <LanguageName locale={option.value} name={option.label} />
{/snippet}

<Story
  name="In a language select"
  parameters={{
    docs: {
      description: {
        story:
          "Each option shows its language's flag beside its name, and carries `lang`, so assistive technology reads the name in its own language, on the option and on the value the field shows.",
      },
    },
  }}
  asChild
>
  <div class="select">
    <Select
      aria-label="Language"
      options={languageOptions}
      controller={fixedSelect<"en" | "fr">("fr", true)}
      renderOption={languageOption}
    />
  </div>
</Story>

<style>
  .select {
    inline-size: var(--layout-container-xs);
    min-block-size: var(--space-24);
  }
</style>
