import type Ionicons from "@expo/vector-icons/Ionicons";

import type { OnboardingGoal, PrioritySymptom } from "./onboardingDraft";
import type { TreatmentContext } from "../../repositories/onboardingStateRepository";

type IconName = keyof typeof Ionicons.glyphMap;

/**
 * Single source of truth for which icon represents which personalization
 * concept — imported by every screen/summary that renders a goal, priority
 * symptom, or treatment-context option, so the same concept never gets two
 * different glyphs across screens (Phase K established an icon-consistency
 * scan for exactly this class of drift; Product 2.0 spec §20 extends the
 * same discipline to these new concepts).
 */
export const GOAL_ICONS: Record<OnboardingGoal, IconName> = {
  symptoms: "pulse-outline",
  treatment: "medical-outline",
  trends: "trending-up-outline",
  appointments: "calendar-outline",
  knowledge: "book-outline",
};

export const PRIORITY_SYMPTOM_ICONS: Record<PrioritySymptom, IconName> = {
  pain: "body-outline",
  stiffness: "time-outline",
  fatigue: "battery-half-outline",
  wellbeing: "sunny-outline",
};

/**
 * Medication and injection deliberately use different glyphs here (Furkan's
 * Phase N follow-up) so the Treatment Context selector's two treatment
 * options are visually distinguishable, not just distinguishable by label.
 * Ionicons has no syringe/needle glyph as of the version installed in this
 * project (checked directly against
 * node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/Ionicons.json
 * — no `syringe`/`needle`/`inject*` entry exists). `flask-outline` is the
 * closest distinct existing medical glyph for "biologic/injectable
 * treatment" (matches the injection option's own label wording, "Enjeksiyon
 * / biyolojik tedavi") without inventing a new dependency or asset. Labels
 * still carry the full semantic meaning on their own either way — this is
 * a visual-scan improvement, not a load-bearing one (Redesign Spec §2.6:
 * "the icon never carries the semantic meaning alone").
 */
export const TREATMENT_CONTEXT_ICONS: Record<TreatmentContext, IconName> = {
  medication: "medical-outline",
  injection: "flask-outline",
  both: "layers-outline",
  none: "pause-circle-outline",
};
