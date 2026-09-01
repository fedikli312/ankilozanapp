import { useTranslation } from "../../localization";
import { KNOWLEDGE_ARTICLES_EN } from "./content/articles.en";
import { KNOWLEDGE_ARTICLES_TR } from "./content/articles.tr";
import type { KnowledgeArticle } from "./types";

/** All articles for the current locale, in fixed content-file order. */
export function useKnowledgeArticles(): KnowledgeArticle[] {
  const { locale } = useTranslation();
  return locale === "tr" ? KNOWLEDGE_ARTICLES_TR : KNOWLEDGE_ARTICLES_EN;
}

/** A single article by id for the current locale, or `undefined` if the id doesn't exist. */
export function useKnowledgeArticle(id: string | undefined): KnowledgeArticle | undefined {
  const articles = useKnowledgeArticles();
  return articles.find((article) => article.id === id);
}
