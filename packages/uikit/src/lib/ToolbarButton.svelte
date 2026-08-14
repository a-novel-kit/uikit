<script lang="ts" module>
  import type { ButtonProps } from "./Button.svelte";

  /** A Button registered in its nearest Toolbar focus model. */
  export type ToolbarButtonProps = ButtonProps;
</script>

<script lang="ts">
  import Button from "./Button.svelte";

  import { Toolbar as ToolbarPrimitive } from "bits-ui";

  let { children, disabled = false, ...buttonProps }: ToolbarButtonProps = $props();
</script>

<ToolbarPrimitive.Button {disabled}>
  {#snippet child({ props })}
    <Button {...buttonProps} {...props} {disabled}>
      {@render children?.()}
    </Button>
  {/snippet}
</ToolbarPrimitive.Button>
