import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams } from "expo-router";
import { Linking, Text, View } from "react-native";

import { AccessibleTouchable, ScreenContainer, SectionLabel, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";
import { useKnowledgeArticle } from "@/features/knowledge/useKnowledgeContent";

/**
 * Knowledge Hub article detail (Product 2.0 Phase P, spec §9, §17-19).
 * Hero -> key points -> short sections -> optional tip -> sources -> review
 * date -> a brief, non-alarming disclaimer (this screen is reachable
 * directly by deep link, so it carries its own short notice rather than
 * relying solely on the landing screen's). Read-only: no completion state,
 * no bookmark, nothing persisted (spec §23).
 */
export default function KnowledgeArticleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { colors, typography, spacing, radius } = useTheme();
  const article = useKnowledgeArticle(id);

  if (!article) {
    return (
      <ScreenContainer>
        <Text style={{ fontSize: typography.body.fontSize, color: colors.textSecondary }}>{t("knowledge.notFound")}</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll>
      <View style={{ alignItems: "flex-start", marginBottom: spacing.md }}>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: radius.small,
            backgroundColor: colors.surfaceHighlight,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: spacing.sm,
          }}
        >
          <Ionicons name={article.icon} size={24} color={colors.accent} />
        </View>
        <Text
          style={{
            fontSize: typography.title.fontSize,
            fontWeight: typography.title.fontWeight,
            color: colors.textPrimary,
            marginBottom: spacing.xxs,
          }}
        >
          {article.title}
        </Text>
        <Text style={{ fontSize: typography.body.fontSize, color: colors.textSecondary }}>
          {article.summary} · {article.readTime}
        </Text>
      </View>

      <View style={{ marginBottom: spacing.lg }}>
        <SectionLabel>{t("knowledge.keyPointsLabel")}</SectionLabel>
        {article.keyPoints.map((point) => (
          <View key={point} style={{ flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, marginBottom: spacing.xs }}>
            <Ionicons name="checkmark-circle-outline" size={18} color={colors.accent} style={{ marginTop: 1 }} accessibilityElementsHidden />
            <Text style={{ flex: 1, fontSize: typography.body.fontSize, color: colors.textPrimary }}>{point}</Text>
          </View>
        ))}
      </View>

      {article.sections.map((section) => (
        <View key={section.heading} style={{ marginBottom: spacing.md }}>
          <Text style={{ fontSize: typography.headline.fontSize, fontWeight: typography.headline.fontWeight, color: colors.textPrimary, marginBottom: spacing.xxs }}>
            {section.heading}
          </Text>
          <Text style={{ fontSize: typography.body.fontSize, color: colors.textPrimary, lineHeight: 22 }}>{section.body}</Text>
        </View>
      ))}

      {article.tip ? (
        <View
          style={{
            backgroundColor: colors.surfaceHighlight,
            borderRadius: radius.standard,
            padding: spacing.md,
            marginBottom: spacing.lg,
          }}
        >
          <Text style={{ fontSize: typography.caption.fontSize, fontWeight: "600", color: colors.accent, marginBottom: spacing.xxs }}>
            {article.tip.heading}
          </Text>
          <Text style={{ fontSize: typography.body.fontSize, color: colors.textPrimary }}>{article.tip.body}</Text>
        </View>
      ) : null}

      <View style={{ marginBottom: spacing.md }}>
        <SectionLabel>{t("knowledge.sourcesLabel")}</SectionLabel>
        {article.sources.map((source) => (
          <AccessibleTouchable
            key={source.url}
            onPress={() => Linking.openURL(source.url)}
            accessibilityRole="link"
            accessibilityLabel={t("knowledge.openSource", { organization: source.organization, title: source.title })}
            style={{ paddingVertical: spacing.xs }}
          >
            <Text style={{ fontSize: typography.body.fontSize, color: colors.textPrimary }}>{source.organization}</Text>
            <Text style={{ fontSize: typography.caption.fontSize, color: colors.accent }}>{source.title}</Text>
          </AccessibleTouchable>
        ))}
        <Text style={{ fontSize: typography.micro.fontSize, color: colors.textSecondary, marginTop: spacing.xs }}>
          {t("knowledge.reviewedLabel", { date: article.reviewedAt })}
        </Text>
      </View>

      <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, fontStyle: "italic" }}>
        {t("knowledge.disclaimer")}
      </Text>
    </ScreenContainer>
  );
}
