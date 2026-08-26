import { createTestDatabase } from "../../db/testUtils/testDatabase";
import { completeOnboarding, getOnboardingState } from "../onboardingStateRepository";

describe("onboarding state repository", () => {
  it("is not completed before completeOnboarding is called", () => {
    const { db } = createTestDatabase();
    expect(getOnboardingState(db)?.completed).toBeFalsy();
  });

  it("persists completion and the recorded selection", () => {
    const { db } = createTestDatabase();

    completeOnboarding(db, ["medications", "injections"]);

    const state = getOnboardingState(db);
    expect(state?.completed).toBe(true);
    expect(JSON.parse(state!.whatToRemember)).toEqual(["medications", "injections"]);
    expect(state?.completedAt).not.toBeNull();
  });

  it("is idempotent — calling it again does not create a second row (singleton)", () => {
    const { db } = createTestDatabase();

    completeOnboarding(db, ["medications"]);
    completeOnboarding(db, ["injections"]);

    const state = getOnboardingState(db);
    expect(state?.id).toBe("default");
    expect(JSON.parse(state!.whatToRemember)).toEqual(["injections"]);
  });
});
