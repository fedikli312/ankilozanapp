import { buildTimelineEvents, type TimelineEventSources } from "../buildTimelineEvents";

const emptySources: TimelineEventSources = {
  checkIns: [],
  bodyAreasByCheckInDate: {},
  medicationAdministrations: [],
  injectionAdministrations: [],
  labResults: [],
  appointments: [],
};

describe("buildTimelineEvents", () => {
  it("returns an empty array for a user with no records at all", () => {
    expect(buildTimelineEvents(emptySources)).toEqual([]);
  });

  it("sorts events most-recent-first across every event type", () => {
    const events = buildTimelineEvents({
      ...emptySources,
      checkIns: [
        { id: "c1", date: "2026-08-01", pain: 4, fatigue: 4, morningStiffnessBucket: "15_30", isHighSymptomDay: false },
      ],
      labResults: [{ id: "l1", marker: "CRP", value: 5, unit: "mg/L", recordedDate: "2026-08-15" }],
      appointments: [
        { id: "a1", type: "rheumatology", date: "2026-08-10", doctorOrInstitution: null, status: "completed" },
      ],
    });
    expect(events.map((e) => e.date)).toEqual(["2026-08-15", "2026-08-10", "2026-08-01"]);
  });

  it("emits a high_symptom_day event, not a plain check_in, when the marker is set — and only then", () => {
    const events = buildTimelineEvents({
      ...emptySources,
      checkIns: [
        { id: "c1", date: "2026-08-01", pain: 8, fatigue: 8, morningStiffnessBucket: "over_60", isHighSymptomDay: true },
        { id: "c2", date: "2026-08-02", pain: 8, fatigue: 8, morningStiffnessBucket: "over_60", isHighSymptomDay: false },
      ],
    });
    const marked = events.find((e) => e.sourceId === "c1");
    const unmarked = events.find((e) => e.sourceId === "c2");
    expect(marked?.type).toBe("high_symptom_day");
    expect(unmarked?.type).toBe("check_in");
  });

  it("attaches body areas by the check-in's own date", () => {
    const [event] = buildTimelineEvents({
      ...emptySources,
      checkIns: [{ id: "c1", date: "2026-08-01", pain: 4, fatigue: 4, morningStiffnessBucket: "15_30", isHighSymptomDay: false }],
      bodyAreasByCheckInDate: { "2026-08-01": ["hips", "lower_back"] },
    });
    expect(event.type === "check_in" && event.bodyAreas).toEqual(["hips", "lower_back"]);
  });

  it("excludes pending medication/injection administrations — only recorded outcomes are timeline events", () => {
    const events = buildTimelineEvents({
      ...emptySources,
      medicationAdministrations: [
        { id: "m1", medicationName: "Sulfasalazine", scheduledFor: "2026-08-01T08:00", status: "pending" },
        { id: "m2", medicationName: "Sulfasalazine", scheduledFor: "2026-08-02T08:00", status: "taken" },
      ],
      injectionAdministrations: [
        { id: "i1", treatmentName: "Etanercept", scheduledFor: "2026-08-01", status: "pending" },
        { id: "i2", treatmentName: "Etanercept", scheduledFor: "2026-08-03", status: "completed" },
      ],
    });
    expect(events.map((e) => e.sourceId).sort()).toEqual(["i2", "m2"]);
  });

  it("uses only the date portion of a medication's wall-clock timestamp, never the time", () => {
    const [event] = buildTimelineEvents({
      ...emptySources,
      medicationAdministrations: [
        { id: "m1", medicationName: "Sulfasalazine", scheduledFor: "2026-08-01T21:45", status: "taken" },
      ],
    });
    expect(event.date).toBe("2026-08-01");
  });

  it("same-day tie-break: appointment first, then check-in, then injection, then medication, then lab", () => {
    const events = buildTimelineEvents({
      checkIns: [{ id: "c1", date: "2026-08-01", pain: 4, fatigue: 4, morningStiffnessBucket: "15_30", isHighSymptomDay: false }],
      bodyAreasByCheckInDate: {},
      medicationAdministrations: [{ id: "m1", medicationName: "Sulfasalazine", scheduledFor: "2026-08-01T08:00", status: "taken" }],
      injectionAdministrations: [{ id: "i1", treatmentName: "Etanercept", scheduledFor: "2026-08-01", status: "completed" }],
      labResults: [{ id: "l1", marker: "CRP", value: 5, unit: "mg/L", recordedDate: "2026-08-01" }],
      appointments: [{ id: "a1", type: "rheumatology", date: "2026-08-01", doctorOrInstitution: null, status: "completed" }],
    });
    expect(events.map((e) => e.type)).toEqual(["appointment", "check_in", "injection", "medication", "lab"]);
  });

  it("breaks a same-day, same-type tie deterministically on sourceId", () => {
    const events = buildTimelineEvents({
      ...emptySources,
      labResults: [
        { id: "l2", marker: "ESR", value: 20, unit: "mm/hr", recordedDate: "2026-08-01" },
        { id: "l1", marker: "CRP", value: 5, unit: "mg/L", recordedDate: "2026-08-01" },
      ],
    });
    expect(events.map((e) => e.sourceId)).toEqual(["l1", "l2"]);
  });

  it("a range filters every event type consistently; omitting range returns the full history", () => {
    const sources: TimelineEventSources = {
      ...emptySources,
      appointments: [
        { id: "a1", type: "rheumatology", date: "2026-07-01", doctorOrInstitution: null, status: "completed" },
        { id: "a2", type: "rheumatology", date: "2026-09-01", doctorOrInstitution: null, status: "scheduled" },
      ],
    };
    const ranged = buildTimelineEvents(sources, { rangeStart: "2026-08-01", rangeEnd: "2026-08-31" });
    expect(ranged).toEqual([]);

    const unranged = buildTimelineEvents(sources);
    expect(unranged).toHaveLength(2);
  });

  it("preserves each event's original record id for future navigation", () => {
    const [event] = buildTimelineEvents({
      ...emptySources,
      appointments: [{ id: "appt-123", type: "laboratory", date: "2026-08-01", doctorOrInstitution: "City Lab", status: "scheduled" }],
    });
    expect(event.sourceId).toBe("appt-123");
  });
});
