<script lang="ts" module>
  import type { AuthorizationController, AuthorizationStatus } from "./authorization.svelte";

  import type { Snippet } from "svelte";

  /** Props for conditional content controlled by one authorization decision. */
  export interface AuthorizationBoundaryProps {
    /** Explicit state owner; otherwise inherited from the nearest provider. */
    controller?: AuthorizationController;
    /** Content instantiated only while access is allowed. */
    children: Snippet;
    /** Optional replacement for every non-allowed state. Applications own its copy and actions. */
    fallback?: Snippet<[Exclude<AuthorizationStatus, "allowed">]>;
  }
</script>

<script lang="ts">
  import AuthorizationProvider from "./AuthorizationProvider.svelte";
  import { hasAuthorization, useAuthorization } from "./authorizationContext";

  let { controller, children, fallback }: AuthorizationBoundaryProps = $props();
  const inherited = hasAuthorization() ? useAuthorization() : undefined;
  const active = $derived.by(() => {
    const value = controller ?? inherited;
    if (!value) throw new Error("AuthorizationBoundary requires a controller or an AuthorizationProvider.");
    return value;
  });
  const status = $derived(active.state.status);
</script>

<AuthorizationProvider controller={active}>
  {#if status === "allowed"}
    {@render children()}
  {:else}
    {@render fallback?.(status)}
  {/if}
</AuthorizationProvider>
