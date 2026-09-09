import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { AccessibleTouchable, Button, DateBlock, Hairline, ListRow, Section, SectionLabel, ScreenContainer, useTheme } from "@/design-system";
import { formatDateBlock, useTranslation } from "@/localization";
import { diffInDays, parseDateOnly } from "@/domain/dateUtils";
import { todayDateOnly } from "@/shared/today";
import { useAppointments } from "@/features/appointments/useAppointments";

/**
 * Appointments — Design System 2.0, Phase Design-F. Answers "what is my
 * next rheumatology visit, and am I ready for it?" via a fixed hierarchy
 * (brief §3): the next upcoming appointment dominates, a Prepare entry sits
 * directly on it, and past appointments read as a compact document history
 * — never a flat list of equally-weighted cards.
 */
export default function AppointmentsListScreen() {
  const { t, locale } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();
  const { upcoming, past } = useAppointments();
  const today = todayDateOnly();

  type AppointmentItem = (typeof upcoming)[number];
  const [primary, ...secondaryUpcoming] = upcoming;

  if (upcoming.length === 0 && past.length === 0) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: typography.body.fontSize, color: colors.textSecondary, marginBottom: spacing.md }}>
            {t("appointments.emptyTitle")}
          </Text>
          <Button label={t("appointments.addAction")} onPress={() => router.push("/appointments/add")} />
        </View>
      </ScreenContainer>
    );
  }

  const contextLine = (item: AppointmentItem): string => {
    const days = diffInDays(today, item.date);
    if (days <= 0) return t("appointments.form.today");
    return t("appointments.daysUntil", { count: days });
  };

  const historyRow = (item: AppointmentItem) => {
    const block = formatDateBlock(parseDateOnly(item.date), locale);
    const typeLabel = t(`appointments.type.${item.type}`);
    const caption = [typeLabel, item.status !== "scheduled" ? t(`appointments.status.${item.status}`) : null]
      .filter(Boolean)
      .join(" · ");
    return (
      <ListRow
        key={item.id}
        leading={<DateBlock day={block.day} month={block.month} />}
        label={item.doctorOrInstitution || typeLabel}
        caption={caption}
        onPress={() => router.push(`/appointments/${item.id}`)}
        chevron
      />
    );
  };

  return (
    <ScreenContainer scroll>
      <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginBottom: spacing.lg }}>
        {t("appointments.subtitle")}
      </Text>

      {/* 1. The next upcoming appointment dominates — open composition,
          editorial date treatment, no surrounding box (brief §4). */}
      {primary ? (
        <View style={{ marginBottom: spacing.xl }}>
          <SectionLabel>{t("appointments.upcoming")}</SectionLabel>
          <AccessibleTouchable
            onPress={() => router.push(`/appointments/${primary.id}`)}
            accessibilityRole="button"
            accessibilityLabel={primary.doctorOrInstitution || t(`appointments.type.${primary.type}`)}
          >
            <View style={{ flexDirection: "row", alignItems: "flex-start", gap: spacing.md }}>
              <DateBlock
                day={formatDateBlock(parseDateOnly(primary.date), locale).day}
                month={formatDateBlock(parseDateOnly(primary.date), locale).month}
                emphasis="strong"
              />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary }}>
                  {t(`appointments.type.${primary.type}`)}
                </Text>
                <Text style={{ fontSize: typography.title.fontSize, fontWeight: typography.title.fontWeight, color: colors.textPrimary }}>
                  {primary.doctorOrInstitution || t(`appointments.type.${primary.type}`)}
                </Text>
                <Text style={{ fontSize: typography.body.fontSize, color: colors.textSecondary, marginTop: 2 }}>
                  {[contextLine(primary), primary.time].filter(Boolean).join(" · ")}
                </Text>
              </View>
            </View>
          </AccessibleTouchable>
          {primary.type === "rheumatology" ? (
            <View style={{ marginTop: spacing.md }}>
              <Button label={t("appointments.detail.prepare")} onPress={() => router.push(`/appointments/${primary.id}/prepare`)} />
            </View>
          ) : null}

          {/* Additional upcoming appointments stay compact — never equal
              visual weight to the primary one (brief §3: "do not give
              every appointment equal visual weight"). */}
          {secondaryUpcoming.length > 0 ? (
            <View style={{ marginTop: spacing.md }}>
              <Hairline />
              {secondaryUpcoming.map((item) => (
                <ListRow
                  key={item.id}
                  leading={<DateBlock day={formatDateBlock(parseDateOnly(item.date), locale).day} month={formatDateBlock(parseDateOnly(item.date), locale).month} />}
                  label={item.doctorOrInstitution || t(`appointments.type.${item.type}`)}
                  caption={t(`appointments.type.${item.type}`)}
                  onPress={() => router.push(`/appointments/${item.id}`)}
                  chevron
                />
              ))}
            </View>
          ) : null}
        </View>
      ) : (
        <View style={{ marginBottom: spacing.xl }}>
          <SectionLabel>{t("appointments.upcoming")}</SectionLabel>
          <Text style={{ fontSize: typography.body.fontSize, color: colors.textSecondary, marginBottom: spacing.sm }}>
            {t("appointments.noUpcoming")}
          </Text>
          <Button label={t("appointments.addAction")} onPress={() => router.push("/appointments/add")} variant="secondary" />
        </View>
      )}

      {/* 2. Past appointments read as a compact document history — date,
          context, status, hairline, navigation affordance (brief §6) —
          the same `DateBlock`/hairline language Health Record's own
          Symptoms/Timeline surfaces already use, not a duplicate of the
          Timeline rail itself. */}
      {past.length > 0 ? (
        <View style={{ marginBottom: spacing.md }}>
          <Section title={t("appointments.past")}>{past.map((item) => historyRow(item))}</Section>
        </View>
      ) : null}

      {upcoming.length > 0 ? (
        <View style={{ marginTop: spacing.sm }}>
          <Button label={t("appointments.addAction")} onPress={() => router.push("/appointments/add")} variant="secondary" />
        </View>
      ) : null}
    </ScreenContainer>
  );
}
