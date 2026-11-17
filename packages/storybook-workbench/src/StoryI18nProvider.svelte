<!-- Stands in for an app's i18n provider, so stories render uikit's messages in the toolbar language. -->
<script lang="ts">
  import { type Snippet, untrack } from "svelte";

  import { createStaticI18n } from "@a-novel-kit/nodelib-i18n";
  import { setI18nContext } from "@a-novel-kit/nodelib-i18n/svelte";

  let { children, locale }: { children: Snippet; locale: string } = $props();

  untrack(() =>
    setI18nContext(
      createStaticI18n({
        locale,
        defaultLocale: "en",
        defaultNamespace: "app",
        namespaces: ["app"],
        resources: { [locale]: { app: {} } },
      })
    )
  );
</script>

{@render children()}
