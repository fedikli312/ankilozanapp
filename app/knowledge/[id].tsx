import { useLocalSearchParams } from "expo-router";
import { Linking, Text, View } from "react-native";

import { AccessibleTouchable, Hairline, ScreenContainer, SectionLabel, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";
import { useKnowledgeArticle } from "@/features/knowledge/useKnowledgeContent";

/**
 * Knowledge article detail — Design-H (brief §7). Prioritizes reading: a
 * clear title, concise context, comfortable measure, meaningful headings,
 * open document composition, calm source attribution. The decorative
 * hero icon box was removed (brief §7: "avoid... decorative medical
 * icons... giant hero treatments") — the title itself is the header now.
 * Key points lost their per-item checkmark glyphs for the same reason;
 * the tip callout keeps its one restrained `selected`-tint surface (the
 * article's one legitimate emphasis moment) but no longer colors its own
 * heading text in the accent — "excessive accent color" (brief §7) is the
 * thing being trimmed, not the callout's existence. Read-only: no
 * completion state, no bookmark, nothing persisted — unchanged. No
 * medical meaning changed — presentation only.
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
      <View style={{ marginBottom: spacing.lg }}>
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
          <Text key={point} style={{ fontSize: typography.body.fontSize, color: colors.textPrimary, lineHeight: 22, marginBottom: spacing.xxs }}>
            {"—  "}
            {point}
          </Text>
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
            backgroundColor: colors.selected,
            borderRadius: radius.standard,
            padding: spacing.md,
            marginBottom: spacing.lg,
          }}
        >
          <Text style={{ fontSize: typography.caption.fontSize, fontWeight: "600", color: colors.textPrimary, marginBottom: spacing.xxs }}>
            {article.tip.heading}
          </Text>
          <Text style={{ fontSize: typography.body.fontSize, color: colors.textPrimary }}>{article.tip.body}</Text>
        </View>
      ) : null}

      <View style={{ marginBottom: spacing.md }}>
        <SectionLabel>{t("knowledge.sourcesLabel")}</SectionLabel>
        {article.sources.map((source, index) => (
          <View key={source.url}>
            {index > 0 ? <Hairline /> : null}
            <AccessibleTouchable
              onPress={() => Linking.openURL(source.url)}
              accessibilityRole="link"
              accessibilityLabel={t("knowledge.openSource", { organization: source.organization, title: source.title })}
              style={{ paddingVertical: spacing.xs }}
            >
              <Text style={{ fontSize: typography.body.fontSize, color: colors.textPrimary }}>{source.organization}</Text>
              <Text style={{ fontSize: typography.caption.fontSize, color: colors.brandPrimary }}>{source.title}</Text>
            </AccessibleTouchable>
          </View>
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
