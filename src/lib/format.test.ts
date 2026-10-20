import { describe, expect, it } from "vitest";
import { formatAmount, formatBalance } from "./format";

describe("formatAmount", () => {
  it("omits decimals for whole amounts, as in the design", () => {
    expect(formatAmount(12500)).toBe("$125");
  });

  it("shows two decimals otherwise", () => {
    expect(formatAmount(1199)).toBe("$11.99");
    expect(formatAmount(1150)).toBe("$11.50");
  });

  it("groups thousands", () => {
    expect(formatAmount(123456700)).toBe("$1,234,567");
  });
});

describe("formatBalance", () => {
  it("always shows two decimals", () => {
    expect(formatBalance(97885)).toBe("978.85");
    expect(formatBalance(100000)).toBe("1,000.00");
  });
});
