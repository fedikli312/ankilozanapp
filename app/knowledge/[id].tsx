import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { Animated, Linking, Text, View } from "react-native";

import { AccessibleTouchable, Hairline, HeroBloom, ScreenContainer, SectionLabel, SpineConcept, useReducedMotion, useTheme } from "@/design-system";
import type { HeroBloomVariant } from "@/design-system/illustrations/HeroBloom";
import { motion } from "@/design-system/tokens/motion";
import { useTranslation } from "@/localization";
import { useKnowledgeArticle } from "@/features/knowledge/useKnowledgeContent";
import { KNOWLEDGE_CATEGORIES } from "@/features/knowledge/categories";

const HERO_HEIGHT = 96;
const INLINE_VISUAL_SIZE = 148;

/** The one article this pass built a content-specific inline illustration for — see `docs/VISUAL_ART_DIRECTION_3_0.md` §8. Every other article still gets the generic `HeroBloom` hero, just no inline diagram. */
const ARTICLE_WITH_INLINE_VISUAL = "what-is-as";

/**
 * Controlled hero-composition variation across the twelve articles
 * (`docs/VISUAL_ART_DIRECTION_3_0_PROPAGATION.md` §7): one `HeroBloom`
 * primitive, but its crop/accent placement is chosen by the article's
 * category so a reader moving between articles doesn't see the identical
 * picture every time. Deterministic (same article → same hero, always),
 * and still only three compositions total — not a bespoke illustration
 * per article, which the brief explicitly deferred.
 */
const CATEGORY_HERO_VARIANT: Record<string, HeroBloomVariant> = {
  basics: "bloom",
  symptoms: "drift",
  treatment: "dawn",
  dailyLife: "drift",
  appointmentPrep: "bloom",
};
/** Which section heading the inline visual follows — the one that actually names the sacroiliac region in prose, so the illustration adds no claim beyond the article's own reviewed text. */
const INLINE_VISUAL_AFTER_SECTION_INDEX = 0;

/**
 * Knowledge article detail — Art Direction 3.0 (`docs/VISUAL_ART_DIRECTION_3_0.md`
 * §17/§27). The prior version already prioritized reading (comfortable
 * measure, real headings, calm sources) — this pass adds the visual
 * storytelling layer the brief asked for on top of that same reading
 * experience, not instead of it: a quiet illustrated hero (every article),
 * one content-justified inline diagram (only where the article's own text
 * already names that anatomy), a real editorial standfirst, and a
 * restrained fade/translate entrance. No medical meaning changed —
 * presentation only, same content, same sources, same disclaimer.
 */
export default function KnowledgeArticleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { colors, typography, spacing, radius } = useTheme();
  const reducedMotion = useReducedMotion();
  const article = useKnowledgeArticle(id);
  const [heroWidth, setHeroWidth] = useState(0);

  const [contentEnter] = useState(() => new Animated.Value(reducedMotion ? 0 : 12));
  const [contentOpacity] = useState(() => new Animated.Value(reducedMotion ? 1 : 0));
  useEffect(() => {
    if (reducedMotion) {
      contentEnter.setValue(0);
      contentOpacity.setValue(1);
      return;
    }
    Animated.parallel([
      Animated.timing(contentOpacity, { toValue: 1, duration: motion.contentEnter.maxMs, useNativeDriver: true }),
      Animated.timing(contentEnter, { toValue: 0, duration: motion.contentEnter.maxMs, useNativeDriver: true }),
    ]).start();
    // Fires once on mount — a later reducedMotion toggle should not replay the entrance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!article) {
    return (
      <ScreenContainer>
        <Text style={{ fontSize: typography.body.fontSize, color: colors.textSecondary }}>{t("knowledge.notFound")}</Text>
      </ScreenContainer>
    );
  }

  const categoryLabelKey = KNOWLEDGE_CATEGORIES.find((c) => c.id === article.category)?.labelKey;
  const heroVariant: HeroBloomVariant = CATEGORY_HERO_VARIANT[article.category] ?? "bloom";

  return (
    <ScreenContainer scroll>
      {/* Hero — every article gets this same quiet illustrated atmosphere (Art Direction 3.0's one universal, reusable hero, not a new asset per article). */}
      <View
        onLayout={(e) => setHeroWidth(e.nativeEvent.layout.width)}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={{ height: HERO_HEIGHT, marginBottom: spacing.md, borderRadius: radius.large, overflow: "hidden", backgroundColor: colors.surfaceSecondary }}
      >
        {heroWidth > 0 ? <HeroBloom width={heroWidth} height={HERO_HEIGHT} variant={heroVariant} /> : null}
      </View>

      <Animated.View style={{ opacity: contentOpacity, transform: [{ translateY: contentEnter }] }}>
        {categoryLabelKey ? (
          <Text style={{ fontSize: typography.caption.fontSize, color: colors.brandPrimary, fontWeight: "600", marginBottom: spacing.xxs }}>
            {t(categoryLabelKey)} · {article.readTime}
          </Text>
        ) : null}

        <Text
          style={{
            fontSize: typography.display.fontSize,
            lineHeight: typography.display.lineHeight,
            fontWeight: typography.display.fontWeight,
            color: colors.textPrimary,
            marginBottom: spacing.xs,
          }}
        >
          {article.title}
        </Text>
        {/* Standfirst — the same `summary` field as before, now given real editorial weight instead of being folded into one small caption line. */}
        <Text style={{ fontSize: typography.headline.fontSize, color: colors.textSecondary, lineHeight: 24, marginBottom: spacing.lg }}>
          {article.summary}
        </Text>

        <View style={{ marginBottom: spacing.lg }}>
          <SectionLabel>{t("knowledge.keyPointsLabel")}</SectionLabel>
          {article.keyPoints.map((point) => (
            <Text key={point} style={{ fontSize: typography.body.fontSize, color: colors.textPrimary, lineHeight: 22, marginBottom: spacing.xxs }}>
              {"—  "}
              {point}
            </Text>
          ))}
        </View>

        {article.sections.map((section, index) => (
          <View key={section.heading}>
            <View style={{ marginBottom: spacing.md }}>
              <Text style={{ fontSize: typography.headline.fontSize, fontWeight: typography.headline.fontWeight, color: colors.textPrimary, marginBottom: spacing.xxs }}>
                {section.heading}
              </Text>
              <Text style={{ fontSize: typography.body.fontSize, color: colors.textPrimary, lineHeight: 22 }}>{section.body}</Text>
            </View>

            {article.id === ARTICLE_WITH_INLINE_VISUAL && index === INLINE_VISUAL_AFTER_SECTION_INDEX ? (
              <View style={{ alignItems: "center", marginBottom: spacing.lg }}>
                <SpineConcept width={INLINE_VISUAL_SIZE} height={INLINE_VISUAL_SIZE} accessibilityLabel={t("knowledge.spineIllustrationLabel")} />
                <Text style={{ fontSize: typography.micro.fontSize, color: colors.textSecondary, fontStyle: "italic", marginTop: spacing.xs, textAlign: "center" }}>
                  {t("knowledge.illustrationCaption")}
                </Text>
              </View>
            ) : null}
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
      </Animated.View>
    </ScreenContainer>
  );
}
