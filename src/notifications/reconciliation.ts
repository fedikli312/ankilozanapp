import { CUSTOM_INTERVAL_REMINDER_WINDOW_SIZE } from "../domain/constants";
import { getCustomIntervalReminderWindow } from "../domain/scheduling";
import type { PermissionStatus } from "./client";
import type { SourceType } from "../repositories/scheduledNotificationRepository";

/**
 * Reconciliation foundations (Tech Arch §G) — pure, unit-testable planning
 * functions. Wiring these into actual app-lifecycle triggers (launch,
 * foreground, config change, timezone change, schedule edit) is a later
 * feature-phase concern once real screens exist to trigger from; this
 * phase only builds the logic those triggers will call.
 */

export type NotificationKey = {
  sourceType: SourceType;
  sourceId: string;
  scheduledFor: string;
};

function keyOf(n: NotificationKey): string {
  return `${n.sourceType}:${n.sourceId}:${n.scheduledFor}`;
}

/**
 * Compares what domain data currently implies should be scheduled against
 * the `ScheduledNotification` bookkeeping rows that actually exist, and
 * returns the drift to correct — the "safety-net pass" from Tech Arch §G.
 */
export function diffScheduledNotifications<T extends NotificationKey, E extends NotificationKey>(
  desired: readonly T[],
  existing: readonly E[],
): { toCreate: T[]; toCancel: E[] } {
  const desiredKeys = new Set(desired.map(keyOf));
  const existingKeys = new Set(existing.map(keyOf));

  return {
    toCreate: desired.filter((d) => !existingKeys.has(keyOf(d))),
    toCancel: existing.filter((e) => !desiredKeys.has(keyOf(e))),
  };
}

/**
 * Which dates need a new bookkeeping row/notification to keep a
 * custom-interval medication's rolling window full (Tech Arch §G) — never
 * re-creates a date that's already scheduled.
 */
export function planCustomIntervalTopUp(
  existingFutureDates: readonly string[],
  lastKnownOccurrence: string,
  intervalDays: number,
  windowSize: number = CUSTOM_INTERVAL_REMINDER_WINDOW_SIZE,
): string[] {
  const fullWindow = getCustomIntervalReminderWindow(lastKnownOccurrence, intervalDays, windowSize);
  const existingSet = new Set(existingFutureDates);
  return fullWindow.filter((date) => !existingSet.has(date));
}

export function getCurrentTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/** `lastKnownTimezone` is `null` on first run — that is never a "change." */
export function hasTimezoneChanged(lastKnownTimezone: string | null, currentTimezone: string): boolean {
  return lastKnownTimezone !== null && lastKnownTimezone !== currentTimezone;
}

/**
 * If permission has been revoked, reconciliation must stop attempting new
 * scheduling calls (Tech Arch §G) — it does not need to cancel
 * already-OS-scheduled notifications itself; a permission revocation is
 * handled by the OS.
 */
export function shouldAttemptScheduling(status: PermissionStatus): boolean {
  return status === "granted";
}
