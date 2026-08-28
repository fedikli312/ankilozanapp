import { eq } from "drizzle-orm";

import { medication } from "../db/schema";
import type { AppDatabase } from "./types";

export type CreateMedicationInput = {
  id: string;
  name: string;
  dose: string;
  notes?: string;
};

export function createMedication(db: AppDatabase, input: CreateMedicationInput): void {
  db.insert(medication)
    .values({ id: input.id, name: input.name, dose: input.dose, notes: input.notes })
    .run();
}

export function updateMedicationDetails(
  db: AppDatabase,
  id: string,
  patch: { name?: string; dose?: string; notes?: string | null },
): void {
  db.update(medication)
    .set({ ...patch, updatedAt: new Date().toISOString() })
    .where(eq(medication.id, id))
    .run();
}

/** Archiving never deletes (Tech Arch §F) — stops future scheduling only. */
export function archiveMedication(db: AppDatabase, id: string, archivedAt: string): void {
  db.update(medication)
    .set({ active: false, archivedAt, updatedAt: new Date().toISOString() })
    .where(eq(medication.id, id))
    .run();
}

export function getMedicationById(db: AppDatabase, id: string) {
  return db.select().from(medication).where(eq(medication.id, id)).get();
}

export function getActiveMedications(db: AppDatabase) {
  return db.select().from(medication).where(eq(medication.active, true)).all();
}

/** Active and archived — Insights/Appointment Preparation history must still include a discontinued medication's own record. */
export function getAllMedications(db: AppDatabase) {
  return db.select().from(medication).all();
}
