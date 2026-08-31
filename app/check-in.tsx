import { useRouter } from "expo-router";
import { Text } from "react-native";

import { ScreenContainer, useTheme } from "@/design-system";
import { formatHeadingDate, useTranslation } from "@/localization";
import { parseDateOnly } from "@/domain/dateUtils";
import { CheckInForm } from "@/features/checkIn/CheckInForm";
import { useCheckIn } from "@/features/checkIn/useCheckIn";
import { setCheckInDraft } from "@/features/checkIn/checkInDraft";

export default function CheckInScreen() {
  const { t, locale } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();
  const { today, initialValue, save } = useCheckIn();

  return (
    <ScreenContainer scroll>
      <Text style={{ fontSize: typography.title.fontSize, fontWeight: typography.title.fontWeight, color: colors.textPrimary, marginBottom: spacing.xxs }}>
        {t("checkIn.title")}
      </Text>
      <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginBottom: spacing.lg }}>
        {formatHeadingDate(parseDateOnly(today), locale)}
      </Text>
      <CheckInForm
        initialValue={initialValue}
        onChangeDraft={(value) => setCheckInDraft({ date: today, ...value })}
        onSave={(input) => {
          save(input);
          router.back();
        }}
      />
    </ScreenContainer>
  );
}
