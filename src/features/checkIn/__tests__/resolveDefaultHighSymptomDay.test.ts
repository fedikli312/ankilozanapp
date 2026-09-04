import { resolveDefaultHighSymptomDay } from "../resolveDefaultHighSymptomDay";

describe("resolveDefaultHighSymptomDay", () => {
  it("a normal check-in entry (no High-Symptom Day path) always defaults false, regardless of draft/existing state", () => {
    expect(resolveDefaultHighSymptomDay(false, false, false)).toBe(false);
    expect(resolveDefaultHighSymptomDay(false, true, false)).toBe(false);
    expect(resolveDefaultHighSymptomDay(false, false, true)).toBe(false);
  });

  it("a fresh entry via the explicit High-Symptom Day path defaults true", () => {
    expect(resolveDefaultHighSymptomDay(true, false, false)).toBe(true);
  });

  it("an existing draft always wins over the High-Symptom Day entry path — never silently overridden", () => {
    expect(resolveDefaultHighSymptomDay(true, true, false)).toBe(false);
  });

  it("an existing today's check-in always wins over the High-Symptom Day entry path — never silently overridden", () => {
    expect(resolveDefaultHighSymptomDay(true, false, true)).toBe(false);
  });
});
