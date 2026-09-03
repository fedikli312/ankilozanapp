import { isWithinRange } from "../dateUtils";
import type { MorningStiffnessBucket } from "../insights";
import type { HealthDateRange } from "../healthSummary/types";
import type { BodyAreaRegion } from "../../repositories/checkInRepository";
import type {
  AppointmentTimelineEvent,
  CheckInTimelineEvent,
  InjectionTimelineEvent,
  LabTimelineEvent,
  MedicationTimelineEvent,
  TimelineEvent,
  TimelineEventType,
} from "./types";

export type CheckInForTimeline = {
  id: string;
  date: string;
  pain: number;
  fatigue: number;
  morningStiffnessBucket: MorningStiffnessBucket;
  isHighSymptomDay: boolean;
};

export type MedicationAdministrationForTimeline = {
  id: string;
  medicationName: string;
  /** Local wall-clock `YYYY-MM-DDTHH:mm` — only the date portion is used; the Timeline groups by calendar day, never by time of day. */
  scheduledFor: string;
  status: "pending" | "taken" | "missed" | "skipped";
};

export type InjectionAdministrationForTimeline = {
  id: string;
  treatmentName: string;
  scheduledFor: string;
  status: "pending" | "completed" | "missed";
};

export type LabResultForTimeline = {
  id: string;
  marker: string;
  value: number;
  unit: string;
  recordedDate: string;
};

export type AppointmentForTimeline = {
  id: string;
  type: "rheumatology" | "laboratory" | "imaging" | "other";
  date: string;
  doctorOrInstitution: string | null;
  status: "scheduled" | "completed" | "cancelled";
};

export type TimelineEventSources = {
  checkIns: readonly CheckInForTimeline[];
  /** Keyed by check-in `date` (not `id`) — a check-in's date is already unique (the schema's own `daily_check_in.date` unique constraint), so a date-keyed map is sufficient and avoids the caller needing a checkIn-id join just to attach body areas. */
  bodyAreasByCheckInDate: Readonly<Record<string, readonly BodyAreaRegion[]>>;
  medicationAdministrations: readonly MedicationAdministrationForTimeline[];
  injectionAdministrations: readonly InjectionAdministrationForTimeline[];
  labResults: readonly LabResultForTimeline[];
  appointments: readonly AppointmentForTimeline[];
};

/**
 * Same-day tie-break (Phase W brief §4: "define tie-breaking behavior for
 * multiple events on the same timestamp/day") — an explicit, documented
 * priority, not insertion order or database-return order: an appointment
 * is the day's headline event if one occurred; a check-in (including a
 * High-Symptom Day) is the daily narrative anchor next; injections and
 * medications follow; a lab result sorts last. Ties within the same type
 * on the same day break on `sourceId` ascending, so output order is fully
 * deterministic regardless of input order.
 */
const TIMELINE_EVENT_TYPE_PRIORITY: Record<TimelineEventType, number> = {
  appointment: 0,
  high_symptom_day: 1,
  check_in: 1,
  injection: 2,
  medication: 3,
  lab: 4,
};

/**
 * Pure, derived presentation over already-fetched rows — never a second
 * source of truth (Phase W brief §4). `range` is optional: omit it for the
 * full history (e.g. a future unranged Timeline screen), or pass one to
 * scope the feed the same way every other Phase W contract does.
 */
export function buildTimelineEvents(sources: TimelineEventSources, range?: HealthDateRange): TimelineEvent[] {
  const inRange = (date: string) => !range || isWithinRange(date, range.rangeStart, range.rangeEnd);

  const checkInEvents: CheckInTimelineEvent[] = sources.checkIns
    .filter((c) => inRange(c.date))
    .map((c) => ({
      type: c.isHighSymptomDay ? "high_symptom_day" : "check_in",
      id: `check_in:${c.id}`,
      date: c.date,
      sourceId: c.id,
      pain: c.pain,
      fatigue: c.fatigue,
      morningStiffnessBucket: c.morningStiffnessBucket,
      bodyAreas: [...(sources.bodyAreasByCheckInDate[c.date] ?? [])],
    }));

  const medicationEvents: MedicationTimelineEvent[] = sources.medicationAdministrations
    // A still-pending dose hasn't happened yet — not a recorded event.
    .filter((a): a is MedicationAdministrationForTimeline & { status: "taken" | "missed" | "skipped" } =>
      a.status !== "pending",
    )
    .filter((a) => inRange(a.scheduledFor.slice(0, 10)))
    .map((a) => ({
      type: "medication",
      id: `medication:${a.id}`,
      date: a.scheduledFor.slice(0, 10),
      sourceId: a.id,
      medicationName: a.medicationName,
      status: a.status,
    }));

  const injectionEvents: InjectionTimelineEvent[] = sources.injectionAdministrations
    .filter((a): a is InjectionAdministrationForTimeline & { status: "completed" | "missed" } => a.status !== "pending")
    .filter((a) => inRange(a.scheduledFor))
    .map((a) => ({
      type: "injection",
      id: `injection:${a.id}`,
      date: a.scheduledFor,
      sourceId: a.id,
      treatmentName: a.treatmentName,
      status: a.status,
    }));

  const labEvents: LabTimelineEvent[] = sources.labResults
    .filter((r) => inRange(r.recordedDate))
    .map((r) => ({
      type: "lab",
      id: `lab:${r.id}`,
      date: r.recordedDate,
      sourceId: r.id,
      marker: r.marker,
      value: r.value,
      unit: r.unit,
    }));

  const appointmentEvents: AppointmentTimelineEvent[] = sources.appointments
    .filter((a) => inRange(a.date))
    .map((a) => ({
      type: "appointment",
      id: `appointment:${a.id}`,
      date: a.date,
      sourceId: a.id,
      appointmentType: a.type,
      doctorOrInstitution: a.doctorOrInstitution,
      status: a.status,
    }));

  const all: TimelineEvent[] = [
    ...checkInEvents,
    ...medicationEvents,
    ...injectionEvents,
    ...labEvents,
    ...appointmentEvents,
  ];

  return all.sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date); // most-recent first
    if (dateCompare !== 0) return dateCompare;
    const priorityCompare = TIMELINE_EVENT_TYPE_PRIORITY[a.type] - TIMELINE_EVENT_TYPE_PRIORITY[b.type];
    if (priorityCompare !== 0) return priorityCompare;
    return a.sourceId.localeCompare(b.sourceId);
  });
}
