import { TIMELINE_EVENT_MARKERS, type TimelineMarkerShape } from "../timelineMarkers";
import type { TimelineEventType } from "../../../domain/timeline";

const ALL_EVENT_TYPES: TimelineEventType[] = [
  "check_in",
  "high_symptom_day",
  "medication",
  "injection",
  "lab",
  "appointment",
];

describe("TIMELINE_EVENT_MARKERS", () => {
  it("has a marker spec for every real TimelineEventType", () => {
    for (const type of ALL_EVENT_TYPES) {
      expect(TIMELINE_EVENT_MARKERS[type]).toBeDefined();
    }
  });

  it("uses a distinct shape per event type — no two types share a silhouette", () => {
    const shapes = ALL_EVENT_TYPES.map((type) => TIMELINE_EVENT_MARKERS[type].shape);
    const uniqueShapes = new Set<TimelineMarkerShape>(shapes);
    expect(uniqueShapes.size).toBe(ALL_EVENT_TYPES.length);
  });

  it("only the two genuinely infrequent record types plus the explicit High-Symptom Day marker are 'anchor' tier", () => {
    expect(TIMELINE_EVENT_MARKERS.lab.tier).toBe("anchor");
    expect(TIMELINE_EVENT_MARKERS.appointment.tier).toBe("anchor");
    expect(TIMELINE_EVENT_MARKERS.high_symptom_day.tier).toBe("anchor");
    expect(TIMELINE_EVENT_MARKERS.check_in.tier).toBe("routine");
    expect(TIMELINE_EVENT_MARKERS.medication.tier).toBe("routine");
    expect(TIMELINE_EVENT_MARKERS.injection.tier).toBe("routine");
  });

  it("high_symptom_day gets the bar marker, distinct from check_in's circle", () => {
    expect(TIMELINE_EVENT_MARKERS.high_symptom_day.shape).toBe("bar");
    expect(TIMELINE_EVENT_MARKERS.check_in.shape).toBe("circle");
  });
});
