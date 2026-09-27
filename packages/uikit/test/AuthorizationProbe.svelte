<script lang="ts">
  import { useAuthorization } from "../src/lib/authorizationContext";

  const authorization = useAuthorization();
  let { label }: { label: string } = $props();
</script>

<p>{label}: {authorization.state.status}</p>
