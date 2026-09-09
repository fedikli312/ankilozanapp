import type Ionicons from "@expo/vector-icons/Ionicons";

import type { OnboardingGoal } from "./onboardingDraft";

type IconName = keyof typeof Ionicons.glyphMap;

/**
 * Single source of truth for which icon represents which goal — imported
 * by the paywall's value pillars, the one remaining place a goal is shown
 * with a leading icon (Design-C retired the onboarding-wide icon+card
 * template these icons used to serve; `GOAL_ICONS` itself stays, since the
 * paywall's short benefit list is a genuinely different, single-screen use
 * of an icon, not a repeated per-step template).
 */
export const GOAL_ICONS: Record<OnboardingGoal, IconName> = {
  symptoms: "pulse-outline",
  treatment: "medical-outline",
  trends: "trending-up-outline",
  appointments: "calendar-outline",
  knowledge: "book-outline",
};
