import { describe, expect, it } from "vitest";
import { cardStatus } from "./cards";

const card = { isBlocked: false, expMonth: 2, expYear: 2030 };

describe("cardStatus", () => {
  it("is active before the expiration month ends", () => {
    expect(cardStatus(card, new Date(2030, 1, 28, 23, 59))).toBe("ACTIVE");
  });

  it("expires on the first day after the expiration month", () => {
    expect(cardStatus(card, new Date(2030, 2, 1))).toBe("EXPIRED");
  });

  it("handles December expirations crossing into the next year", () => {
    const december = { ...card, expMonth: 12, expYear: 2026 };
    expect(cardStatus(december, new Date(2026, 11, 31))).toBe("ACTIVE");
    expect(cardStatus(december, new Date(2027, 0, 1))).toBe("EXPIRED");
  });

  it("reports blocked even when not expired", () => {
    expect(cardStatus({ ...card, isBlocked: true }, new Date(2026, 0, 1))).toBe("BLOCKED");
  });
});
