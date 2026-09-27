<!--
@component
Instantiates protected content only when the scoped controller allows access.
Inherits the nearest provider unless `controller` is supplied. Throws when neither exists.
Descendants inherit the restricted decision; the application owns fallback UI and redirects.
Server-side authorization is still required.

Within an AuthorizationProvider:

```svelte
<script lang="ts">
  import { AuthorizationBoundary, StatusState } from "@a-novel-kit/uikit";
</script>

<AuthorizationBoundary>
  <p>Protected content.</p>
  {#snippet fallback(status)}
    {#if status === "pending"}
      <StatusState tone="loading" title="Checking access" />
    {:else}
      <StatusState title="Content unavailable" />
    {/if}
  {/snippet}
</AuthorizationBoundary>
```
-->
<script lang="ts" module>
  import type { AuthorizationController, AuthorizationStatus } from "./authorizationController";

  import type { Snippet } from "svelte";

  /** Props for conditional content controlled by one authorization decision. */
  export interface AuthorizationBoundaryProps {
    /** Explicit state owner; otherwise inherited from the nearest provider. */
    controller?: AuthorizationController;
    /** Additional permission required for allowed content; defaults to true. Cannot bypass a denial. */
    when?: boolean;
    /** Content instantiated only while access is allowed. */
    children: Snippet;
    /** Optional replacement for every non-allowed state. Applications own its copy and actions. */
    fallback?: Snippet<[Exclude<AuthorizationStatus, "allowed">]>;
  }
</script>

<script lang="ts">
  import AuthorizationProvider from "./AuthorizationProvider.svelte";
  import { hasAuthorization, useAuthorization } from "./authorizationContext";
  import { createAuthorizationController } from "./authorizationController";

  let { controller, when = true, children, fallback }: AuthorizationBoundaryProps = $props();
  const inherited = hasAuthorization() ? useAuthorization() : undefined;
  const active = createAuthorizationController({
    getStatus: () => {
      const source = controller ?? inherited;
      if (!source) throw new Error("AuthorizationBoundary requires a controller or an AuthorizationProvider.");
      return source.state.status;
    },
    when: () => when,
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
