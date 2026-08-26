import { getCustomIntervalReminderWindow } from "../customIntervalReminderWindow";
import { CUSTOM_INTERVAL_REMINDER_WINDOW_SIZE } from "../../constants";

describe("getCustomIntervalReminderWindow", () => {
  it("returns exactly CUSTOM_INTERVAL_REMINDER_WINDOW_SIZE future occurrences", () => {
    const window = getCustomIntervalReminderWindow("2026-08-01", 5);
    expect(window).toHaveLength(CUSTOM_INTERVAL_REMINDER_WINDOW_SIZE);
    expect(window[0]).toBe("2026-08-06");
    expect(window[CUSTOM_INTERVAL_REMINDER_WINDOW_SIZE - 1]).toBe(
      addDaysManually("2026-08-01", 5 * CUSTOM_INTERVAL_REMINDER_WINDOW_SIZE),
    );
  });

  function addDaysManually(date: string, days: number): string {
    const d = new Date(`${date}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
  }
});
