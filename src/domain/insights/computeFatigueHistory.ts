import { computeNumericCheckInTrend, type CheckInForTrend } from "./numericCheckInTrend";
import type { DateRange, NumericTrend } from "./types";

export type CheckInForFatigue = CheckInForTrend & { fatigue: number };

export function computeFatigueHistory(
  checkIns: readonly CheckInForFatigue[],
  range: DateRange,
): NumericTrend {
  return computeNumericCheckInTrend(checkIns, range, (c) => c.fatigue);
}
