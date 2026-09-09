import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { Linking, Text } from "react-native";

import { ListRow, Section, ScreenContainer, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";
import { useProfile } from "@/features/profile/useProfile";
import { APPLE_EULA_URL } from "@/purchases/config";

/**
 * Profile — Design-H. Answers "what controls and supporting information
 * belong to my Ilium setup?" (brief §3) — never a health summary. A
 * deliberate hierarchy (brief §4), not one flat list: Preferences →
 * Reminders → Support (including Knowledge's new final home, brief §5) →
 * About. No Subscription section — see the reasoning in
 * `docs/DESIGN_H_PROFILE_KNOWLEDGE.md` §13 (Profile is only reachable
 * while entitled, and the entitlement layer tracks no richer plan/renewal
 * data to show). No separate top-level Data section either — "Delete all
 * local data" stays exactly where it already lived, one tap into Privacy
 * & data, rather than adding a second, duplicate entry point for the same
 * destructive action.
 *
 * Row grammar (brief §10): icons only where they meaningfully improve
 * scanning (Language/Reminders/Notification privacy/Privacy & data) —
 * Knowledge and the About rows are plain text, no icon.
 */
export default function ProfileScreen() {
  const { t } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();
  const { notificationDetailOptIn, languageOverride } = useProfile();

  return (
    <ScreenContainer scroll>
      <Text
        style={{
          fontSize: typography.title.fontSize,
          fontWeight: typography.title.fontWeight,
          color: colors.textPrimary,
          marginBottom: spacing.xxs,
        }}
      >
        {t("profile.title")}
      </Text>
      {/* One restrained local-first trust signal, not repeated on every
          settings screen, and no absolute security claim. */}
      <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginBottom: spacing.lg }}>
        {t("profile.localFirstTrust")}
      </Text>

      <Section title={t("profile.group.preferences")}>
        <ListRow
          leading={<Ionicons name="language-outline" size={20} color={colors.textSecondary} />}
          label={t("profile.language")}
          caption={languageOverride ? t(`profile.languageOption.${languageOverride}`) : t("profile.languageSystem")}
          onPress={() => router.push("/profile/language")}
          chevron
        />
      </Section>

      <Section title={t("profile.group.reminders")}>
        <ListRow
          leading={<Ionicons name="notifications-outline" size={20} color={colors.textSecondary} />}
          label={t("profile.reminderSettings")}
          onPress={() => router.push("/profile/reminder-settings")}
          chevron
        />
        <ListRow
          leading={<Ionicons name="shield-checkmark-outline" size={20} color={colors.textSecondary} />}
          label={t("profile.notificationPrivacy")}
          caption={t(notificationDetailOptIn ? "common.on" : "common.off")}
          onPress={() => router.push("/profile/notification-privacy")}
          chevron
        />
      </Section>

      <Section title={t("profile.group.support")}>
        <ListRow label={t("knowledge.title")} caption={t("knowledge.subtitle")} onPress={() => router.push("/knowledge")} chevron />
        <ListRow
          leading={<Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />}
          label={t("profile.privacyAndData")}
          onPress={() => router.push("/profile/privacy-data")}
          chevron
        />
      </Section>

      <Section title={t("profile.group.about")}>
        <ListRow label={t("profile.disclaimer")} onPress={() => router.push("/profile/disclaimer")} chevron />
        <ListRow label={t("paywall.terms")} onPress={() => Linking.openURL(APPLE_EULA_URL)} chevron />
        <ListRow label={t("profile.about")} onPress={() => router.push("/profile/about")} chevron />
      </Section>
    </ScreenContainer>
  );
}
