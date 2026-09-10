import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

import { ActionSheet, Button, InlineAction, ListRow, Section, ScreenContainer, useTheme } from "@/design-system";
import { formatDate, formatShortDate, useTranslation } from "@/localization";
import { useMedicationDetail } from "@/features/medications/useMedicationDetail";
import { presentMedicationDetail, type MedicationAdministrationLike } from "@/features/medications/presentMedicationDetail";
import { MedicationScheduleFields, type MedicationScheduleFieldsValue } from "@/features/medications/MedicationScheduleFields";
import { todayDateOnly } from "@/shared/today";

/**
 * Medication Detail — restructured history architecture (Furkan-requested,
 * post-audit: the original "structural redesign" had never actually been
 * implemented, only Design-I's presentational `GroupedList`→`Section` pass
 * had). Old shape: identity → plan → one "Geçmiş" `Section` dumping every
 * administration ever generated (bounded-window future pending rows
 * included) with a repeated Taken/Missed button pair on every unresolved
 * row. New shape: identity → plan → one actionable current/next dose (one
 * pair of buttons, ever) → a small capped "needs attention" backlog (only
 * when real unresolved past doses exist) → a 5-row recent-history preview
 * (tap to correct) → "View full history" to a dedicated, virtualized route.
 * All derivation is `presentMedicationDetail` (pure, unit-tested) — no new
 * domain/scheduling logic, no schema change; `administrations` is exactly
 * what `getAdministrationsForMedication` already returned before this pass.
 */
export default function MedicationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
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
  const [correctionTarget, setCorrectionTarget] = useState<MedicationAdministrationLike | null>(null);

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
  const doseDateTimeLabel = (item: MedicationAdministrationLike) =>
    `${formatShortDate(new Date(item.scheduledFor.slice(0, 10)), locale)} · ${item.scheduledFor.slice(11, 16)}`;

  const presentation = presentMedicationDetail(administrations, todayDateOnly());

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
        <Section title={t("medications.detail.planTitle")}>
          <ListRow label={t("medications.detail.schedule")} caption={scheduleTimes.map((s) => s.timeOfDay).join(" · ")} />
          {schedule.effectiveFrom ? (
            <ListRow label={t("medications.detail.startDate")} caption={formatDate(new Date(schedule.effectiveFrom), locale)} />
          ) : null}
          <ListRow
            label={t("medications.form.reminderToggle")}
            caption={t(schedule.reminderEnabled ? "medications.detail.reminderOn" : "medications.detail.reminderOff")}
          />
        </Section>
      )}

      {/* Current / next relevant dose — the ONE actionable row this screen
          ever shows a Taken/Missed pair for (brief §3), whatever its actual
          date turns out to be: overdue, today, or genuinely upcoming. */}
      <Section title={t("medications.detail.currentDoseTitle")}>
        {presentation.currentDose ? (
          <View>
            <Text style={{ fontSize: typography.body.fontSize, color: colors.textPrimary, marginBottom: spacing.sm, fontVariant: ["tabular-nums"] }}>
              {doseDateTimeLabel(presentation.currentDose)}
            </Text>
            {/* `flexWrap` — the two Turkish button labels together
                comfortably exceed 390pt in one row; wrapping lets the
                secondary button drop to its own line instead of clipping
                off the right edge (caught in live 390×844 QA). */}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs }}>
              <Button label={t("medications.detail.markTaken")} onPress={() => markTaken(presentation.currentDose!.id)} />
              <Button label={t("medications.detail.markMissed")} onPress={() => markMissed(presentation.currentDose!.id)} variant="secondary" />
            </View>
          </View>
        ) : (
          <Text style={{ fontSize: typography.body.fontSize, color: colors.textSecondary }}>{t("medications.detail.noCurrentDose")}</Text>
        )}
      </Section>

      {/* Needs attention — real backlog only (unresolved doses strictly
          before today), never the current dose itself, capped small (brief
          §9) — never the unbounded button wall the old screen had. Each row
          is its own date-then-buttons block (not `ListRow`'s label/trailing
          split) — a trailing slot squeezed next to a label is exactly what
          clipped in the current-dose row above; stacking avoids the same
          bug here at 390pt. */}
      {presentation.needsAttention.length > 0 ? (
        <Section title={t("medications.detail.needsAttentionTitle")}>
          {presentation.needsAttention.map((item) => (
            <View key={item.id} style={{ paddingVertical: spacing.sm }}>
              <Text style={{ fontSize: typography.body.fontSize, color: colors.textPrimary, marginBottom: spacing.xs, fontVariant: ["tabular-nums"] }}>
                {doseDateTimeLabel(item)}
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs }}>
                <Button label={t("medications.detail.markTaken")} onPress={() => markTaken(item.id)} variant="secondary" />
                <Button label={t("medications.detail.markMissed")} onPress={() => markMissed(item.id)} variant="quiet" />
              </View>
            </View>
          ))}
        </Section>
      ) : null}

      {/* Recent history — a capped, factual preview (brief §5). Tapping a
          row opens a restrained correction sheet (brief §8) rather than
          permanently showing two buttons on every recorded row. */}
      <Section title={t("medications.detail.recentHistoryTitle")}>
        {presentation.recentHistory.length > 0 ? (
          presentation.recentHistory.map((item) => (
            <ListRow
              key={item.id}
              label={doseDateTimeLabel(item)}
              onPress={() => setCorrectionTarget(item)}
              trailing={
                <Text style={{ fontSize: typography.body.fontSize, color: colors.textPrimary, fontWeight: "600" }}>
                  {statusLabel(item.status)}
                </Text>
              }
            />
          ))
        ) : (
          <Text style={{ fontSize: typography.body.fontSize, color: colors.textSecondary }}>{t("medications.detail.noHistory")}</Text>
        )}
      </Section>

      {presentation.hasMoreHistory ? (
        <View style={{ marginBottom: spacing.md }}>
          <InlineAction label={t("medications.detail.viewFullHistory")} onPress={() => router.push(`/medications/${medication.id}/history`)} />
        </View>
      ) : null}

      {/* A single "Edit schedule" action doesn't need its own titled section
          (Design-F precedent, Appointment Detail) — a plain inline action
          is enough. */}
      <View style={{ marginBottom: spacing.md }}>
        <InlineAction label={t("medications.detail.editSchedule")} onPress={startEditing} tone="quiet" />
      </View>

      <View style={{ marginTop: spacing.md }}>
        <Button
          label={medication.archivedAt ? t("medications.detail.archived") : t("medications.detail.archive")}
          onPress={archive}
          variant="destructive"
          disabled={!!medication.archivedAt}
        />
      </View>

      <ActionSheet
        visible={correctionTarget !== null}
        onDismiss={() => setCorrectionTarget(null)}
        title={correctionTarget ? doseDateTimeLabel(correctionTarget) : undefined}
        actions={[
          {
            label: t("medications.detail.markTaken"),
            onPress: () => {
              if (correctionTarget) markTaken(correctionTarget.id);
              setCorrectionTarget(null);
            },
          },
          {
            label: t("medications.detail.markMissed"),
            onPress: () => {
              if (correctionTarget) markMissed(correctionTarget.id);
              setCorrectionTarget(null);
            },
          },
        ]}
      />
    </ScreenContainer>
  );
}
