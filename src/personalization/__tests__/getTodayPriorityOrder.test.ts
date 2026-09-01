import { getTodayPriorityOrder } from "../getTodayPriorityOrder";
import { EMPTY_PERSONALIZATION_PROFILE, type PersonalizationProfile } from "../types";

function profileWithGoals(goals: PersonalizationProfile["goals"]): PersonalizationProfile {
  return { ...EMPTY_PERSONALIZATION_PROFILE, goals };
}

describe("getTodayPriorityOrder", () => {
  it("no personalization → the exact existing default tier2 order, no promoted section", () => {
    const result = getTodayPriorityOrder(EMPTY_PERSONALIZATION_PROFILE);
    expect(result.tier2Order).toEqual(["nextInjection", "upcomingAppointment", "supportiveSlot", "recentSummary"]);
    expect(result.promotedSection).toBeNull();
    expect(result.showSymptomHistoryShortcut).toBe(false);
    expect(result.emphasizeAppointmentPrep).toBe(false);
  });

  it("treatment goal → nextInjection already leads by default, so order is unchanged and nothing is 'promoted'", () => {
    const result = getTodayPriorityOrder(profileWithGoals(["treatment"]));
    expect(result.tier2Order[0]).toBe("nextInjection");
    expect(result.promotedSection).toBeNull();
  });

  it("appointment-prep goal → upcomingAppointment promoted to the front, flagged as promoted", () => {
    const result = getTodayPriorityOrder(profileWithGoals(["appointments"]));
    expect(result.tier2Order[0]).toBe("upcomingAppointment");
    expect(result.promotedSection).toBe("upcomingAppointment");
    expect(result.emphasizeAppointmentPrep).toBe(true);
  });

  it("changes-over-time goal → recentSummary promoted to the front", () => {
    const result = getTodayPriorityOrder(profileWithGoals(["trends"]));
    expect(result.tier2Order[0]).toBe("recentSummary");
    expect(result.promotedSection).toBe("recentSummary");
  });

  it("learn-about-AS goal → supportiveSlot promoted to the front", () => {
    const result = getTodayPriorityOrder(profileWithGoals(["knowledge"]));
    expect(result.tier2Order[0]).toBe("supportiveSlot");
    expect(result.promotedSection).toBe("supportiveSlot");
  });

  it("symptom-tracking goal → showSymptomHistoryShortcut true, tier2 order unaffected (check-in itself is fixed outside this function)", () => {
    const result = getTodayPriorityOrder(profileWithGoals(["symptoms"]));
    expect(result.showSymptomHistoryShortcut).toBe(true);
    expect(result.tier2Order).toEqual(["nextInjection", "upcomingAppointment", "supportiveSlot", "recentSummary"]);
  });

  it("mixed goals (appointments + trends) → both promoted, in their original relative order to each other", () => {
    const result = getTodayPriorityOrder(profileWithGoals(["appointments", "trends"]));
    expect(result.tier2Order).toEqual(["upcomingAppointment", "recentSummary", "nextInjection", "supportiveSlot"]);
    expect(result.promotedSection).toBe("upcomingAppointment");
  });

  it("this function's input never includes the check-in or due-medication rows — they cannot be reordered by construction (urgency-vs-preference rule)", () => {
    const result = getTodayPriorityOrder(profileWithGoals(["appointments"]));
    expect(result.tier2Order).not.toContain("checkIn");
    expect(result.tier2Order).not.toContain("dueMeds");
  });
});
