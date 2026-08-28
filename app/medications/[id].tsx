import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { FlatList, Text, View } from "react-native";

import { Button, ListRow, ScreenContainer, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";
import { useMedicationDetail } from "@/features/medications/useMedicationDetail";
import { MedicationScheduleFields, type MedicationScheduleFieldsValue } from "@/features/medications/MedicationScheduleFields";

export default function MedicationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
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

  return (
    <ScreenContainer scroll>
      <Text style={{ fontSize: typography.title.fontSize, fontWeight: typography.title.fontWeight, color: colors.textPrimary }}>
        {medication.name}
      </Text>
      <Text style={{ fontSize: typography.body.fontSize, color: colors.textSecondary, marginBottom: spacing.md }}>
        {medication.dose}
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
        <ListRow
          label={t("medications.detail.editSchedule")}
          caption={scheduleTimes[0]?.timeOfDay}
          onPress={startEditing}
        />
      )}

      <Text style={{ fontSize: typography.headline.fontSize, color: colors.textPrimary, marginTop: spacing.lg, marginBottom: spacing.sm }}>
        {t("medications.detail.history")}
      </Text>
      <FlatList
        data={administrations}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <ListRow
            label={item.scheduledFor.replace("T", " ")}
            caption={statusLabel(item.status)}
            trailing={
              item.status === "pending" ? (
                <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-end", gap: spacing.xs, maxWidth: 160 }}>
                  <Button label={t("medications.detail.markTaken")} onPress={() => markTaken(item.id)} variant="secondary" />
                  <Button label={t("medications.detail.markMissed")} onPress={() => markMissed(item.id)} variant="secondary" />
                </View>
              ) : null
            }
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: colors.borderHairline }} />}
      />

      <View style={{ marginTop: spacing.lg }}>
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
