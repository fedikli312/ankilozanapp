import { createTestDatabase } from "../../db/testUtils/testDatabase";
import { CURRENT_ONBOARDING_VERSION } from "../../domain/constants";
import { completeOnboarding, getOnboardingState } from "../onboardingStateRepository";

describe("onboarding state repository", () => {
  it("is not completed before completeOnboarding is called", () => {
    const { db } = createTestDatabase();
    expect(getOnboardingState(db)?.completed).toBeFalsy();
  });

  it("persists completion and the Product 2.0 personalization answers", () => {
    const { db } = createTestDatabase();

    completeOnboarding(db, {
      goals: ["symptoms", "trends"],
      prioritySymptoms: ["pain"],
      priorityBodyAreas: ["lower_back"],
      treatmentContext: "medication",
    });

    const state = getOnboardingState(db);
    expect(state?.completed).toBe(true);
    expect(JSON.parse(state!.goals)).toEqual(["symptoms", "trends"]);
    expect(JSON.parse(state!.prioritySymptoms)).toEqual(["pain"]);
    expect(JSON.parse(state!.priorityBodyAreas)).toEqual(["lower_back"]);
    expect(state?.treatmentContext).toBe("medication");
    expect(state?.onboardingVersion).toBe(CURRENT_ONBOARDING_VERSION);
    expect(state?.completedAt).not.toBeNull();
    // whatToRemember is superseded, not repurposed — see the schema comment.
    expect(JSON.parse(state!.whatToRemember)).toEqual([]);
  });

  it("is idempotent — calling it again does not create a second row (singleton)", () => {
    const { db } = createTestDatabase();

    completeOnboarding(db, { goals: ["symptoms"], prioritySymptoms: [], priorityBodyAreas: [], treatmentContext: null });
    completeOnboarding(db, { goals: ["trends"], prioritySymptoms: [], priorityBodyAreas: [], treatmentContext: "none" });

    const state = getOnboardingState(db);
    expect(state?.id).toBe("default");
    expect(JSON.parse(state!.goals)).toEqual(["trends"]);
    expect(state?.treatmentContext).toBe("none");
  });

  it("allows a skipped treatment context to persist as null", () => {
    const { db } = createTestDatabase();

    completeOnboarding(db, { goals: [], prioritySymptoms: [], priorityBodyAreas: [], treatmentContext: null });

    expect(getOnboardingState(db)?.treatmentContext).toBeNull();
  });
});
