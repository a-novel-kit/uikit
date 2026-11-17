<!--
@component
Renders a protected page once access is allowed, and otherwise the access state that stops it, centered in the page:
checking, forbidden or unavailable, with uikit's translated copy. The app sends a visitor without an account to its
sign-in, so the page shows nothing for an anonymous decision. Server loads and actions still enforce access.

```svelte
<script lang="ts">
  import { ProtectedPage } from "@a-novel-kit/uikit";
</script>

<ProtectedPage homeHref="/" retryHref="/projects">
  <h1>Your projects</h1>
</ProtectedPage>
```
-->
<script lang="ts" module>
  import type { AuthorizationController } from "./authorizationController";

  import type { Snippet } from "svelte";

  /** Props for a page shown only once access is allowed. */
  export interface ProtectedPageProps {
    /** Explicit state owner; otherwise inherited from the nearest provider. */
    controller?: AuthorizationController;
    /** Additional permission required for allowed content; defaults to true. Cannot bypass a denial. */
    when?: boolean;
    /** The page, instantiated only while access is allowed. */
    children: Snippet;
    /** Content safe to show without a verified account, in place of the unavailable state. */
    unavailable?: Snippet;
    /** Destination of the forbidden state's link home. */
    homeHref: string;
    /** The page's own address, which the unavailable state's link reloads. */
    retryHref: string;
  }
</script>

<script lang="ts">
  import AccessForbiddenState from "./AccessForbiddenState.svelte";
  import AccessPendingState from "./AccessPendingState.svelte";
  import AccessUnavailableState from "./AccessUnavailableState.svelte";
  import AuthorizationBoundary from "./AuthorizationBoundary.svelte";

  let { controller, when, children, unavailable, homeHref, retryHref }: ProtectedPageProps = $props();
</script>

<AuthorizationBoundary {controller} {when} {children}>
  {#snippet fallback(status)}
    {#if status === "unavailable" && unavailable}
      {@render unavailable()}
    {:else if status !== "anonymous"}
      <div class="page">
        {#if status === "pending"}
          <AccessPendingState headingLevel={1} />
        {:else if status === "forbidden"}
          <AccessForbiddenState {homeHref} headingLevel={1} />
        {:else}
          <AccessUnavailableState {retryHref} headingLevel={1} />
        {/if}
      </div>
    {/if}
  {/snippet}
</AuthorizationBoundary>

<style>
  .page {
    display: grid;
    place-items: center;
    box-sizing: border-box;
    padding: var(--space-6);
    min-block-size: 100dvb;
  }
</style>
