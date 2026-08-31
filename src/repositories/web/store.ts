/**
 * Dev-web-preview-only in-memory data store.
 *
 * expo-sqlite's web implementation depends on a Worker + WASM + OPFS +
 * SharedArrayBuffer stack that cannot be verified end-to-end in every
 * environment (see metro.config.js's COOP/COEP comment). Since this app's
 * repository layer uses expo-sqlite's *synchronous* driver API on every
 * screen, a runtime failure in that stack wouldn't degrade gracefully — it
 * would break every screen. So Expo Web instead runs against this seeded
 * in-memory store, swapped in automatically by Metro's `.web.ts` platform
 * resolution (see each `*Repository.web.ts` sibling file).
 *
 * Native iOS/Android builds never load this file — they resolve the plain
 * `*Repository.ts` files against real expo-sqlite, completely unchanged.
 *
 * This is a **visual/UX preview aid only**. It is not a production data
 * backend, is not persisted, and resets on every reload.
 */

function isoDaysFromToday(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString();
}

function dateOnlyDaysFromToday(offsetDays: number): string {
  return isoDaysFromToday(offsetDays).slice(0, 10);
}

function wallClockDaysFromToday(offsetDays: number, hhmm: string): string {
  return `${dateOnlyDaysFromToday(offsetDays)}T${hhmm}`;
}

export type MedicationRow = {
  id: string;
  name: string;
  dose: string;
  notes: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
};

export type MedicationScheduleRow = {
  id: string;
  medicationId: string;
  frequencyType: "daily" | "specific_days" | "custom_interval";
  intervalDays: number | null;
  reminderEnabled: boolean;
  effectiveFrom: string;
  effectiveUntil: string | null;
  createdAt: string;
};

export type MedicationScheduleDayRow = { medicationScheduleId: string; dayOfWeek: number };
export type MedicationScheduleTimeRow = { medicationScheduleId: string; timeOfDay: string };

export type MedicationAdministrationRow = {
  id: string;
  medicationId: string;
  medicationScheduleId: string | null;
  scheduledFor: string;
  status: "pending" | "taken" | "missed" | "skipped";
  actualTime: string | null;
  createdAt: string;
  updatedAt: string;
};

export type InjectionTreatmentRow = {
  id: string;
  name: string;
  dose: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
};

export type InjectionScheduleRow = {
  id: string;
  injectionTreatmentId: string;
  intervalDays: number;
  reminderLeadDays: number;
  reminderOnScheduledDay: boolean;
  effectiveFrom: string;
  effectiveUntil: string | null;
  createdAt: string;
};

export type InjectionAdministrationRow = {
  id: string;
  injectionTreatmentId: string;
  injectionScheduleId: string | null;
  scheduledFor: string;
  status: "pending" | "completed" | "missed";
  actualDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AppointmentRow = {
  id: string;
  type: "rheumatology" | "laboratory" | "imaging" | "other";
  doctorOrInstitution: string | null;
  date: string;
  time: string | null;
  notes: string | null;
  reminderLeadDays: number;
  status: "scheduled" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
};

export type LabResultRow = {
  id: string;
  marker: "CRP" | "ESR";
  value: number;
  unit: string;
  recordedDate: string;
  institution: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LabReminderRow = {
  id: string;
  label: string;
  marker: "CRP" | "ESR" | null;
  dueDate: string;
  reminderLeadDays: number;
  status: "pending" | "completed" | "dismissed";
  createdAt: string;
  updatedAt: string;
};

export type BodyAreaRegion =
  | "neck"
  | "upper_back"
  | "lower_back"
  | "hips"
  | "shoulders"
  | "chest_ribs"
  | "other";

export type DailyCheckInRow = {
  id: string;
  date: string;
  pain: number;
  fatigue: number;
  morningStiffnessBucket: "none" | "under_15" | "15_30" | "30_60" | "over_60";
  wellbeing: number | null;
  notes: string | null;
  flaggedImportant: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CheckInBodyAreaRow = { checkInId: string; region: BodyAreaRegion };

export type ScheduledNotificationRow = {
  id: string;
  sourceType: "medication" | "injection" | "appointment" | "lab_reminder";
  sourceId: string;
  notificationIdentifier: string;
  scheduledFor: string;
  isRepeating: boolean;
  createdAt: string;
};

export type OnboardingStateRow = {
  id: string;
  completed: boolean;
  whatToRemember: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UserPreferencesRow = {
  id: string;
  languageOverride: "en" | "tr" | null;
  notificationDetailOptIn: boolean;
  lastKnownTimezone: string | null;
  createdAt: string;
  updatedAt: string;
};

type Store = {
  medications: MedicationRow[];
  medicationSchedules: MedicationScheduleRow[];
  medicationScheduleDays: MedicationScheduleDayRow[];
  medicationScheduleTimes: MedicationScheduleTimeRow[];
  medicationAdministrations: MedicationAdministrationRow[];
  injectionTreatments: InjectionTreatmentRow[];
  injectionSchedules: InjectionScheduleRow[];
  injectionAdministrations: InjectionAdministrationRow[];
  appointments: AppointmentRow[];
  labResults: LabResultRow[];
  labReminders: LabReminderRow[];
  dailyCheckIns: DailyCheckInRow[];
  checkInBodyAreas: CheckInBodyAreaRow[];
  scheduledNotifications: ScheduledNotificationRow[];
  onboardingState: OnboardingStateRow[];
  userPreferences: UserPreferencesRow[];
};

const MED_SULFASALAZINE = "seed-med-sulfasalazine";
const MED_NAPROXEN = "seed-med-naproxen";
const MEDSCH_SULFASALAZINE = "seed-medsch-sulfasalazine-1";
const MEDSCH_NAPROXEN = "seed-medsch-naproxen-1";
const INJ_ETANERCEPT = "seed-inj-etanercept";
const INJSCH_ETANERCEPT = "seed-injsch-etanercept-1";

function buildSeedMedicationAdministrations(): MedicationAdministrationRow[] {
  const rows: MedicationAdministrationRow[] = [];
  // Sulfasalazine: daily at 08:00, last 10 days mostly taken, one missed, today pending, next few days pending.
  for (let offset = -10; offset <= 6; offset++) {
    const scheduledFor = wallClockDaysFromToday(offset, "08:00");
    let status: MedicationAdministrationRow["status"] = "pending";
    let actualTime: string | null = null;
    if (offset < 0) {
      status = offset === -4 ? "missed" : "taken";
      actualTime = status === "taken" ? scheduledFor : null;
    }
    rows.push({
      id: `seed-medadmin-sulfa-${offset}`,
      medicationId: MED_SULFASALAZINE,
      medicationScheduleId: MEDSCH_SULFASALAZINE,
      scheduledFor,
      status,
      actualTime,
      createdAt: isoDaysFromToday(offset),
      updatedAt: isoDaysFromToday(offset),
    });
  }
  // Naproxen: Mon/Wed/Fri at 09:00 — approximate with every-other-day over the same window.
  for (let offset = -9; offset <= 6; offset += 2) {
    const scheduledFor = wallClockDaysFromToday(offset, "09:00");
    const status: MedicationAdministrationRow["status"] = offset < 0 ? "taken" : "pending";
    rows.push({
      id: `seed-medadmin-naproxen-${offset}`,
      medicationId: MED_NAPROXEN,
      medicationScheduleId: MEDSCH_NAPROXEN,
      scheduledFor,
      status,
      actualTime: status === "taken" ? scheduledFor : null,
      createdAt: isoDaysFromToday(offset),
      updatedAt: isoDaysFromToday(offset),
    });
  }
  return rows;
}

function buildSeedInjectionAdministrations(): InjectionAdministrationRow[] {
  const completedOffsets = [-21, -14, -7];
  const rows: InjectionAdministrationRow[] = completedOffsets.map((offset) => ({
    id: `seed-injadmin-${offset}`,
    injectionTreatmentId: INJ_ETANERCEPT,
    injectionScheduleId: INJSCH_ETANERCEPT,
    scheduledFor: dateOnlyDaysFromToday(offset),
    status: "completed",
    actualDate: dateOnlyDaysFromToday(offset),
    createdAt: isoDaysFromToday(offset),
    updatedAt: isoDaysFromToday(offset),
  }));
  rows.push({
    id: "seed-injadmin-pending",
    injectionTreatmentId: INJ_ETANERCEPT,
    injectionScheduleId: INJSCH_ETANERCEPT,
    scheduledFor: dateOnlyDaysFromToday(3),
    status: "pending",
    actualDate: null,
    createdAt: isoDaysFromToday(-7),
    updatedAt: isoDaysFromToday(-7),
  });
  return rows;
}

function buildSeedCheckIns(): { rows: DailyCheckInRow[]; bodyAreas: CheckInBodyAreaRow[] } {
  const pains = [6, 6, 5, 6, 5, 4, 5, 4, 4, 3];
  const fatigues = [7, 6, 6, 5, 6, 5, 5, 4, 4, 3];
  const stiffnessBuckets: DailyCheckInRow["morningStiffnessBucket"][] = [
    "over_60",
    "30_60",
    "30_60",
    "30_60",
    "15_30",
    "15_30",
    "15_30",
    "under_15",
    "under_15",
    "none",
  ];
  const rows: DailyCheckInRow[] = [];
  const bodyAreas: CheckInBodyAreaRow[] = [];
  // offsets -10..-1 (today itself deliberately left without a check-in, so
  // Today's check-in prompt is visible in the preview like a real first
  // visit of the day).
  for (let i = 0; i < 10; i++) {
    const offset = -10 + i;
    const id = `seed-checkin-${offset}`;
    rows.push({
      id,
      date: dateOnlyDaysFromToday(offset),
      pain: pains[i],
      fatigue: fatigues[i],
      morningStiffnessBucket: stiffnessBuckets[i],
      wellbeing: i % 3 === 0 ? 3 : null,
      notes: offset === -3 ? "Felt noticeably better after physio stretches." : null,
      flaggedImportant: false,
      createdAt: isoDaysFromToday(offset),
      updatedAt: isoDaysFromToday(offset),
    });
    if (offset === -2) {
      bodyAreas.push({ checkInId: id, region: "lower_back" }, { checkInId: id, region: "hips" });
    }
  }
  return { rows, bodyAreas };
}

function buildInitialStore(): Store {
  const { rows: checkInRows, bodyAreas: checkInBodyAreaRows } = buildSeedCheckIns();

  return {
    medications: [
      {
        id: MED_SULFASALAZINE,
        name: "Sulfasalazine",
        dose: "500mg",
        notes: null,
        active: true,
        createdAt: isoDaysFromToday(-120),
        updatedAt: isoDaysFromToday(-120),
        archivedAt: null,
      },
      {
        id: MED_NAPROXEN,
        name: "Naproxen",
        dose: "250mg",
        notes: "As needed for flare-ups",
        active: true,
        createdAt: isoDaysFromToday(-90),
        updatedAt: isoDaysFromToday(-90),
        archivedAt: null,
      },
    ],
    medicationSchedules: [
      {
        id: MEDSCH_SULFASALAZINE,
        medicationId: MED_SULFASALAZINE,
        frequencyType: "daily",
        intervalDays: null,
        reminderEnabled: true,
        effectiveFrom: dateOnlyDaysFromToday(-120),
        effectiveUntil: null,
        createdAt: isoDaysFromToday(-120),
      },
      {
        id: MEDSCH_NAPROXEN,
        medicationId: MED_NAPROXEN,
        frequencyType: "specific_days",
        intervalDays: null,
        reminderEnabled: false,
        effectiveFrom: dateOnlyDaysFromToday(-90),
        effectiveUntil: null,
        createdAt: isoDaysFromToday(-90),
      },
    ],
    medicationScheduleDays: [
      { medicationScheduleId: MEDSCH_NAPROXEN, dayOfWeek: 1 },
      { medicationScheduleId: MEDSCH_NAPROXEN, dayOfWeek: 3 },
      { medicationScheduleId: MEDSCH_NAPROXEN, dayOfWeek: 5 },
    ],
    medicationScheduleTimes: [
      { medicationScheduleId: MEDSCH_SULFASALAZINE, timeOfDay: "08:00" },
      { medicationScheduleId: MEDSCH_NAPROXEN, timeOfDay: "09:00" },
    ],
    medicationAdministrations: buildSeedMedicationAdministrations(),
    injectionTreatments: [
      {
        id: INJ_ETANERCEPT,
        name: "Etanercept",
        dose: "50mg",
        active: true,
        createdAt: isoDaysFromToday(-120),
        updatedAt: isoDaysFromToday(-120),
        archivedAt: null,
      },
    ],
    injectionSchedules: [
      {
        id: INJSCH_ETANERCEPT,
        injectionTreatmentId: INJ_ETANERCEPT,
        intervalDays: 7,
        reminderLeadDays: 1,
        reminderOnScheduledDay: true,
        effectiveFrom: dateOnlyDaysFromToday(-120),
        effectiveUntil: null,
        createdAt: isoDaysFromToday(-120),
      },
    ],
    injectionAdministrations: buildSeedInjectionAdministrations(),
    appointments: [
      {
        id: "seed-appt-rheum-upcoming",
        type: "rheumatology",
        doctorOrInstitution: "Dr. Aylin Demir — City Hospital Rheumatology",
        date: dateOnlyDaysFromToday(10),
        time: "10:30",
        notes: "Bring recent CRP/ESR results",
        reminderLeadDays: 1,
        status: "scheduled",
        createdAt: isoDaysFromToday(-14),
        updatedAt: isoDaysFromToday(-14),
      },
      {
        id: "seed-appt-rheum-past",
        type: "rheumatology",
        doctorOrInstitution: "Dr. Aylin Demir — City Hospital Rheumatology",
        date: dateOnlyDaysFromToday(-75),
        time: "11:00",
        notes: "Follow-up review",
        reminderLeadDays: 1,
        status: "completed",
        createdAt: isoDaysFromToday(-90),
        updatedAt: isoDaysFromToday(-75),
      },
      {
        id: "seed-appt-lab-past",
        type: "laboratory",
        doctorOrInstitution: "City Hospital Lab",
        date: dateOnlyDaysFromToday(-30),
        time: null,
        notes: null,
        reminderLeadDays: 1,
        status: "completed",
        createdAt: isoDaysFromToday(-35),
        updatedAt: isoDaysFromToday(-30),
      },
      {
        id: "seed-appt-other-cancelled",
        type: "other",
        doctorOrInstitution: "Physiotherapy clinic",
        date: dateOnlyDaysFromToday(-5),
        time: "14:00",
        notes: null,
        reminderLeadDays: 1,
        status: "cancelled",
        createdAt: isoDaysFromToday(-10),
        updatedAt: isoDaysFromToday(-6),
      },
    ],
    labResults: [
      {
        id: "seed-lab-crp-1",
        marker: "CRP",
        value: 12.4,
        unit: "mg/L",
        recordedDate: dateOnlyDaysFromToday(-70),
        institution: "City Hospital Lab",
        notes: null,
        createdAt: isoDaysFromToday(-70),
        updatedAt: isoDaysFromToday(-70),
      },
      {
        id: "seed-lab-crp-2",
        marker: "CRP",
        value: 9.1,
        unit: "mg/L",
        recordedDate: dateOnlyDaysFromToday(-40),
        institution: "City Hospital Lab",
        notes: null,
        createdAt: isoDaysFromToday(-40),
        updatedAt: isoDaysFromToday(-40),
      },
      {
        id: "seed-lab-crp-3",
        marker: "CRP",
        value: 6.8,
        unit: "mg/L",
        recordedDate: dateOnlyDaysFromToday(-10),
        institution: "City Hospital Lab",
        notes: null,
        createdAt: isoDaysFromToday(-10),
        updatedAt: isoDaysFromToday(-10),
      },
      {
        id: "seed-lab-esr-1",
        marker: "ESR",
        value: 28,
        unit: "mm/hr",
        recordedDate: dateOnlyDaysFromToday(-70),
        institution: "City Hospital Lab",
        notes: null,
        createdAt: isoDaysFromToday(-70),
        updatedAt: isoDaysFromToday(-70),
      },
      {
        id: "seed-lab-esr-2",
        marker: "ESR",
        value: 22,
        unit: "mm/hr",
        recordedDate: dateOnlyDaysFromToday(-40),
        institution: "City Hospital Lab",
        notes: null,
        createdAt: isoDaysFromToday(-40),
        updatedAt: isoDaysFromToday(-40),
      },
      {
        id: "seed-lab-esr-3",
        marker: "ESR",
        value: 15,
        unit: "mm/hr",
        recordedDate: dateOnlyDaysFromToday(-10),
        institution: "City Hospital Lab",
        notes: null,
        createdAt: isoDaysFromToday(-10),
        updatedAt: isoDaysFromToday(-10),
      },
    ],
    labReminders: [
      {
        id: "seed-labreminder-1",
        label: "3-month CRP/ESR recheck",
        marker: null,
        dueDate: dateOnlyDaysFromToday(20),
        reminderLeadDays: 3,
        status: "pending",
        createdAt: isoDaysFromToday(-10),
        updatedAt: isoDaysFromToday(-10),
      },
    ],
    dailyCheckIns: checkInRows,
    checkInBodyAreas: checkInBodyAreaRows,
    scheduledNotifications: [],
    onboardingState: [
      {
        id: "default",
        completed: true,
        whatToRemember: JSON.stringify(["medications", "injections", "appointments", "symptoms"]),
        completedAt: isoDaysFromToday(-120),
        createdAt: isoDaysFromToday(-120),
        updatedAt: isoDaysFromToday(-120),
      },
    ],
    userPreferences: [
      {
        id: "default",
        languageOverride: null,
        notificationDetailOptIn: false,
        lastKnownTimezone: null,
        createdAt: isoDaysFromToday(-120),
        updatedAt: isoDaysFromToday(-120),
      },
    ],
  };
}

export const webPreviewStore: Store = buildInitialStore();

/** Used only by dataManagementRepository.web.ts's "Delete all local data" mock. */
export function resetWebPreviewStore(): void {
  const fresh = buildInitialStore();
  (Object.keys(fresh) as (keyof Store)[]).forEach((key) => {
    (webPreviewStore[key] as unknown[]).length = 0;
    (webPreviewStore[key] as unknown[]).push(...(fresh[key] as unknown[]));
  });
}

/** Used only by dataManagementRepository.web.ts — clears every table to nothing, matching the native full-reset behavior, without reseeding. */
export function clearWebPreviewStore(): void {
  (Object.keys(webPreviewStore) as (keyof Store)[]).forEach((key) => {
    (webPreviewStore[key] as unknown[]).length = 0;
  });
}
