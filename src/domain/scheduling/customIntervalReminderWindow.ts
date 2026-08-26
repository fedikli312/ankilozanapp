import { CUSTOM_INTERVAL_REMINDER_WINDOW_SIZE } from "../constants";
import { addDays } from "../dateUtils";

/**
 * Next N future occurrence dates for a `custom_interval` medication
 * schedule, topped up on launch/foreground reconciliation (Tech Arch §G).
 * `lastKnownOccurrence` is the most recent occurrence already scheduled
 * (or the schedule's `effectiveFrom` if none exist yet).
 */
export function getCustomIntervalReminderWindow(
  lastKnownOccurrence: string,
  intervalDays: number,
  windowSize: number = CUSTOM_INTERVAL_REMINDER_WINDOW_SIZE,
): string[] {
  const occurrences: string[] = [];
  let cursor = lastKnownOccurrence;
  for (let i = 0; i < windowSize; i += 1) {
    cursor = addDays(cursor, intervalDays);
    occurrences.push(cursor);
  }
  return occurrences;
}
