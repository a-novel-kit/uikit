<script lang="ts" module>
  import type { AuthorizationController } from "./authorization.svelte";

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
    resolve(status) {
      controller.resolve(status);
    },
  });
</script>

{@render children()}
