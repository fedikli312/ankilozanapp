export type DateRange = {
  /** Inclusive. */
  rangeStart: string;
  /** Exclusive. */
  rangeEnd: string;
};

export type TrendDirection = "up" | "down" | "flat";

export type NumericTrend = {
  average: number;
  previousPeriodAverage: number | null;
  direction: TrendDirection | null;
  dataPoints: number;
  sufficientData: boolean;
};
