import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

import { Button, GroupedList, ListRow, ScreenContainer, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";
import { useInjectionDetail } from "@/features/injections/useInjectionDetail";

export default function InjectionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const {
    treatment,
    schedule,
    administrations,
    nextInjectionDate,
    logCompleted,
    logMissed,
    rescheduleBy,
    archive,
  } = useInjectionDetail(id);

  if (!treatment) {
    return (
      <ScreenContainer>
        <Text style={{ color: colors.textSecondary }}>{t("injections.emptyTitle")}</Text>
      </ScreenContainer>
    );
  }

  const statusLabel = (status: string) => t(`injections.status.${status}`);

  const administrationStatus = (status: string) => {
    if (status === "completed") return { icon: "checkmark-circle" as const, color: colors.accent };
    if (status === "missed") return { icon: "ellipse-outline" as const, color: colors.statusNeutral };
    return null;
  };

  return (
    <ScreenContainer scroll>
      <Text style={{ fontSize: typography.title.fontSize, fontWeight: typography.title.fontWeight, color: colors.textPrimary }}>
        {treatment.name}
      </Text>
      <Text style={{ fontSize: typography.body.fontSize, color: colors.textSecondary, marginBottom: spacing.md }}>
        {treatment.dose}
        {treatment.archivedAt ? ` · ${t("injections.detail.archived")}` : ""}
      </Text>

      <GroupedList title={t("medications.detail.planTitle")}>
        {schedule ? (
          <ListRow
            label={t("injections.form.intervalDays")}
            caption={t("injections.detail.everyDays", { count: schedule.intervalDays })}
          />
        ) : null}
        {nextInjectionDate ? (
          <ListRow label={t("injections.detail.nextInjection")} caption={nextInjectionDate} />
        ) : null}
        {schedule ? (
          <ListRow
            label={t("injections.form.reminderToggle")}
            caption={t(
              schedule.reminderLeadDays > 0 || schedule.reminderOnScheduledDay
                ? "medications.detail.reminderOn"
                : "medications.detail.reminderOff",
            )}
          />
        ) : null}
      </GroupedList>

      {nextInjectionDate ? (
        <View style={{ flexDirection: "row", gap: spacing.xs, flexWrap: "wrap", marginBottom: spacing.lg }}>
          <Button label={t("injections.detail.logCompleted")} onPress={logCompleted} />
          <Button label={t("injections.detail.logMissed")} onPress={logMissed} variant="secondary" />
          <Button label={t("injections.detail.rescheduleEarlier")} onPress={() => rescheduleBy(-1)} variant="secondary" />
          <Button label={t("injections.detail.rescheduleLater")} onPress={() => rescheduleBy(1)} variant="secondary" />
        </View>
      ) : null}

      <GroupedList title={t("injections.detail.history")}>
        {administrations.map((item) => {
          const badge = administrationStatus(item.status);
          return (
            <ListRow
              key={item.id}
              label={item.scheduledFor}
              caption={item.status === "pending" ? undefined : statusLabel(item.status)}
              leading={badge ? <Ionicons name={badge.icon} size={18} color={badge.color} /> : undefined}
            />
          );
        })}
      </GroupedList>

      {/* No edit-schedule action exists for injections in the current domain
          layer (unlike medications' editSchedule) — adding one would be new
          domain logic, out of scope for a visual redesign phase. AYARLAR
          would otherwise be empty, so archive stays a standalone destructive
          action below, matching the medication detail screen's pattern and
          keeping it visually separated per the redesign spec. */}
      <View style={{ marginTop: spacing.md }}>
        <Button
          label={treatment.archivedAt ? t("injections.detail.archived") : t("injections.detail.archive")}
          onPress={archive}
          variant="destructive"
          disabled={!!treatment.archivedAt}
        />
      </View>
    </ScreenContainer>
  );
}
