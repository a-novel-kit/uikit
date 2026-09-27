<script lang="ts">
  import AuthorizationBoundary from "../src/lib/AuthorizationBoundary.svelte";
  import AuthorizationProvider from "../src/lib/AuthorizationProvider.svelte";
  import type { AuthorizationController } from "../src/lib/authorization";
  import AuthorizationProbe from "./AuthorizationProbe.svelte";

  let {
    controller,
    override,
    when,
    probeAllowed = true,
  }: {
    controller: AuthorizationController;
    override?: AuthorizationController;
    when?: boolean;
    probeAllowed?: boolean;
  } = $props();
</script>

<AuthorizationProvider {controller}>
  <AuthorizationProbe label="outer" />
  <AuthorizationBoundary controller={override} {when}>
    <p>Protected content</p>
    <AuthorizationProbe label="inner" allowed={probeAllowed} />
    {#snippet fallback(status)}<p>Fallback: {status}</p><AuthorizationProbe
        label="inner"
        allowed={probeAllowed}
      />{/snippet}
  </AuthorizationBoundary>
</AuthorizationProvider>
