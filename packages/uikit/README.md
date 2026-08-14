# @a-novel-kit/uikit

Agora's shared Svelte components consume the public contracts from
`@a-novel-kit/uikit-tokens`, the self-hosted faces from `@a-novel-kit/uikit-fonts`, and named icons
from `@a-novel-kit/uikit-icons`.

Install the component package and the foundations imported by your application.

```bash
pnpm add @a-novel-kit/uikit @a-novel-kit/uikit-fonts @a-novel-kit/uikit-tokens
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

Component prop types and shared contracts such as `ComponentSize`, `FeedbackTone`, `LayoutGap`,
and `SelectionOption` are exported from the same package root.

Components use semantic color tokens and generated metric tokens. Applications can adjust a base
token at their root to change the corresponding scale without rewriting component styles.

The package follows native-first layering:

- native elements provide buttons, links, forms, disclosure, dialog, progress, meter, and document
  semantics;
- the internal headless primitive handles only composite keyboard patterns such as tabs, action
  menus, tooltips, and searchable comboboxes;
- platforms import the UI-kit API, never its internal primitive dependency;
- workflow, manuscript, and other product-specific components remain feature-owned.
