<script lang="ts">
  import { useAuthorization } from "../src/lib/authorization";

  let { label, allowed = true }: { label: string; allowed?: boolean } = $props();
  const authorization = useAuthorization(() => allowed);
</script>

<p>{label}: {authorization.state.status}</p>
