// `useAppointmentSummary` reads the singleton `db` from "../../db" directly,
// so it's swapped for an isolated in-memory test database here, matching
// `useAppointmentPreparation.test.ts`'s/`useTimeline.test.ts`'s own
// established pattern exactly. `todayDateOnly` is mocked too — no test in
// this suite depends on the real wall clock.
jest.mock("../../../db", () => {
  const { createTestDatabase } = jest.requireActual("../../../db/testUtils/testDatabase");
  return { db: createTestDatabase().db };
});
jest.mock("../../../shared/today", () => ({ todayDateOnly: () => "2026-09-04" }));

/* eslint-disable import/first */
import { db } from "../../../db";
import { createAppointment, createLabResult, upsertCheckIn } from "../../../repositories";
import { useAppointmentSummary } from "../useAppointmentSummary";
/* eslint-enable import/first */

describe("useAppointmentSummary", () => {
  it("returns appointment: null for an unknown appointment id — no summary computed", () => {
    const result = useAppointmentSummary("does-not-exist", 30);
    expect(result.appointment).toBeNull();
  });

  it("resolves the specific target appointment by id, not HealthSummary's generic most-recent/next-upcoming", () => {
    createAppointment(db, {
      id: "a1",
      type: "rheumatology",
      doctorOrInstitution: "Dr. Aylin Demir — City Hospital Rheumatology",
      date: "2026-09-10",
    });
    createAppointment(db, { id: "a2", type: "laboratory", date: "2026-09-20" }); // a later appointment — must not be what's returned

    const result = useAppointmentSummary("a1", 30);
    expect(result.appointment?.id).toBe("a1");
    expect(result.appointment?.doctorOrInstitution).toBe("Dr. Aylin Demir — City Hospital Rheumatology");
  });

  it("a 30-day report's range is exactly 30 calendar days, anchored to today", () => {
    createAppointment(db, { id: "a3", type: "rheumatology", date: "2026-09-10" });
    const result = useAppointmentSummary("a3", 30);
    expect(result.summary?.range).toEqual({ rangeStart: "2026-08-06", rangeEnd: "2026-09-05" });
    expect(result.summary?.symptoms.coverage.daysInRange).toBe(30);
  });

  it("switching to 90 days changes the range and the coverage denominator consistently", () => {
    createAppointment(db, { id: "a4", type: "rheumatology", date: "2026-09-10" });
    const result = useAppointmentSummary("a4", 90);
    expect(result.summary?.range).toEqual({ rangeStart: "2026-06-07", rangeEnd: "2026-09-05" });
    expect(result.summary?.symptoms.coverage.daysInRange).toBe(90);
  });

  it("a check-in just inside the 30-day range is counted; the same date under a 90-day range still counts, consistently", () => {
    createAppointment(db, { id: "a5", type: "rheumatology", date: "2026-09-10" });
    upsertCheckIn(db, { id: "c1", date: "2026-08-20", pain: 4, fatigue: 3, morningStiffnessBucket: "15_30" });

    const result30 = useAppointmentSummary("a5", 30);
    expect(result30.summary?.symptoms.coverage.completedCount).toBe(1);

    const result90 = useAppointmentSummary("a5", 90);
    expect(result90.summary?.symptoms.coverage.completedCount).toBe(1);
  });

  it("surfaces the real recorded unit for a lab result actually in range", () => {
    createAppointment(db, { id: "a6", type: "rheumatology", date: "2026-09-10" });
    createLabResult(db, { id: "l1", marker: "CRP", value: 6.8, unit: "mg/L", recordedDate: "2026-08-25" });

    const result = useAppointmentSummary("a6", 30);
    expect(result.unitsByMarker).toEqual({ CRP: "mg/L" });
    expect(result.summary?.labs.markers.find((m) => m.marker === "CRP")?.history.mostRecent?.value).toBe(6.8);
  });
});
