import { Redirect, useRouter } from "expo-router";
import { Text, View } from "react-native";

import { Button, ListRow, ScreenContainer, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";
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
  const { t } = useTranslation();
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

  return (
    <ScreenContainer scroll>
      {/* Priority 1 (UX spec §D): the one dominant action while incomplete, a quiet collapsed row once done. */}
      {!todaysCheckIn ? (
        <View
          style={{
            backgroundColor: colors.surfaceHighlight,
            borderRadius: 16,
            padding: spacing.lg,
            marginBottom: spacing.lg,
          }}
        >
          <Text style={{ fontSize: typography.headline.fontSize, color: colors.textPrimary, marginBottom: spacing.sm }}>
            {t("today.checkInPrompt")}
          </Text>
          <Button label={t("today.checkInCta")} onPress={() => router.push("/check-in")} />
        </View>
      ) : (
        <View style={{ marginBottom: spacing.lg }}>
          <ListRow
            label={t("today.checkInCompleted", { pain: todaysCheckIn.pain, stiffness: t(`checkIn.stiffness.${todaysCheckIn.morningStiffnessBucket}`) })}
            onPress={() => router.push("/check-in")}
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
            <View style={{ marginBottom: spacing.lg }}>
              <Text style={{ fontSize: typography.headline.fontSize, color: colors.textPrimary, marginBottom: spacing.sm }}>
                {t("today.dueToday")}
              </Text>
              {dueToday.map((row) => (
                <ListRow
                  key={row.administrationId}
                  label={row.medicationName}
                  caption={row.scheduledFor.split("T")[1]}
                  trailing={<Button label={t("medications.detail.markTaken")} onPress={() => markTaken(row.administrationId)} variant="secondary" />}
                />
              ))}
            </View>
          ) : nextMedication ? (
            <View style={{ marginBottom: spacing.lg }}>
              <Text style={{ fontSize: typography.headline.fontSize, color: colors.textPrimary, marginBottom: spacing.sm }}>
                {t("today.nextMedication")}
              </Text>
              <ListRow
                label={nextMedication.medicationName}
                caption={nextMedication.scheduledFor.replace("T", " ")}
                onPress={() => router.push("/medications")}
              />
            </View>
          ) : null}

          {nextInjection ? (
            <View style={{ marginBottom: spacing.lg }}>
              <Text style={{ fontSize: typography.headline.fontSize, color: colors.textPrimary, marginBottom: spacing.sm }}>
                {t("today.nextInjection")}
              </Text>
              <ListRow
                label={nextInjection.treatmentName}
                caption={nextInjection.scheduledFor}
                onPress={() => router.push(`/injections/${nextInjection.treatmentId}`)}
              />
            </View>
          ) : null}

          {upcomingAppointment ? (
            <View style={{ marginBottom: spacing.lg }}>
              <Text style={{ fontSize: typography.headline.fontSize, color: colors.textPrimary, marginBottom: spacing.sm }}>
                {t("today.upcomingAppointment")}
              </Text>
              <ListRow
                label={upcomingAppointment.doctorOrInstitution || t(`appointments.type.${upcomingAppointment.type}`)}
                caption={upcomingAppointment.date}
                onPress={() => router.push(`/appointments/${upcomingAppointment.id}`)}
              />
            </View>
          ) : null}

          <View style={{ flexDirection: "row", gap: spacing.sm, marginTop: spacing.md, flexWrap: "wrap" }}>
            <Button label={t("medications.listTitle")} onPress={() => router.push("/medications")} variant="secondary" />
            <Button label={t("injections.listTitle")} onPress={() => router.push("/injections")} variant="secondary" />
          </View>
        </>
      )}
    </ScreenContainer>
  );
}
