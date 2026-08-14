<script lang="ts" module>
  import type { ToggleButtonProps } from "./ToggleButton.svelte";

  /** A ToggleButton registered in its nearest Toolbar focus model. */
  export type ToolbarToggleButtonProps = ToggleButtonProps;
</script>

<script lang="ts">
  import ToggleButton from "./ToggleButton.svelte";

  import { Toolbar as ToolbarPrimitive } from "bits-ui";

  let {
    children,
    disabled = false,
    pressed = $bindable(false),
    onPressedChange,
    ...toggleProps
  }: ToolbarToggleButtonProps = $props();
</script>

<ToolbarPrimitive.Button {disabled}>
  {#snippet child({ props })}
    <ToggleButton {...toggleProps} {...props} {disabled} bind:pressed {onPressedChange}>
      {@render children?.()}
    </ToggleButton>
  {/snippet}
</ToolbarPrimitive.Button>
