import { presentTodayCheckIn } from "../presentTodayCheckIn";

describe("presentTodayCheckIn — incomplete state", () => {
  it("no check-in, no prior entry → incomplete with no yesterday context", () => {
    const result = presentTodayCheckIn(null, null);
    expect(result).toEqual({ status: "incomplete", yesterdayPain: null });
  });

  it("no check-in, a prior entry exists → incomplete with yesterday's pain surfaced, never today's", () => {
    const result = presentTodayCheckIn(null, { pain: 6 });
    expect(result).toEqual({ status: "incomplete", yesterdayPain: 6 });
  });
});

describe("presentTodayCheckIn — complete state", () => {
  it("a saved check-in → complete, carrying pain/fatigue/stiffness verbatim", () => {
    const result = presentTodayCheckIn(
      { pain: 4, fatigue: 3, morningStiffnessBucket: "30_60", isHighSymptomDay: false },
      { pain: 6 },
    );
    expect(result).toEqual({
      status: "complete",
      pain: 4,
      fatigue: 3,
      morningStiffnessBucket: "30_60",
      isHighSymptomDay: false,
    });
  });

  it("a saved check-in with High-Symptom Day recorded → isHighSymptomDay true in the presentation", () => {
    const result = presentTodayCheckIn(
      { pain: 7, fatigue: 6, morningStiffnessBucket: "over_60", isHighSymptomDay: true },
      null,
    );
    expect(result.status).toBe("complete");
    expect(result).toMatchObject({ isHighSymptomDay: true });
  });

  it("worst-case values (pain 10, fatigue 10) pass through unmodified — no clamping, no reinterpretation", () => {
    const result = presentTodayCheckIn(
      { pain: 10, fatigue: 10, morningStiffnessBucket: "over_60", isHighSymptomDay: false },
      null,
    );
    expect(result).toMatchObject({ pain: 10, fatigue: 10 });
  });
});
