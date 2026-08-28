import { eq } from "drizzle-orm";

import { injectionTreatment } from "../db/schema";
import type { AppDatabase } from "./types";

export type CreateInjectionTreatmentInput = {
  id: string;
  name: string;
  dose: string;
};

export function createInjectionTreatment(db: AppDatabase, input: CreateInjectionTreatmentInput): void {
  db.insert(injectionTreatment).values(input).run();
}

export function archiveInjectionTreatment(db: AppDatabase, id: string, archivedAt: string): void {
  db.update(injectionTreatment)
    .set({ active: false, archivedAt, updatedAt: new Date().toISOString() })
    .where(eq(injectionTreatment.id, id))
    .run();
}

export function getInjectionTreatmentById(db: AppDatabase, id: string) {
  return db.select().from(injectionTreatment).where(eq(injectionTreatment.id, id)).get();
}

export function getActiveInjectionTreatments(db: AppDatabase) {
  return db.select().from(injectionTreatment).where(eq(injectionTreatment.active, true)).all();
}

/** Active and archived — Insights/Appointment Preparation history must still include a discontinued treatment's own record. */
export function getAllInjectionTreatments(db: AppDatabase) {
  return db.select().from(injectionTreatment).all();
}
