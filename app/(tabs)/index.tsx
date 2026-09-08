import Ionicons from "@expo/vector-icons/Ionicons";
import { Redirect, useRouter } from "expo-router";
import { Platform, Text, View } from "react-native";

import {
  AccessibleTouchable,
  Button,
  DateBlock,
  ListRow,
  MetricLine,
  QuietSurface,
  Section,
  ScreenContainer,
  useTheme,
} from "@/design-system";
import { DOMAIN_ICONS } from "@/design-system/icons";
import { formatDateBlock, formatHeadingDate, useTranslation } from "@/localization";
import { diffInDays } from "@/domain/dateUtils";
import { useOnboardingState } from "@/features/onboarding/useOnboardingState";
import { presentTodayCheckIn } from "@/features/today/presentTodayCheckIn";
import { useTodayData } from "@/features/today/useTodayData";
import { TodaySupportiveSlot } from "@/features/today/TodaySupportiveSlot";
import { hasGoal } from "@/personalization/goalMapping";
import { getEmptyStateAction } from "@/personalization/getEmptyStateAction";
import { resolveHasTreatment } from "@/personalization/resolveHasTreatment";
import { usePersonalizationProfile } from "@/personalization/usePersonalizationProfile";
import { todayDateOnly } from "@/shared/today";

export default function TodayScreen() {
  const { completed } = useOnboardingState();

  if (!completed) {
    return <Redirect href="/onboarding/welcome" />;
  }

  return <TodayContent />;
}

/**
 * Today — Design System 2.0, Phase Design-D. Answers one question ("what
 * matters today?") via a fixed hierarchy, not a menu of every available
 * module (brief §2): date/context, the one dominant check-in state,
 * today's treatment, the next meaningful appointment if any, and at most
 * one subordinate support item. The previous "Last 7 days" 2-metric-card
 * block and the Phase R goal-based tier2 reordering of
 * treatment/appointment/support against each other are deliberately not
 * carried into this render — see `docs/DESIGN_D_TODAY_CHECKIN.md` for the
 * full reasoning; `getTodayPriorityOrder`/`recentSummary` themselves are
 * untouched and still exist, just not consumed by this screen anymore.
 */
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
    upcomingAppointment,
    markTaken,
  } = useTodayData();
  const profile = usePersonalizationProfile();
  // Real repository state (`hasAnyTreatment`) is always authoritative over
  // onboarding's `treatmentContext` — see `resolveHasTreatment`'s own doc
  // comment (Phase R brief §15).
  const hasTreatment = resolveHasTreatment(hasAnyTreatment, profile.treatmentContext);
  const emptyStateAction =
    !hasTreatment && !upcomingAppointment && todaysCheckIn ? getEmptyStateAction(profile) : null;
  // Still-applicable Phase R personalization signals (brief §21 "preserve
  // existing product logic where applicable") — plain text links, not a
  // reordering of the fixed hierarchy below.
  const showSymptomHistoryShortcut = hasGoal(profile, "symptoms");
  const emphasizeAppointmentPrep = hasGoal(profile, "appointments");

  const checkInState = presentTodayCheckIn(todaysCheckIn, yesterdayCheckIn);
  const appointmentDateBlock = upcomingAppointment ? formatDateBlock(new Date(upcomingAppointment.date), locale) : null;
  const today = new Date();
  const todayOnly = todayDateOnly();

  const injectionDaysLeft = nextInjection ? diffInDays(todayOnly, nextInjection.scheduledFor.slice(0, 10)) : null;
  const injectionCaption = nextInjection
    ? injectionDaysLeft !== null && injectionDaysLeft <= 0
      ? t("today.injectionDueToday")
      : t("today.injectionDaysLeft", { count: injectionDaysLeft })
    : undefined;

  const hasTreatmentRows = dueToday.length > 0 || !!nextMedication || !!nextInjection;

  return (
    <ScreenContainer scroll>
      {/* 1. Lightweight date/context — no greeting, no restated question,
          no subtitle explaining what the app does (brief §3/§8). */}
      <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginBottom: spacing.lg }}>
        {formatHeadingDate(today, locale)}
      </Text>

      {/* 2. ONE dominant daily check-in state/action. */}
      {checkInState.status === "incomplete" ? (
        <QuietSurface>
          <Text style={{ fontSize: typography.sectionTitle.fontSize, fontWeight: typography.sectionTitle.fontWeight, letterSpacing: typography.sectionTitle.letterSpacing, textTransform: typography.sectionTitle.textTransform, color: colors.brandPrimary, marginBottom: spacing.xxs }}>
            {t("today.checkInSectionTitle")}
          </Text>
          <Text style={{ fontSize: typography.headline.fontSize, fontWeight: typography.headline.fontWeight, color: colors.textPrimary, marginBottom: spacing.xs }}>
            {t("today.checkInPrompt")}
          </Text>
          {checkInState.yesterdayPain !== null ? (
            <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginBottom: spacing.sm }}>
              {t("today.checkInYesterdayContext", { pain: checkInState.yesterdayPain })}
            </Text>
          ) : null}
          <Button label={t("today.checkInCta")} onPress={() => router.push("/check-in")} />
          <AccessibleTouchable
            onPress={() => router.push(`/check-in?highSymptomDay=1`)}
            accessibilityRole="button"
            accessibilityLabel={t("today.highSymptomDayCta")}
            style={{ marginTop: spacing.sm, alignSelf: "flex-start" }}
          >
            <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary }}>
              {t("today.highSymptomDayCta")}
            </Text>
          </AccessibleTouchable>
        </QuietSurface>
      ) : (
        <View style={{ marginBottom: spacing.xl }}>
          <Text style={{ fontSize: typography.sectionTitle.fontSize, fontWeight: typography.sectionTitle.fontWeight, letterSpacing: typography.sectionTitle.letterSpacing, textTransform: typography.sectionTitle.textTransform, color: colors.textSecondary, marginBottom: spacing.sm }}>
            {t("today.checkInSectionTitle")}
          </Text>
          <View style={{ gap: spacing.md }}>
            <MetricLine label={t("today.metricPain")} value={String(checkInState.pain)} unit="/10" />
            <MetricLine label={t("today.metricFatigue")} value={String(checkInState.fatigue)} unit="/10" />
            <MetricLine label={t("checkIn.stiffnessLabel")} value={t(`checkIn.stiffnessCompact.${checkInState.morningStiffnessBucket}`)} />
          </View>
          {/* A factual secondary marker only — never an alert/severity
              treatment (Product 2.1 Phase Y semantics, unchanged; brief §4). */}
          {checkInState.isHighSymptomDay ? (
            <Text style={{ fontSize: typography.caption.fontSize, color: colors.brandPrimary, marginTop: spacing.sm }}>
              {t("today.highSymptomDayRecorded")}
            </Text>
          ) : null}
          <AccessibleTouchable onPress={() => router.push("/check-in")} accessibilityRole="button" accessibilityLabel={t("today.viewOrEditCheckIn")}>
            <Text style={{ fontSize: typography.caption.fontSize, color: colors.brandPrimary, marginTop: spacing.md }}>
              {t("today.viewOrEditCheckIn")}
            </Text>
          </AccessibleTouchable>
          {showSymptomHistoryShortcut ? (
            <AccessibleTouchable onPress={() => router.push("/symptoms")} accessibilityRole="button" accessibilityLabel={t("today.viewSymptomHistory")}>
              <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginTop: spacing.xxs }}>
                {t("today.viewSymptomHistory")}
              </Text>
            </AccessibleTouchable>
          ) : null}
        </View>
      )}

      {!hasTreatment ? (
        <View style={{ alignItems: "flex-start" }}>
          <Text style={{ fontSize: typography.body.fontSize, color: colors.textSecondary, marginBottom: spacing.md }}>
            {t("today.emptyPrompt")}
          </Text>
          <Button label={t("today.emptyAction")} onPress={() => router.push("/medications/add")} />
          {emptyStateAction ? (
            <AccessibleTouchable
              onPress={() => router.push(emptyStateAction.route)}
              accessibilityRole="button"
              accessibilityLabel={t(emptyStateAction.labelKey)}
              style={{ marginTop: spacing.sm }}
            >
              <Text style={{ fontSize: typography.caption.fontSize, color: colors.brandPrimary }}>{t(emptyStateAction.labelKey)}</Text>
            </AccessibleTouchable>
          ) : null}
        </View>
      ) : (
        <>
          {/* 3. Today's treatment — medications and injections combined
              into one compact, hairline-separated list (brief §5): label
              / row / status / action, no per-medication card, no
              decorative icon circles. */}
          {hasTreatmentRows ? (
            <Section title={t("today.treatmentTitle")}>
              {dueToday.length > 0
                ? dueToday.map((row) => (
                    <ListRow
                      key={row.administrationId}
                      leading={<Ionicons name={DOMAIN_ICONS.medication.outline} size={18} color={colors.textSecondary} />}
                      label={row.medicationName}
                      caption={`${row.medicationDose} · ${row.scheduledFor.split("T")[1] ?? ""}`}
                      trailing={
                        row.status === "taken" ? (
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                            <Ionicons name="checkmark-circle" size={16} color={colors.brandPrimary} />
                            <Text style={{ fontSize: typography.caption.fontSize, color: colors.brandPrimary }}>
                              {t("today.markTakenShort")}
                            </Text>
                          </View>
                        ) : (
                          <Button label={t("today.markTakenShort")} onPress={() => markTaken(row.administrationId)} variant="secondary" />
                        )
                      }
                    />
                  ))
                : nextMedication
                  ? [
                      <ListRow
                        key="next-medication"
                        leading={<Ionicons name={DOMAIN_ICONS.medication.outline} size={18} color={colors.textSecondary} />}
                        label={nextMedication.medicationName}
                        caption={nextMedication.medicationDose}
                        onPress={() => router.push("/medications")}
                        chevron
                      />,
                    ]
                  : []}
              {nextInjection ? (
                <ListRow
                  leading={<Ionicons name={DOMAIN_ICONS.injection.outline} size={18} color={colors.textSecondary} />}
                  label={nextInjection.treatmentName}
                  caption={injectionCaption}
                  onPress={() => router.push(`/injections/${nextInjection.treatmentId}`)}
                  chevron
                />
              ) : null}
            </Section>
          ) : null}

          {/* 4. The one next meaningful appointment, if any — a single
              concise row, not the Appointments screen re-created here. */}
          {upcomingAppointment && appointmentDateBlock ? (
            <Section title={t("today.upcomingAppointment")}>
              <ListRow
                leading={<DateBlock day={appointmentDateBlock.day} month={appointmentDateBlock.month} emphasis="strong" />}
                label={upcomingAppointment.doctorOrInstitution || t(`appointments.type.${upcomingAppointment.type}`)}
                caption={
                  upcomingAppointment.doctorOrInstitution
                    ? `${t(`appointments.type.${upcomingAppointment.type}`)}${upcomingAppointment.time ? ` · ${upcomingAppointment.time}` : ""}`
                    : (upcomingAppointment.time ?? undefined)
                }
                onPress={() => router.push(`/appointments/${upcomingAppointment.id}`)}
                chevron
              />
              {emphasizeAppointmentPrep ? (
                <AccessibleTouchable
                  onPress={() => router.push(`/appointments/${upcomingAppointment.id}/prepare`)}
                  accessibilityRole="button"
                  accessibilityLabel={t("today.prepareAppointment")}
                >
                  <Text style={{ fontSize: typography.caption.fontSize, color: colors.brandPrimary, marginTop: spacing.xxs }}>
                    {t("today.prepareAppointment")}
                  </Text>
                </AccessibleTouchable>
              ) : null}
            </Section>
          ) : null}

          {/* 5. At most one subordinate support item. */}
          <TodaySupportiveSlot />
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
