import { createTestDatabase } from "../../../db/testUtils/testDatabase";
import { getTimelineEvents } from "../getTimelineEvents";
import {
  createAppointment,
  createInjectionTreatment,
  createLabResult,
  createMedication,
  createPendingAdministrations,
  createPendingInjectionAdministration,
  logInjectionAdministration,
  markAdministration,
  upsertCheckIn,
} from "../../../repositories";

describe("getTimelineEvents (DB integration)", () => {
  it("an empty database returns an empty timeline", () => {
    const { db } = createTestDatabase();
    expect(getTimelineEvents(db, "2026-09-03")).toEqual([]);
  });

  it("merges every record type into one sorted, real feed with resolved medication/treatment names", () => {
    const { db } = createTestDatabase();

    upsertCheckIn(db, { id: "c1", date: "2026-09-01", pain: 4, fatigue: 4, morningStiffnessBucket: "15_30" });

    createMedication(db, { id: "m1", name: "Sulfasalazine", dose: "500mg" });
    createPendingAdministrations(db, [{ id: "ma1", medicationId: "m1", medicationScheduleId: null, scheduledFor: "2026-08-30T08:00" }]);
    markAdministration(db, "ma1", "taken");

    createInjectionTreatment(db, { id: "t1", name: "Etanercept", dose: "50mg" });
    createPendingInjectionAdministration(db, { id: "ia1", injectionTreatmentId: "t1", injectionScheduleId: null, scheduledFor: "2026-08-29" });
    logInjectionAdministration(db, "ia1", "completed", "2026-08-29");

    createLabResult(db, { id: "l1", marker: "CRP", value: 8, unit: "mg/L", recordedDate: "2026-08-28" });
    createAppointment(db, { id: "a1", type: "rheumatology", date: "2026-08-22" });

    const events = getTimelineEvents(db, "2026-09-03");
    expect(events.map((e) => e.type)).toEqual(["check_in", "medication", "injection", "lab", "appointment"]);

    const medicationEvent = events.find((e) => e.type === "medication");
    expect(medicationEvent && "medicationName" in medicationEvent && medicationEvent.medicationName).toBe("Sulfasalazine");

    const injectionEvent = events.find((e) => e.type === "injection");
    expect(injectionEvent && "treatmentName" in injectionEvent && injectionEvent.treatmentName).toBe("Etanercept");
  });

  it("a high-symptom-day check-in surfaces as its own event type in the merged feed", () => {
    const { db } = createTestDatabase();
    upsertCheckIn(db, {
      id: "c1",
      date: "2026-09-01",
      pain: 9,
      fatigue: 9,
      morningStiffnessBucket: "over_60",
      isHighSymptomDay: true,
      bodyAreas: ["hips", "lower_back"],
    });

    const [event] = getTimelineEvents(db, "2026-09-03");
    expect(event.type).toBe("high_symptom_day");
    expect(event.type === "high_symptom_day" && event.bodyAreas).toEqual(["hips", "lower_back"]);
  });

  it("respects an explicit range while defaulting to the full history when omitted", () => {
    const { db } = createTestDatabase();
    createAppointment(db, { id: "old", type: "rheumatology", date: "2026-01-01" });
    createAppointment(db, { id: "recent", type: "rheumatology", date: "2026-08-25" });

    const ranged = getTimelineEvents(db, "2026-09-03", { rangeStart: "2026-08-01", rangeEnd: "2026-09-04" });
    expect(ranged.map((e) => e.sourceId)).toEqual(["recent"]);

    const full = getTimelineEvents(db, "2026-09-03");
    expect(full.map((e) => e.sourceId).sort()).toEqual(["old", "recent"]);
  });

  it("includes a future scheduled appointment when unranged, sorted ahead of past events", () => {
    const { db } = createTestDatabase();
    createAppointment(db, { id: "future", type: "rheumatology", date: "2026-09-20" });
    createAppointment(db, { id: "past", type: "rheumatology", date: "2026-08-01" });

    const events = getTimelineEvents(db, "2026-09-03");
    expect(events.map((e) => e.sourceId)).toEqual(["future", "past"]);
  });
});
