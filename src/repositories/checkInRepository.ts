import { and, eq, gte, lt } from "drizzle-orm";

import { checkInBodyArea, dailyCheckIn } from "../db/schema";
import type { AppDatabase } from "./types";

export type BodyAreaRegion =
  | "neck"
  | "upper_back"
  | "lower_back"
  | "hips"
  | "shoulders"
  | "chest_ribs"
  | "other";

export type UpsertCheckInInput = {
  id: string;
  date: string;
  pain: number;
  fatigue: number;
  morningStiffnessBucket: "none" | "under_15" | "15_30" | "30_60" | "over_60";
  wellbeing?: number;
  notes?: string;
  flaggedImportant?: boolean;
  /** Product 2.1 Phase W — the High-Symptom Day marker (`src/db/schema/checkIn.ts`'s own doc comment has the full decision). Set only by explicit user action. */
  isHighSymptomDay?: boolean;
  bodyAreas?: BodyAreaRegion[];
};

/**
 * One check-in per calendar day, editable same-day (Tech Arch §D) — an
 * insert that becomes an update when a row for that date already exists,
 * rather than the caller having to look one up first.
 */
export function upsertCheckIn(db: AppDatabase, input: UpsertCheckInInput): void {
  const existing = getCheckInByDate(db, input.date);
  const id = existing?.id ?? input.id;

  db.insert(dailyCheckIn)
    .values({
      id,
      date: input.date,
      pain: input.pain,
      fatigue: input.fatigue,
      morningStiffnessBucket: input.morningStiffnessBucket,
      wellbeing: input.wellbeing,
      notes: input.notes ?? null,
      flaggedImportant: input.flaggedImportant ?? false,
      isHighSymptomDay: input.isHighSymptomDay ?? false,
    })
    .onConflictDoUpdate({
      target: dailyCheckIn.date,
      set: {
        pain: input.pain,
        fatigue: input.fatigue,
        morningStiffnessBucket: input.morningStiffnessBucket,
        wellbeing: input.wellbeing,
        // Explicit `?? null` (not left `undefined`): an update must be able to
        // clear a previously-saved note when the user removes the text and
        // re-saves the same day, not silently retain the old value.
        notes: input.notes ?? null,
        flaggedImportant: input.flaggedImportant ?? false,
        isHighSymptomDay: input.isHighSymptomDay ?? false,
        updatedAt: new Date().toISOString(),
      },
    })
    .run();

  if (input.bodyAreas) {
    db.delete(checkInBodyArea).where(eq(checkInBodyArea.checkInId, id)).run();
    for (const region of input.bodyAreas) {
      db.insert(checkInBodyArea).values({ checkInId: id, region }).run();
    }
  }
}

export function getCheckInByDate(db: AppDatabase, date: string) {
  return db.select().from(dailyCheckIn).where(eq(dailyCheckIn.date, date)).get();
}

export function getBodyAreasForCheckIn(db: AppDatabase, checkInId: string): BodyAreaRegion[] {
  return db
    .select()
    .from(checkInBodyArea)
    .where(eq(checkInBodyArea.checkInId, checkInId))
    .all()
    .map((row) => row.region as BodyAreaRegion);
}

export function getCheckInsInRange(
  db: AppDatabase,
  rangeStartInclusive: string,
  rangeEndExclusive: string,
) {
  return db
    .select()
    .from(dailyCheckIn)
    .where(and(gte(dailyCheckIn.date, rangeStartInclusive), lt(dailyCheckIn.date, rangeEndExclusive)))
    .all();
}

/**
 * Product 2.1 Phase W — every recorded body area across every check-in,
 * with each row's own check-in date attached, so a range-scoped frequency
 * count (`computeBodyAreaFrequency`) never has to N+1-query
 * `getBodyAreasForCheckIn` once per check-in. A genuinely new capability
 * (no existing repository function joins body areas to a date), not a
 * duplicate of anything above.
 */
export function getAllCheckInBodyAreasWithDates(
  db: AppDatabase,
): { date: string; region: BodyAreaRegion }[] {
  return db
    .select({ date: dailyCheckIn.date, region: checkInBodyArea.region })
    .from(checkInBodyArea)
    .innerJoin(dailyCheckIn, eq(checkInBodyArea.checkInId, dailyCheckIn.id))
    .all() as { date: string; region: BodyAreaRegion }[];
}
