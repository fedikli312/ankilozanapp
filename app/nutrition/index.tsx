import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";
import { Text, View } from "react-native";

import { ListRow, ScreenContainer, SectionLabel, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";

type NutritionItem = { heading: string; body: string };
type NutritionCategory = { title: string; icon: ComponentProps<typeof Ionicons>["name"]; items: NutritionItem[] };

/**
 * Static, bundled, educational content only (Redesign Spec §J) — no
 * database table, no repository, no persistence of any kind. The category
 * list itself lives in code (not data-driven JSON), matching this
 * codebase's established localization convention of flat string leaves
 * addressed by a fixed set of keys, not arrays inside the translation
 * files.
 */
export default function NutritionScreen() {
  const { t } = useTranslation();
  const { colors, typography, spacing } = useTheme();

  const categories: NutritionCategory[] = [
    {
      title: t("nutrition.category.balancedPlate"),
      icon: "restaurant-outline",
      items: [{ heading: t("nutrition.item.varietyHeading"), body: t("nutrition.item.varietyBody") }],
    },
    {
      title: t("nutrition.category.fiber"),
      icon: "leaf-outline",
      items: [
        { heading: t("nutrition.item.vegFruitHeading"), body: t("nutrition.item.vegFruitBody") },
        { heading: t("nutrition.item.wholeGrainHeading"), body: t("nutrition.item.wholeGrainBody") },
      ],
    },
    {
      title: t("nutrition.category.protein"),
      icon: "fish-outline",
      items: [{ heading: t("nutrition.item.proteinVarietyHeading"), body: t("nutrition.item.proteinVarietyBody") }],
    },
    {
      title: t("nutrition.category.fluids"),
      icon: "water-outline",
      items: [{ heading: t("nutrition.item.waterHeading"), body: t("nutrition.item.waterBody") }],
    },
    {
      title: t("nutrition.category.routine"),
      icon: "time-outline",
      items: [{ heading: t("nutrition.item.mealTimesHeading"), body: t("nutrition.item.mealTimesBody") }],
    },
  ];

  return (
    <ScreenContainer scroll>
      <Text style={{ fontSize: typography.title.fontSize, fontWeight: typography.title.fontWeight, color: colors.textPrimary, marginBottom: 2 }}>
        {t("nutrition.title")}
      </Text>
      <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginBottom: spacing.md }}>
        {t("nutrition.subtitle")}
      </Text>

      {categories.map((category) => (
        <View key={category.title} style={{ marginBottom: spacing.sm }}>
          <SectionLabel>{category.title}</SectionLabel>
          {category.items.map((item) => (
            <ListRow
              key={item.heading}
              leading={<Ionicons name={category.icon} size={20} color={colors.textSecondary} />}
              label={item.heading}
              caption={item.body}
            />
          ))}
        </View>
      ))}

      <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginTop: spacing.md, fontStyle: "italic" }}>
        {t("nutrition.disclaimer")}
      </Text>
    </ScreenContainer>
  );
}
