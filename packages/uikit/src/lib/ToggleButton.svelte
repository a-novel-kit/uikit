<script lang="ts" module>
  import type { ButtonProps } from "./Button.svelte";

  import type { HTMLButtonAttributes } from "svelte/elements";

  /** Props for a button that exposes a persistent pressed state. */
  export interface ToggleButtonProps extends Omit<ButtonProps, "aria-pressed" | "onclick" | "tone"> {
    pressed?: boolean;
    tone?: "brand" | "neutral";
    onPressedChange?: (pressed: boolean) => void;
    onclick?: HTMLButtonAttributes["onclick"];
  }
</script>

<script lang="ts">
  import Button from "./Button.svelte";

  let {
    pressed = $bindable(false),
    tone = "brand",
    onPressedChange,
    onclick,
    children,
    ...rest
  }: ToggleButtonProps = $props();

  function handleClick(event: MouseEvent & { currentTarget: HTMLButtonElement }) {
    onclick?.(event);
    if (event.defaultPrevented) return;

    pressed = !pressed;
    onPressedChange?.(pressed);
  }
</script>

<Button {...rest} {tone} aria-pressed={pressed} onclick={handleClick}>
  {@render children?.()}
</Button>
