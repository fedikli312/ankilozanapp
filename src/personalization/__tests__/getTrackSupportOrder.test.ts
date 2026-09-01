import { getTrackSupportOrder } from "../getTrackSupportOrder";
import { EMPTY_PERSONALIZATION_PROFILE, type PersonalizationProfile } from "../types";

describe("getTrackSupportOrder", () => {
  it("no goals → default order, all 4 modules present, nothing hidden", () => {
    const result = getTrackSupportOrder(EMPTY_PERSONALIZATION_PROFILE);
    expect(result.healthOrder).toEqual(["symptoms", "medications", "injections", "labs"]);
    expect(result.healthOrder).toHaveLength(4);
    expect(result.knowledgeEmphasized).toBe(false);
  });

  it("symptom-tracking goal → default order preserved (Symptoms is already first)", () => {
    const profile: PersonalizationProfile = { ...EMPTY_PERSONALIZATION_PROFILE, goals: ["symptoms"] };
    expect(getTrackSupportOrder(profile).healthOrder).toEqual(["symptoms", "medications", "injections", "labs"]);
  });

  it("treatment goal alone → Medications+Injections promoted ahead of Symptoms, Labs stays last", () => {
    const profile: PersonalizationProfile = { ...EMPTY_PERSONALIZATION_PROFILE, goals: ["treatment"] };
    expect(getTrackSupportOrder(profile).healthOrder).toEqual(["medications", "injections", "symptoms", "labs"]);
  });

  it("treatment AND symptoms both selected → symptoms wins, default order kept (avoids instability from two competing signals)", () => {
    const profile: PersonalizationProfile = { ...EMPTY_PERSONALIZATION_PROFILE, goals: ["treatment", "symptoms"] };
    expect(getTrackSupportOrder(profile).healthOrder).toEqual(["symptoms", "medications", "injections", "labs"]);
  });

  it("learn-about-AS goal → knowledgeEmphasized true, health-section order unaffected", () => {
    const profile: PersonalizationProfile = { ...EMPTY_PERSONALIZATION_PROFILE, goals: ["knowledge"] };
    const result = getTrackSupportOrder(profile);
    expect(result.knowledgeEmphasized).toBe(true);
    expect(result.healthOrder).toEqual(["symptoms", "medications", "injections", "labs"]);
  });

  it("no goal ever removes Labs from the list or changes its last position", () => {
    for (const goals of [[], ["treatment"], ["symptoms"], ["knowledge"], ["trends"], ["appointments"]] as const) {
      const profile: PersonalizationProfile = { ...EMPTY_PERSONALIZATION_PROFILE, goals: [...goals] };
      expect(getTrackSupportOrder(profile).healthOrder.at(-1)).toBe("labs");
    }
  });
});
