<script lang="ts">
  import { ActionMenu, type ActionMenuProps } from "../src/lib";

  let { controller }: Pick<ActionMenuProps, "controller"> = $props();
</script>

<ActionMenu label="Item actions" {controller} items={[{ id: "rename", label: "Rename" }]}>
  {#snippet trigger(attributes)}
    <button type="button" {...attributes}>Item actions</button>
  {/snippet}
</ActionMenu>
