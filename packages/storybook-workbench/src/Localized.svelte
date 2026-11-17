<!-- Demo text in the toolbar language. It stands in for an app's own translations, which uikit never owns. -->
<script lang="ts">
  import { getI18nContext } from "@a-novel-kit/nodelib-i18n/svelte";

  let { en, fr }: { en: string; fr: string } = $props();

  const { language } = getI18nContext();
</script>

{language === "fr" ? fr : en}
