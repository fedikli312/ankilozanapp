import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

import { Button, GroupedList, ListRow, ScreenContainer, useTheme } from "@/design-system";
import { formatDate, formatShortDate, useTranslation } from "@/localization";
import { useMedicationDetail } from "@/features/medications/useMedicationDetail";
import { MedicationScheduleFields, type MedicationScheduleFieldsValue } from "@/features/medications/MedicationScheduleFields";

export default function MedicationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, locale } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const {
    medication,
    schedule,
    scheduleDays,
    scheduleTimes,
    administrations,
    markTaken,
    markMissed,
    archive,
    editSchedule,
  } = useMedicationDetail(id);

  const [editing, setEditing] = useState(false);
  const [scheduleDraft, setScheduleDraft] = useState<MedicationScheduleFieldsValue | null>(null);

  if (!medication || !schedule) {
    return (
      <ScreenContainer>
        <Text style={{ color: colors.textSecondary }}>{t("medications.emptyTitle")}</Text>
      </ScreenContainer>
    );
  }

  const startEditing = () => {
    setScheduleDraft({
      frequencyType: schedule.frequencyType,
      intervalDays: schedule.intervalDays ?? 7,
      daysOfWeek: scheduleDays.map((d) => d.dayOfWeek),
      timeOfDay: scheduleTimes[0]?.timeOfDay ?? "08:00",
      reminderEnabled: schedule.reminderEnabled,
    });
    setEditing(true);
  };

  const statusLabel = (status: string) => t(`medications.status.${status}`);

  const administrationStatus = (status: string) => {
    if (status === "taken") {
      return { icon: "checkmark-circle" as const, color: colors.accent };
    }
    if (status === "missed") {
      return { icon: "ellipse-outline" as const, color: colors.statusNeutral };
    }
    return null;
  };

  return (
    <ScreenContainer scroll>
      <Text style={{ fontSize: typography.title.fontSize, fontWeight: typography.title.fontWeight, color: colors.textPrimary }}>
        {medication.name}
      </Text>
      <Text style={{ fontSize: typography.body.fontSize, color: colors.textSecondary, marginBottom: spacing.md }}>
        {medication.dose}
        {medication.archivedAt ? ` · ${t("medications.detail.archived")}` : ""}
      </Text>

      {editing && scheduleDraft ? (
        <View style={{ marginBottom: spacing.lg }}>
          <MedicationScheduleFields
            value={scheduleDraft}
            onChange={setScheduleDraft}
            reminderDescription={t("onboarding.reminderPrompt")}
          />
          <Button
            label={t("common.save")}
            onPress={async () => {
              await editSchedule(scheduleDraft);
              setEditing(false);
            }}
          />
        </View>
      ) : (
        <GroupedList title={t("medications.detail.planTitle")}>
          <ListRow label={t("medications.detail.schedule")} caption={scheduleTimes.map((s) => s.timeOfDay).join(" · ")} />
          {schedule.effectiveFrom ? (
            <ListRow label={t("medications.detail.startDate")} caption={formatDate(new Date(schedule.effectiveFrom), locale)} />
          ) : null}
          <ListRow
            label={t("medications.form.reminderToggle")}
            caption={t(schedule.reminderEnabled ? "medications.detail.reminderOn" : "medications.detail.reminderOff")}
          />
        </GroupedList>
      )}

      <GroupedList title={t("medications.detail.history")}>
        {administrations.map((item) => {
          const badge = administrationStatus(item.status);
          return (
            <ListRow
              key={item.id}
              label={`${formatShortDate(new Date(item.scheduledFor.slice(0, 10)), locale)} ${item.scheduledFor.slice(11, 16)}`}
              caption={item.status === "pending" ? undefined : statusLabel(item.status)}
              leading={
                badge ? <Ionicons name={badge.icon} size={18} color={badge.color} /> : undefined
              }
              trailing={
                item.status === "pending" ? (
                  <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-end", gap: spacing.xs, maxWidth: 160 }}>
                    <Button label={t("medications.detail.markTaken")} onPress={() => markTaken(item.id)} variant="secondary" />
                    <Button label={t("medications.detail.markMissed")} onPress={() => markMissed(item.id)} variant="secondary" />
                  </View>
                ) : null
              }
            />
          );
        })}
      </GroupedList>

      <GroupedList title={t("medications.detail.settingsTitle")}>
        <ListRow label={t("medications.detail.editSchedule")} onPress={startEditing} chevron />
      </GroupedList>

      <View style={{ marginTop: spacing.md }}>
        <Button
          label={medication.archivedAt ? t("medications.detail.archived") : t("medications.detail.archive")}
          onPress={archive}
          variant="destructive"
          disabled={!!medication.archivedAt}
        />
      </View>
    </ScreenContainer>
  );
}
