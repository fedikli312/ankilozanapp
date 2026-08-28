import { createTestDatabase } from "../../db/testUtils/testDatabase";
import { getCheckInByDate, upsertCheckIn } from "../checkInRepository";

describe("check-in repository", () => {
  it("is editable same-day: a second upsert for the same date updates rather than duplicates", () => {
    const { db } = createTestDatabase();

    upsertCheckIn(db, {
      id: "check-in-1",
      date: "2026-08-26",
      pain: 4,
      fatigue: 3,
      morningStiffnessBucket: "15_30",
    });

    upsertCheckIn(db, {
      id: "check-in-1-retry",
      date: "2026-08-26",
      pain: 6,
      fatigue: 5,
      morningStiffnessBucket: "30_60",
    });

    const stored = getCheckInByDate(db, "2026-08-26");
    expect(stored?.pain).toBe(6);
    expect(stored?.id).toBe("check-in-1"); // the original row's id is preserved, not replaced
  });

  it("stores no note when none is provided (empty-note behavior)", () => {
    const { db } = createTestDatabase();

    upsertCheckIn(db, {
      id: "check-in-2",
      date: "2026-08-27",
      pain: 1,
      fatigue: 1,
      morningStiffnessBucket: "none",
    });

    expect(getCheckInByDate(db, "2026-08-27")?.notes).toBeNull();
  });

  it("persists an optional note and updates it via a same-day upsert", () => {
    const { db } = createTestDatabase();

    upsertCheckIn(db, {
      id: "check-in-3",
      date: "2026-08-28",
      pain: 3,
      fatigue: 2,
      morningStiffnessBucket: "under_15",
      notes: "Felt stiff after the gym.",
    });

    expect(getCheckInByDate(db, "2026-08-28")?.notes).toBe("Felt stiff after the gym.");

    upsertCheckIn(db, {
      id: "check-in-3-retry",
      date: "2026-08-28",
      pain: 3,
      fatigue: 2,
      morningStiffnessBucket: "under_15",
      notes: "Updated note for the same day.",
    });

    expect(getCheckInByDate(db, "2026-08-28")?.notes).toBe("Updated note for the same day.");
  });

  it("clears a previously-saved note when the same-day upsert omits it", () => {
    const { db } = createTestDatabase();

    upsertCheckIn(db, {
      id: "check-in-4",
      date: "2026-08-29",
      pain: 2,
      fatigue: 2,
      morningStiffnessBucket: "none",
      notes: "Will be removed.",
    });
    expect(getCheckInByDate(db, "2026-08-29")?.notes).toBe("Will be removed.");

    upsertCheckIn(db, {
      id: "check-in-4-retry",
      date: "2026-08-29",
      pain: 2,
      fatigue: 2,
      morningStiffnessBucket: "none",
    });

    expect(getCheckInByDate(db, "2026-08-29")?.notes).toBeNull();
  });
});
