<script lang="ts">
  import AuthorizationBoundary from "../src/lib/AuthorizationBoundary.svelte";
  import AuthorizationProvider from "../src/lib/AuthorizationProvider.svelte";
  import type { AuthorizationController } from "../src/lib/authorization.svelte";
  import AuthorizationProbe from "./AuthorizationProbe.svelte";

  let { controller, override }: { controller: AuthorizationController; override?: AuthorizationController } = $props();
</script>

<AuthorizationProvider {controller}>
  <AuthorizationProbe label="outer" />
  <AuthorizationBoundary controller={override}>
    <p>Protected content</p>
    <AuthorizationProbe label="inner" />
    {#snippet fallback(status)}<p>Fallback: {status}</p><AuthorizationProbe label="inner" />{/snippet}
  </AuthorizationBoundary>
</AuthorizationProvider>
