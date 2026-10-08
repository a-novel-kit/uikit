<script lang="ts">
  import { type Component, untrack } from "svelte";

  import { createStaticI18n } from "@a-novel-kit/nodelib-i18n";
  import { setI18nContext } from "@a-novel-kit/nodelib-i18n/svelte";

  // Stands in for an app's i18n provider: its own namespace, and optionally its own uikit messages.
  let {
    locale,
    component: Rendered,
    props,
    overrides,
  }: {
    locale: string;
    // The fixture renders whichever component a test passes, with that test's props.
    component: Component<any>;
    props: Record<string, unknown>;
    overrides?: Record<string, unknown>;
  } = $props();

  untrack(() =>
    setI18nContext(
      createStaticI18n({
        locale,
        defaultLocale: "en",
        defaultNamespace: "app",
        namespaces: ["app"],
        resources: { [locale]: { app: {}, ...(overrides && { uikit: overrides }) } },
      })
    )
  );
</script>

<Rendered {...props} />
