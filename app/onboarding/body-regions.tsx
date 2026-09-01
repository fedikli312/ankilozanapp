import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

import { Button, Chip, ScreenContainer, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";
import { OnboardingProgress } from "@/features/onboarding/OnboardingProgress";
import { setOnboardingPersonalization } from "@/features/onboarding/onboardingDraft";
import type { BodyAreaRegion } from "@/repositories";

const REGIONS: BodyAreaRegion[] = [
  "neck",
  "upper_back",
  "lower_back",
  "hips",
  "shoulders",
  "chest_ribs",
  "other",
];

/**
 * Product 2.0 Phase N, step 5 — "Where do you usually feel it most?"
 * (spec §7/§8). Deliberately the exact same 7-region taxonomy and the same
 * `checkIn.bodyArea.*` labels the real daily check-in already uses — no new
 * taxonomy invented. Body Map 2.0's own illustrated silhouette is Phase O
 * scope (spec §7: "if implementing the illustration would force
 * architecture/assets beyond Phase N, use a polished simplified selector
 * and report the limitation") — this screen is that simplified selector:
 * the same accessible chip list check-in itself uses, standing alone rather
 * than layered under a silhouette. No diagnosis, no severity inference —
 * this only sets which regions are pre-highlighted the first few times the
 * user opens the real check-in's body-area picker.
 */
export default function BodyRegionsScreen() {
  const { t } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();
  const [selected, setSelected] = useState<BodyAreaRegion[]>([]);

  const toggle = (region: BodyAreaRegion) => {
    setSelected((prev) => (prev.includes(region) ? prev.filter((r) => r !== region) : [...prev, region]));
  };

  const handleContinue = () => {
    setOnboardingPersonalization({ priorityBodyAreas: selected });
    router.push("/onboarding/treatment-context");
  };

  return (
    <ScreenContainer>
      <OnboardingProgress step={5} />
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: typography.title.fontSize,
            fontWeight: typography.title.fontWeight,
            color: colors.textPrimary,
            marginBottom: spacing.xs,
          }}
        >
          {t("onboarding.bodyRegions.title")}
        </Text>
        <Text style={{ fontSize: typography.body.fontSize, color: colors.textSecondary, marginBottom: spacing.lg }}>
          {t("onboarding.bodyRegions.supporting")}
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs }}>
          {REGIONS.map((region) => (
            <Chip
              key={region}
              label={t(`checkIn.bodyArea.${region}`)}
              selected={selected.includes(region)}
              onPress={() => toggle(region)}
            />
          ))}
        </View>
      </View>
      <Button label={t("common.continue")} onPress={handleContinue} />
    </ScreenContainer>
  );
}
