import AuthorizationContextFixture from "../../test/AuthorizationContextFixture.svelte";
import AuthorizationProbe from "../../test/AuthorizationProbe.svelte";
import AuthorizationBoundary from "./AuthorizationBoundary.svelte";
import { type AuthorizationStatus, createAuthorizationController } from "./authorization.svelte";

import { createRawSnippet, tick } from "svelte";

import { describe, expect, it } from "vitest";

import { render } from "@testing-library/svelte";

const children = createRawSnippet(() => ({ render: () => "<p>Protected content</p>" }));

describe("AuthorizationBoundary", () => {
  it.each(["pending", "anonymous", "forbidden", "unavailable"] satisfies AuthorizationStatus[])(
    "omits protected content when %s",
    (initialStatus) => {
      const { container } = render(AuthorizationBoundary, {
        props: { controller: createAuthorizationController({ initialStatus }), children },
      });
      expect(container.textContent).toBe("");
      expect(container.children).toHaveLength(0);
    }
  );

  it("reacts to loss and recovery of authorization", async () => {
    const controller = createAuthorizationController({ initialStatus: "allowed" });
    const { queryByText } = render(AuthorizationBoundary, { props: { controller, children } });
    expect(queryByText("Protected content")).not.toBeNull();
    controller.resolve("forbidden");
    await tick();
    expect(queryByText("Protected content")).toBeNull();
    controller.resolve("allowed");
    await tick();
    expect(queryByText("Protected content")).not.toBeNull();
  });

  it("inherits the provider and exposes fallback decisions through the hook", async () => {
    const controller = createAuthorizationController();
    const { queryByText, rerender } = render(AuthorizationContextFixture, { props: { controller } });
    expect(queryByText("outer: pending")).not.toBeNull();
    expect(queryByText("Fallback: pending")).not.toBeNull();
    expect(queryByText("inner: pending")).not.toBeNull();
    expect(queryByText("Protected content")).toBeNull();

    controller.resolve("allowed");
    await tick();
    expect(queryByText("Protected content")).not.toBeNull();
    expect(queryByText("inner: allowed")).not.toBeNull();

    await rerender({ controller: createAuthorizationController({ initialStatus: "unavailable" }) });
    expect(queryByText("outer: unavailable")).not.toBeNull();
    expect(queryByText("inner: unavailable")).not.toBeNull();
    expect(queryByText("Protected content")).toBeNull();
  });

  it("scopes explicit overrides to the boundary's descendants", async () => {
    const controller = createAuthorizationController({ initialStatus: "allowed" });
    const override = createAuthorizationController({ initialStatus: "forbidden" });
    const { queryByText, rerender } = render(AuthorizationContextFixture, { props: { controller, override } });
    expect(queryByText("outer: allowed")).not.toBeNull();
    expect(queryByText("inner: forbidden")).not.toBeNull();
    expect(queryByText("Protected content")).toBeNull();
    await rerender({ controller, override: undefined });
    expect(queryByText("inner: allowed")).not.toBeNull();
    expect(queryByText("Protected content")).not.toBeNull();
  });

  it("requires context when no explicit controller is supplied", () => {
    expect(() => render(AuthorizationBoundary, { props: { children } })).toThrow("AuthorizationBoundary requires");
    expect(() => render(AuthorizationProbe, { props: { label: "orphan" } })).toThrow("Authorization requires");
  });
});
