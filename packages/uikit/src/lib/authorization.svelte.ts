/** A server-derived access decision. UI visibility never replaces server authorization. */
export type AuthorizationStatus = "pending" | "allowed" | "anonymous" | "forbidden" | "unavailable";

/** Rendered authorization state, containing no credentials or protected data. */
export interface AuthorizationState {
  /** Only allowed permits protected content to render. */
  readonly status: AuthorizationStatus;
}

/** External state owner for an authorization boundary. */
export interface AuthorizationController {
  /** Decision rendered by the component. */
  readonly state: AuthorizationState;
  /** Applies the decision supplied by the application's trusted adapter. */
  resolve(status: AuthorizationStatus): void;
}

/** Configuration for the default authorization controller. */
export interface AuthorizationControllerOptions {
  /** Decision available before the first update; defaults to pending. */
  initialStatus?: AuthorizationStatus;
}

/** Creates isolated reactive authorization state without routing, storage, or network effects. */
export function createAuthorizationController({
  initialStatus = "pending",
}: AuthorizationControllerOptions = {}): AuthorizationController {
  let status = $state(initialStatus);
  return {
    get state() {
      return { status };
    },
    resolve(nextStatus) {
      status = nextStatus;
    },
  };
}
