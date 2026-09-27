import { type AuthorizationStatus, createAuthorizationController } from "./authorization";

import { describe, expect, it, vi } from "vitest";

describe("authorization controller", () => {
  it("reads each server decision without mirroring it into local state", () => {
    let decision: AuthorizationStatus = "pending";
    const controller = createAuthorizationController({ getStatus: () => decision });
    expect(controller.state.status).toBe("pending");
    for (const status of [
      "allowed",
      "anonymous",
      "forbidden",
      "unavailable",
      "pending",
    ] satisfies AuthorizationStatus[]) {
      decision = status;
      expect(controller.state.status).toBe(status);
    }
  });

  it("keeps separately created controllers isolated", () => {
    let decision: AuthorizationStatus = "allowed";
    const first = createAuthorizationController({ getStatus: () => decision });
    const second = createAuthorizationController({ getStatus: () => "pending" });
    decision = "forbidden";
    expect(first.state.status).toBe("forbidden");
    expect(second.state.status).toBe("pending");
  });

  it("rechecks a configured rule against allowed access", () => {
    let canEdit = false;
    const controller = createAuthorizationController({ getStatus: () => "allowed", when: () => canEdit });
    expect(controller.state.status).toBe("forbidden");
    canEdit = true;
    expect(controller.state.status).toBe("allowed");
  });

  it.each(["pending", "anonymous", "forbidden", "unavailable"] satisfies AuthorizationStatus[])(
    "preserves %s without evaluating a rule that may need an identity",
    (status) => {
      const when = vi.fn(() => true);
      const controller = createAuthorizationController({ getStatus: () => status, when });
      expect(controller.state.status).toBe(status);
      expect(when).not.toHaveBeenCalled();
    }
  );
});
