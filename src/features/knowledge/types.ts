import type Ionicons from "@expo/vector-icons/Ionicons";

type IconName = keyof typeof Ionicons.glyphMap;

/**
 * Product 2.0 Phase P — AS Knowledge Hub content model
 * (`docs/PRODUCT_2_0_UX_SPECIFICATION.md` §16-17).
 *
 * Five categories, matching the brief's own list exactly.
 */
export type KnowledgeCategoryId = "basics" | "symptoms" | "treatment" | "dailyLife" | "appointmentPrep";

/**
 * A traceable citation. This is metadata for future medical review, not a
 * decoration — every article must carry at least one. `accessedAt` is when
 * this source was checked while writing/reviewing this content, distinct
 * from `reviewedAt` on the article itself (Phase P brief §2, §17).
 */
export type KnowledgeSource = {
  organization: string;
  title: string;
  url: string;
  accessedAt: string;
};

export type KnowledgeSection = {
  heading: string;
  body: string;
};

/**
 * `title`/`summary`/`readTime`/`keyPoints`/`sections`/`tip` are locale-
 * specific long-form content — deliberately NOT routed through the flat-key
 * `translate()` system (§16: "do not dump huge unreadable article bodies
 * into one giant translation JSON"). Short chrome strings around this
 * content (screen titles, "Kaynaklar", the disclaimer, category labels)
 * still go through the normal `en.json`/`tr.json` localization exactly like
 * the rest of the app — only the article prose itself lives here, as one
 * typed, reviewable TypeScript module per locale (`content/articles.en.ts`,
 * `content/articles.tr.ts`), so a future medical-content review reads real
 * sentences in context rather than isolated JSON leaves, and so `sections`/
 * `keyPoints`/`sources` can stay properly typed (the app's `t()` is typed
 * to return `string` only — the exact same constraint that ruled out a
 * JSON-array approach for Nutrition in an earlier phase applies here, at a
 * larger scale).
 */
export type KnowledgeArticle = {
  /** Stable, locale-independent identifier — the route param and the join key between the two locale content files. */
  id: string;
  category: KnowledgeCategoryId;
  icon: IconName;
  title: string;
  /** One-line card summary. */
  summary: string;
  /** Static, reviewed estimate — e.g. "2 dk" / "2 min". Never computed dynamically. */
  readTime: string;
  /** 2-4 short, icon-supported points. */
  keyPoints: string[];
  /** 3-5 short sections. */
  sections: KnowledgeSection[];
  /** Optional "Bilmen iyi olabilir" callout. */
  tip?: KnowledgeSection;
  /** At least one required — enforced by a Jest content-integrity test. */
  sources: KnowledgeSource[];
  /** Content review date ("Son gözden geçirme") — NOT a claim of clinical review; see §17. */
  reviewedAt: string;
};
