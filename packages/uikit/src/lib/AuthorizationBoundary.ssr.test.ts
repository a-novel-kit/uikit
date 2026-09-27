import AuthorizationContextFixture from "../../test/AuthorizationContextFixture.svelte";
import { type AuthorizationStatus, createAuthorizationController } from "./authorization.svelte";

import { render } from "svelte/server";

import { describe, expect, it } from "vitest";

describe("authorization SSR", () => {
  it.each(["pending", "anonymous", "forbidden", "unavailable"] satisfies AuthorizationStatus[])(
    "withholds protected HTML when %s",
    (initialStatus) => {
      const result = render(AuthorizationContextFixture, {
        props: { controller: createAuthorizationController({ initialStatus }) },
      });
      expect(result.body).not.toContain("Protected content");
      expect(result.body).toContain(`Fallback: ${initialStatus}`);
    }
  );

  it("isolates decisions between render trees", () => {
    const allowed = render(AuthorizationContextFixture, {
      props: { controller: createAuthorizationController({ initialStatus: "allowed" }) },
    });
    const pending = render(AuthorizationContextFixture, { props: { controller: createAuthorizationController() } });
    expect(allowed.body).toContain("Protected content");
    expect(pending.body).not.toContain("Protected content");
  });
});
