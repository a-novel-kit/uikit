<script lang="ts">
  import { Alert, Button, Field, FormActions, Input, Stack } from "../src/lib";

  let {
    error = false,
    fields = true,
    blockSize,
    onsubmit = () => {},
  }: {
    error?: boolean;
    fields?: boolean;
    /** A height for the form's column, taller than its content, as a fullscreen dialog's body gives it. */
    blockSize?: string;
    onsubmit?: () => void;
  } = $props();
</script>

<form
  onsubmit={(event) => {
    event.preventDefault();
    onsubmit();
  }}
>
  <Stack gap="4" style={blockSize ? `block-size: ${blockSize}` : undefined}>
    {#if fields}
      <Field label="Display name">{#snippet children(control)}<Input {...control} />{/snippet}</Field>
    {/if}
    <FormActions>
      {#snippet feedback()}{#if error}<Alert tone="error" title="Changes could not be saved." />{/if}{/snippet}
      <Button type="submit">Save changes</Button>
      <Button variant="ghost">Cancel</Button>
    </FormActions>
  </Stack>
</form>
