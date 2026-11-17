import {
  fixedChecked,
  fixedChips,
  fixedCombobox,
  fixedConsent,
  fixedOpen,
  fixedPressed,
  fixedSelect,
  fixedTags,
  fixedValue,
} from "../src/controllers";

import { describe, expect, it } from "vitest";

/** A fixed controller, and every transition its component can ask of it. */
function row<Controller extends { state: object }>(
  name: string,
  controller: Controller,
  ask: (controller: Controller) => unknown
) {
  return { name, controller, ask: () => ask(controller) };
}

const rows = [
  row("fixedOpen", fixedOpen(true), (c) => [c.open(), c.close(), c.toggle()]),
  row("fixedConsent", fixedConsent(), (c) => [c.open(), c.accept(), c.decline()]),
  row("fixedChecked", fixedChecked(true), (c) => [c.setChecked(false), c.toggle()]),
  row("fixedPressed", fixedPressed(true), (c) => [c.setPressed(false), c.toggle()]),
  row("fixedValue", fixedValue("a"), (c) => c.setValue("b")),
  row("fixedSelect", fixedSelect("a", true), (c) => [c.select("b"), c.close(), c.toggle()]),
  row("fixedCombobox", fixedCombobox("a", true, "query"), (c) => [c.select("b"), c.setQuery(""), c.close()]),
  row("fixedChips", fixedChips(["a"], "query", true), (c) => [c.setValue(["b"]), c.setQuery(""), c.close()]),
  row("fixedTags", fixedTags(["a"]), (c) => [c.add("b"), c.remove("a")]),
];

describe("fixed-state controllers", () => {
  it.each(rows)("$name keeps its state whatever its component asks", ({ controller, ask }) => {
    const state = structuredClone(controller.state);

    ask();

    expect(controller.state).toEqual(state);
  });

  it("refuses every tag, so what is typed stays in the field", () => {
    expect(fixedTags().add("noir")).toBe(false);
  });
});
