import { translate } from "../localization/i18n";
import type { SupportedLocale } from "../localization/resolveLocale";

/**
 * Notification copy — UX spec / Tech Arch §G, §M: default content is
 * generic and privacy-preserving; detailed content (e.g. a medication name)
 * is an explicit, user-controlled opt-in, off by default. Symptom values,
 * lab values, and personal notes are never included under any
 * configuration — there is deliberately no parameter for them anywhere in
 * this module. Localized via src/localization (Tech Arch §O) — never a
 * hardcoded English string.
 */

export type NotificationContent = {
  title: string;
  body: string;
};

export type BuildNotificationContentOptions = {
  locale: SupportedLocale;
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
  const title = translate(options.locale, "notifications.defaultTitle");

  if (options.detailOptIn && options.detailedBody) {
    return { title, body: options.detailedBody };
  }
  return { title, body: translate(options.locale, "notifications.defaultBody") };
}
