import { Text, View } from "react-native";

import { spacing, typography, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";

export default function FoundationPlaceholder() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: spacing.lg,
        backgroundColor: colors.background,
      }}
    >
      <Text
        style={{
          fontSize: typography.title.fontSize,
          fontWeight: typography.title.fontWeight,
          color: colors.textPrimary,
        }}
      >
        {t("foundation.placeholderTitle")}
      </Text>
      <Text
        style={{
          marginTop: spacing.xs,
          fontSize: typography.caption.fontSize,
          color: colors.textSecondary,
          textAlign: "center",
        }}
      >
        {t("foundation.placeholderSubtitle")}
      </Text>
    </View>
  );
}
