import { useRouter } from "expo-router";
import { Text } from "react-native";

import { ListRow, Section, ScreenContainer, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";
import { KNOWLEDGE_CATEGORIES } from "@/features/knowledge/categories";
import { useKnowledgeArticles } from "@/features/knowledge/useKnowledgeContent";

/** The article opened as this screen's one "Başlangıç" / featured pick — a fixed, deterministic choice (Phase P brief §25: no personalization/inference yet). */
const FEATURED_ARTICLE_ID = "what-is-as";

/**
 * Knowledge Hub landing — Design-H (brief §6). A small reference library,
 * not a content app: an editorial article index — category headings,
 * restrained rows, no icon-in-a-colored-box treatment anywhere, no card
 * grid. Same 5 categories, same 12 articles, same sources, same
 * non-diagnostic framing — presentation only, nothing rewritten in the
 * corpus itself.
 */
export default function KnowledgeHomeScreen() {
  const { t } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();
  const articles = useKnowledgeArticles();
  const featured = articles.find((article) => article.id === FEATURED_ARTICLE_ID);

  return (
    <ScreenContainer scroll>
      <Text style={{ fontSize: typography.title.fontSize, fontWeight: typography.title.fontWeight, color: colors.textPrimary, marginBottom: 2 }}>
        {t("knowledge.title")}
      </Text>
      <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginBottom: spacing.lg }}>
        {t("knowledge.subtitle")}
      </Text>

      {featured ? (
        <Section title={t("knowledge.featuredLabel")}>
          <ListRow
            label={featured.title}
            caption={`${featured.summary} · ${featured.readTime}`}
            onPress={() => router.push(`/knowledge/${featured.id}`)}
            chevron
          />
        </Section>
      ) : null}

      {KNOWLEDGE_CATEGORIES.map((category) => {
        const categoryArticles = articles.filter((a) => a.category === category.id && a.id !== FEATURED_ARTICLE_ID);
        if (categoryArticles.length === 0) return null;

        return (
          <Section key={category.id} title={t(category.labelKey)}>
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
        );
      })}

      <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginTop: spacing.md, fontStyle: "italic" }}>
        {t("knowledge.disclaimer")}
      </Text>
    </ScreenContainer>
  );
}
