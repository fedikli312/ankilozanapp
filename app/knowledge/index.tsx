import { useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { Animated, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { HeroBloom, ListRow, PressableScale, Section, SpineConcept, useReducedMotion, useTheme } from "@/design-system";
import { motion } from "@/design-system/tokens/motion";
import { useTranslation } from "@/localization";
import { KNOWLEDGE_CATEGORIES } from "@/features/knowledge/categories";
import { useKnowledgeArticles } from "@/features/knowledge/useKnowledgeContent";

/** The article opened as this screen's one "Başlangıç" / featured pick — a fixed, deterministic choice (Phase P brief §25: no personalization/inference yet). */
const FEATURED_ARTICLE_ID = "what-is-as";

const HERO_HEIGHT = 132;
const FEATURED_VISUAL_SIZE = 68;

/**
 * Knowledge Hub landing — Art Direction 3.0 (`docs/VISUAL_ART_DIRECTION_3_0.md`
 * §16, §26). The prior version (Design-H) was a correct but visually flat
 * "heading → section label → text row → hairline → chevron, repeat"
 * composition — clean, but reading closer to a settings list than a
 * premium health-learning hub. This version keeps every piece of that
 * same content (same 5 categories, same 12 articles, same sources, same
 * non-diagnostic framing) but composes it with real visual rhythm: one
 * original illustrated hero, one illustrated featured-article moment
 * (reusing the same `SpineConcept` artwork the article itself uses — one
 * illustration, two appearances, not a second asset), a horizontal
 * topic-chip index for at-a-glance scanning, and only then the editorial
 * article list.
 *
 * The topic chips were originally meant to smooth-scroll to their
 * category section on press (three implementation attempts: manual
 * cumulative-offset math, then `measureLayout` with a component-ref
 * target, then with a `findNodeHandle` target) — all three failed in live
 * QA on this react-native-web preview (the first overshot/undershot, the
 * other two never scrolled at all), so rather than keep sinking time into
 * one secondary interaction, the chips were simplified to keep their
 * tactile `PressableScale` press feedback (still satisfying the brief's
 * "premium interaction feedback" ask) without a broken side effect. If
 * this direction is approved to propagate, scroll-to-section is worth a
 * second, better-resourced attempt — see the final report.
 */
export default function KnowledgeHomeScreen() {
  const { t } = useTranslation();
  const { colors, typography, spacing, radius, layout } = useTheme();
  const reducedMotion = useReducedMotion();
  const router = useRouter();
  const articles = useKnowledgeArticles();
  const featured = articles.find((article) => article.id === FEATURED_ARTICLE_ID);

  const scrollRef = useRef<ScrollView>(null);
  const [heroWidth, setHeroWidth] = useState(0);

  const [contentOpacity] = useState(() => new Animated.Value(reducedMotion ? 1 : 0));
  useEffect(() => {
    if (reducedMotion) {
      contentOpacity.setValue(1);
      return;
    }
    Animated.timing(contentOpacity, { toValue: 1, duration: motion.heroEnter.maxMs, useNativeDriver: true }).start();
    // Fires once on mount only — a re-render from reducedMotion flipping mid-session should not replay the entrance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ paddingHorizontal: layout.pageMargin, paddingTop: spacing.lg, paddingBottom: spacing.lg + layout.bottomClearance }}
      >
        {/* Hero — a single original illustration, not a repeated motif. Purely decorative: hidden from the accessibility tree, the real heading right below carries the meaning. */}
        <View
          onLayout={(e) => setHeroWidth(e.nativeEvent.layout.width)}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={{ height: HERO_HEIGHT, marginBottom: spacing.md, borderRadius: radius.large, overflow: "hidden", backgroundColor: colors.surfaceSecondary }}
        >
          {heroWidth > 0 ? <HeroBloom width={heroWidth} height={HERO_HEIGHT} /> : null}
        </View>

        <Animated.View style={{ opacity: contentOpacity }}>
          <Text style={{ fontSize: typography.display.fontSize, lineHeight: typography.display.lineHeight, fontWeight: typography.display.fontWeight, color: colors.textPrimary, marginBottom: spacing.xxs }}>
            {t("knowledge.title")}
          </Text>
          <Text style={{ fontSize: typography.body.fontSize, color: colors.textSecondary, marginBottom: spacing.lg }}>
            {t("knowledge.subtitle")}
          </Text>

          {/* Featured — the one strong article moment, illustrated, larger than a plain row. */}
          {featured ? (
            <View style={{ marginBottom: spacing.lg }}>
              <Text style={{ fontSize: typography.sectionTitle.fontSize, lineHeight: typography.sectionTitle.lineHeight, fontWeight: typography.sectionTitle.fontWeight, letterSpacing: typography.sectionTitle.letterSpacing, textTransform: typography.sectionTitle.textTransform, color: colors.textSecondary, marginBottom: spacing.xs }}>
                {t("knowledge.featuredLabel")}
              </Text>
              <PressableScale
                onPress={() => router.push(`/knowledge/${featured.id}`)}
                accessibilityLabel={`${featured.title} — ${featured.summary}`}
                style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}
              >
                <View style={{ width: FEATURED_VISUAL_SIZE, height: FEATURED_VISUAL_SIZE, borderRadius: radius.standard, overflow: "hidden", backgroundColor: colors.surfaceSecondary }}>
                  <SpineConcept width={FEATURED_VISUAL_SIZE} height={FEATURED_VISUAL_SIZE} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: typography.headline.fontSize, fontWeight: typography.headline.fontWeight, color: colors.textPrimary }}>
                    {featured.title}
                  </Text>
                  <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginTop: 2 }} numberOfLines={2}>
                    {featured.summary}
                  </Text>
                  <Text style={{ fontSize: typography.micro.fontSize, color: colors.textSecondary, marginTop: 2 }}>{featured.readTime}</Text>
                </View>
              </PressableScale>
            </View>
          ) : null}

          {/* Topic index — a quick-scan row of the same 5 categories listed
              below, for at-a-glance editorial rhythm. Deliberately plain
              (not pressable): a tappable-but-inert chip would read as
              broken, and the intended tap-to-scroll behavior didn't work
              reliably in this web preview (see the doc comment above) —
              an honest static index beats a fake interactive one. */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.lg }}>
            <View style={{ flexDirection: "row", gap: spacing.xs }}>
              {KNOWLEDGE_CATEGORIES.map((category) => (
                <View
                  key={category.id}
                  style={{
                    paddingHorizontal: spacing.sm,
                    minHeight: 44,
                    justifyContent: "center",
                    borderRadius: radius.large,
                    borderWidth: 1,
                    borderColor: colors.hairline,
                    backgroundColor: colors.surfaceElevated,
                  }}
                >
                  <Text style={{ fontSize: typography.caption.fontSize, fontWeight: "600", color: colors.textPrimary }}>{t(category.labelKey)}</Text>
                </View>
              ))}
            </View>
          </ScrollView>

          {/* Editorial article rows, grouped by category — the existing, content-preserving Section/ListRow language. */}
          {KNOWLEDGE_CATEGORIES.map((category) => {
            const categoryArticles = articles.filter((a) => a.category === category.id && a.id !== FEATURED_ARTICLE_ID);
            if (categoryArticles.length === 0) return null;

            return (
              <View key={category.id}>
                <Section title={t(category.labelKey)}>
                  {categoryArticles.map((article) => (
                    <ListRow
                      key={article.id}
                      label={article.title}
                      caption={article.summary}
                      trailing={<Text style={{ fontSize: typography.micro.fontSize, color: colors.textSecondary }}>{article.readTime}</Text>}
                      onPress={() => router.push(`/knowledge/${article.id}`)}
                      chevron
                    />
                  ))}
                </Section>
              </View>
            );
          })}

          <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginTop: spacing.md, fontStyle: "italic" }}>
            {t("knowledge.disclaimer")}
          </Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
