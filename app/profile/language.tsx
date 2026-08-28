import { Text, View } from "react-native";

import { ListRow, ScreenContainer, useTheme } from "@/design-system";
import { SUPPORTED_LOCALES, useTranslation } from "@/localization";
import { useProfile } from "@/features/profile/useProfile";

export default function LanguageScreen() {
  const { t } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const { languageOverride, setLanguageOverride } = useProfile();

  return (
    <ScreenContainer>
      <Text style={{ fontSize: typography.title.fontSize, fontWeight: typography.title.fontWeight, color: colors.textPrimary, marginBottom: spacing.md }}>
        {t("profile.language")}
      </Text>
      <ListRow
        label={t("profile.languageSystem")}
        caption={languageOverride === null ? t("profile.languageSelected") : undefined}
        onPress={() => setLanguageOverride(null)}
      />
      <View style={{ height: 1, backgroundColor: colors.borderHairline }} />
      {SUPPORTED_LOCALES.map((locale) => (
        <View key={locale}>
          <ListRow
            label={t(`profile.languageOption.${locale}`)}
            caption={languageOverride === locale ? t("profile.languageSelected") : undefined}
            onPress={() => setLanguageOverride(locale)}
          />
          <View style={{ height: 1, backgroundColor: colors.borderHairline }} />
        </View>
      ))}
    </ScreenContainer>
  );
}
