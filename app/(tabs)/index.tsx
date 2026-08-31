import Ionicons from "@expo/vector-icons/Ionicons";
import { Redirect, useRouter } from "expo-router";
import { Platform, Text, View } from "react-native";

import {
  AccessibleTouchable,
  Button,
  DateBlock,
  GroupedList,
  ListRow,
  MetricCard,
  SectionLabel,
  ScreenContainer,
  useTheme,
} from "@/design-system";
import { formatDateBlock, formatHeadingDate, formatShortDate, useTranslation } from "@/localization";
import { diffInDays } from "@/domain/dateUtils";
import { useOnboardingState } from "@/features/onboarding/useOnboardingState";
import { useTodayData } from "@/features/today/useTodayData";
import { TodaySupportiveSlot } from "@/features/today/TodaySupportiveSlot";
import { todayDateOnly } from "@/shared/today";

export default function TodayScreen() {
  const { completed } = useOnboardingState();

  if (!completed) {
    return <Redirect href="/onboarding/welcome" />;
  }

  return <TodayContent />;
}

function TodayContent() {
  const { t, locale } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();
  const {
    hasAnyTreatment,
    dueToday,
    nextMedication,
    nextInjection,
    todaysCheckIn,
    yesterdayCheckIn,
    recentSummary,
    upcomingAppointment,
    markTaken,
  } = useTodayData();

  const appointmentDateBlock = upcomingAppointment ? formatDateBlock(new Date(upcomingAppointment.date), locale) : null;
  const today = new Date();
  const todayOnly = todayDateOnly();

  const injectionDaysLeft = nextInjection ? diffInDays(todayOnly, nextInjection.scheduledFor.slice(0, 10)) : null;
  const injectionDateLabel = nextInjection ? formatShortDate(new Date(nextInjection.scheduledFor.slice(0, 10)), locale) : "";
  const injectionCaption = nextInjection
    ? injectionDaysLeft !== null && injectionDaysLeft <= 0
      ? `${t("today.injectionDueToday")} · ${injectionDateLabel}`
      : `${t("today.injectionDaysLeft", { count: injectionDaysLeft })} · ${injectionDateLabel}`
    : undefined;

  return (
    <ScreenContainer scroll>
      {/* Redesign Spec §9 header: greeting + strong question + one supporting line. */}
      <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginBottom: 2 }}>
        {t("today.greeting")}
      </Text>
      <Text
        style={{
          fontSize: typography.title.fontSize,
          fontWeight: typography.title.fontWeight,
          color: colors.textPrimary,
          marginBottom: spacing.xxs,
        }}
      >
        {t("today.headerTitle")}
      </Text>
      <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginBottom: 2 }}>
        {t("today.headerSubtitle")}
      </Text>
      <Text style={{ fontSize: typography.micro.fontSize, color: colors.textSecondary, marginBottom: spacing.md }}>
        {formatHeadingDate(today, locale)}
      </Text>

      {/* Priority 1 (UX spec §D): the one dominant action while incomplete, a quiet completed summary once done — the app's single `surfaceHighlight` moment per Visual Design Spec §13. */}
      {!todaysCheckIn ? (
        <View
          style={{
            backgroundColor: colors.surfaceHighlight,
            borderRadius: 16,
            padding: spacing.md,
            marginBottom: spacing.lg,
          }}
        >
          <Text style={{ fontSize: typography.caption.fontSize, fontWeight: "600", color: colors.accent, marginBottom: 2 }}>
            {t("today.checkInSectionTitle")}
          </Text>
          <Text style={{ fontSize: typography.body.fontSize, color: colors.textPrimary, marginBottom: spacing.xs }}>
            {t("today.checkInPrompt")}
          </Text>
          {/* Previous context only, never presented as today's value (Redesign Spec §9). */}
          {yesterdayCheckIn ? (
            <Text style={{ fontSize: typography.micro.fontSize, color: colors.textSecondary, marginBottom: spacing.sm }}>
              {t("today.checkInYesterdayContext", { pain: yesterdayCheckIn.pain })}
            </Text>
          ) : null}
          <Button label={t("today.checkInCta")} onPress={() => router.push("/check-in")} />
        </View>
      ) : (
        <View style={{ marginBottom: spacing.lg }}>
          <Text style={{ fontSize: typography.caption.fontSize, fontWeight: "600", color: colors.accent, marginBottom: spacing.xs }}>
            {t("today.checkInSectionTitle")}
          </Text>
          <View style={{ flexDirection: "row", gap: spacing.xs, marginBottom: spacing.xs }}>
            <MetricCard label={t("today.metricPain")} value={String(todaysCheckIn.pain)} unit="/10" />
            <MetricCard label={t("checkIn.stiffnessLabel")} value={t(`checkIn.stiffness.${todaysCheckIn.morningStiffnessBucket}`)} />
            <MetricCard label={t("today.metricFatigue")} value={String(todaysCheckIn.fatigue)} unit="/10" />
          </View>
          <AccessibleTouchable onPress={() => router.push("/check-in")} accessibilityRole="button" accessibilityLabel={t("today.viewOrEditCheckIn")}>
            <Text style={{ fontSize: typography.caption.fontSize, color: colors.accent, marginTop: spacing.xxs }}>
              {t("today.viewOrEditCheckIn")}
            </Text>
          </AccessibleTouchable>
        </View>
      )}

      {!hasAnyTreatment ? (
        <View style={{ alignItems: "flex-start" }}>
          <Text style={{ fontSize: typography.body.fontSize, color: colors.textSecondary, marginBottom: spacing.md }}>
            {t("today.emptyPrompt")}
          </Text>
          <Button label={t("today.emptyAction")} onPress={() => router.push("/medications/add")} />
        </View>
      ) : (
        <>
          {dueToday.length > 0 ? (
            <GroupedList title={t("today.dueToday")}>
              {dueToday.map((row) => (
                <ListRow
                  key={row.administrationId}
                  label={row.medicationName}
                  caption={`${row.medicationDose} · ${row.scheduledFor.split("T")[1] ?? ""}`}
                  trailing={
                    row.status === "taken" ? (
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                        <Ionicons name="checkmark-circle" size={16} color={colors.accent} />
                        <Text style={{ fontSize: typography.caption.fontSize, color: colors.accent }}>
                          {t("today.markTakenShort")}
                        </Text>
                      </View>
                    ) : (
                      <Button label={t("today.markTakenShort")} onPress={() => markTaken(row.administrationId)} variant="secondary" />
                    )
                  }
                />
              ))}
            </GroupedList>
          ) : nextMedication ? (
            <GroupedList title={t("today.nextMedication")}>
              <ListRow
                label={nextMedication.medicationName}
                caption={`${nextMedication.medicationDose} · ${formatShortDate(new Date(nextMedication.scheduledFor.slice(0, 10)), locale)} ${nextMedication.scheduledFor.slice(11, 16)}`}
                onPress={() => router.push("/medications")}
                chevron
              />
            </GroupedList>
          ) : null}

          {nextInjection ? (
            <GroupedList title={t("today.nextInjection")}>
              <ListRow
                leading={<Ionicons name="medical-outline" size={20} color={colors.textSecondary} />}
                label={nextInjection.treatmentName}
                caption={injectionCaption}
                onPress={() => router.push(`/injections/${nextInjection.treatmentId}`)}
                chevron
              />
            </GroupedList>
          ) : null}

          {upcomingAppointment && appointmentDateBlock ? (
            <GroupedList title={t("today.upcomingAppointment")}>
              <ListRow
                leading={<DateBlock day={appointmentDateBlock.day} month={appointmentDateBlock.month} emphasis="strong" />}
                label={upcomingAppointment.doctorOrInstitution || t(`appointments.type.${upcomingAppointment.type}`)}
                caption={
                  upcomingAppointment.doctorOrInstitution
                    ? `${t(`appointments.type.${upcomingAppointment.type}`)}${upcomingAppointment.time ? ` · ${upcomingAppointment.time}` : ""}`
                    : upcomingAppointment.time ?? undefined
                }
                onPress={() => router.push(`/appointments/${upcomingAppointment.id}`)}
                chevron
              />
            </GroupedList>
          ) : null}

          <TodaySupportiveSlot />

          {recentSummary ? (
            <View style={{ marginBottom: spacing.md }}>
              <SectionLabel>{t("today.recentSummaryTitle")}</SectionLabel>
              <View style={{ flexDirection: "row", gap: spacing.xs }}>
                <MetricCard
                  label={t("today.recentAveragePain")}
                  value={recentSummary.averagePain.toFixed(1)}
                  unit="/10"
                />
                <MetricCard
                  label={t("today.recentCheckInFrequency")}
                  value={String(recentSummary.checkInCount)}
                  unit={t("today.recentFrequencyUnit")}
                />
              </View>
            </View>
          ) : null}

          <View style={{ flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm, flexWrap: "wrap" }}>
            <Button label={t("medications.listTitle")} onPress={() => router.push("/medications")} variant="secondary" />
            <Button label={t("injections.listTitle")} onPress={() => router.push("/injections")} variant="secondary" />
          </View>
        </>
      )}

      {/* Dev-web-preview-only entry point: the seeded web preview store
          starts with onboarding already completed, so this is the only way
          to reach the onboarding flow from the running preview without
          typing the URL directly. Platform-gated identically to the mobile
          preview shell in app/_layout.tsx; unreachable on iOS/Android and
          never touches real onboarding-completion persistence. */}
      {Platform.OS === "web" ? (
        <AccessibleTouchable
          onPress={() => router.push("/onboarding/welcome")}
          accessibilityRole="button"
          accessibilityLabel={t("today.previewOnboardingDevOnly")}
          style={{ marginTop: spacing.lg, alignSelf: "center" }}
        >
          <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary }}>
            {t("today.previewOnboardingDevOnly")}
          </Text>
        </AccessibleTouchable>
      ) : null}
    </ScreenContainer>
  );
}
