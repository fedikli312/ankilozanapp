import type { OnboardingGoal } from "@/features/onboarding/onboardingDraft";

import { hasGoal, orderByGoalPriority } from "./goalMapping";
import type { PersonalizationProfile } from "./types";

/**
 * Today's reorderable sections (Phase R brief §8). Deliberately excludes
 * the check-in card and the due/urgent medication row — those never move:
 * "urgency/state still beats preference... do not reorder an overdue/due
 * medication below optional content." They stay structurally fixed at the
 * top of Today's JSX, outside this function's input entirely, so there is
 * no code path that could reorder them even by mistake.
 */
export type TodayTier2SectionId = "nextInjection" | "upcomingAppointment" | "supportiveSlot" | "recentSummary";

/** The exact order Today already renders these in today — reproducing it with zero goals selected is what makes "no personalization → neutral fallback" hold for existing users. */
const TIER2_DEFAULT_ORDER: TodayTier2SectionId[] = ["nextInjection", "upcomingAppointment", "supportiveSlot", "recentSummary"];

const TIER2_GOAL_OF: Record<TodayTier2SectionId, OnboardingGoal | null> = {
  nextInjection: "treatment",
  upcomingAppointment: "appointments",
  supportiveSlot: "knowledge",
  recentSummary: "trends",
};

export type TodayPersonalization = {
  tier2Order: TodayTier2SectionId[];
  /** The one tier2 section actually moved to the front by an explicit goal match — `null` when the order equals the default, so a "Senin için" cue (used sparingly, brief §22) is shown at most once and only when something real changed. */
  promotedSection: TodayTier2SectionId | null;
  /** The symptom-tracking goal's one real Today effect beyond the check-in card's already-fixed first position: a subtle "view symptom history" shortcut once today's check-in is complete (brief §21). */
  showSymptomHistoryShortcut: boolean;
  /** Makes "Randevuya hazırlan" more discoverable directly on Today's upcoming-appointment row when the appointment-prep goal is selected (brief §19) — never a duplicate giant CTA, just one extra text link. */
  emphasizeAppointmentPrep: boolean;
};

export function getTodayPriorityOrder(profile: PersonalizationProfile): TodayPersonalization {
  const tier2Order = orderByGoalPriority(TIER2_DEFAULT_ORDER, profile, (id) => TIER2_GOAL_OF[id]);

  return {
    tier2Order,
    promotedSection: tier2Order[0] !== TIER2_DEFAULT_ORDER[0] ? tier2Order[0] : null,
    showSymptomHistoryShortcut: hasGoal(profile, "symptoms"),
    emphasizeAppointmentPrep: hasGoal(profile, "appointments"),
  };
}
