import { type AuthorizationController, createAuthorizationController } from "./authorizationController.js";

import { createContext } from "svelte";

/** Internal tree-local context shared by authorization components. */
export const [getAuthorization, setAuthorization, hasAuthorization] = createContext<AuthorizationController>();

/** Reads scoped access during initialization, optionally restricting it with a reactive rule. */
export function useAuthorization(when?: () => boolean): AuthorizationController {
  if (!hasAuthorization())
    throw new Error("Authorization requires an AuthorizationProvider or an explicit controller.");
  const controller = getAuthorization();
  return when ? createAuthorizationController({ getStatus: () => controller.state.status, when }) : controller;
}
