import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { AccessibleTouchable, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";
import { parseDateOnly } from "@/domain/dateUtils";
import { useKnowledgeArticle } from "@/features/knowledge/useKnowledgeContent";
import { getKnowledgeRecommendation } from "@/personalization/getKnowledgeRecommendation";
import { usePersonalizationProfile } from "@/personalization/usePersonalizationProfile";
import { todayDateOnly } from "@/shared/today";

/** The one fixed knowledge candidate this slot falls back to when nothing more specific applies (Phase P brief §6, §25: deterministic/static only, no health-record inference — still true after Phase R's goal/priority-symptom layer on top). */
const FEATURED_KNOWLEDGE_ARTICLE_ID = "morning-stiffness";

/**
 * Today's single supportive-content suggestion — Phase P introduced a
 * simple date-seeded rotation between exactly two fixed candidates
 * (Breathing, and one fixed Knowledge article). Phase R adds one more
 * deterministic layer on top, via `getKnowledgeRecommendation` (Phase R
 * brief §17/§18): an explicit "learn about AS" goal always favors
 * Knowledge over Breathing, and failing that, an explicit priority symptom
 * with a genuinely matching article (stiffness/pain/fatigue) is shown
 * instead of the fixed featured one. With no goals or priority symptoms at
 * all, behavior is byte-identical to before Phase R — still exactly one
 * quiet row.
 *
 * Design System 2.0, Phase Design-D §7/§23: no filled/bordered box, no
 * decorative icon (the previous `leaf-outline` was exactly the generic
 * wellness glyph the icon rules retire) — a plain text row, subordinate by
 * typography weight/color alone, matching Today's card-free composition.
 * Article-specific icons (`knowledgeArticle.icon`) are also dropped here
 * for the same reason: this row's job is a single subordinate suggestion,
 * not a second icon-menu entry.
 */
export function TodaySupportiveSlot() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, spacing, typography } = useTheme();
  const profile = usePersonalizationProfile();
  const dateRotationPrefersKnowledge = parseDateOnly(todayDateOnly()).getUTCDate() % 2 === 0;
  const recommendation = getKnowledgeRecommendation(profile, {
    defaultArticleId: FEATURED_KNOWLEDGE_ARTICLE_ID,
    dateRotationPrefersKnowledge,
  });
  const knowledgeArticle = useKnowledgeArticle(recommendation.kind === "knowledge" ? recommendation.articleId : undefined);

  const showKnowledge = recommendation.kind === "knowledge" && !!knowledgeArticle;

  const title = showKnowledge
    ? t("today.supportiveKnowledge", { title: knowledgeArticle!.title, readTime: knowledgeArticle!.readTime })
    : t("today.supportiveBreathing");

  return (
    <AccessibleTouchable
      onPress={() => (showKnowledge ? router.push(`/knowledge/${knowledgeArticle!.id}`) : router.push("/breathing"))}
      accessibilityRole="button"
      accessibilityLabel={`${t("today.supportiveTitle")}, ${title}`}
    >
      <View style={{ paddingVertical: spacing.xs }}>
        <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary }}>{t("today.supportiveTitle")}</Text>
        <Text style={{ fontSize: typography.body.fontSize, color: colors.textPrimary }}>{title}</Text>
      </View>
    </AccessibleTouchable>
  );
}
