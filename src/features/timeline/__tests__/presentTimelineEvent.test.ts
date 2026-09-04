import { presentTimelineEvent, type Translate } from "../presentTimelineEvent";
import type { TimelineEvent } from "../../../domain/timeline";

const TODAY = "2026-09-03";

/** A minimal, faithful-enough stand-in for the real `t` — returns the key with interpolated params visible, so assertions can check both which key was requested and what was passed to it without importing the full i18n system. */
const t: Translate = (key, options) => (options ? `${key}(${JSON.stringify(options)})` : key);

describe("presentTimelineEvent", () => {
  it("check_in: uses the existing symptoms.rowLabel key and never mentions a note (the type carries none)", () => {
    const event: TimelineEvent = {
      type: "check_in",
      id: "check_in:c1",
      date: "2026-08-20",
      sourceId: "c1",
      pain: 4,
      fatigue: 3,
      morningStiffnessBucket: "15_30",
      bodyAreas: ["hips"],
    };
    const result = presentTimelineEvent(event, t, TODAY);
    expect(result.label).toContain("symptoms.rowLabel");
    expect(result.caption).toContain("checkIn.stiffnessCompact.15_30");
    expect(result.caption).toContain("checkIn.bodyArea.hips");
    expect(result.route).toBeNull(); // not today's date
  });

  it("check_in on today's date is navigable to /check-in; any other date is read-only", () => {
    const todayEvent: TimelineEvent = {
      type: "check_in",
      id: "check_in:c1",
      date: TODAY,
      sourceId: "c1",
      pain: 4,
      fatigue: 3,
      morningStiffnessBucket: "none",
      bodyAreas: [],
    };
    expect(presentTimelineEvent(todayEvent, t, TODAY).route).toBe("/check-in");

    const pastEvent = { ...todayEvent, date: "2026-08-01" };
    expect(presentTimelineEvent(pastEvent, t, TODAY).route).toBeNull();
  });

  it("high_symptom_day: label is the explicit marker string, never inferred, and caption carries the full snapshot", () => {
    const event: TimelineEvent = {
      type: "high_symptom_day",
      id: "check_in:c2",
      date: "2026-08-20",
      sourceId: "c2",
      pain: 8,
      fatigue: 7,
      morningStiffnessBucket: "over_60",
      bodyAreas: ["hips", "lower_back"],
    };
    const result = presentTimelineEvent(event, t, TODAY);
    expect(result.label).toBe("timeline.highSymptomDay");
    expect(result.caption).toContain("timeline.painOutOfTen");
    expect(result.caption).toContain("checkIn.stiffnessCompact.over_60");
    expect(result.caption).toContain("checkIn.bodyArea.hips");
    expect(result.caption).toContain("checkIn.bodyArea.lower_back");
  });

  it("high_symptom_day with no recorded body areas omits that segment cleanly (no dangling separator)", () => {
    const event: TimelineEvent = {
      type: "high_symptom_day",
      id: "check_in:c3",
      date: "2026-08-20",
      sourceId: "c3",
      pain: 6,
      fatigue: 6,
      morningStiffnessBucket: "30_60",
      bodyAreas: [],
    };
    const result = presentTimelineEvent(event, t, TODAY);
    expect(result.caption?.endsWith(" · ")).toBe(false);
    expect(result.caption).not.toContain("checkIn.bodyArea");
  });

  it("medication: uses the real medication name as the label and the existing status vocabulary as the caption", () => {
    const event: TimelineEvent = {
      type: "medication",
      id: "medication:m1",
      date: "2026-08-20",
      sourceId: "m1",
      medicationName: "Sulfasalazine",
      status: "taken",
    };
    const result = presentTimelineEvent(event, t, TODAY);
    expect(result.label).toBe("Sulfasalazine");
    expect(result.caption).toBe("medications.status.taken");
    expect(result.route).toBeNull();
  });

  it("injection: uses the real treatment name as the label and the existing status vocabulary as the caption", () => {
    const event: TimelineEvent = {
      type: "injection",
      id: "injection:i1",
      date: "2026-08-20",
      sourceId: "i1",
      treatmentName: "Etanercept",
      status: "completed",
    };
    const result = presentTimelineEvent(event, t, TODAY);
    expect(result.label).toBe("Etanercept");
    expect(result.caption).toBe("injections.status.completed");
    expect(result.route).toBeNull();
  });

  it("lab: shows the marker as the label and the raw recorded value+unit as the caption, no interpretation", () => {
    const event: TimelineEvent = {
      type: "lab",
      id: "lab:l1",
      date: "2026-08-28",
      sourceId: "l1",
      marker: "CRP",
      value: 12.4,
      unit: "mg/L",
    };
    const result = presentTimelineEvent(event, t, TODAY);
    expect(result.label).toBe("labs.marker.CRP");
    expect(result.caption).toBe("12.4 mg/L");
    expect(result.route).toBeNull();
  });

  it("appointment: prefers the doctor/institution as the label, falls back to the type label, and is always navigable", () => {
    const withDoctor: TimelineEvent = {
      type: "appointment",
      id: "appointment:a1",
      date: "2026-08-22",
      sourceId: "a1",
      appointmentType: "rheumatology",
      doctorOrInstitution: "City Hospital Rheumatology",
      status: "scheduled",
    };
    expect(presentTimelineEvent(withDoctor, t, TODAY).label).toBe("City Hospital Rheumatology");
    expect(presentTimelineEvent(withDoctor, t, TODAY).route).toBe("/appointments/a1");

    const withoutDoctor = { ...withDoctor, doctorOrInstitution: null };
    expect(presentTimelineEvent(withoutDoctor, t, TODAY).label).toBe("appointments.type.rheumatology");
  });

  it("appointment: appends the status label only when it isn't 'scheduled'", () => {
    const scheduled: TimelineEvent = {
      type: "appointment",
      id: "appointment:a1",
      date: "2026-08-22",
      sourceId: "a1",
      appointmentType: "laboratory",
      doctorOrInstitution: null,
      status: "scheduled",
    };
    expect(presentTimelineEvent(scheduled, t, TODAY).caption).toBe("appointments.type.laboratory");

    const completed = { ...scheduled, status: "completed" as const };
    expect(presentTimelineEvent(completed, t, TODAY).caption).toBe(
      "appointments.type.laboratory · appointments.status.completed",
    );
  });

  it("accessibilityLabel combines label and caption when both exist, and is just the label when caption is empty", () => {
    const withCaption: TimelineEvent = {
      type: "lab",
      id: "lab:l1",
      date: "2026-08-28",
      sourceId: "l1",
      marker: "CRP",
      value: 5,
      unit: "mg/L",
    };
    expect(presentTimelineEvent(withCaption, t, TODAY).accessibilityLabel).toBe("labs.marker.CRP. 5 mg/L");
  });
});
