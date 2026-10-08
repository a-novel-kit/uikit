# @a-novel-kit/uikit

Agora's shared Svelte components consume the public contracts from
`@a-novel-kit/uikit-tokens` and the self-hosted faces from `@a-novel-kit/uikit-fonts`.

Install the component package and the foundations imported by your application.

```bash
pnpm add @a-novel-kit/uikit @a-novel-kit/uikit-fonts @a-novel-kit/uikit-tokens @a-novel-kit/nodelib-i18n i18next
```

Import the foundation styles once in the application shell.

```ts
import "@a-novel-kit/uikit-fonts/fonts.css";
import "@a-novel-kit/uikit-tokens/tokens.css";
```

Components are exported from the package root.

```svelte
<script lang="ts">
  import { Button } from "@a-novel-kit/uikit";
</script>

<Button variant="solid">Continue</Button>
```

Built-in text, such as labels and placeholders, ships in English and French. Inside an
`@a-novel-kit/nodelib-i18n` provider, components join the app's i18next instance under the `uikit`
namespace and follow its language; elsewhere they render in English. An app's own `uikit` messages
always win, which also covers languages uikit doesn't ship yet.

Component prop types and shared contracts such as `ComponentSize`, `FeedbackTone`, `LayoutGap`,
and `SelectionOption` are exported from the same package root.

For authorization, mount `AuthorizationProvider` once with an app-owned controller. Boundaries
inherit it; an optional `when` prop restricts access further. Import the headless controller and
hook from `@a-novel-kit/uikit/authorization`. UIKit does not import an authentication client:
your adapter supplies safe, server-derived decisions, and server endpoints still enforce access.
See [authorization setup and usage](https://a-novel-kit.github.io/uikit/?path=/docs/access-authorization--documentation).

Components use semantic color tokens and generated metric tokens. Applications can adjust a base
token at their root to change the corresponding scale without rewriting component styles.

The package follows native-first layering:

- native elements provide buttons, links, forms, disclosure, dialog, progress, meter, and document
  semantics;
- shared internal helpers coordinate top-layer placement and composite keyboard focus;
- tabs, menus, tooltips, and selection controls follow their corresponding WAI-ARIA Authoring
  Practices patterns;
- platforms import the UI-kit API, never its internal primitive dependency;
- applications compose page shells, routing landmarks, workflows, and domain content from these primitives.
