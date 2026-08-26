import { isWithinRange } from "../dateUtils";
import type { ScheduleVersion } from "./types";

/**
 * Returns whichever schedule version's `[effectiveFrom, effectiveUntil)`
 * range contains `date`. This is the single function historical
 * regeneration/display must call — it must never substitute "the current
 * schedule" for a past date (Tech Arch §F invariant 3).
 */
export function resolveEffectiveSchedule<T extends ScheduleVersion>(
  versions: readonly T[],
  date: string,
): T | undefined {
  return versions.find((version) =>
    isWithinRange(date, version.effectiveFrom, version.effectiveUntil ?? "9999-12-31"),
  );
}
