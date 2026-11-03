<!--
@component
Registers a ToggleButton with its containing Toolbar's roving focus.
Use only inside Toolbar and supply a pressed-state controller.
-->
<script lang="ts" module>
  import type { ToggleButtonController, ToggleButtonProps } from "./ToggleButton.svelte";

  /** External state contract for a toolbar toggle button. */
  export type ToolbarToggleButtonController = ToggleButtonController;

  /** A ToggleButton registered in its nearest Toolbar focus model. */
  export type ToolbarToggleButtonProps = ToggleButtonProps;
</script>

<script lang="ts">
  import ToggleButton from "./ToggleButton.svelte";

  let props: ToolbarToggleButtonProps = $props();
</script>

<ToggleButton {...props} data-composite-item="" tabindex={-1} />
