import Ionicons from "@expo/vector-icons/Ionicons";
import { Text } from "react-native";

import { GroupedList, ListRow, ScreenContainer, useTheme } from "@/design-system";
import { SUPPORTED_LOCALES, useTranslation } from "@/localization";
import { useProfile } from "@/features/profile/useProfile";

export default function LanguageScreen() {
  const { t } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const { languageOverride, setLanguageOverride } = useProfile();

  const check = <Ionicons name="checkmark" size={20} color={colors.accent} />;

  return (
    <ScreenContainer>
      <Text style={{ fontSize: typography.title.fontSize, fontWeight: typography.title.fontWeight, color: colors.textPrimary, marginBottom: spacing.md }}>
        {t("profile.language")}
      </Text>
      <GroupedList>
        <ListRow
          label={t("profile.languageSystem")}
          trailing={languageOverride === null ? check : undefined}
          onPress={() => setLanguageOverride(null)}
          accessibilityLabel={
            languageOverride === null
              ? `${t("profile.languageSystem")}, ${t("profile.languageSelected")}`
              : t("profile.languageSystem")
          }
        />
        {SUPPORTED_LOCALES.map((locale) => (
          <ListRow
            key={locale}
            label={t(`profile.languageOption.${locale}`)}
            trailing={languageOverride === locale ? check : undefined}
            onPress={() => setLanguageOverride(locale)}
            accessibilityLabel={
              languageOverride === locale
                ? `${t(`profile.languageOption.${locale}`)}, ${t("profile.languageSelected")}`
                : t(`profile.languageOption.${locale}`)
            }
          />
        ))}
      </GroupedList>
    </ScreenContainer>
  );
}
