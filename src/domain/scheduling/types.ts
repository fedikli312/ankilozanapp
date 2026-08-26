export type FrequencyType = "daily" | "specific_days" | "custom_interval";

/** Mirrors the `medication_schedule` / `injection_schedule` row shape —
 * domain functions take plain data, never a repository or db import. */
export type ScheduleVersion = {
  id: string;
  effectiveFrom: string;
  effectiveUntil: string | null;
};

export type MedicationScheduleVersion = ScheduleVersion & {
  frequencyType: FrequencyType;
  intervalDays: number | null;
};
