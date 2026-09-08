import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { InlineAction, ListRow, Section, SectionLabel, ScreenContainer, useTheme } from "@/design-system";
import { formatShortDate, useTranslation } from "@/localization";
import { presentTimelineEvent } from "@/features/timeline/presentTimelineEvent";
import { TimelineEventRow } from "@/features/timeline/TimelineEventRow";
import { TimelineRailLine } from "@/features/timeline/TimelineRailLine";
import { useTimeline } from "@/features/timeline/useTimeline";
import { useTrackLanding } from "@/features/track/useTrackLanding";
import { getTrackSupportOrder } from "@/personalization/getTrackSupportOrder";
import { usePersonalizationProfile } from "@/personalization/usePersonalizationProfile";
import { todayDateOnly } from "@/shared/today";

const RECENT_HISTORY_PREVIEW_LIMIT = 3;

/**
 * Health Record landing — Design System 2.0, Phase Design-E. Answers "what
 * has been happening with my AS?" via a fixed hierarchy (brief §2): a
 * context line, a compact Timeline preview as the primary anchor, the
 * recording categories as one continuous list (not six feature cards),
 * a Trends/Insights entry folded into that same list, and — clearly
 * subordinate, last — Nutrition/Breathing as supporting record utilities.
 *
 * Knowledge is deliberately no longer part of this hierarchy (brief §16):
 * its route (`/knowledge`) and content are untouched, just not linked
 * from here anymore. Its eventual home (most likely Profile) is not
 * decided or built in this phase — see `docs/DESIGN_E_HEALTH_RECORD_TIMELINE.md`
 * for that flagged-not-solved note (a Design-H task).
 */
export default function TrackLandingScreen() {
  const { t, locale } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();
  const {
    latestCheckInDate,
    activeMedications,
    activeInjections,
    nextInjectionDate,
    nextInjectionDaysLeft,
    latestLabResult,
  } = useTrackLanding();
  const { months, today, isEmpty } = useTimeline();
  const profile = usePersonalizationProfile();
  // Only `healthOrder` still applies here — see the doc's "what changed"
  // section for why `knowledgeEmphasized` has no consumer on this screen
  // anymore (Knowledge itself was removed from the hierarchy, not just
  // its emphasis cue).
  const { healthOrder } = getTrackSupportOrder(profile);
  const symptomsFirst = healthOrder.indexOf("symptoms") < healthOrder.indexOf("medications");

  const symptomsCaption = latestCheckInDate
    ? t(
        latestCheckInDate === todayDateOnly() ? "track.latestCheckInToday" : "track.latestCheckInOn",
        latestCheckInDate === todayDateOnly()
          ? undefined
          : { date: formatShortDate(new Date(latestCheckInDate), locale) },
      )
    : t("track.noneYet");

  const medicationsCaption =
    activeMedications.length > 0 ? t("track.countActive", { count: activeMedications.length }) : t("track.noneYet");

  const injectionsCaption =
    activeInjections.length === 0
      ? t("track.noneYet")
      : nextInjectionDate && nextInjectionDaysLeft !== null
        ? nextInjectionDaysLeft <= 0
          ? t("track.injectionsToday")
          : t("track.injectionsNextIn", { count: nextInjectionDaysLeft })
        : t("track.countActive", { count: activeInjections.length });

  const labsCaption = latestLabResult
    ? t("track.labsLatestResult", { date: formatShortDate(new Date(latestLabResult.recordedDate), locale) })
    : t("track.noneYet");

  const symptomsRow = (
    <ListRow key="symptoms" label={t("track.symptoms")} caption={symptomsCaption} onPress={() => router.push("/symptoms")} chevron />
  );
  const treatmentRows = [
    <SectionLabel key="treatment-label">{t("today.treatmentTitle")}</SectionLabel>,
    <ListRow key="medications" label={t("medications.listTitle")} caption={medicationsCaption} onPress={() => router.push("/medications")} chevron />,
    <ListRow key="injections" label={t("injections.listTitle")} caption={injectionsCaption} onPress={() => router.push("/injections")} chevron />,
  ];
  const labsRow = <ListRow key="labs" label={t("track.labs")} caption={labsCaption} onPress={() => router.push("/labs")} chevron />;
  const trendsRow = (
    <ListRow key="trends" label={t("insights.title")} caption={t("track.trendsCaption")} onPress={() => router.push("/insights")} chevron />
  );

  const previewEvents = months
    .flatMap((month) => month.days.flatMap((day) => day.events))
    .slice(0, RECENT_HISTORY_PREVIEW_LIMIT);

  return (
    <ScreenContainer scroll>
      {/* 1. Heading/context — the native tab header already renders "Health
          Record" (Design-B); this line is the only in-content context,
          never a duplicate title (the exact anti-pattern this screen was
          previously corrected for). */}
      <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginBottom: spacing.lg }}>
        {t("track.subtitle")}
      </Text>

      {/* 2. Timeline anchor — a compact preview of the same rail/marker
          language the full Timeline uses (brief §10), not a duplicate of
          the whole screen. */}
      <View style={{ marginBottom: spacing.xl }}>
        <SectionLabel>{t("track.recentHistoryTitle")}</SectionLabel>
        {isEmpty ? (
          <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginBottom: spacing.sm }}>
            {t("track.recentHistoryEmpty")}
          </Text>
        ) : (
          <View style={{ position: "relative", marginBottom: spacing.xs }}>
            <TimelineRailLine />
            {previewEvents.map((event) => {
              const { label, caption, accessibilityLabel } = presentTimelineEvent(event, t, today);
              return <TimelineEventRow key={event.id} type={event.type} label={label} caption={caption} accessibilityLabel={accessibilityLabel} />;
            })}
          </View>
        )}
        <InlineAction label={t("track.viewFullTimeline")} onPress={() => router.push("/timeline")} tone="quiet" />
      </View>

      {/* 3+4. Recording categories, plus the Trends/Insights entry folded
          into the same continuous list (brief §2's own worked example) —
          one hairline-separated `Section`, never six feature cards.
          Symptoms and the Treatment pair (Medications+Injections) swap
          relative order per the existing, unchanged Phase R personalization
          rule; Labs and Trends always come last. */}
      <Section>
        {symptomsFirst ? [symptomsRow, ...treatmentRows, labsRow, trendsRow] : [...treatmentRows, symptomsRow, labsRow, trendsRow]}
      </Section>

      {/* 5. Supporting record utilities — clearly subordinate, last.
          Knowledge is intentionally not here (brief §16). */}
      <View style={{ marginTop: spacing.md }}>
        <Section title={t("track.supportGroupTitle")}>
          <ListRow label={t("track.nutrition")} caption={t("track.nutritionCaption")} onPress={() => router.push("/nutrition")} chevron />
          <ListRow label={t("track.breathing")} caption={t("track.breathingCaption")} onPress={() => router.push("/breathing")} chevron />
        </Section>
      </View>
    </ScreenContainer>
  );
}
