<script lang="ts" module>
  import type { ButtonProps } from "./Button.svelte";

  /** A Button registered in its nearest Toolbar focus model. */
  export type ToolbarButtonProps = ButtonProps;
</script>

<script lang="ts">
  import Button from "./Button.svelte";

  let { children, disabled = false, ...buttonProps }: ToolbarButtonProps = $props();
</script>

<Button {...buttonProps} {disabled} data-composite-item="" tabindex={-1}>
  {@render children?.()}
</Button>
