import { calculateNextInjectionDate } from "../injectionNextDate";

describe("calculateNextInjectionDate", () => {
  it("adds the interval to the scheduled date when logged on time", () => {
    const next = calculateNextInjectionDate(
      { scheduledFor: "2026-08-01", actualDate: null, status: "pending" },
      14,
    );
    expect(next).toBe("2026-08-15");
  });

  it("anchors to the actual logged date when it differs from the schedule, so the interval never silently drifts", () => {
    const next = calculateNextInjectionDate(
      { scheduledFor: "2026-08-01", actualDate: "2026-08-03", status: "completed" },
      14,
    );
    expect(next).toBe("2026-08-17");
  });
});
