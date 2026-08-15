<script lang="ts" module>
  import type { ToggleButtonProps } from "./ToggleButton.svelte";

  /** A ToggleButton registered in its nearest Toolbar focus model. */
  export type ToolbarToggleButtonProps = ToggleButtonProps;
</script>

<script lang="ts">
  import ToggleButton from "./ToggleButton.svelte";

  let {
    children,
    disabled = false,
    pressed = $bindable(false),
    onPressedChange,
    ...toggleProps
  }: ToolbarToggleButtonProps = $props();
</script>

<ToggleButton {...toggleProps} {disabled} data-composite-item="" tabindex={-1} bind:pressed {onPressedChange}>
  {@render children?.()}
</ToggleButton>
