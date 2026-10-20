import { describe, expect, it } from "vitest";
import { toSearchKey } from "./search";

describe("toSearchKey", () => {
  it("removes accents and lowercases", () => {
    expect(toSearchKey("José Suárez")).toBe("jose suarez");
    expect(toSearchKey("JORGE ÁLVAREZ")).toBe("jorge alvarez");
  });

  it("treats ñ as n, so typing without it still matches", () => {
    // "ñ" decomposes to "n" + tilde; stripping the mark makes "Muñoz" findable as "munoz".
    expect(toSearchKey("Muñoz")).toBe("munoz");
  });

  it("trims surrounding spaces", () => {
    expect(toSearchKey("  Adobe ")).toBe("adobe");
  });
});
