import { describe, expect, it } from "vitest";
import { counterpartPath } from "./version-switch";

describe("counterpartPath", () => {
  it("maps Figma routes to v2", () => {
    expect(counterpartPath("/")).toBe("/v2");
    expect(counterpartPath("/movimientos")).toBe("/v2/movimientos");
    expect(counterpartPath("/login")).toBe("/v2/login");
  });

  it("maps v2 routes back to Figma", () => {
    expect(counterpartPath("/v2")).toBe("/");
    expect(counterpartPath("/v2/movimientos/abc")).toBe("/movimientos/abc");
  });

  it("does not treat lookalike paths as v2", () => {
    expect(counterpartPath("/v2x")).toBe("/v2/v2x");
  });
});
