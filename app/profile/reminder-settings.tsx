import { useEffect, useState } from "react";
import { Text } from "react-native";

import { GroupedList, ListRow, ScreenContainer, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";
import { getNotificationPermissionStatusAsync, type PermissionStatus } from "@/notifications";

/**
 * UX spec §L describes "per-category defaults and lead times" here. Tech
 * Arch's schema stores each reminder's lead time on the entity itself
 * (MedicationSchedule.reminderEnabled, InjectionSchedule.reminderLeadDays/
 * reminderOnScheduledDay, Appointment.reminderLeadDays) rather than in a
 * separate global-preferences table — there is no "reminder defaults"
 * table to edit centrally. This screen shows the approved defaults as
 * reference and points to where each is actually changed (the item's own
 * add/edit form), rather than inventing a parallel settings store that
 * would fall out of sync with the per-item values. Flagged as a scope/
 * mapping decision, not a silent gap.
 */
export default function ReminderSettingsScreen() {
  const { t } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus | null>(null);

  // Read-only status check — never requests permission (Redesign Spec §I.4).
  useEffect(() => {
    getNotificationPermissionStatusAsync().then(setPermissionStatus).catch(() => setPermissionStatus(null));
  }, []);

  const rows = [
    { label: t("profile.reminderDefaults.medication"), value: t("profile.reminderDefaults.medicationValue") },
    { label: t("profile.reminderDefaults.injection"), value: t("profile.reminderDefaults.injectionValue") },
    { label: t("profile.reminderDefaults.appointment"), value: t("profile.reminderDefaults.appointmentValue") },
  ];

  return (
    <ScreenContainer scroll>
      <Text style={{ fontSize: typography.title.fontSize, fontWeight: typography.title.fontWeight, color: colors.textPrimary, marginBottom: spacing.sm }}>
        {t("profile.reminderSettings")}
      </Text>
      <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginBottom: spacing.md }}>
        {t("profile.reminderDefaults.note")}
      </Text>

      <GroupedList title={t("profile.group.reminders")}>
        {rows.map((row) => (
          <ListRow key={row.label} label={row.label} caption={row.value} />
        ))}
      </GroupedList>

      {permissionStatus ? (
        <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginTop: spacing.sm }}>
          {permissionStatus === "granted" ? t("profile.notificationPermissionOn") : t("notifications.remindersOff")}
        </Text>
      ) : null}
    </ScreenContainer>
  );
}
