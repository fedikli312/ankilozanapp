import { eq } from "drizzle-orm";

import { labResult } from "../db/schema";
import type { AppDatabase } from "./types";

export type CreateLabResultInput = {
  id: string;
  marker: "CRP" | "ESR";
  value: number;
  unit: string;
  recordedDate: string;
  institution?: string;
  notes?: string;
};

export function createLabResult(db: AppDatabase, input: CreateLabResultInput): void {
  db.insert(labResult).values(input).run();
}

export type UpdateLabResultInput = {
  value?: number;
  unit?: string;
  recordedDate?: string;
  institution?: string | null;
  notes?: string | null;
};

/**
 * Unlike medication/injection administrations, a lab result is a
 * user-entered fact (not a scheduling commitment) — corrigible like any
 * other user-entered field, so plain edit/delete apply (UX spec §I "edit/
 * delete behavior per approved data rules" — labs have no historical-
 * accuracy immutability rule to preserve).
 */
export function updateLabResult(db: AppDatabase, id: string, patch: UpdateLabResultInput): void {
  db.update(labResult)
    .set({ ...patch, updatedAt: new Date().toISOString() })
    .where(eq(labResult.id, id))
    .run();
}

export function deleteLabResult(db: AppDatabase, id: string): void {
  db.delete(labResult).where(eq(labResult.id, id)).run();
}

export function getLabResultById(db: AppDatabase, id: string) {
  return db.select().from(labResult).where(eq(labResult.id, id)).get();
}

export function getLabResultsByMarker(db: AppDatabase, marker: "CRP" | "ESR") {
  return db
    .select()
    .from(labResult)
    .where(eq(labResult.marker, marker))
    .all()
    .sort((a, b) => b.recordedDate.localeCompare(a.recordedDate));
}

export function getAllLabResults(db: AppDatabase) {
  return db.select().from(labResult).all();
}
