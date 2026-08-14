# @a-novel-kit/uikit-icons

The icon package exposes a deliberately small, named interface vocabulary. Its standard glyphs are
backed by Lucide's ISC-licensed official `@lucide/svelte` components; consumers do not import Lucide
directly. This keeps
icon names stable if the underlying set changes and avoids shipping an icon font or a complete runtime
icon registry.

```svelte
<script lang="ts">
  import { IconButton } from "@a-novel-kit/uikit";
  import { MenuIcon, SearchIcon } from "@a-novel-kit/uikit-icons";
</script>

<IconButton label="Open navigation"><MenuIcon /></IconButton>
<IconButton label="Search"><SearchIcon /></IconButton>
```

Product-specific glyphs belong in this package as Svelte components built on `IconBase`. They must use
the same 24-unit canvas, inherit `currentColor`, accept the shared icon props, and include a visible or
programmatic label at the call site. Do not fetch icons at runtime or embed arbitrary SVG markup in
application features.
