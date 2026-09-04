import { useLocalSearchParams, useRouter } from "expo-router";
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
  // Product 2.1 Phase Y — Today's "Symptoms more intense today?" secondary
  // CTA links here with ?highSymptomDay=1 (brief §2). Purely a starting
  // signal for the toggle's default; see `useCheckIn`'s own doc comment.
  const { highSymptomDay } = useLocalSearchParams<{ highSymptomDay?: string }>();
  const { today, initialValue, defaultHighSymptomDay, save } = useCheckIn({
    highSymptomDayEntry: highSymptomDay === "1",
  });

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
        defaultHighSymptomDay={defaultHighSymptomDay}
        onChangeDraft={(value) => setCheckInDraft({ date: today, ...value })}
        onSave={(input) => {
          save(input);
          router.back();
        }}
      />
    </ScreenContainer>
  );
}
