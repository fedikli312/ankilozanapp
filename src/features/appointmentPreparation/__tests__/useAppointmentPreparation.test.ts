// `useAppointmentPreparation` reads the singleton `db` from "../../db"
// directly rather than taking it as a parameter, so it's swapped for an
// isolated in-memory test database here via jest.mock — self-contained
// (only references the `jest` global) so it isn't sensitive to import
// hoisting order.
jest.mock("../../../db", () => {
  const { createTestDatabase } = jest.requireActual("../../../db/testUtils/testDatabase");
  return { db: createTestDatabase().db };
});

// These imports must come after the jest.mock() call above (the mocked
// module has to be registered before anything requires it).
/* eslint-disable import/first */
import { db } from "../../../db";
import { createAppointment, upsertCheckIn } from "../../../repositories";
import { useAppointmentPreparation } from "../useAppointmentPreparation";
/* eslint-enable import/first */

describe("useAppointmentPreparation — check-in notes", () => {
  it("includes only non-empty check-in notes within the resolved lookback range", () => {
    // Previous rheumatology appointment pins the lookback range's start exactly,
    // so this test doesn't depend on the 90-day fallback's date arithmetic.
    createAppointment(db, { id: "appt-prev", type: "rheumatology", date: "2026-06-01" });
    createAppointment(db, { id: "appt-target", type: "rheumatology", date: "2026-09-01" });

    upsertCheckIn(db, {
      id: "ci-in-start",
      date: "2026-06-01", // == rangeStart, inclusive
      pain: 4,
      fatigue: 3,
      morningStiffnessBucket: "15_30",
      notes: "First check-in note",
    });
    upsertCheckIn(db, {
      id: "ci-in-end",
      date: "2026-09-01", // == appointment date itself, still in range
      pain: 5,
      fatigue: 4,
      morningStiffnessBucket: "30_60",
      notes: "Appointment-day note",
    });
    upsertCheckIn(db, {
      id: "ci-before",
      date: "2026-05-31", // one day before rangeStart — out of range
      pain: 2,
      fatigue: 2,
      morningStiffnessBucket: "none",
      notes: "Too early note",
    });
    upsertCheckIn(db, {
      id: "ci-after",
      date: "2026-09-02", // one day after the appointment — out of range
      pain: 6,
      fatigue: 5,
      morningStiffnessBucket: "over_60",
      notes: "Too late note",
    });
    upsertCheckIn(db, {
      id: "ci-no-note",
      date: "2026-07-15", // in range, but no note at all
      pain: 3,
      fatigue: 3,
      morningStiffnessBucket: "under_15",
    });
    upsertCheckIn(db, {
      id: "ci-empty-note",
      date: "2026-07-20", // in range, empty-string note
      pain: 1,
      fatigue: 1,
      morningStiffnessBucket: "none",
      notes: "",
    });

    const result = useAppointmentPreparation("appt-target");

    expect(result.hasPriorRheumatologyAppointment).toBe(true);
    expect(result.recordedNotes).toEqual([
      { date: "2026-06-01", notes: "First check-in note" },
      { date: "2026-09-01", notes: "Appointment-day note" },
    ]);
  });

  it("reports no notes when none were recorded in range", () => {
    // Dated well before every appointment/check-in seeded by the other test in
    // this file (which share one in-memory db for the whole file) so this
    // assertion holds regardless of test execution order.
    createAppointment(db, { id: "appt-empty", type: "rheumatology", date: "2020-01-01" });

    const result = useAppointmentPreparation("appt-empty");

    expect(result.hasPriorRheumatologyAppointment).toBe(false);
    expect(result.recordedNotes).toEqual([]);
  });
});
