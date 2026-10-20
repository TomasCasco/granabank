import { describe, expect, it } from "vitest";
import { dayLabel, groupByDay } from "./dates";

const now = new Date(2026, 9, 20, 10, 0); // 20 Oct 2026, 10:00 local time
const at = (y: number, m: number, d: number, h = 12) => new Date(y, m, d, h).toISOString();

describe("dayLabel", () => {
  it("says Hoy for any time today", () => {
    expect(dayLabel(at(2026, 9, 20, 0), now)).toBe("Hoy");
    expect(dayLabel(at(2026, 9, 20, 23), now)).toBe("Hoy");
  });

  it("says Ayer for yesterday, including across a month boundary", () => {
    expect(dayLabel(at(2026, 9, 19), now)).toBe("Ayer");
    expect(dayLabel(at(2026, 8, 30), new Date(2026, 9, 1, 9))).toBe("Ayer");
  });

  it("uses day and month for older dates this year", () => {
    expect(dayLabel(at(2026, 9, 15), now)).toBe("15 de octubre");
  });

  it("adds the year for other years", () => {
    expect(dayLabel(at(2025, 11, 31), now)).toBe("31 de diciembre de 2025");
  });
});

describe("groupByDay", () => {
  it("groups consecutive items by day keeping their order", () => {
    const items = [
      { id: "a", date: at(2026, 9, 20, 9) },
      { id: "b", date: at(2026, 9, 20, 8) },
      { id: "c", date: at(2026, 9, 19) },
      { id: "d", date: at(2026, 9, 15) },
    ];
    expect(groupByDay(items, now).map((g) => [g.label, g.items.map((i) => i.id)])).toEqual([
      ["Hoy", ["a", "b"]],
      ["Ayer", ["c"]],
      ["15 de octubre", ["d"]],
    ]);
  });

  it("returns no groups for an empty list", () => {
    expect(groupByDay([], now)).toEqual([]);
  });
});
