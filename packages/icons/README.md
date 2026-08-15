# @a-novel-kit/uikit-icons

This package contains custom Agora glyphs and the shared `IconBase` canvas used to build them.

Import standard interface icons directly from `@lucide/svelte`.

```svelte
<script lang="ts">
  import { IconButton } from "@a-novel-kit/uikit";

  import { Menu, Search } from "@lucide/svelte";
</script>

<IconButton label="Open navigation"><Menu /></IconButton>
<IconButton label="Search"><Search /></IconButton>
```

Build a custom glyph on the shared 24-unit canvas.

```svelte
<script lang="ts">
  import { IconBase } from "@a-novel-kit/uikit-icons";
</script>

<IconBase label="Custom action"><path d="M4 12h16" /></IconBase>
```

Custom glyphs inherit `currentColor` and accept the shared icon props. Give each icon a visible or
programmatic label at the call site.
