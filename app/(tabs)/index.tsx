import { Redirect, useRouter } from "expo-router";
import { Text, View } from "react-native";

import { Button, DateBlock, ListRow, SectionLabel, ScreenContainer, useTheme } from "@/design-system";
import { formatDateBlock, formatHeadingDate, useTranslation } from "@/localization";
import { useOnboardingState } from "@/features/onboarding/useOnboardingState";
import { useTodayData } from "@/features/today/useTodayData";

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
    upcomingAppointment,
    markTaken,
  } = useTodayData();

  const appointmentDateBlock = upcomingAppointment ? formatDateBlock(new Date(upcomingAppointment.date), locale) : null;

  return (
    <ScreenContainer scroll>
      <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginBottom: spacing.md }}>
        {formatHeadingDate(new Date(), locale)}
      </Text>

      {/* Priority 1 (UX spec §D): the one dominant action while incomplete, a quiet collapsed row once done — the app's single `surfaceHighlight` moment per §13. */}
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
          <Text style={{ fontSize: typography.body.fontSize, color: colors.textPrimary, marginBottom: spacing.sm }}>
            {t("today.checkInPrompt")}
          </Text>
          <Button label={t("today.checkInCta")} onPress={() => router.push("/check-in")} />
        </View>
      ) : (
        <View style={{ marginBottom: spacing.lg }}>
          <ListRow
            label={t("today.checkInCompleted", { pain: todaysCheckIn.pain, stiffness: t(`checkIn.stiffness.${todaysCheckIn.morningStiffnessBucket}`) })}
            onPress={() => router.push("/check-in")}
            chevron
          />
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
            <View style={{ marginBottom: spacing.md }}>
              <SectionLabel>{t("today.dueToday")}</SectionLabel>
              {dueToday.map((row) => (
                <ListRow
                  key={row.administrationId}
                  label={row.medicationName}
                  caption={`${row.medicationDose} · ${row.scheduledFor.split("T")[1]}`}
                  trailing={
                    <Button label={t("medications.detail.markTaken")} onPress={() => markTaken(row.administrationId)} variant="secondary" />
                  }
                />
              ))}
            </View>
          ) : nextMedication ? (
            <View style={{ marginBottom: spacing.md }}>
              <SectionLabel>{t("today.nextMedication")}</SectionLabel>
              <ListRow
                label={nextMedication.medicationName}
                caption={`${nextMedication.medicationDose} · ${nextMedication.scheduledFor.replace("T", " ")}`}
                onPress={() => router.push("/medications")}
                chevron
              />
            </View>
          ) : null}

          {nextInjection ? (
            <View style={{ marginBottom: spacing.md }}>
              <SectionLabel>{t("today.nextInjection")}</SectionLabel>
              <ListRow
                label={nextInjection.treatmentName}
                caption={nextInjection.scheduledFor}
                onPress={() => router.push(`/injections/${nextInjection.treatmentId}`)}
                chevron
              />
            </View>
          ) : null}

          {upcomingAppointment && appointmentDateBlock ? (
            <View style={{ marginBottom: spacing.md }}>
              <SectionLabel>{t("today.upcomingAppointment")}</SectionLabel>
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
            </View>
          ) : null}

          <View style={{ flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm, flexWrap: "wrap" }}>
            <Button label={t("medications.listTitle")} onPress={() => router.push("/medications")} variant="secondary" />
            <Button label={t("injections.listTitle")} onPress={() => router.push("/injections")} variant="secondary" />
          </View>
        </>
      )}
    </ScreenContainer>
  );
}
