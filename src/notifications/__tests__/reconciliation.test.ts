import {
  diffScheduledNotifications,
  hasTimezoneChanged,
  planCustomIntervalTopUp,
  shouldAttemptScheduling,
} from "../reconciliation";
import { CUSTOM_INTERVAL_REMINDER_WINDOW_SIZE } from "../../domain/constants";

describe("diffScheduledNotifications", () => {
  it("creates only what's missing and cancels only what's no longer desired", () => {
    const desired = [
      { sourceType: "medication" as const, sourceId: "med-1", scheduledFor: "2026-08-27" },
      { sourceType: "medication" as const, sourceId: "med-1", scheduledFor: "2026-08-28" },
    ];
    const existing = [
      { id: "n1", sourceType: "medication" as const, sourceId: "med-1", scheduledFor: "2026-08-27" },
      { id: "n2", sourceType: "medication" as const, sourceId: "med-1", scheduledFor: "2026-08-26" },
    ];

    const { toCreate, toCancel } = diffScheduledNotifications(desired, existing);

    expect(toCreate).toEqual([
      { sourceType: "medication", sourceId: "med-1", scheduledFor: "2026-08-28" },
    ]);
    expect(toCancel).toEqual([
      { id: "n2", sourceType: "medication", sourceId: "med-1", scheduledFor: "2026-08-26" },
    ]);
  });

  it("is a no-op when desired and existing already match", () => {
    const rows = [
      { sourceType: "appointment" as const, sourceId: "appt-1", scheduledFor: "2026-09-01" },
    ];
    const existing = rows.map((r) => ({ ...r, id: "n1" }));

    const { toCreate, toCancel } = diffScheduledNotifications(rows, existing);
    expect(toCreate).toEqual([]);
    expect(toCancel).toEqual([]);
  });
});

describe("planCustomIntervalTopUp", () => {
  it("skips dates that are already scheduled and only proposes the missing ones", () => {
    const fullWindow = planCustomIntervalTopUp([], "2026-08-01", 5);
    expect(fullWindow).toHaveLength(CUSTOM_INTERVAL_REMINDER_WINDOW_SIZE);

    const alreadyHaveFirstTwo = fullWindow.slice(0, 2);
    const topUp = planCustomIntervalTopUp(alreadyHaveFirstTwo, "2026-08-01", 5);

    expect(topUp).toHaveLength(CUSTOM_INTERVAL_REMINDER_WINDOW_SIZE - 2);
    expect(topUp).toEqual(fullWindow.slice(2));
  });
});

describe("hasTimezoneChanged", () => {
  it("is never a change on first run (no last-known timezone)", () => {
    expect(hasTimezoneChanged(null, "Europe/Istanbul")).toBe(false);
  });

  it("detects a genuine change", () => {
    expect(hasTimezoneChanged("Europe/Istanbul", "America/New_York")).toBe(true);
  });

  it("is false when unchanged", () => {
    expect(hasTimezoneChanged("Europe/Istanbul", "Europe/Istanbul")).toBe(false);
  });
});

describe("shouldAttemptScheduling", () => {
  it("only schedules when permission is granted", () => {
    expect(shouldAttemptScheduling("granted")).toBe(true);
    expect(shouldAttemptScheduling("denied")).toBe(false);
    expect(shouldAttemptScheduling("undetermined")).toBe(false);
  });
});
