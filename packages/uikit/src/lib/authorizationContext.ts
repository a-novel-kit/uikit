import { type AuthorizationController, createAuthorizationController } from "./authorizationController.js";

import { createContext } from "svelte";

/** Internal tree-local context shared by authorization components. */
export const [getAuthorization, setAuthorization, hasAuthorization] = createContext<AuthorizationController>();

/**
 * Reads the nearest provider or boundary during Svelte component initialization.
 * An optional reactive rule can further restrict allowed access. Read `controller.state`
 * reactively rather than copying the initial decision.
 *
 * @throws When called outside component initialization or without authorization context.
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useAuthorization } from "@a-novel-kit/uikit/authorization";
 *   const access = useAuthorization();
 * </script>
 *
 * {#if access.state.status === "allowed"}<p>Protected content.</p>{/if}
 * ```
 */
export function useAuthorization(when?: () => boolean): AuthorizationController {
  if (!hasAuthorization())
    throw new Error("Authorization requires an AuthorizationProvider or an explicit controller.");
  const controller = getAuthorization();
  return when ? createAuthorizationController({ getStatus: () => controller.state.status, when }) : controller;
}
