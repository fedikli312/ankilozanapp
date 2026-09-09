import { useRouter } from "expo-router";
import { Text } from "react-native";

import { ListRow, ScreenContainer, Section, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";
import { useInsightsLanding } from "@/features/insights/useInsightsLanding";
import {
  presentInjectionSummary,
  presentLabSummary,
  presentNumericSummary,
  presentStiffnessSummary,
  presentTreatmentRecordSummary,
} from "@/features/insights/presentInsightsLanding";
import type { InsightMetricKey } from "@/features/insights/types";

/**
 * Insights landing — Design-G. An analytical sibling of the Health
 * Record, not a dashboard: no equal-weight metric-card grid (brief §4),
 * no icons carrying metric identity (brief §21) — three boxless
 * `Section`s (Symptoms / Treatment / Labs) group the exact same 7
 * existing metrics conceptually, in a fixed editorial order (Symptoms
 * first, matching the app's own established check-in-first hierarchy
 * everywhere else) rather than any data-derived "most important metric"
 * ranking (brief §5 explicitly forbids that).
 */
export default function InsightsLandingScreen() {
  const { t } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();
  const data = useInsightsLanding();

  const goTo = (metric: InsightMetricKey) => () => router.push(`/insights/${metric}`);

  return (
    <ScreenContainer scroll>
      <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginBottom: spacing.xs }}>
        {t("insights.subtitle")}
      </Text>
      {/* Recording-window context (brief §4) — a plain fact about what
          period the rows below summarize, not a headline metric. */}
      <Text style={{ fontSize: typography.caption.fontSize, color: colors.textTertiary, marginBottom: spacing.lg }}>
        {t("insights.recordingWindow", { count: data.checkInCount })}
      </Text>

      <Section title={t("insights.group.symptoms")} tone="document">
        <ListRow label={t("insights.metric.pain")} caption={presentNumericSummary(data.pain, t)} onPress={goTo("pain")} chevron />
        <ListRow label={t("insights.metric.stiffness")} caption={presentStiffnessSummary(data.stiffness, t)} onPress={goTo("stiffness")} chevron />
        <ListRow label={t("insights.metric.fatigue")} caption={presentNumericSummary(data.fatigue, t)} onPress={goTo("fatigue")} chevron />
      </Section>

      <Section title={t("insights.group.treatment")} tone="document">
        <ListRow
          label={t("insights.metric.medicationAdherence")}
          caption={presentTreatmentRecordSummary(data.medicationAdherence, t)}
          onPress={goTo("medicationAdherence")}
          chevron
        />
        <ListRow
          label={t("insights.metric.injectionHistory")}
          caption={presentInjectionSummary(data.injectionHistory, t)}
          onPress={goTo("injectionHistory")}
          chevron
        />
      </Section>

      <Section title={t("insights.group.labs")} tone="document">
        <ListRow label={t("insights.metric.crp")} caption={presentLabSummary(data.crp, t)} onPress={goTo("crp")} chevron />
        <ListRow label={t("insights.metric.esr")} caption={presentLabSummary(data.esr, t)} onPress={goTo("esr")} chevron />
      </Section>

      <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginTop: spacing.sm, fontStyle: "italic" }}>
        {t("insights.disclaimer")}
      </Text>
    </ScreenContainer>
  );
}
