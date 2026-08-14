<script lang="ts" module>
  import type { LinkProps } from "./Link.svelte";

  /** A Link registered in its nearest Toolbar focus model. */
  export type ToolbarLinkProps = LinkProps;
</script>

<script lang="ts">
  import Link from "./Link.svelte";

  import { Toolbar as ToolbarPrimitive } from "bits-ui";

  let { children, ...linkProps }: ToolbarLinkProps = $props();
</script>

<ToolbarPrimitive.Link>
  {#snippet child({ props })}
    <Link {...linkProps} {...props}>
      {@render children?.()}
    </Link>
  {/snippet}
</ToolbarPrimitive.Link>
