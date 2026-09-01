import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { GroupedList, ListRow, ScreenContainer, SectionLabel, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";
import { KNOWLEDGE_CATEGORIES } from "@/features/knowledge/categories";
import { useKnowledgeArticles } from "@/features/knowledge/useKnowledgeContent";

/** The article opened as this screen's one "Başlangıç" / featured pick — a fixed, deterministic choice (Phase P brief §25: no personalization/inference yet). */
const FEATURED_ARTICLE_ID = "what-is-as";

/**
 * Knowledge Hub landing (Product 2.0 Phase P, spec §7). Static, bundled
 * content — no CMS, no remote fetch, no read/completion state. One
 * featured article, then compact category groups — deliberately not a flat
 * list of 12 titles.
 */
export default function KnowledgeHomeScreen() {
  const { t } = useTranslation();
  const { colors, typography, spacing, radius } = useTheme();
  const router = useRouter();
  const articles = useKnowledgeArticles();
  const featured = articles.find((article) => article.id === FEATURED_ARTICLE_ID);

  return (
    <ScreenContainer scroll>
      <Text style={{ fontSize: typography.title.fontSize, fontWeight: typography.title.fontWeight, color: colors.textPrimary, marginBottom: 2 }}>
        {t("knowledge.title")}
      </Text>
      <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginBottom: spacing.md }}>
        {t("knowledge.subtitle")}
      </Text>

      {featured ? (
        <View style={{ marginBottom: spacing.lg }}>
          <SectionLabel>{t("knowledge.featuredLabel")}</SectionLabel>
          <ListRow
            leading={
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: radius.small,
                  backgroundColor: colors.surfaceHighlight,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name={featured.icon} size={20} color={colors.accent} />
              </View>
            }
            label={featured.title}
            caption={`${featured.summary} · ${featured.readTime}`}
            onPress={() => router.push(`/knowledge/${featured.id}`)}
            chevron
          />
        </View>
      ) : null}

      {KNOWLEDGE_CATEGORIES.map((category) => {
        const categoryArticles = articles.filter((a) => a.category === category.id && a.id !== FEATURED_ARTICLE_ID);
        if (categoryArticles.length === 0) return null;

        return (
          <GroupedList key={category.id} title={t(category.labelKey)}>
            {categoryArticles.map((article) => (
              <ListRow
                key={article.id}
                leading={<Ionicons name={article.icon} size={20} color={colors.textSecondary} />}
                label={article.title}
                caption={article.summary}
                trailing={<Text style={{ fontSize: typography.micro.fontSize, color: colors.textSecondary }}>{article.readTime}</Text>}
                onPress={() => router.push(`/knowledge/${article.id}`)}
                chevron
              />
            ))}
          </GroupedList>
        );
      })}

      <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginTop: spacing.md, fontStyle: "italic" }}>
        {t("knowledge.disclaimer")}
      </Text>
    </ScreenContainer>
  );
}
