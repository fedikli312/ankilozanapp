import * as Notifications from "expo-notifications";

import type { NotificationContent } from "./copy";

/**
 * Foreground presentation behavior — configured once at module load. This
 * does not request permission and does not schedule anything; it only
 * tells the OS how to present a notification that arrives while the app is
 * open. No sound, no badge — consistent with the approved "no urgency-
 * driven UI" product direction.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export type PermissionStatus = "granted" | "denied" | "undetermined";

/**
 * Never called automatically anywhere in this codebase — permission is
 * only ever requested from a contextual product flow (e.g. "enable your
 * first reminder"), per the approved onboarding decision. Callers decide
 * when this is appropriate; this module only provides the primitive.
 */
export async function requestNotificationPermissionAsync(): Promise<PermissionStatus> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status;
}

export async function getNotificationPermissionStatusAsync(): Promise<PermissionStatus> {
  const { status } = await Notifications.getPermissionsAsync();
  return status;
}

/**
 * JS `Date.getUTCDay()`/domain `dayOfWeek` convention is 0 (Sunday) - 6
 * (Saturday); `expo-notifications`' weekly trigger uses 1 (Sunday) - 7
 * (Saturday) (iOS `UNCalendarNotificationTrigger` convention). Converting
 * in exactly one place avoids an off-by-one reminder landing on the wrong
 * day.
 */
export function toExpoWeekday(domainDayOfWeek: number): number {
  return domainDayOfWeek + 1;
}

export type ScheduleWeeklyReminderInput = {
  content: NotificationContent;
  /** Domain convention: 0 (Sunday) - 6 (Saturday). */
  dayOfWeek: number;
  /** Local wall-clock hour, 0-23. */
  hour: number;
  minute: number;
};

/** Regular medication schedules — one repeating trigger per time x weekday (Tech Arch §G). */
export async function scheduleWeeklyReminder(input: ScheduleWeeklyReminderInput): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content: input.content,
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: toExpoWeekday(input.dayOfWeek),
      hour: input.hour,
      minute: input.minute,
    },
  });
}

export type ScheduleDailyReminderInput = {
  content: NotificationContent;
  hour: number;
  minute: number;
};

/** `daily`-frequency medication schedules — fires every day at the same wall-clock time (Tech Arch §G). */
export async function scheduleDailyReminder(input: ScheduleDailyReminderInput): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content: input.content,
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: input.hour,
      minute: input.minute,
    },
  });
}

export type ScheduleOneOffReminderInput = {
  content: NotificationContent;
  /** The exact instant the reminder should fire. */
  date: Date;
};

/** Injection / appointment / lab reminders — always a single concrete occurrence (Tech Arch §G). */
export async function scheduleOneOffReminder(input: ScheduleOneOffReminderInput): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content: input.content,
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: input.date,
    },
  });
}

export async function cancelScheduledNotification(identifier: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(identifier);
}

export async function getAllScheduledNotificationIdentifiers(): Promise<string[]> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  return scheduled.map((n) => n.identifier);
}
