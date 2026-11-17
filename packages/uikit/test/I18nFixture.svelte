<script lang="ts">
  import { type Component, untrack } from "svelte";

  import { createStaticI18n } from "@a-novel-kit/nodelib-i18n";
  import { setI18nContext } from "@a-novel-kit/nodelib-i18n/svelte";

  // Stands in for an app's i18n provider: its own namespace, and optionally its own uikit messages.
  let {
    locale,
    component,
    props,
    overrides,
  }: {
    locale: string;
    // Any component is a Component<never>, since a component accepts what its props allow; the test pairs it with
    // its props.
    component: Component<never>;
    props: Record<string, unknown>;
    overrides?: Record<string, unknown>;
  } = $props();

  // The fixture renders whichever component a test passes, with that test's props.
  const Rendered = $derived(component as Component<Record<string, unknown>>);

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
