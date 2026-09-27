import type { AuthorizationController } from "./authorization.svelte";

import { createContext } from "svelte";

/** Internal tree-local context shared by authorization components. */
export const [getAuthorization, setAuthorization, hasAuthorization] = createContext<AuthorizationController>();

/** Reads the nearest provider during component initialization; throws when none exists. */
export function useAuthorization(): AuthorizationController {
  if (!hasAuthorization())
    throw new Error("Authorization requires an AuthorizationProvider or an explicit controller.");
  return getAuthorization();
}
