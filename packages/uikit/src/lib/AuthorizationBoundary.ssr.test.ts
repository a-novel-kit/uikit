import AuthorizationContextFixture from "../../test/AuthorizationContextFixture.svelte";
import type { AuthorizationStatus } from "./authorization";

import { render } from "svelte/server";

import { describe, expect, it } from "vitest";

describe("authorization SSR", () => {
  it.each(["pending", "anonymous", "forbidden", "unavailable"] satisfies AuthorizationStatus[])(
    "withholds protected HTML when %s",
    (initialStatus) => {
      const result = render(AuthorizationContextFixture, {
        props: { controller: { state: { status: initialStatus } } },
      });
      expect(result.body).not.toContain("Protected content");
      expect(result.body).toContain(`Fallback: ${initialStatus}`);
    }
  );

  it("isolates decisions between render trees", () => {
    const allowed = render(AuthorizationContextFixture, {
      props: { controller: { state: { status: "allowed" } } },
    });
    const pending = render(AuthorizationContextFixture, { props: { controller: { state: { status: "pending" } } } });
    expect(allowed.body).toContain("Protected content");
    expect(pending.body).not.toContain("Protected content");
  });

  it("withholds protected HTML when a local rule denies access", () => {
    const result = render(AuthorizationContextFixture, {
      props: { controller: { state: { status: "allowed" } }, when: false },
    });
    expect(result.body).not.toContain("Protected content");
    expect(result.body).toContain("Fallback: forbidden");
  });
});
