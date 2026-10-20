import { describe, expect, it } from "vitest";
import { safeNextPath } from "./redirect";

describe("safeNextPath", () => {
  it("keeps internal paths with their query string", () => {
    expect(safeNextPath("/movimientos?type=CASH_IN&q=juan")).toBe("/movimientos?type=CASH_IN&q=juan");
    expect(safeNextPath("/movimientos/abc123")).toBe("/movimientos/abc123");
  });

  it.each([
    ["absolute URL", "https://evil.com"],
    ["protocol-relative URL", "//evil.com"],
    ["backslash trick", "/\\evil.com"],
    ["javascript: URL", "javascript:alert(1)"],
    ["relative path", "movimientos"],
  ])("falls back to home for a %s", (_, value) => {
    expect(safeNextPath(value)).toBe("/");
  });

  it("falls back to home when missing", () => {
    expect(safeNextPath(null)).toBe("/");
    expect(safeNextPath("")).toBe("/");
  });

  it("never sends the user back to the login page", () => {
    expect(safeNextPath("/login")).toBe("/");
    expect(safeNextPath("/login?next=/movimientos")).toBe("/");
  });
});
