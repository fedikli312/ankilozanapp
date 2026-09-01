import { getCheckInPresentation } from "../getCheckInPresentation";
import { EMPTY_PERSONALIZATION_PROFILE, type PersonalizationProfile } from "../types";

describe("getCheckInPresentation", () => {
  it("no priority symptoms, no priority body areas → no auto-expand, nothing emphasized", () => {
    const result = getCheckInPresentation(EMPTY_PERSONALIZATION_PROFILE);
    expect(result.autoExpandMore).toBe(false);
    expect(result.emphasizedCoreSymptoms).toEqual([]);
    expect(result.wellbeingEmphasized).toBe(false);
    expect(result.priorityBodyAreas).toEqual([]);
  });

  it("pain priority → emphasized, but does not by itself auto-expand (pain is always visible, not behind the disclosure)", () => {
    const profile: PersonalizationProfile = { ...EMPTY_PERSONALIZATION_PROFILE, prioritySymptoms: ["pain"] };
    const result = getCheckInPresentation(profile);
    expect(result.emphasizedCoreSymptoms).toEqual(["pain"]);
    expect(result.autoExpandMore).toBe(false);
  });

  it("stiffness priority → emphasized", () => {
    const profile: PersonalizationProfile = { ...EMPTY_PERSONALIZATION_PROFILE, prioritySymptoms: ["stiffness"] };
    expect(getCheckInPresentation(profile).emphasizedCoreSymptoms).toEqual(["stiffness"]);
  });

  it("fatigue priority → emphasized", () => {
    const profile: PersonalizationProfile = { ...EMPTY_PERSONALIZATION_PROFILE, prioritySymptoms: ["fatigue"] };
    expect(getCheckInPresentation(profile).emphasizedCoreSymptoms).toEqual(["fatigue"]);
  });

  it("wellbeing priority → wellbeingEmphasized true AND auto-expands the secondary section (brief §12)", () => {
    const profile: PersonalizationProfile = { ...EMPTY_PERSONALIZATION_PROFILE, prioritySymptoms: ["wellbeing"] };
    const result = getCheckInPresentation(profile);
    expect(result.wellbeingEmphasized).toBe(true);
    expect(result.autoExpandMore).toBe(true);
    // Wellbeing itself is never in the core-symptom emphasis list — it's a separate field.
    expect(result.emphasizedCoreSymptoms).toEqual([]);
  });

  it("priority body areas present → auto-expands the secondary section and are passed through for labeling, never as today's selection", () => {
    const profile: PersonalizationProfile = { ...EMPTY_PERSONALIZATION_PROFILE, priorityBodyAreas: ["neck", "hips"] };
    const result = getCheckInPresentation(profile);
    expect(result.autoExpandMore).toBe(true);
    expect(result.priorityBodyAreas).toEqual(["neck", "hips"]);
  });

  it("no priority body areas → priorityBodyAreas stays empty, no auto-expand from this alone", () => {
    const result = getCheckInPresentation(EMPTY_PERSONALIZATION_PROFILE);
    expect(result.priorityBodyAreas).toEqual([]);
    expect(result.autoExpandMore).toBe(false);
  });

  it("multiple onboarding body areas → all passed through unmodified, in their stored order", () => {
    const profile: PersonalizationProfile = {
      ...EMPTY_PERSONALIZATION_PROFILE,
      priorityBodyAreas: ["hips", "neck", "lower_back"],
    };
    expect(getCheckInPresentation(profile).priorityBodyAreas).toEqual(["hips", "neck", "lower_back"]);
  });
});
