<script lang="ts" module>
  import type { ButtonProps } from "./Button.svelte";

  import type { Snippet } from "svelte";

  export interface IconButtonProps extends Omit<ButtonProps, "children" | "square"> {
    /** Required accessible name for the icon-only control. */
    label: string;
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
