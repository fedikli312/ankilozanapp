export const INSIGHT_METRICS = [
  "pain",
  "stiffness",
  "fatigue",
  "medicationAdherence",
  "injectionHistory",
  "crp",
  "esr",
] as const;

export type InsightMetricKey = (typeof INSIGHT_METRICS)[number];
