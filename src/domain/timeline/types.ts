import type { MorningStiffnessBucket } from "../insights";
import type { BodyAreaRegion } from "../../repositories/checkInRepository";

export type TimelineEventType = "check_in" | "high_symptom_day" | "medication" | "injection" | "lab" | "appointment";

/**
 * A daily check-in or a user-marked High-Symptom Day are the same
 * underlying `daily_check_in` row — `type` is the only thing that differs
 * (`isHighSymptomDay` decides which), never two separate events for one
 * row (Phase W brief §4: "do not duplicate health records into a timeline
 * table").
 */
export type CheckInTimelineEvent = {
  type: "check_in" | "high_symptom_day";
  id: string;
  date: string;
  sourceId: string;
  pain: number;
  fatigue: number;
  morningStiffnessBucket: MorningStiffnessBucket;
  bodyAreas: BodyAreaRegion[];
};

export type MedicationTimelineEvent = {
  type: "medication";
  id: string;
  date: string;
  sourceId: string;
  medicationName: string;
  status: "taken" | "missed" | "skipped";
};

export type InjectionTimelineEvent = {
  type: "injection";
  id: string;
  date: string;
  sourceId: string;
  treatmentName: string;
  status: "completed" | "missed";
};

export type LabTimelineEvent = {
  type: "lab";
  id: string;
  date: string;
  sourceId: string;
  marker: string;
  value: number;
  unit: string;
};

export type AppointmentTimelineEvent = {
  type: "appointment";
  id: string;
  date: string;
  sourceId: string;
  appointmentType: "rheumatology" | "laboratory" | "imaging" | "other";
  doctorOrInstitution: string | null;
  status: "scheduled" | "completed" | "cancelled";
};

/**
 * Every variant carries only presentation/navigation fields — `sourceId`
 * is the one thing every screen tapping into a Timeline entry needs (to
 * navigate to that record's own existing detail screen, Phase W brief §4:
 * "the Timeline is a lens, not a new destination"), never a raw repository
 * row.
 */
export type TimelineEvent =
  | CheckInTimelineEvent
  | MedicationTimelineEvent
  | InjectionTimelineEvent
  | LabTimelineEvent
  | AppointmentTimelineEvent;
