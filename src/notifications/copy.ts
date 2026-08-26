/**
 * Notification copy — UX spec / Tech Arch §G, §M: default content is
 * generic and privacy-preserving; detailed content (e.g. a medication name)
 * is an explicit, user-controlled opt-in, off by default. Symptom values,
 * lab values, and personal notes are never included under any
 * configuration — there is deliberately no parameter for them anywhere in
 * this module.
 */

export const DEFAULT_NOTIFICATION_TITLE = "Ankilozanapp";
export const DEFAULT_NOTIFICATION_BODY = "You have a health reminder.";

export type NotificationContent = {
  title: string;
  body: string;
};

export type BuildNotificationContentOptions = {
  /** `UserPreferences.notificationDetailOptIn` — false by default. */
  detailOptIn: boolean;
  /** Only used when `detailOptIn` is true; e.g. a medication or injection name. */
  detailedBody?: string;
};

/**
 * Structurally enforces the opt-in rule: detailed content is only ever
 * returned when the caller both passes `detailOptIn: true` *and* supplies
 * `detailedBody` — there is no way to fall into showing detail by default.
 */
export function buildNotificationContent(
  options: BuildNotificationContentOptions,
): NotificationContent {
  if (options.detailOptIn && options.detailedBody) {
    return { title: DEFAULT_NOTIFICATION_TITLE, body: options.detailedBody };
  }
  return { title: DEFAULT_NOTIFICATION_TITLE, body: DEFAULT_NOTIFICATION_BODY };
}
