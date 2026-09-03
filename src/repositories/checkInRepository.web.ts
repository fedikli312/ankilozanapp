/**
 * Dev-web-preview-only mock — see src/repositories/web/store.ts. Mirrors
 * checkInRepository.ts's exported signatures exactly; native builds never
 * load this file (Metro `.web.ts` platform resolution).
 */
import { webPreviewStore, type BodyAreaRegion } from "./web/store";

export type { BodyAreaRegion };

export type UpsertCheckInInput = {
  id: string;
  date: string;
  pain: number;
  fatigue: number;
  morningStiffnessBucket: "none" | "under_15" | "15_30" | "30_60" | "over_60";
  wellbeing?: number;
  notes?: string;
  flaggedImportant?: boolean;
  /** Product 2.1 Phase W — the High-Symptom Day marker. See `checkInRepository.ts`. */
  isHighSymptomDay?: boolean;
  bodyAreas?: BodyAreaRegion[];
};

export function upsertCheckIn(_db: unknown, input: UpsertCheckInInput): void {
  const now = new Date().toISOString();
  const existing = getCheckInByDate(_db, input.date);
  const id = existing?.id ?? input.id;

  if (existing) {
    existing.pain = input.pain;
    existing.fatigue = input.fatigue;
    existing.morningStiffnessBucket = input.morningStiffnessBucket;
    existing.wellbeing = input.wellbeing ?? null;
    existing.notes = input.notes ?? null;
    existing.flaggedImportant = input.flaggedImportant ?? false;
    existing.isHighSymptomDay = input.isHighSymptomDay ?? false;
    existing.updatedAt = now;
  } else {
    webPreviewStore.dailyCheckIns.push({
      id,
      date: input.date,
      pain: input.pain,
      fatigue: input.fatigue,
      morningStiffnessBucket: input.morningStiffnessBucket,
      wellbeing: input.wellbeing ?? null,
      notes: input.notes ?? null,
      flaggedImportant: input.flaggedImportant ?? false,
      isHighSymptomDay: input.isHighSymptomDay ?? false,
      createdAt: now,
      updatedAt: now,
    });
  }

  if (input.bodyAreas) {
    webPreviewStore.checkInBodyAreas = webPreviewStore.checkInBodyAreas.filter(
      (b) => b.checkInId !== id,
    );
    for (const region of input.bodyAreas) {
      webPreviewStore.checkInBodyAreas.push({ checkInId: id, region });
    }
  }
}

export function getCheckInByDate(_db: unknown, date: string) {
  return webPreviewStore.dailyCheckIns.find((c) => c.date === date);
}

export function getBodyAreasForCheckIn(_db: unknown, checkInId: string): BodyAreaRegion[] {
  return webPreviewStore.checkInBodyAreas
    .filter((b) => b.checkInId === checkInId)
    .map((b) => b.region);
}

export function getCheckInsInRange(
  _db: unknown,
  rangeStartInclusive: string,
  rangeEndExclusive: string,
) {
  return webPreviewStore.dailyCheckIns.filter(
    (c) => c.date >= rangeStartInclusive && c.date < rangeEndExclusive,
  );
}

/** Mirrors `checkInRepository.ts`'s join, over the in-memory mock store. */
export function getAllCheckInBodyAreasWithDates(
  _db: unknown,
): { date: string; region: BodyAreaRegion }[] {
  return webPreviewStore.checkInBodyAreas
    .map((b) => {
      const checkIn = webPreviewStore.dailyCheckIns.find((c) => c.id === b.checkInId);
      return checkIn ? { date: checkIn.date, region: b.region } : null;
    })
    .filter((row): row is { date: string; region: BodyAreaRegion } => row !== null);
}
