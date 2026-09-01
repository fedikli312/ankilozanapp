import { buildPersonalizationProfile } from "../buildPersonalizationProfile";
import { EMPTY_PERSONALIZATION_PROFILE } from "../types";

describe("buildPersonalizationProfile", () => {
  it("missing row (no onboarding_state at all) → empty/neutral profile, no crash", () => {
    expect(buildPersonalizationProfile(undefined)).toEqual(EMPTY_PERSONALIZATION_PROFILE);
  });

  it("legacy onboardingVersion 1 row with schema-default empty-array columns → empty/neutral profile", () => {
    const row = {
      goals: "[]",
      prioritySymptoms: "[]",
      priorityBodyAreas: "[]",
      treatmentContext: null,
      onboardingVersion: 1,
    } as any;
    expect(buildPersonalizationProfile(row)).toEqual({
      goals: [],
      prioritySymptoms: [],
      priorityBodyAreas: [],
      treatmentContext: null,
      onboardingVersion: 1,
    });
  });

  it("malformed JSON in any column → empty array for that field, never a thrown error", () => {
    const row = {
      goals: "not json",
      prioritySymptoms: "[",
      priorityBodyAreas: "{}",
      treatmentContext: "both",
      onboardingVersion: 2,
    } as any;
    const profile = buildPersonalizationProfile(row);
    expect(profile.goals).toEqual([]);
    expect(profile.prioritySymptoms).toEqual([]);
    expect(profile.priorityBodyAreas).toEqual([]);
    expect(profile.treatmentContext).toBe("both");
  });

  it("a real onboardingVersion 2 row parses every field correctly", () => {
    const row = {
      goals: JSON.stringify(["symptoms", "appointments"]),
      prioritySymptoms: JSON.stringify(["pain", "wellbeing"]),
      priorityBodyAreas: JSON.stringify(["neck", "hips"]),
      treatmentContext: "injection",
      onboardingVersion: 2,
    } as any;
    expect(buildPersonalizationProfile(row)).toEqual({
      goals: ["symptoms", "appointments"],
      prioritySymptoms: ["pain", "wellbeing"],
      priorityBodyAreas: ["neck", "hips"],
      treatmentContext: "injection",
      onboardingVersion: 2,
    });
  });
});
