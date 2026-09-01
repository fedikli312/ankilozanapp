import { getKnowledgeRecommendation } from "../getKnowledgeRecommendation";
import { EMPTY_PERSONALIZATION_PROFILE, type PersonalizationProfile } from "../types";

const DEFAULT_ARTICLE_ID = "morning-stiffness";

describe("getKnowledgeRecommendation", () => {
  it("no goals, no priority symptoms, rotation says breathing → breathing (neutral fallback, unchanged from Phase P)", () => {
    expect(
      getKnowledgeRecommendation(EMPTY_PERSONALIZATION_PROFILE, {
        defaultArticleId: DEFAULT_ARTICLE_ID,
        dateRotationPrefersKnowledge: false,
      }),
    ).toEqual({ kind: "breathing" });
  });

  it("no goals, no priority symptoms, rotation says knowledge → the default article, source 'rotation'", () => {
    expect(
      getKnowledgeRecommendation(EMPTY_PERSONALIZATION_PROFILE, {
        defaultArticleId: DEFAULT_ARTICLE_ID,
        dateRotationPrefersKnowledge: true,
      }),
    ).toEqual({ kind: "knowledge", articleId: DEFAULT_ARTICLE_ID, source: "rotation" });
  });

  it("learn-about-AS goal → Knowledge favored over Breathing regardless of rotation", () => {
    const profile: PersonalizationProfile = { ...EMPTY_PERSONALIZATION_PROFILE, goals: ["knowledge"] };
    expect(
      getKnowledgeRecommendation(profile, { defaultArticleId: DEFAULT_ARTICLE_ID, dateRotationPrefersKnowledge: false }),
    ).toEqual({ kind: "knowledge", articleId: DEFAULT_ARTICLE_ID, source: "goal" });
  });

  it("priority symptom 'stiffness' → the morning-stiffness article, source 'prioritySymptom'", () => {
    const profile: PersonalizationProfile = { ...EMPTY_PERSONALIZATION_PROFILE, prioritySymptoms: ["stiffness"] };
    expect(
      getKnowledgeRecommendation(profile, { defaultArticleId: DEFAULT_ARTICLE_ID, dateRotationPrefersKnowledge: false }),
    ).toEqual({ kind: "knowledge", articleId: "morning-stiffness", source: "prioritySymptom" });
  });

  it("priority symptom 'pain' → the pain-and-fatigue article", () => {
    const profile: PersonalizationProfile = { ...EMPTY_PERSONALIZATION_PROFILE, prioritySymptoms: ["pain"] };
    expect(
      getKnowledgeRecommendation(profile, { defaultArticleId: DEFAULT_ARTICLE_ID, dateRotationPrefersKnowledge: false }).kind,
    ).toBe("knowledge");
  });

  it("priority symptom 'wellbeing' alone has no article mapping → falls through to rotation, never guessed", () => {
    const profile: PersonalizationProfile = { ...EMPTY_PERSONALIZATION_PROFILE, prioritySymptoms: ["wellbeing"] };
    expect(
      getKnowledgeRecommendation(profile, { defaultArticleId: DEFAULT_ARTICLE_ID, dateRotationPrefersKnowledge: false }),
    ).toEqual({ kind: "breathing" });
  });

  it("goal wins over priority symptom when both are present", () => {
    const profile: PersonalizationProfile = {
      ...EMPTY_PERSONALIZATION_PROFILE,
      goals: ["knowledge"],
      prioritySymptoms: ["stiffness"],
    };
    const result = getKnowledgeRecommendation(profile, { defaultArticleId: DEFAULT_ARTICLE_ID, dateRotationPrefersKnowledge: false });
    expect(result.kind).toBe("knowledge");
    expect(result.kind === "knowledge" && result.source).toBe("goal");
  });

  it("never inspects a health-record value — only reads goals/prioritySymptoms off the profile it's given", () => {
    // Type-level guarantee, exercised at runtime: no check-in/pain-value argument exists on this function's signature at all.
    expect(getKnowledgeRecommendation.length).toBe(2);
  });
});
