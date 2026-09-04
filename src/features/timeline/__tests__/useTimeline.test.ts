// `useTimeline` reads the singleton `db` from "../../db" directly (via
// `getTimelineEvents`), so it's swapped for an isolated in-memory test
// database here, matching `useAppointmentPreparation.test.ts`'s own
// established pattern exactly. `todayDateOnly` is mocked too — this
// codebase's tests never depend on the real wall clock (no other test in
// the suite calls it unmocked), and Phase X shouldn't be the first to.
jest.mock("../../../db", () => {
  const { createTestDatabase } = jest.requireActual("../../../db/testUtils/testDatabase");
  return { db: createTestDatabase().db };
});
jest.mock("../../../shared/today", () => ({ todayDateOnly: () => "2026-09-03" }));

/* eslint-disable import/first */
import { db } from "../../../db";
import { createAppointment, createLabResult, upsertCheckIn } from "../../../repositories";
import { useTimeline } from "../useTimeline";
/* eslint-enable import/first */

const TODAY = "2026-09-03";

describe("useTimeline", () => {
  it("an empty database reports isEmpty and an empty months array", () => {
    const result = useTimeline();
    expect(result.isEmpty).toBe(true);
    expect(result.months).toEqual([]);
    expect(result.today).toBe(TODAY);
  });

  it("a populated database returns grouped, non-empty months in the existing Phase W sorted order", () => {
    createLabResult(db, { id: "l1", marker: "CRP", value: 8, unit: "mg/L", recordedDate: "2026-08-20" });
    createAppointment(db, { id: "a1", type: "rheumatology", date: "2026-07-01" }); // within the 90-day window (rangeStart 2026-06-06)
    upsertCheckIn(db, { id: "c1", date: "2026-08-25", pain: 5, fatigue: 5, morningStiffnessBucket: "15_30" });

    const result = useTimeline();
    expect(result.isEmpty).toBe(false);
    expect(result.months.length).toBeGreaterThan(0);

    const allEvents = result.months.flatMap((m) => m.days.flatMap((d) => d.events));
    expect(allEvents.map((e) => e.sourceId).sort()).toEqual(["a1", "c1", "l1"]);
    // Most-recent-first, unchanged from Phase W's own ordering.
    expect(allEvents.map((e) => e.sourceId)).toEqual(["c1", "l1", "a1"]);
  });

  it("an event exactly 90 days back is included; one day further back is not", () => {
    // resolveHealthDateRange(90, "2026-09-03") = { rangeStart: "2026-06-06", rangeEnd: "2026-09-04" } (verified in Phase W's own tests).
    upsertCheckIn(db, { id: "in", date: "2026-06-06", pain: 3, fatigue: 3, morningStiffnessBucket: "none" });
    upsertCheckIn(db, { id: "out", date: "2026-06-05", pain: 3, fatigue: 3, morningStiffnessBucket: "none" });

    const result = useTimeline();
    const sourceIds = result.months.flatMap((m) => m.days.flatMap((d) => d.events.map((e) => e.sourceId)));
    expect(sourceIds).toContain("in");
    expect(sourceIds).not.toContain("out");
  });

  it("each day group's date matches every event inside it", () => {
    upsertCheckIn(db, { id: "c1", date: "2026-08-25", pain: 5, fatigue: 5, morningStiffnessBucket: "15_30" });
    const result = useTimeline();
    for (const month of result.months) {
      for (const day of month.days) {
        for (const event of day.events) {
          expect(event.date).toBe(day.date);
        }
      }
    }
  });
});
