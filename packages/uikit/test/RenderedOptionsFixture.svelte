<!-- An open list of each kind that renders its own rows, here a flag beside a language's name: the content that
     sat above its row's middle. -->
<script lang="ts">
  import {
    ActionMenu,
    type ActionMenuAction,
    Combobox,
    LanguageName,
    Select,
    type SelectOption,
    createComboboxController,
    createOpenController,
    createSelectController,
  } from "../src/lib";

  let { kind }: { kind: "select" | "combobox" | "menu" } = $props();

  type Language = "en" | "fr";

  const languages: SelectOption<Language>[] = [
    { value: "en", label: "English", lang: "en" },
    { value: "fr", label: "Français", lang: "fr" },
  ];
</script>

{#snippet language(option: SelectOption<Language>)}
  <LanguageName locale={option.value} name={option.label} />
{/snippet}

{#snippet action(item: ActionMenuAction)}
  <LanguageName locale={item.id as Language} name={item.label} />
{/snippet}

{#if kind === "select"}
  <Select
    aria-label="Language"
    options={languages}
    controller={createSelectController<Language>({ initialValue: "fr", initialOpen: true })}
    renderOption={language}
  />
{:else if kind === "combobox"}
  <Combobox
    aria-label="Language"
    options={languages}
    controller={createComboboxController<Language>({ initialOpen: true })}
    renderOption={language}
  />
{:else}
  <ActionMenu
    label="Language"
    items={languages.map(({ value, label }) => ({ id: value, label }))}
    controller={createOpenController({ initialOpen: true })}
    renderItem={action}
  />
{/if}
