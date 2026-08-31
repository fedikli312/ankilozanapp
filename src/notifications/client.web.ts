/**
 * Dev-web-preview-only — expo-notifications' web module has no scheduling
 * API (see NotificationScheduler.ts's web fallback, which only implements
 * addListener/removeListeners), so every function this app's real client.ts
 * calls (scheduleNotificationAsync, getPermissionsAsync,
 * requestPermissionsAsync, cancel*, getAllScheduledNotificationsAsync)
 * throws `UnavailabilityError` on web — including from
 * useReconciliationLifecycle on every app launch/foreground, which would
 * otherwise break the preview before a reviewer sees anything. This mirrors
 * client.ts's exported surface with safe no-ops instead. Native iOS/Android
 * builds never load this file (Metro `.web.ts` platform resolution) — the
 * real expo-notifications integration is untouched there.
 */
import type { NotificationContent } from "./copy";

export type PermissionStatus = "granted" | "denied" | "undetermined";

export async function requestNotificationPermissionAsync(): Promise<PermissionStatus> {
  return "denied";
}

export async function getNotificationPermissionStatusAsync(): Promise<PermissionStatus> {
  return "denied";
}

export function toExpoWeekday(domainDayOfWeek: number): number {
  return domainDayOfWeek + 1;
}

export type ScheduleWeeklyReminderInput = {
  content: NotificationContent;
  dayOfWeek: number;
  hour: number;
  minute: number;
};

export async function scheduleWeeklyReminder(_input: ScheduleWeeklyReminderInput): Promise<string> {
  return "web-preview-noop";
}

export type ScheduleDailyReminderInput = {
  content: NotificationContent;
  hour: number;
  minute: number;
};

export async function scheduleDailyReminder(_input: ScheduleDailyReminderInput): Promise<string> {
  return "web-preview-noop";
}

export type ScheduleOneOffReminderInput = {
  content: NotificationContent;
  date: Date;
};

export async function scheduleOneOffReminder(_input: ScheduleOneOffReminderInput): Promise<string> {
  return "web-preview-noop";
}

export async function cancelScheduledNotification(_identifier: string): Promise<void> {}

export async function cancelAllScheduledNotifications(): Promise<void> {}

export async function getAllScheduledNotificationIdentifiers(): Promise<string[]> {
  return [];
}
