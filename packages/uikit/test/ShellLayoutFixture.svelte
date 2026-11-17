<script lang="ts">
  import { ShellLayout, StickyBar } from "../src/lib";

  // Stands in for an app's shell: its landmarks fill the layout's regions, and its page holds a bar at each edge.
  let {
    collapsed = false,
    banner = false,
    short = false,
  }: { collapsed?: boolean; banner?: boolean; short?: boolean } = $props();
</script>

{#snippet rail()}<aside aria-label="Navigation">Rail</aside>{/snippet}
{#snippet header()}<header>Header</header>{/snippet}
{#snippet notice()}<div role="status" style:block-size="3rem">Maintenance</div>{/snippet}

<ShellLayout {collapsed} {rail} {header} banner={banner ? notice : undefined}>
  <main>
    <StickyBar edge="start">Top bar</StickyBar>
    <div style:block-size={short ? "2rem" : "300vb"}></div>
    <StickyBar edge="end">Bottom bar</StickyBar>
  </main>
</ShellLayout>
