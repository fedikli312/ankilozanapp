import { planMedicationAdministrationGeneration } from "../../domain/scheduling";
import type { MedicationScheduleVersion } from "../../domain/scheduling/types";
import {
  createPendingAdministrations,
  getAdministrationsForMedication,
  type AppDatabase,
} from "../../repositories";
import { generateId } from "../../shared/id";
import { todayDateOnly } from "../../shared/today";

/**
 * Tops up the bounded window of "pending" administration rows for one
 * medication (PRD §5 activation requirement — Today must reflect the next
 * expected dose without waiting for accumulated history). Idempotent: never
 * duplicates a date/time pair that already has a row.
 */
export function generateDueAdministrations(
  db: AppDatabase,
  medicationId: string,
  schedule: MedicationScheduleVersion,
  daysOfWeek: number[],
  timesOfDay: string[],
): void {
  const existingScheduledFor = getAdministrationsForMedication(db, medicationId).map(
    (administration) => administration.scheduledFor,
  );

  const planned = planMedicationAdministrationGeneration({
    schedule,
    daysOfWeek,
    timesOfDay,
    existingScheduledFor,
    today: todayDateOnly(),
  });

  createPendingAdministrations(
    db,
    planned.map((scheduledFor) => ({
      id: generateId(),
      medicationId,
      medicationScheduleId: schedule.id,
      scheduledFor,
    })),
  );
}
