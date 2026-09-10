import { groupByMonth } from "../groupByMonth";

describe("groupByMonth", () => {
  it("buckets already-sorted (most-recent-first) items into month groups, preserving order", () => {
    const items = [
      { id: "a", date: "2026-09-15" },
      { id: "b", date: "2026-09-01" },
      { id: "c", date: "2026-08-20" },
      { id: "d", date: "2026-08-02" },
      { id: "e", date: "2026-06-10" },
    ];

    const groups = groupByMonth(items, (item) => item.date);

    expect(groups.map((g) => g.monthStart)).toEqual(["2026-09-01", "2026-08-01", "2026-06-01"]);
    expect(groups[0].items.map((i) => i.id)).toEqual(["a", "b"]);
    expect(groups[1].items.map((i) => i.id)).toEqual(["c", "d"]);
    expect(groups[2].items.map((i) => i.id)).toEqual(["e"]);
  });

  it("returns one group per distinct month even with a single item", () => {
    const groups = groupByMonth([{ date: "2026-01-05" }], (item) => item.date);
    expect(groups).toHaveLength(1);
    expect(groups[0].monthStart).toBe("2026-01-01");
  });

  it("returns an empty array for an empty input", () => {
    expect(groupByMonth([] as { date: string }[], (item) => item.date)).toEqual([]);
  });
});
