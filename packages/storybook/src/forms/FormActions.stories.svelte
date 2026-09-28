<script module lang="ts">
  import { Alert, Button, Container, Field, FormActions, Input, Stack } from "@a-novel-kit/uikit";
  import { reviewStoryGlobals } from "@a-novel-kit/uikit-storybook";

  import { defineMeta } from "@storybook/addon-svelte-csf";

  const { Story } = defineMeta({ title: "Forms/Form actions", component: FormActions });
</script>

{#snippet example(error = false)}
  <Container size="sm">
    <form onsubmit={(event) => event.preventDefault()}>
      <Stack gap="4">
        <Field label="Display name">
          {#snippet children(control)}<Input {...control} value="Ada" />{/snippet}
        </Field>
        <FormActions>
          {#snippet feedback()}
            {#if error}<Alert tone="error" title="Changes could not be saved. Please try again." />{/if}
          {/snippet}
          <Button type="submit">Save changes</Button>
          <Button variant="ghost" tone="neutral">Cancel</Button>
        </FormActions>
      </Stack>
    </form>
  </Container>
{/snippet}

<Story name="Ready — desktop" exportName="ReadyDesktop" globals={reviewStoryGlobals.desktop} asChild
  >{@render example()}</Story
>
<Story name="Ready — mobile" exportName="ReadyMobile" globals={reviewStoryGlobals.mobile} asChild
  >{@render example()}</Story
>
<Story name="Error — desktop" exportName="ErrorDesktop" globals={reviewStoryGlobals.desktop} asChild
  >{@render example(true)}</Story
>
<Story name="Error — mobile" exportName="ErrorMobile" globals={reviewStoryGlobals.mobile} asChild
  >{@render example(true)}</Story
>
