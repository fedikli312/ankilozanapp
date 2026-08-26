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

export function getLabResultsByMarker(db: AppDatabase, marker: "CRP" | "ESR") {
  return db.select().from(labResult).where(eq(labResult.marker, marker)).all();
}

export function getAllLabResults(db: AppDatabase) {
  return db.select().from(labResult).all();
}
