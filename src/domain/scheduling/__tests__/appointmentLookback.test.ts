import { resolveAppointmentPreparationLookback } from "../appointmentLookback";
import { APPOINTMENT_PREPARATION_FALLBACK_LOOKBACK_DAYS } from "../../constants";
import { addDays } from "../../dateUtils";

describe("resolveAppointmentPreparationLookback", () => {
  it("uses the most recent prior rheumatology appointment when one exists", () => {
    const range = resolveAppointmentPreparationLookback(
      [
        { type: "rheumatology", date: "2026-02-10" },
        { type: "rheumatology", date: "2026-05-15" },
        { type: "laboratory", date: "2026-06-01" },
      ],
      "2026-08-20",
    );

    expect(range).toEqual({ rangeStart: "2026-05-15", rangeEnd: "2026-08-20" });
  });

  it("falls back to the fixed lookback window when no prior rheumatology appointment exists", () => {
    const target = "2026-08-20";
    const range = resolveAppointmentPreparationLookback(
      [{ type: "laboratory", date: "2026-06-01" }],
      target,
    );

    expect(range).toEqual({
      rangeStart: addDays(target, -APPOINTMENT_PREPARATION_FALLBACK_LOOKBACK_DAYS),
      rangeEnd: target,
    });
  });

  it("ignores rheumatology appointments on or after the target date", () => {
    const range = resolveAppointmentPreparationLookback(
      [{ type: "rheumatology", date: "2026-08-20" }],
      "2026-08-20",
    );

    expect(range.rangeStart).toBe(
      addDays("2026-08-20", -APPOINTMENT_PREPARATION_FALLBACK_LOOKBACK_DAYS),
    );
  });
});
