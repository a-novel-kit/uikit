/** A server-derived access decision. UI visibility never replaces server authorization. */
export type AuthorizationStatus = "pending" | "allowed" | "anonymous" | "forbidden" | "unavailable";

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
  /** Additional synchronous permission check. Omitted means no further restriction. */
  when?: () => boolean;
}

/** Derives access without storing a second decision. A rule can restrict, never grant denied access. */
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
