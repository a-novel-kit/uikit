<script lang="ts" module>
  import type { ToggleButtonController, ToggleButtonProps } from "./ToggleButton.svelte";

  /** External state contract for a toolbar toggle button. */
  export type ToolbarToggleButtonController = ToggleButtonController;

  /** A ToggleButton registered in its nearest Toolbar focus model. */
  export type ToolbarToggleButtonProps = ToggleButtonProps;
</script>

<script lang="ts">
  import ToggleButton from "./ToggleButton.svelte";

  let { children, disabled = false, controller, ...toggleProps }: ToolbarToggleButtonProps = $props();
</script>

<ToggleButton {...toggleProps} {controller} {disabled} data-composite-item="" tabindex={-1}>
  {@render children?.()}
</ToggleButton>
