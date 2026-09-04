import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import type { ComponentProps, ReactElement } from "react";
import { Text } from "react-native";

import { GroupedList, ListRow, ScreenContainer, useTheme } from "@/design-system";
import { formatShortDate, useTranslation } from "@/localization";
import { useTrackLanding } from "@/features/track/useTrackLanding";
import { getTrackSupportOrder, type TrackHealthRowId } from "@/personalization/getTrackSupportOrder";
import { usePersonalizationProfile } from "@/personalization/usePersonalizationProfile";
import { todayDateOnly } from "@/shared/today";

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
  const profile = usePersonalizationProfile();
  const { healthOrder, knowledgeEmphasized } = getTrackSupportOrder(profile);

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

  const icon = (name: ComponentProps<typeof Ionicons>["name"]) => (
    <Ionicons name={name} size={20} color={colors.textSecondary} />
  );

  // Phase R (brief §16): each health module's row content, keyed by id so
  // it can be rendered in `healthOrder` — every module is still always
  // present, only the order changes. Nutrition/Breathing below are
  // deliberately NOT part of this reorderable set (brief §16: "avoid
  // making Track unstable... do not create dramatically different
  // information architectures per user").
  const healthRows: Record<TrackHealthRowId, ReactElement> = {
    symptoms: (
      <ListRow
        key="symptoms"
        leading={icon("pulse-outline")}
        label={t("track.symptoms")}
        caption={symptomsCaption}
        onPress={() => router.push("/symptoms")}
        chevron
      />
    ),
    medications: (
      <ListRow
        key="medications"
        leading={icon("medkit-outline")}
        label={t("medications.listTitle")}
        caption={medicationsCaption}
        onPress={() => router.push("/medications")}
        chevron
      />
    ),
    injections: (
      <ListRow
        key="injections"
        leading={icon("medical-outline")}
        label={t("injections.listTitle")}
        caption={injectionsCaption}
        onPress={() => router.push("/injections")}
        chevron
      />
    ),
    labs: (
      <ListRow
        key="labs"
        leading={icon("flask-outline")}
        label={t("track.labs")}
        caption={labsCaption}
        onPress={() => router.push("/labs")}
        chevron
      />
    ),
  };

  return (
    <ScreenContainer>
      {/* Phase S: an earlier pass in this same phase added an in-content
          title here, believing the screen had none — it was wrong. This is
          a tab screen; `app/(tabs)/_layout.tsx` already renders `track.title`
          as the native tab header (with the gear icon). Adding it again here
          produced a duplicated heading, caught in this phase's own live QA
          and reverted before it ever shipped. */}
      <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginBottom: spacing.md }}>
        {t("track.subtitle")}
      </Text>

      <GroupedList title={t("track.healthGroupTitle")}>
        {healthOrder.map((id) => healthRows[id])}
        {/* Phase X — always last, never part of `healthOrder`/personalization
            (Product 2.1 spec brief §20: "do not personalize the Timeline
            order/content" — this row's position is fixed by not touching
            `getTrackSupportOrder`/`TrackHealthRowId` at all, the same way
            Nutrition/Breathing below stay outside that reorderable set). */}
        <ListRow
          key="timeline"
          leading={icon("time-outline")}
          label={t("timeline.title")}
          caption={t("timeline.trackCaption")}
          onPress={() => router.push("/timeline")}
          chevron
        />
      </GroupedList>

      {/* Redesign Spec §8/§J: "GÜNLÜK DESTEK" — visually subordinate to
          SAĞLIK TAKİBİ above, never equal weight (product-safety-adjacent
          rule: supportive content must never look as clinically
          authoritative as the actual health-record features). Order is
          fixed (brief §16) — only Knowledge's own row gets a restrained
          "Senin için" cue when the learn-about-AS goal is selected;
          Nutrition/Breathing never move. */}
      <GroupedList title={t("track.supportGroupTitle")} emphasis="subordinate">
        <ListRow
          leading={<Ionicons name="book-outline" size={20} color={knowledgeEmphasized ? colors.accent : colors.textSecondary} />}
          label={t("track.knowledge")}
          caption={knowledgeEmphasized ? `${t("personalization.forYou")} · ${t("track.knowledgeCaption")}` : t("track.knowledgeCaption")}
          onPress={() => router.push("/knowledge")}
          chevron
        />
        <ListRow
          leading={icon("nutrition-outline")}
          label={t("track.nutrition")}
          caption={t("track.nutritionCaption")}
          onPress={() => router.push("/nutrition")}
          chevron
        />
        <ListRow
          leading={icon("leaf-outline")}
          label={t("track.breathing")}
          caption={t("track.breathingCaption")}
          onPress={() => router.push("/breathing")}
          chevron
        />
      </GroupedList>
    </ScreenContainer>
  );
}
