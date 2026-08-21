<script lang="ts" module>
  import type { ButtonProps } from "./Button.svelte";
  import type { PressedController } from "./controllers.svelte";

  import type { HTMLButtonAttributes } from "svelte/elements";

  /** External state contract for a toggle button. */
  export type ToggleButtonController = PressedController;

  /** Props for a button that exposes a persistent pressed state. */
  export interface ToggleButtonProps extends Omit<ButtonProps, "aria-pressed" | "onclick" | "tone"> {
    /** State owner that decides whether press requests take effect. */
    controller: ToggleButtonController;
    /** Semantic treatment of the toggle. */
    tone?: "brand" | "neutral";
    /** Native click handler run before the controller request. */
    onclick?: HTMLButtonAttributes["onclick"];
  }
</script>

<script lang="ts">
  import Button from "./Button.svelte";

  let { controller, tone = "brand", onclick, children, ...rest }: ToggleButtonProps = $props();

  function handleClick(event: MouseEvent & { currentTarget: HTMLButtonElement }) {
    onclick?.(event);
    if (event.defaultPrevented) return;

    controller.toggle();
  }
</script>

<Button {...rest} {tone} aria-pressed={controller.state.pressed} onclick={handleClick}>
  {@render children?.()}
</Button>
