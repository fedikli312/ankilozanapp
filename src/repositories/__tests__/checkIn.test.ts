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
});
