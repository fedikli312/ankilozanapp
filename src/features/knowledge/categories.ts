import type Ionicons from "@expo/vector-icons/Ionicons";

import type { KnowledgeCategoryId } from "./types";

type IconName = keyof typeof Ionicons.glyphMap;

/**
 * Fixed category order for the Knowledge Hub landing (Phase P brief §7).
 * Labels are short chrome strings, so they go through the normal
 * `knowledge.category.*` localization keys rather than the typed content
 * files — only long-form article prose lives outside `translate()`.
 */
export const KNOWLEDGE_CATEGORIES: { id: KnowledgeCategoryId; icon: IconName; labelKey: string }[] = [
  { id: "basics", icon: "book-outline", labelKey: "knowledge.category.basics" },
  { id: "symptoms", icon: "pulse-outline", labelKey: "knowledge.category.symptoms" },
  { id: "treatment", icon: "medical-outline", labelKey: "knowledge.category.treatment" },
  { id: "dailyLife", icon: "walk-outline", labelKey: "knowledge.category.dailyLife" },
  { id: "appointmentPrep", icon: "calendar-outline", labelKey: "knowledge.category.appointmentPrep" },
];
