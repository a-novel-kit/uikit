# @a-novel-kit/uikit

Agora's shared Svelte components consume the public contracts from
`@a-novel-kit/uikit-tokens` and the self-hosted faces from `@a-novel-kit/uikit-fonts`.

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

Components use semantic color tokens and generated metric tokens. Applications can adjust a base
token at their root to change the corresponding scale without rewriting component styles.
