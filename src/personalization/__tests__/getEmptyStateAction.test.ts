import { getEmptyStateAction } from "../getEmptyStateAction";
import { EMPTY_PERSONALIZATION_PROFILE, type PersonalizationProfile } from "../types";

function profileWithGoals(goals: PersonalizationProfile["goals"]): PersonalizationProfile {
  return { ...EMPTY_PERSONALIZATION_PROFILE, goals };
}

describe("getEmptyStateAction", () => {
  it("no goals → null (no fabricated action)", () => {
    expect(getEmptyStateAction(EMPTY_PERSONALIZATION_PROFILE)).toBeNull();
  });

  it("symptom-tracking goal → symptom history shortcut", () => {
    expect(getEmptyStateAction(profileWithGoals(["symptoms"]))).toEqual({
      labelKey: "today.emptyActionSymptomHistory",
      route: "/symptoms",
    });
  });

  it("changes-over-time goal → Insights shortcut", () => {
    expect(getEmptyStateAction(profileWithGoals(["trends"]))).toEqual({
      labelKey: "today.emptyActionInsights",
      route: "/insights",
    });
  });

  it("appointment-prep goal → add-appointment shortcut", () => {
    expect(getEmptyStateAction(profileWithGoals(["appointments"]))).toEqual({
      labelKey: "today.emptyActionAddAppointment",
      route: "/appointments/add",
    });
  });

  it("learn-about-AS goal → Knowledge shortcut", () => {
    expect(getEmptyStateAction(profileWithGoals(["knowledge"]))).toEqual({
      labelKey: "today.emptyActionKnowledge",
      route: "/knowledge",
    });
  });

  it("mixed goals → deterministic first match in fixed priority order (symptoms wins over trends)", () => {
    expect(getEmptyStateAction(profileWithGoals(["trends", "symptoms"]))).toEqual({
      labelKey: "today.emptyActionSymptomHistory",
      route: "/symptoms",
    });
  });
});
