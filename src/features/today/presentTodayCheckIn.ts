export type StiffnessBucket = "none" | "under_15" | "15_30" | "30_60" | "over_60";

export type TodayCheckInInput =
  | {
      pain: number;
      fatigue: number;
      morningStiffnessBucket: StiffnessBucket;
      isHighSymptomDay: boolean;
    }
  | null
  | undefined;

export type TodayCheckInPresentation =
  | {
      status: "incomplete";
      /** Yesterday's own recorded pain value, for the "Yesterday: Pain X/10" context line — `null` when there is no prior entry, never today's own value (Redesign Spec §9). */
      yesterdayPain: number | null;
    }
  | {
      status: "complete";
      pain: number;
      fatigue: number;
      morningStiffnessBucket: StiffnessBucket;
      /** Whether to show the High-Symptom Day marker line — true only when the user explicitly recorded it today (Product 2.1 Phase Y semantics, unchanged). */
      isHighSymptomDay: boolean;
    };

/**
 * Today's check-in module has exactly two states (Design System 2.0, Phase
 * Design-D §3/§4) — pure so both are directly testable without a
 * component or database. Takes the already-fetched rows (not a repository
 * call) so it stays a plain function, consistent with every other
 * presenter in this codebase.
 */
export function presentTodayCheckIn(
  todaysCheckIn: TodayCheckInInput,
  yesterdayCheckIn: { pain: number } | null | undefined,
): TodayCheckInPresentation {
  if (todaysCheckIn) {
    return {
      status: "complete",
      pain: todaysCheckIn.pain,
      fatigue: todaysCheckIn.fatigue,
      morningStiffnessBucket: todaysCheckIn.morningStiffnessBucket,
      isHighSymptomDay: todaysCheckIn.isHighSymptomDay,
    };
  }
  return { status: "incomplete", yesterdayPain: yesterdayCheckIn?.pain ?? null };
}
