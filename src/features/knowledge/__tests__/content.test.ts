import { KNOWLEDGE_CATEGORIES } from "../categories";
import { KNOWLEDGE_ARTICLES_EN } from "../content/articles.en";
import { KNOWLEDGE_ARTICLES_TR } from "../content/articles.tr";

const VALID_CATEGORY_IDS = new Set(KNOWLEDGE_CATEGORIES.map((c) => c.id));

/**
 * Content-registry integrity — Phase P brief §32: catch structural/sourcing
 * mistakes (a bad id, an unsourced claim, an http:// link), not brittle
 * prose snapshots. Runs against both locale files identically.
 */
describe.each([
  ["EN", KNOWLEDGE_ARTICLES_EN],
  ["TR", KNOWLEDGE_ARTICLES_TR],
])("knowledge content (%s)", (_label, articles) => {
  it("has at least 8 articles (the brief's minimum foundational set)", () => {
    expect(articles.length).toBeGreaterThanOrEqual(8);
  });

  it("has unique article ids", () => {
    const ids = articles.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every article references a real category", () => {
    for (const article of articles) {
      expect(VALID_CATEGORY_IDS.has(article.category)).toBe(true);
    }
  });

  it("every article has at least one source", () => {
    for (const article of articles) {
      expect(article.sources.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("every source URL is HTTPS", () => {
    for (const article of articles) {
      for (const source of article.sources) {
        expect(source.url.startsWith("https://")).toBe(true);
      }
    }
  });

  it("every source has a non-empty organization and title", () => {
    for (const article of articles) {
      for (const source of article.sources) {
        expect(source.organization.trim().length).toBeGreaterThan(0);
        expect(source.title.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("every article has a review date and at least 2 key points and 3 sections", () => {
    for (const article of articles) {
      expect(article.reviewedAt.length).toBeGreaterThan(0);
      expect(article.keyPoints.length).toBeGreaterThanOrEqual(2);
      expect(article.sections.length).toBeGreaterThanOrEqual(3);
    }
  });
});

describe("knowledge content — EN/TR parity", () => {
  it("both locales define the exact same set of article ids", () => {
    const enIds = KNOWLEDGE_ARTICLES_EN.map((a) => a.id).sort();
    const trIds = KNOWLEDGE_ARTICLES_TR.map((a) => a.id).sort();
    expect(trIds).toEqual(enIds);
  });

  it("the same id maps to the same category in both locales", () => {
    const trById = new Map(KNOWLEDGE_ARTICLES_TR.map((a) => [a.id, a]));
    for (const enArticle of KNOWLEDGE_ARTICLES_EN) {
      expect(trById.get(enArticle.id)?.category).toBe(enArticle.category);
    }
  });
});
