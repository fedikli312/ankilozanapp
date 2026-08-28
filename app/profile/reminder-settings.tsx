import { Text, View } from "react-native";

import { ScreenContainer, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";

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

  const rows = [
    { label: t("profile.reminderDefaults.medication"), value: t("profile.reminderDefaults.medicationValue") },
    { label: t("profile.reminderDefaults.injection"), value: t("profile.reminderDefaults.injectionValue") },
    { label: t("profile.reminderDefaults.appointment"), value: t("profile.reminderDefaults.appointmentValue") },
  ];

  return (
    <ScreenContainer>
      <Text style={{ fontSize: typography.title.fontSize, fontWeight: typography.title.fontWeight, color: colors.textPrimary, marginBottom: spacing.sm }}>
        {t("profile.reminderSettings")}
      </Text>
      <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginBottom: spacing.lg }}>
        {t("profile.reminderDefaults.note")}
      </Text>
      {rows.map((row) => (
        <View key={row.label} style={{ marginBottom: spacing.md }}>
          <Text style={{ fontSize: typography.body.fontSize, color: colors.textPrimary }}>{row.label}</Text>
          <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginTop: 2 }}>{row.value}</Text>
        </View>
      ))}
    </ScreenContainer>
  );
}
