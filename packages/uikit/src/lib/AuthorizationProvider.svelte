<!--
@component
Provides one application-owned authorization controller to a component subtree.
Set it up once in the owning layout; all children render regardless of access status.
-->
<script lang="ts" module>
  import type { AuthorizationController } from "./authorizationController";

  import type { Snippet } from "svelte";

  /** Props for tree-scoped authorization context without a visibility gate. */
  export interface AuthorizationProviderProps {
    /** External authorization state inherited by descendants. */
    controller: AuthorizationController;
    /** Content that receives the context. */
    children: Snippet;
  }
</script>

<script lang="ts">
  import { setAuthorization } from "./authorizationContext";

  let { controller, children }: AuthorizationProviderProps = $props();

  setAuthorization({
    get state() {
      return controller.state;
    },
  });
</script>

{@render children()}
