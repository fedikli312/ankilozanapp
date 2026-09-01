import { resolveHasTreatment } from "../resolveHasTreatment";

describe("resolveHasTreatment", () => {
  it("repository says true, treatmentContext agrees → true", () => {
    expect(resolveHasTreatment(true, "both")).toBe(true);
  });

  it("repository says false, treatmentContext agrees (none) → false", () => {
    expect(resolveHasTreatment(false, "none")).toBe(false);
  });

  it("treatmentContext disagrees with real repository state → real data always wins", () => {
    // Onboarding said "both", but the user never actually added a medication or injection.
    expect(resolveHasTreatment(false, "both")).toBe(false);
    // The reverse: onboarding was skipped (null) or said "none", but the user later added real treatment.
    expect(resolveHasTreatment(true, "none")).toBe(true);
    expect(resolveHasTreatment(true, null)).toBe(true);
  });

  it("treatmentContext value never changes the outcome — only repositoryHasTreatment does", () => {
    for (const treatmentContext of ["medication", "injection", "both", "none", null] as const) {
      expect(resolveHasTreatment(true, treatmentContext)).toBe(true);
      expect(resolveHasTreatment(false, treatmentContext)).toBe(false);
    }
  });
});
