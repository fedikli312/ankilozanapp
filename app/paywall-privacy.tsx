import { Text } from "react-native";

import { ScreenContainer, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";

/**
 * Reachable from the paywall while not-entitled (Phase Q brief §10, §27) —
 * `/profile/privacy-data` itself is a protected route (Profile is behind
 * the entitlement gate like every other core screen), so a non-entitled
 * user tapping "Gizlilik" on the paywall needs a genuinely reachable
 * destination, not a link back into the very gate they're behind. Reuses
 * the exact same real privacy copy `/profile/privacy-data` shows — one
 * source of truth for the actual claims, just exposed at an ungated route
 * for this one context.
 */
export default function PaywallPrivacyScreen() {
  const { t } = useTranslation();
  const { colors, typography, spacing } = useTheme();

  return (
    <ScreenContainer scroll>
      <Text style={{ fontSize: typography.title.fontSize, fontWeight: typography.title.fontWeight, color: colors.textPrimary, marginBottom: spacing.md }}>
        {t("profile.privacyAndData")}
      </Text>
      <Text style={{ fontSize: typography.body.fontSize, color: colors.textPrimary, marginBottom: spacing.sm }}>
        {t("profile.privacyBody")}
      </Text>
      <Text style={{ fontSize: typography.body.fontSize, color: colors.textPrimary }}>{t("profile.privacyBackup")}</Text>
    </ScreenContainer>
  );
}
