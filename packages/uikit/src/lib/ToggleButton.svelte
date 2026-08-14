<script lang="ts" module>
  import type { ButtonProps } from "./Button.svelte";

  import type { HTMLButtonAttributes } from "svelte/elements";

  /** Props for a button that exposes a persistent pressed state. */
  export interface ToggleButtonProps extends Omit<ButtonProps, "aria-pressed" | "onclick" | "tone"> {
    /** Current pressed state. */
    pressed?: boolean;
    /** Semantic treatment of the toggle. */
    tone?: "brand" | "neutral";
    /** Runs after the pressed state changes. */
    onPressedChange?: (pressed: boolean) => void;
    /** Native click handler run after the internal state update. */
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
