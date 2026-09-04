import { groupTimelineEventsByMonth } from "../groupTimelineEvents";
import type { TimelineEvent } from "../../../domain/timeline";

function lab(id: string, date: string): TimelineEvent {
  return { type: "lab", id: `lab:${id}`, date, sourceId: id, marker: "CRP", value: 5, unit: "mg/L" };
}

describe("groupTimelineEventsByMonth", () => {
  it("returns an empty array for no events", () => {
    expect(groupTimelineEventsByMonth([])).toEqual([]);
  });

  it("buckets a single event into its own month and day", () => {
    const groups = groupTimelineEventsByMonth([lab("l1", "2026-09-03")]);
    expect(groups).toEqual([
      { monthStart: "2026-09-01", days: [{ date: "2026-09-03", events: [lab("l1", "2026-09-03")] }] },
    ]);
  });

  it("groups multiple events on the same day into one day group, preserving their given order", () => {
    const events = [lab("l1", "2026-09-03"), lab("l2", "2026-09-03")];
    const groups = groupTimelineEventsByMonth(events);
    expect(groups).toHaveLength(1);
    expect(groups[0].days).toHaveLength(1);
    expect(groups[0].days[0].events.map((e) => e.sourceId)).toEqual(["l1", "l2"]);
  });

  it("groups multiple days within the same month into one month group with several day groups", () => {
    const events = [lab("l1", "2026-09-03"), lab("l2", "2026-09-01")];
    const groups = groupTimelineEventsByMonth(events);
    expect(groups).toHaveLength(1);
    expect(groups[0].monthStart).toBe("2026-09-01");
    expect(groups[0].days.map((d) => d.date)).toEqual(["2026-09-03", "2026-09-01"]);
  });

  it("starts a new month group when the month changes, preserving month order as given", () => {
    const events = [lab("l1", "2026-09-03"), lab("l2", "2026-08-28")];
    const groups = groupTimelineEventsByMonth(events);
    expect(groups.map((g) => g.monthStart)).toEqual(["2026-09-01", "2026-08-01"]);
  });

  it("does not re-sort — a caller passing already-descending events keeps that exact order", () => {
    const events = [lab("l1", "2026-09-03"), lab("l2", "2026-09-01"), lab("l3", "2026-08-15")];
    const groups = groupTimelineEventsByMonth(events);
    const flattened = groups.flatMap((m) => m.days.flatMap((d) => d.events.map((e) => e.sourceId)));
    expect(flattened).toEqual(["l1", "l2", "l3"]);
  });
});
