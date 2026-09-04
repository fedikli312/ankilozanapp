// Product 2.1 Phase Y. `useCheckIn`/`CheckInForm` are real React hooks/
// components (unlike most other "use*" feature functions in this codebase),
// so — consistent with this repo's established "no RN render-testing
// library" constraint — the scenarios below are exercised at the exact
// layer that actually carries the logic: `upsertCheckIn`/`getCheckInByDate`
// (the same repository calls `useCheckIn.save()` and `CheckInForm.onSave`
// simply pass through) and `getTimelineEvents` for the Timeline hand-off.
// The toggle's *starting position* logic is covered separately and purely
// in `resolveDefaultHighSymptomDay.test.ts`.
import { createTestDatabase } from "../../../db/testUtils/testDatabase";
import { getCheckInByDate, upsertCheckIn } from "../../../repositories";
import { getTimelineEvents } from "../../timeline/getTimelineEvents";

describe("High-Symptom Day — no inference from symptom values", () => {
  it("pain 10/10 does NOT automatically set isHighSymptomDay", () => {
    const { db } = createTestDatabase();
    upsertCheckIn(db, { id: "c1", date: "2026-09-10", pain: 10, fatigue: 3, morningStiffnessBucket: "none" });
    expect(getCheckInByDate(db, "2026-09-10")?.isHighSymptomDay).toBe(false);
  });

  it("fatigue 10/10 does NOT automatically set isHighSymptomDay", () => {
    const { db } = createTestDatabase();
    upsertCheckIn(db, { id: "c1", date: "2026-09-10", pain: 3, fatigue: 10, morningStiffnessBucket: "none" });
    expect(getCheckInByDate(db, "2026-09-10")?.isHighSymptomDay).toBe(false);
  });

  it("the longest morning stiffness bucket (over_60) does NOT automatically set isHighSymptomDay", () => {
    const { db } = createTestDatabase();
    upsertCheckIn(db, { id: "c1", date: "2026-09-10", pain: 3, fatigue: 3, morningStiffnessBucket: "over_60" });
    expect(getCheckInByDate(db, "2026-09-10")?.isHighSymptomDay).toBe(false);
  });

  it("even the worst possible values together (pain 10, fatigue 10, over_60) do NOT automatically set isHighSymptomDay", () => {
    const { db } = createTestDatabase();
    upsertCheckIn(db, { id: "c1", date: "2026-09-10", pain: 10, fatigue: 10, morningStiffnessBucket: "over_60" });
    expect(getCheckInByDate(db, "2026-09-10")?.isHighSymptomDay).toBe(false);
  });
});

describe("High-Symptom Day — editing today's check-in", () => {
  it("a same-day edit can turn the flag from false to true (mirrors the existing true-to-false repository test)", () => {
    const { db } = createTestDatabase();
    upsertCheckIn(db, {
      id: "c1",
      date: "2026-09-10",
      pain: 4,
      fatigue: 4,
      morningStiffnessBucket: "15_30",
      isHighSymptomDay: false,
    });
    expect(getCheckInByDate(db, "2026-09-10")?.isHighSymptomDay).toBe(false);

    upsertCheckIn(db, {
      id: "c1-retry",
      date: "2026-09-10",
      pain: 6,
      fatigue: 6,
      morningStiffnessBucket: "30_60",
      isHighSymptomDay: true,
    });
    expect(getCheckInByDate(db, "2026-09-10")?.isHighSymptomDay).toBe(true);
  });

  it("editing preserves the saved flag when the edit doesn't touch it — same upsert-preserves semantics as every other field", () => {
    const { db } = createTestDatabase();
    upsertCheckIn(db, {
      id: "c1",
      date: "2026-09-10",
      pain: 5,
      fatigue: 5,
      morningStiffnessBucket: "15_30",
      isHighSymptomDay: true,
    });

    // Re-reading today's saved value (as `useCheckIn`'s `initialValue` does)
    // and passing it straight back through, exactly as CheckInForm always
    // does — the flag is never silently defaulted to false by an edit that
    // doesn't change it.
    const saved = getCheckInByDate(db, "2026-09-10");
    upsertCheckIn(db, {
      id: "c1-retry",
      date: "2026-09-10",
      pain: 5,
      fatigue: 5,
      morningStiffnessBucket: "15_30",
      notes: "Edited note only",
      isHighSymptomDay: saved?.isHighSymptomDay,
    });

    expect(getCheckInByDate(db, "2026-09-10")?.isHighSymptomDay).toBe(true);
  });
});

describe("High-Symptom Day — Timeline hand-off (Phase W architecture, unchanged)", () => {
  it("a saved isHighSymptomDay: true flows into a high_symptom_day Timeline event with no Timeline-specific logic", () => {
    const { db } = createTestDatabase();
    upsertCheckIn(db, {
      id: "c1",
      date: "2026-09-10",
      pain: 7,
      fatigue: 6,
      morningStiffnessBucket: "30_60",
      isHighSymptomDay: true,
    });

    const events = getTimelineEvents(db, "2026-09-10");
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe("high_symptom_day");
    expect(events[0].sourceId).toBe("c1");
  });

  it("a normal (non-high-symptom) check-in flows into a plain check_in Timeline event", () => {
    const { db } = createTestDatabase();
    upsertCheckIn(db, { id: "c1", date: "2026-09-10", pain: 4, fatigue: 4, morningStiffnessBucket: "none" });

    const events = getTimelineEvents(db, "2026-09-10");
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe("check_in");
  });
});
