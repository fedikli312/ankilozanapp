import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Linking, Text, View } from "react-native";

import { AccessibleTouchable, Button, ScreenContainer, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";
import { GOAL_ICONS } from "@/features/onboarding/personalizationIcons";
import { APPLE_EULA_URL } from "@/purchases/config";
import { useEntitlement } from "@/purchases/EntitlementProvider";
import { shouldShowTrialCopy } from "@/purchases/trialEligibility";
import { usePaywallValuePillars } from "@/purchases/usePaywallValuePillars";
import type { PackageIdentifier, PurchasePackageInfo } from "@/purchases/types";

/**
 * The hard paywall (Product 2.0 Phase Q, spec §9-18). Reached only via the
 * root route gate (`app/_layout.tsx`) — no screen navigates here directly
 * except Value Reveal's own CTA. No close/X, no skip, no swipe-to-dismiss
 * (`gestureEnabled: false` on this route, set in `_layout.tsx`). On a
 * successful purchase or restore, this screen does not navigate anywhere
 * itself — `useEntitlement()`'s status flips to `"entitled"`, the route
 * gate re-renders and redirects to Today on its own. That is the whole
 * point of having one authoritative gate (spec §8): this screen only ever
 * asks "am I entitled yet," never decides where to go.
 */
export default function PaywallScreen() {
  const { t } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();
  const entitlement = useEntitlement();
  const pillars = usePaywallValuePillars();
  const [selected, setSelected] = useState<PackageIdentifier>("annual");

  const { status, offerings, purchaseStatus, purchaseErrorMessage, lastAction, purchase, restore, retryResolution } = entitlement;

  // Opens Apple's own Standard EULA — this app has not configured a Custom
  // EULA, so that's the real, correct Terms destination (Phase Q
  // monetization-safety pass, item 3), not an in-app placeholder route.
  const openTerms = () => Linking.openURL(APPLE_EULA_URL);
  const openPrivacy = () => router.push("/paywall-privacy");

  const restoreMessage =
    purchaseStatus === "failed" && lastAction === "restore"
      ? (purchaseErrorMessage ?? t("paywall.restoreNotFound"))
      : null;

  if (status === "error" || !offerings || (!offerings.annual && !offerings.monthly)) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: spacing.sm }}>
          <Ionicons name="cloud-offline-outline" size={28} color={colors.textSecondary} />
          <Text style={{ fontSize: typography.headline.fontSize, fontWeight: typography.headline.fontWeight, color: colors.textPrimary, textAlign: "center" }}>
            {t("paywall.offeringsErrorTitle")}
          </Text>
          <Text style={{ fontSize: typography.body.fontSize, color: colors.textSecondary, textAlign: "center", marginBottom: spacing.sm }}>
            {t("paywall.offeringsErrorBody")}
          </Text>
          <Button label={t("paywall.retry")} onPress={() => retryResolution()} />
        </View>
        <RestoreTermsPrivacyRow
          restoring={purchaseStatus === "restoring"}
          onRestore={restore}
          onTerms={openTerms}
          onPrivacy={openPrivacy}
          restoreMessage={restoreMessage}
        />
      </ScreenContainer>
    );
  }

  const annual = offerings.annual;
  const monthly = offerings.monthly;
  const selectedInfo = selected === "annual" ? annual : monthly;

  const annualTrialCopyAllowed = annual ? shouldShowTrialCopy(annual.trialEligibility) : false;

  const ctaLabel =
    selected === "annual" && annualTrialCopyAllowed
      ? t("paywall.ctaTrial", { days: annual!.trialDays })
      : selected === "annual"
        ? t("paywall.ctaAnnual")
        : t("paywall.ctaMonthly");

  const billingLabel = selectedInfo
    ? selected === "annual" && annualTrialCopyAllowed
      ? t("paywall.billingTrial", { days: annual!.trialDays, price: annual!.priceString })
      : selected === "annual"
        ? t("paywall.billingAnnual", { price: annual?.priceString })
        : t("paywall.billingMonthly", { price: monthly?.priceString })
    : null;

  return (
    <ScreenContainer scroll>
      <View style={{ alignItems: "center", marginBottom: spacing.lg }}>
        <Ionicons name="leaf-outline" size={22} color={colors.accent} style={{ marginBottom: spacing.xxs }} />
        <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary }}>{t("paywall.brand")}</Text>
      </View>

      <Text
        style={{
          fontSize: typography.title.fontSize,
          fontWeight: typography.title.fontWeight,
          color: colors.textPrimary,
          textAlign: "center",
          marginBottom: spacing.xs,
        }}
      >
        {t("paywall.headline")}
      </Text>
      <Text style={{ fontSize: typography.body.fontSize, color: colors.textSecondary, textAlign: "center", marginBottom: spacing.lg }}>
        {t("paywall.subheadline")}
      </Text>

      <View style={{ gap: spacing.xs, marginBottom: spacing.lg }}>
        {pillars.map((goal) => (
          <View key={goal} style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
            <Ionicons name={GOAL_ICONS[goal]} size={18} color={colors.accent} accessibilityElementsHidden />
            <Text style={{ flex: 1, fontSize: typography.body.fontSize, color: colors.textPrimary }}>{t(`paywall.pillar.${goal}`)}</Text>
          </View>
        ))}
      </View>

      <View style={{ gap: spacing.sm, marginBottom: spacing.md }}>
        {annual ? (
          <PlanCard
            info={annual}
            label={t("paywall.planAnnual")}
            priceLabel={t("paywall.perYear", { price: annual.priceString })}
            recommended
            selected={selected === "annual"}
            onPress={() => setSelected("annual")}
          />
        ) : null}
        {monthly ? (
          <PlanCard
            info={monthly}
            label={t("paywall.planMonthly")}
            priceLabel={t("paywall.perMonth", { price: monthly.priceString })}
            recommended={false}
            selected={selected === "monthly"}
            onPress={() => setSelected("monthly")}
          />
        ) : null}
      </View>

      <Button label={ctaLabel} onPress={() => purchase(selected)} loading={purchaseStatus === "purchasing"} />

      {billingLabel ? (
        <Text style={{ fontSize: typography.micro.fontSize, color: colors.textSecondary, textAlign: "center", marginTop: spacing.xs }}>
          {billingLabel}
        </Text>
      ) : null}

      {purchaseStatus === "cancelled" ? (
        <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, textAlign: "center", marginTop: spacing.sm }}>
          {t("paywall.purchaseCancelled")}
        </Text>
      ) : null}
      {purchaseStatus === "failed" && lastAction === "purchase" ? (
        <Text style={{ fontSize: typography.caption.fontSize, color: colors.statusDanger, textAlign: "center", marginTop: spacing.sm }}>
          {t("paywall.purchaseFailed")}
        </Text>
      ) : null}

      <RestoreTermsPrivacyRow
        restoring={purchaseStatus === "restoring"}
        onRestore={restore}
        onTerms={openTerms}
        onPrivacy={openPrivacy}
        restoreMessage={restoreMessage}
      />
    </ScreenContainer>
  );
}

type PlanCardProps = {
  info: PurchasePackageInfo;
  label: string;
  priceLabel: string;
  recommended: boolean;
  selected: boolean;
  onPress: () => void;
};

function PlanCard({ info, label, priceLabel, recommended, selected, onPress }: PlanCardProps) {
  const { colors, typography, spacing, radius } = useTheme();
  const { t } = useTranslation();
  const showTrialCopy = shouldShowTrialCopy(info.trialEligibility);

  return (
    <AccessibleTouchable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${label}, ${priceLabel}${showTrialCopy ? `, ${t("paywall.trialBadge", { days: info.trialDays })}` : ""}`}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: radius.standard,
        borderWidth: selected ? 1.5 : 1,
        borderColor: selected ? colors.accent : colors.borderHairline,
        backgroundColor: selected ? colors.surfaceHighlight : colors.surface,
      }}
    >
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
          <Text style={{ fontSize: typography.body.fontSize, fontWeight: "600", color: selected ? colors.accent : colors.textPrimary }}>
            {label}
          </Text>
          {recommended ? (
            <View style={{ backgroundColor: colors.accent, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1 }}>
              <Text style={{ fontSize: typography.micro.fontSize, color: colors.accentForeground, fontWeight: "600" }}>
                {t("paywall.recommendedBadge")}
              </Text>
            </View>
          ) : null}
        </View>
        <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginTop: 2 }}>{priceLabel}</Text>
        {showTrialCopy ? (
          <Text style={{ fontSize: typography.micro.fontSize, color: colors.accent, marginTop: 2 }}>
            {t("paywall.trialBadge", { days: info.trialDays })}
          </Text>
        ) : null}
      </View>
      {selected ? <Ionicons name="checkmark-circle" size={20} color={colors.accent} accessibilityElementsHidden /> : null}
    </AccessibleTouchable>
  );
}

type RestoreTermsPrivacyRowProps = {
  restoring: boolean;
  onRestore: () => void;
  onTerms: () => void;
  onPrivacy: () => void;
  restoreMessage: string | null;
};

function RestoreTermsPrivacyRow({ restoring, onRestore, onTerms, onPrivacy, restoreMessage }: RestoreTermsPrivacyRowProps) {
  const { colors, typography, spacing } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={{ marginTop: spacing.lg, alignItems: "center" }}>
      <View style={{ flexDirection: "row", gap: spacing.md, marginBottom: spacing.xs }}>
        <AccessibleTouchable onPress={onRestore} accessibilityRole="button" accessibilityLabel={t("paywall.restore")} disabled={restoring}>
          <Text style={{ fontSize: typography.caption.fontSize, color: colors.accent }}>
            {restoring ? t("paywall.restoring") : t("paywall.restore")}
          </Text>
        </AccessibleTouchable>
        <Text style={{ color: colors.borderHairline }}>·</Text>
        <AccessibleTouchable onPress={onTerms} accessibilityRole="button" accessibilityLabel={t("paywall.terms")}>
          <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary }}>{t("paywall.terms")}</Text>
        </AccessibleTouchable>
        <Text style={{ color: colors.borderHairline }}>·</Text>
        <AccessibleTouchable onPress={onPrivacy} accessibilityRole="button" accessibilityLabel={t("paywall.privacy")}>
          <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary }}>{t("paywall.privacy")}</Text>
        </AccessibleTouchable>
      </View>
      {restoreMessage ? (
        <Text style={{ fontSize: typography.micro.fontSize, color: colors.textSecondary, textAlign: "center" }}>{restoreMessage}</Text>
      ) : null}
    </View>
  );
}
