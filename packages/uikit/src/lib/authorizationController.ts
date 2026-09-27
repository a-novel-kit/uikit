/** An application-mapped access decision. UI visibility never replaces server authorization. */
export type AuthorizationStatus =
  /** Access has not been resolved yet; protected content stays hidden. */
  | "pending"
  /** The current identity satisfies the access rule. */
  | "allowed"
  /** Authentication is required and there is no signed-in identity. */
  | "anonymous"
  /** The signed-in identity does not satisfy the access rule. */
  | "forbidden"
  /** Access could not be checked, for example during an authentication-service outage. */
  | "unavailable";

/** Rendered authorization state, containing no credentials or protected data. */
export interface AuthorizationState {
  /** Only allowed permits protected content to render. */
  readonly status: AuthorizationStatus;
}

/** Read-only access view consumed by authorization components. */
export interface AuthorizationController {
  /** Decision rendered by the component. */
  readonly state: AuthorizationState;
}

/** Configuration for the default authorization controller. */
export interface AuthorizationControllerOptions {
  /** Reads the application's reactive, server-derived decision; never fetches during rendering. */
  getStatus: () => AuthorizationStatus;
  /** Synchronous restriction evaluated only when getStatus returns allowed. Defaults to allowing access. */
  when?: () => boolean;
}

/**
 * Derives access on every state read. A rule can restrict, never grant denied access.
 * Create one controller per owning layout; the caller supplies reactive state and handles API calls.
 * Getter errors propagate to the caller; map service failures to `unavailable` before rendering.
 *
 * @example
 * ```ts
 * import { createAuthorizationController } from "@a-novel-kit/uikit/authorization";
 *
 * const controller = createAuthorizationController({ getStatus: () => "anonymous" });
 * controller.state.status; // "anonymous"
 * ```
 */
export function createAuthorizationController({
  getStatus,
  when = () => true,
}: AuthorizationControllerOptions): AuthorizationController {
  return {
    get state() {
      const status = getStatus();
      return { status: status === "allowed" && !when() ? "forbidden" : status };
    },
  };
}
