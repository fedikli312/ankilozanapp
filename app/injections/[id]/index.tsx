import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

import { ActionSheet, Button, InlineAction, ListRow, Section, ScreenContainer, useTheme } from "@/design-system";
import { formatDate, useTranslation } from "@/localization";
import { useInjectionDetail } from "@/features/injections/useInjectionDetail";
import { presentInjectionDetail, type InjectionAdministrationLike } from "@/features/injections/presentInjectionDetail";

/**
 * Injection Detail — same information hierarchy as the restructured
 * Medication Detail, adapted to injection semantics (Furkan-requested
 * audit follow-up, brief §11): identity → schedule → next/current
 * injection → recent history → full history. Injection semantics stay
 * exactly as they were — there is only ever one `pending` administration
 * at a time (completing/missing it immediately creates the next one via
 * `useInjectionDetail`'s existing `logCompleted`/`logMissed`), so unlike
 * Medication Detail there is no "needs attention" backlog concept here;
 * the only real fix needed was capping the history preview (it was an
 * unbounded `administrations.map`, same as medications) and giving
 * already-resolved rows a restrained correction affordance instead of
 * permanent buttons.
 */
export default function InjectionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t, locale } = useTranslation();
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
    correctAdministration,
  } = useInjectionDetail(id);

  const [correctionTarget, setCorrectionTarget] = useState<InjectionAdministrationLike | null>(null);

  if (!treatment) {
    return (
      <ScreenContainer>
        <Text style={{ color: colors.textSecondary }}>{t("injections.emptyTitle")}</Text>
      </ScreenContainer>
    );
  }

  const statusLabel = (status: string) => t(`injections.status.${status}`);
  const presentation = presentInjectionDetail(administrations);

  return (
    <ScreenContainer scroll>
      <Text style={{ fontSize: typography.title.fontSize, fontWeight: typography.title.fontWeight, color: colors.textPrimary }}>
        {treatment.name}
      </Text>
      <Text style={{ fontSize: typography.body.fontSize, color: colors.textSecondary, marginBottom: spacing.md }}>
        {treatment.dose}
        {treatment.archivedAt ? ` · ${t("injections.detail.archived")}` : ""}
      </Text>

      <Section title={t("medications.detail.planTitle")}>
        {schedule ? (
          <ListRow
            label={t("injections.form.intervalDays")}
            caption={t("injections.detail.everyDays", { count: schedule.intervalDays })}
          />
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
      </Section>

      {/* Next / current injection — the one actionable row, mirroring
          Medication Detail's "current dose" section (brief §11). */}
      <Section title={t("injections.detail.nextInjection")}>
        {nextInjectionDate ? (
          <View>
            <Text style={{ fontSize: typography.body.fontSize, color: colors.textPrimary, marginBottom: spacing.sm, fontVariant: ["tabular-nums"] }}>
              {formatDate(new Date(nextInjectionDate), locale)}
            </Text>
            <View style={{ flexDirection: "row", gap: spacing.xs, flexWrap: "wrap" }}>
              <Button label={t("injections.detail.logCompleted")} onPress={logCompleted} />
              <Button label={t("injections.detail.logMissed")} onPress={logMissed} variant="secondary" />
              <Button label={t("injections.detail.rescheduleEarlier")} onPress={() => rescheduleBy(-1)} variant="quiet" />
              <Button label={t("injections.detail.rescheduleLater")} onPress={() => rescheduleBy(1)} variant="quiet" />
            </View>
          </View>
        ) : (
          <Text style={{ fontSize: typography.body.fontSize, color: colors.textSecondary }}>{t("injections.detail.noCurrentInjection")}</Text>
        )}
      </Section>

      {/* Recent history — capped preview (brief §5/§11), tap to correct via
          the same restrained sheet Medication Detail uses. */}
      <Section title={t("injections.detail.recentHistoryTitle")}>
        {presentation.recentHistory.length > 0 ? (
          presentation.recentHistory.map((item) => (
            <ListRow
              key={item.id}
              label={formatDate(new Date(item.scheduledFor), locale)}
              onPress={() => setCorrectionTarget(item)}
              trailing={
                <Text style={{ fontSize: typography.body.fontSize, color: colors.textPrimary, fontWeight: "600" }}>
                  {statusLabel(item.status)}
                </Text>
              }
            />
          ))
        ) : (
          <Text style={{ fontSize: typography.body.fontSize, color: colors.textSecondary }}>{t("injections.detail.noHistory")}</Text>
        )}
      </Section>

      {presentation.hasMoreHistory ? (
        <View style={{ marginBottom: spacing.md }}>
          <InlineAction label={t("injections.detail.viewFullHistory")} onPress={() => router.push(`/injections/${treatment.id}/history`)} />
        </View>
      ) : null}

      {/* No edit-schedule action exists for injections in the current domain
          layer (unlike medications' editSchedule) — adding one would be new
          domain logic, out of scope for a visual redesign phase. Archive
          stays a standalone destructive action below, matching the
          medication detail screen's pattern. */}
      <View style={{ marginTop: spacing.md }}>
        <Button
          label={treatment.archivedAt ? t("injections.detail.archived") : t("injections.detail.archive")}
          onPress={archive}
          variant="destructive"
          disabled={!!treatment.archivedAt}
        />
      </View>

      <ActionSheet
        visible={correctionTarget !== null}
        onDismiss={() => setCorrectionTarget(null)}
        title={correctionTarget ? formatDate(new Date(correctionTarget.scheduledFor), locale) : undefined}
        actions={[
          {
            label: t("injections.detail.logCompleted"),
            onPress: () => {
              if (correctionTarget) correctAdministration(correctionTarget.id, "completed");
              setCorrectionTarget(null);
            },
          },
          {
            label: t("injections.detail.logMissed"),
            onPress: () => {
              if (correctionTarget) correctAdministration(correctionTarget.id, "missed");
              setCorrectionTarget(null);
            },
          },
        ]}
      />
    </ScreenContainer>
  );
}
