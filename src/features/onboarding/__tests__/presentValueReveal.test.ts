import { presentValueReveal, type Translate } from "../presentValueReveal";
import type { OnboardingPersonalization } from "../onboardingDraft";

/** Mirrors `presentAppointmentSummary.test.ts`'s own minimal `t` stand-in. */
const t: Translate = (key, options) => (options ? `${key}(${JSON.stringify(options)})` : key);

function personalization(
  overrides: Partial<Pick<OnboardingPersonalization, "goals" | "prioritySymptoms" | "treatmentContext">> = {},
): Pick<OnboardingPersonalization, "goals" | "prioritySymptoms" | "treatmentContext"> {
  return { goals: [], prioritySymptoms: [], treatmentContext: null, ...overrides };
}

describe("presentValueReveal — symptom-tracking row (always present)", () => {
  it("no priority symptoms selected renders the generic fallback, and is the only row", () => {
    const outcomes = presentValueReveal(personalization(), false, t);
    expect(outcomes).toEqual([{ key: "symptoms", label: "onboarding.valueReveal.outcome.symptomsGeneric" }]);
  });

  it("one priority symptom names it directly", () => {
    const outcomes = presentValueReveal(personalization({ prioritySymptoms: ["pain"] }), false, t);
    expect(outcomes[0]).toEqual({
      key: "symptoms",
      label: 'onboarding.valueReveal.outcome.symptomsOne({"symptom":"onboarding.prioritySymptoms.pain"})',
    });
  });

  it("two priority symptoms names both", () => {
    const outcomes = presentValueReveal(personalization({ prioritySymptoms: ["pain", "stiffness"] }), false, t);
    expect(outcomes[0]).toEqual({
      key: "symptoms",
      label:
        'onboarding.valueReveal.outcome.symptomsTwo({"symptomA":"onboarding.prioritySymptoms.pain","symptomB":"onboarding.prioritySymptoms.stiffness"})',
    });
  });

  it("three or more priority symptoms falls back to a count, never listing all names", () => {
    const outcomes = presentValueReveal(personalization({ prioritySymptoms: ["pain", "stiffness", "fatigue"] }), false, t);
    expect(outcomes[0]).toEqual({ key: "symptoms", label: 'onboarding.valueReveal.outcome.symptomsMany({"count":3})' });
  });
});

describe("presentValueReveal — treatment row (real inputs only)", () => {
  it("treatmentContext none, no treatment goal — no treatment row at all", () => {
    const outcomes = presentValueReveal(personalization({ treatmentContext: "none" }), false, t);
    expect(outcomes.some((o) => o.key === "treatment")).toBe(false);
  });

  it("treatmentContext medication", () => {
    const outcomes = presentValueReveal(personalization({ treatmentContext: "medication" }), false, t);
    expect(outcomes).toContainEqual({ key: "treatment", label: "onboarding.valueReveal.outcome.treatmentMedication" });
  });

  it("treatmentContext injection", () => {
    const outcomes = presentValueReveal(personalization({ treatmentContext: "injection" }), false, t);
    expect(outcomes).toContainEqual({ key: "treatment", label: "onboarding.valueReveal.outcome.treatmentInjection" });
  });

  it("treatmentContext both", () => {
    const outcomes = presentValueReveal(personalization({ treatmentContext: "both" }), false, t);
    expect(outcomes).toContainEqual({ key: "treatment", label: "onboarding.valueReveal.outcome.treatmentBoth" });
  });

  it("treatmentContext null but the treatment goal was selected — generic treatment row, not invented specifics", () => {
    const outcomes = presentValueReveal(personalization({ goals: ["treatment"] }), false, t);
    expect(outcomes).toContainEqual({ key: "treatment", label: "onboarding.valueReveal.outcome.treatmentGeneric" });
  });
});

describe("presentValueReveal — appointment-prep row (real inputs only)", () => {
  it("not shown without the appointments goal or a real upcoming appointment", () => {
    const outcomes = presentValueReveal(personalization(), false, t);
    expect(outcomes.some((o) => o.key === "appointmentPrep")).toBe(false);
  });

  it("shown when the appointments goal was selected", () => {
    const outcomes = presentValueReveal(personalization({ goals: ["appointments"] }), false, t);
    expect(outcomes).toContainEqual({ key: "appointmentPrep", label: "onboarding.valueReveal.outcome.appointmentPrep" });
  });

  it("shown when a real upcoming appointment exists, even without the goal", () => {
    const outcomes = presentValueReveal(personalization(), true, t);
    expect(outcomes).toContainEqual({ key: "appointmentPrep", label: "onboarding.valueReveal.outcome.appointmentPrep" });
  });
});

describe("presentValueReveal — cap and ordering", () => {
  it("never exceeds 3 outcomes, even when every condition qualifies", () => {
    const outcomes = presentValueReveal(
      personalization({ goals: ["treatment", "appointments"], treatmentContext: "both", prioritySymptoms: ["pain", "stiffness", "fatigue"] }),
      true,
      t,
    );
    expect(outcomes).toHaveLength(3);
    expect(outcomes.map((o) => o.key)).toEqual(["symptoms", "treatment", "appointmentPrep"]);
  });
});
