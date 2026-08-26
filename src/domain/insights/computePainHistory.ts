import { computeNumericCheckInTrend, type CheckInForTrend } from "./numericCheckInTrend";
import type { DateRange, NumericTrend } from "./types";

export type CheckInForPain = CheckInForTrend & { pain: number };

export function computePainHistory(
  checkIns: readonly CheckInForPain[],
  range: DateRange,
): NumericTrend {
  return computeNumericCheckInTrend(checkIns, range, (c) => c.pain);
}
