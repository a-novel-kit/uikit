<script lang="ts" module>
  import type { ButtonProps } from "./Button.svelte";

  import type { Snippet } from "svelte";

  /** Props for a square button whose visible content is an icon. */
  export interface IconButtonProps extends Omit<ButtonProps, "children" | "square"> {
    /** Required accessible name for the icon-only control. */
    label: string;
    /** Icon content rendered inside the button. */
    children: Snippet;
  }
</script>

<script lang="ts">
  import Button from "./Button.svelte";

  let { label, children, ...rest }: IconButtonProps = $props();
</script>

<Button square aria-label={label} {...rest}>
  {@render children()}
</Button>
