import { type AuthorizationStatus, createAuthorizationController } from "./authorization.svelte";

import { describe, expect, it } from "vitest";

describe("authorization controller", () => {
  it("defaults to pending and accepts each server decision", () => {
    const controller = createAuthorizationController();
    expect(controller.state.status).toBe("pending");
    for (const status of [
      "allowed",
      "anonymous",
      "forbidden",
      "unavailable",
      "pending",
    ] satisfies AuthorizationStatus[]) {
      controller.resolve(status);
      expect(controller.state.status).toBe(status);
    }
  });

  it("keeps separately created controllers isolated", () => {
    const first = createAuthorizationController({ initialStatus: "allowed" });
    const second = createAuthorizationController();
    first.resolve("forbidden");
    expect(first.state.status).toBe("forbidden");
    expect(second.state.status).toBe("pending");
  });
});
