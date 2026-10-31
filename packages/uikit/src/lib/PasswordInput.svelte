<!--
@component
Renders a password Input with a toggle that shows the value, driven by `createPressedController` or
a compatible controller. Submitting the form hides the value again, and the toggle stays hidden
without scripting.

```svelte
<script lang="ts">
  import { createPressedController, Field, PasswordInput } from "@a-novel-kit/uikit";

  const visibility = createPressedController();
</script>

<Field label="Password" required>
  {#snippet children(attributes)}
    <PasswordInput {...attributes} controller={visibility} name="password" autocomplete="current-password" />
  {/snippet}
</Field>
```
-->
<script lang="ts" module>
  import type { InputProps } from "./Input.svelte";
  import type { PressedController } from "./controllers.svelte";

  /** External visibility contract for a password input; pressed shows the value. */
  export type PasswordInputController = PressedController;

  /** Props for a password input with a show-password toggle. */
  export interface PasswordInputProps extends Omit<
    InputProps,
    "type" | "endAdornment" | "spellcheck" | "autocapitalize" | "autocorrect"
  > {
    /** State owner that decides whether the value shows as plain text. */
    controller: PasswordInputController;
  }
</script>

<script lang="ts">
  import Input from "./Input.svelte";
  import FieldButton from "./internal/FieldButton.svelte";
  import { useMessages } from "./internal/i18n";

  import type { Attachment } from "svelte/attachments";

  import { Eye as EyeIcon, EyeOff as EyeOffIcon } from "@lucide/svelte";

  let { controller, ...rest }: PasswordInputProps = $props();

  const { t } = useMessages();

  // Browsers keep a submitted text field in their form history; a password must leave as one.
  const hideOnSubmit: Attachment<HTMLInputElement> = (input) => {
    const form = input.form;
    const hide = () => controller.setPressed(false);
    form?.addEventListener("submit", hide);
    return () => form?.removeEventListener("submit", hide);
  };
</script>

<!-- A revealed value must not reach a spellcheck service or be rewritten by a mobile keyboard. -->
<Input
  {...rest}
  type={controller.state.pressed ? "text" : "password"}
  spellcheck="false"
  autocapitalize="none"
  autocorrect="off"
  {@attach hideOnSubmit}
>
  {#snippet endAdornment()}
    <span class="toggle">
      <FieldButton
        aria-label={t("passwordInput.show")}
        aria-pressed={controller.state.pressed}
        disabled={rest.disabled}
        onclick={() => controller.toggle()}
      >
        {#if controller.state.pressed}
          <EyeOffIcon size="var(--icon-size-sm)" aria-hidden="true" />
        {:else}
          <EyeIcon size="var(--icon-size-sm)" aria-hidden="true" />
        {/if}
      </FieldButton>
    </span>
  {/snippet}
</Input>

<style>
  /* A zero-height margin box keeps the input at its own height: the button overlaps its padding,
     as far from the inline end as from the block edges of a medium input. */
  .toggle {
    display: inline-flex;
    margin-inline-end: calc(-1 * (var(--space-2) + var(--border-width-thin)));
    margin-block: calc(var(--control-height-sm) / -2);
  }

  @media (scripting: none) {
    .toggle {
      display: none;
    }
  }
</style>
