import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { Button, ScreenContainer, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";

export default function WelcomeScreen() {
  const { t } = useTranslation();
  const { colors, typography } = useTheme();
  const router = useRouter();

  return (
    <ScreenContainer>
      <View style={{ flex: 1, justifyContent: "center" }}>
        <Text
          style={{
            fontSize: typography.display.fontSize,
            fontWeight: typography.display.fontWeight,
            color: colors.textPrimary,
          }}
        >
          {t("onboarding.welcome.title")}
        </Text>
      </View>
      <Button label={t("common.continue")} onPress={() => router.push("/onboarding/privacy")} />
    </ScreenContainer>
  );
}
