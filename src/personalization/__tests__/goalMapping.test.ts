import { ALL_GOALS, hasGoal, orderByGoalPriority } from "../goalMapping";
import { EMPTY_PERSONALIZATION_PROFILE, type PersonalizationProfile } from "../types";

function profileWithGoals(goals: PersonalizationProfile["goals"]): PersonalizationProfile {
  return { ...EMPTY_PERSONALIZATION_PROFILE, goals };
}

describe("ALL_GOALS", () => {
  it("is the exact canonical set/order shared across every consumer, including the Phase Q paywall", () => {
    expect(ALL_GOALS).toEqual(["symptoms", "treatment", "trends", "appointments", "knowledge"]);
  });
});

describe("hasGoal", () => {
  it("true only when the goal is explicitly present", () => {
    expect(hasGoal(profileWithGoals(["symptoms"]), "symptoms")).toBe(true);
    expect(hasGoal(profileWithGoals(["symptoms"]), "treatment")).toBe(false);
    expect(hasGoal(EMPTY_PERSONALIZATION_PROFILE, "symptoms")).toBe(false);
  });
});

describe("orderByGoalPriority", () => {
  const items = ["a", "b", "c", "d"];
  const goalOf = (item: string): "symptoms" | "treatment" | null =>
    item === "b" ? "treatment" : item === "d" ? "symptoms" : null;

  it("no matching goal → output identical to input (the neutral fallback)", () => {
    expect(orderByGoalPriority(items, EMPTY_PERSONALIZATION_PROFILE, goalOf)).toEqual(items);
  });

  it("one matching goal → that item moves to the front, rest keep relative order", () => {
    expect(orderByGoalPriority(items, profileWithGoals(["treatment"]), goalOf)).toEqual(["b", "a", "c", "d"]);
  });

  it("two matching goals → both promoted, in their original relative order to each other", () => {
    expect(orderByGoalPriority(items, profileWithGoals(["symptoms", "treatment"]), goalOf)).toEqual(["b", "d", "a", "c"]);
  });

  it("this is the same primitive the paywall's pillar ordering is built on (Phase R brief §25 consistency check)", () => {
    // Mirrors usePaywallValuePillars' own contract: selected goals first,
    // stable default order for the rest, capped externally at 4 by that hook.
    const result = orderByGoalPriority(ALL_GOALS, profileWithGoals(["knowledge"]), (goal) => goal);
    expect(result[0]).toBe("knowledge");
    expect(result).toEqual(["knowledge", "symptoms", "treatment", "trends", "appointments"]);
  });
});
