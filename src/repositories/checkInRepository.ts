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
      notes: input.notes,
      flaggedImportant: input.flaggedImportant ?? false,
    })
    .onConflictDoUpdate({
      target: dailyCheckIn.date,
      set: {
        pain: input.pain,
        fatigue: input.fatigue,
        morningStiffnessBucket: input.morningStiffnessBucket,
        wellbeing: input.wellbeing,
        notes: input.notes,
        flaggedImportant: input.flaggedImportant ?? false,
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
