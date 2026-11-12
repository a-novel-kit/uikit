<!--
@component
A language's flag and its name, set in that language so a reader lost in another one still finds theirs. Render it
as a select's option, so every language choice in the platform reads the same, and give the option its `lang` too:
the option's accessible name is its label, which assistive technology then reads in that language.

```svelte
<script lang="ts">
  import { createSelectController, LanguageName, Select, type SelectOption } from "@a-novel-kit/uikit";

  const language = createSelectController<"fr">({ initialValue: "fr" });
</script>

<Select options={[{ value: "fr", label: "Français", lang: "fr" }]} controller={language}>
  {#snippet renderOption(option: SelectOption<"fr">)}
    <LanguageName locale={option.value} name={option.label} />
  {/snippet}
</Select>
```
-->
<script lang="ts" module>
  import type { FlagProps } from "./Flag.svelte";

  import type { HTMLAttributes } from "svelte/elements";

  /** Props for a language's flag and name. */
  export interface LanguageNameProps extends HTMLAttributes<HTMLSpanElement> {
    /** The language named. */
    locale: FlagProps["locale"];
    /** The language's name, in that language. */
    name: string;
  }
</script>

<script lang="ts">
  import Flag from "./Flag.svelte";

  let { locale, name, class: className = "", ...rest }: LanguageNameProps = $props();
</script>

<span class="language-name {className}" {...rest}>
  <Flag {locale} />
  <span lang={locale}>{name}</span>
</span>

<style>
  .language-name {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
  }
</style>
