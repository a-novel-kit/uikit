<!--
@component
Renders a square Button with a required accessible name. Keep its icon decorative.
-->
<script lang="ts" module>
  import type { ButtonLinkProps, ButtonProps } from "./Button.svelte";

  import type { Snippet } from "svelte";

  /** Props for a square button whose visible content is an icon. */
  export interface IconButtonProps extends Omit<ButtonProps, "children" | "square"> {
    /** Required accessible name for the icon-only control. */
    label: string;
    /** Icon content rendered inside the button. */
    children: Snippet;
  }

  /** Native link attributes with the same icon and accessible name as IconButton. */
  export interface IconButtonLinkProps
    extends Omit<ButtonLinkProps, "children" | "square">, Pick<IconButtonProps, "label" | "children"> {}
</script>

<script lang="ts">
  import Button from "./Button.svelte";

  let { label, children, ...rest }: IconButtonProps | IconButtonLinkProps = $props();
</script>

<Button square aria-label={label} {...rest}>
  {@render children()}
</Button>
