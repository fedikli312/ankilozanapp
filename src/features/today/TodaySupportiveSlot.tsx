import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { AccessibleTouchable, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";
import { parseDateOnly } from "@/domain/dateUtils";
import { useKnowledgeArticle } from "@/features/knowledge/useKnowledgeContent";
import { todayDateOnly } from "@/shared/today";

/** The one fixed knowledge candidate for this slot (Phase P brief §6, §25: deterministic/static only, no personalization/inference). */
const FEATURED_KNOWLEDGE_ARTICLE_ID = "morning-stiffness";

/**
 * Today's single supportive-content suggestion — Phase P evolves this from
 * Phase J's one fixed Breathing entry into a **simple date-seeded rotation**
 * between exactly two fixed candidates (Breathing, and one fixed Knowledge
 * article), per the original Redesign Spec §9 intent ("a simple date-seeded
 * rotation through the fixed static list, no personalization logic") that
 * Phase J had simplified to a single item since Breathing was the only
 * candidate content that existed yet. Still exactly one quiet row, still no
 * AI/health-record inference, still positioned below every core action
 * (check-in, medications, injection, appointment) and still on
 * `surfaceSecondary` — never the dominant highlight card. Phase R may later
 * personalize which candidate is favored; this phase does not.
 */
export function TodaySupportiveSlot() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, radius, spacing, typography } = useTheme();
  const knowledgeArticle = useKnowledgeArticle(FEATURED_KNOWLEDGE_ARTICLE_ID);

  const showKnowledge = parseDateOnly(todayDateOnly()).getUTCDate() % 2 === 0 && !!knowledgeArticle;

  const icon = showKnowledge ? knowledgeArticle!.icon : "leaf-outline";
  const title = showKnowledge
    ? t("today.supportiveKnowledge", { title: knowledgeArticle!.title, readTime: knowledgeArticle!.readTime })
    : t("today.supportiveBreathing");

  return (
    <AccessibleTouchable
      onPress={() => (showKnowledge ? router.push(`/knowledge/${knowledgeArticle!.id}`) : router.push("/breathing"))}
      accessibilityRole="button"
      accessibilityLabel={`${t("today.supportiveTitle")}, ${title}`}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.surfaceSecondary,
          borderRadius: radius.standard,
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
          marginBottom: spacing.md,
          gap: spacing.sm,
        }}
      >
        <Ionicons name={icon} size={18} color={colors.textSecondary} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary }}>{t("today.supportiveTitle")}</Text>
          <Text style={{ fontSize: typography.body.fontSize, color: colors.textPrimary }}>{title}</Text>
        </View>
        <Text style={{ fontSize: 18, color: colors.textSecondary }} accessibilityElementsHidden>
          {"›"}
        </Text>
      </View>
    </AccessibleTouchable>
  );
}
