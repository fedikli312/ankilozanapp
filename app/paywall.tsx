import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Linking, Text, View } from "react-native";
import Svg from "react-native-svg";

import { AccessibleTouchable, AnchorDot, Button, ContourLine, Hairline, HeroBloom, QuietSurface, ScreenContainer, Wordmark, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";
import { GOAL_ICONS } from "@/features/onboarding/personalizationIcons";
import { APPLE_EULA_URL } from "@/purchases/config";
import { useEntitlement } from "@/purchases/EntitlementProvider";
import { shouldShowTrialCopy } from "@/purchases/trialEligibility";
import { usePaywallValuePillars } from "@/purchases/usePaywallValuePillars";
import type { PackageIdentifier, PurchasePackageInfo } from "@/purchases/types";

/**
 * Ambient hero atmosphere geometry (Craft 3.1 review §4). `HERO_HEIGHT`
 * is the drawn band; `HERO_LIFT` pulls it up so its content sits in the
 * negative space ABOVE the wordmark — only the empty upper part of the
 * `dawn` composition grazes the wordmark, and the headline below is left
 * completely clear (art never crosses the headline). No box / fill /
 * border — it bleeds to the screen edges so wordmark + headline + art
 * read as one lockup, not a banner over two text blocks.
 */
const HERO_HEIGHT = 104;
const HERO_LIFT = 62;

/**
 * The hard paywall (Design-C brief §12-20, on the unchanged Phase Q
 * entitlement architecture). Reached only via the root route gate
 * (`app/_layout.tsx`) — no screen navigates here directly except Value
 * Reveal's own CTA. No close/X, no skip, no swipe-to-dismiss
 * (`gestureEnabled: false` on this route, set in `_layout.tsx`). On a
 * successful purchase or restore, this screen does not navigate anywhere
 * itself — `useEntitlement()`'s status flips to `"entitled"`, the route
 * gate re-renders and redirects to Today on its own.
 *
 * Hierarchy (brief §15): concise value statement → one real product
 * preview → 2-3 concrete benefits → plan selection → CTA → Restore/Terms/
 * Privacy. Plans are pushed below the preview and benefits rather than
 * dominating the first viewport.
 */
export default function PaywallScreen() {
  const { t } = useTranslation();
  const { colors, typography, spacing, layout } = useTheme();
  const router = useRouter();
  const entitlement = useEntitlement();
  const pillars = usePaywallValuePillars();
  const [selected, setSelected] = useState<PackageIdentifier>("annual");
  const [heroWidth, setHeroWidth] = useState(0);
  const [previewWidth, setPreviewWidth] = useState(0);

  const { status, offerings, purchaseStatus, purchaseErrorMessage, lastAction, purchase, restore, retryResolution } = entitlement;

  // Opens Apple's own Standard EULA — this app has not configured a Custom
  // EULA, so that's the real, correct Terms destination, not an in-app
  // placeholder route.
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
      {/* One hero composition — the atmosphere sits in the negative space
          around the wordmark and headline (bleeding to the screen edges,
          no box / fill / border), so this reads as a single lockup rather
          than an art banner pasted above two text blocks (Craft 3.1
          review §4). Decorative only, hidden from the accessibility tree;
          the wordmark + headline carry all meaning. No commercial element
          is affected — plans, pricing, trial eligibility, CTA, and
          Restore/Terms/Privacy are untouched. */}
      <View style={{ position: "relative", alignItems: "center", marginTop: spacing.sm, marginBottom: spacing.lg }}>
        <View
          onLayout={(e) => setHeroWidth(e.nativeEvent.layout.width)}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          pointerEvents="none"
          style={{ position: "absolute", top: -HERO_LIFT, left: -layout.pageMargin, right: -layout.pageMargin, height: HERO_HEIGHT }}
        >
          {heroWidth > 0 ? <HeroBloom width={heroWidth} height={HERO_HEIGHT} variant="dawn" /> : null}
        </View>

        <View style={{ marginBottom: spacing.sm }}>
          <Wordmark size="medium" />
        </View>
        <Text
          style={{
            fontSize: typography.title.fontSize,
            lineHeight: typography.title.lineHeight,
            fontWeight: typography.title.fontWeight,
            color: colors.textPrimary,
            textAlign: "center",
          }}
        >
          {t("paywall.headline")}
        </Text>
      </View>
      <Text style={{ fontSize: typography.body.fontSize, color: colors.textSecondary, textAlign: "center", marginBottom: spacing.lg }}>
        {t("paywall.subheadline")}
      </Text>

      {/* One real product preview (brief §16), recomposed for visual craft
          (`docs/VISUAL_CRAFT_PASS_3_1.md` §5/§9): the same record content
          and the same "clearly an example, not your data" framing, now
          given reference-grade number confidence — hero-scale tabular
          values with a whispered unit, a fine record thread, hairline
          structure. Still the screen's focal moment; the atmosphere strip
          above was shrunk so it stays subordinate to this. */}
      <QuietSurface>
        <Text
          style={{
            fontSize: typography.sectionTitle.fontSize,
            lineHeight: typography.sectionTitle.lineHeight,
            fontWeight: typography.sectionTitle.fontWeight,
            letterSpacing: typography.sectionTitle.letterSpacing,
            textTransform: typography.sectionTitle.textTransform,
            color: colors.textTertiary,
            marginBottom: spacing.sm,
          }}
        >
          {t("paywall.previewLabel")}
        </Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <PreviewMetric label={t("today.metricPain")} value="3.2" />
          <PreviewMetric label={t("today.metricFatigue")} value="2.8" />
        </View>
        <View onLayout={(e) => setPreviewWidth(e.nativeEvent.layout.width)} style={{ height: 18, marginTop: spacing.sm }}>
          {previewWidth > 0 ? (
            <Svg width={previewWidth} height={18} pointerEvents="none">
              <ContourLine
                points={[
                  { x: 0, y: 13 },
                  { x: previewWidth * 0.3, y: 7 },
                  { x: previewWidth * 0.62, y: 11 },
                  { x: previewWidth, y: 4 },
                ]}
                stroke={colors.dataPrimary}
                width={1.75}
                opacity={0.55}
              />
              <AnchorDot cx={previewWidth - 2} cy={4} r={2.5} fill={colors.dataPrimary} />
            </Svg>
          ) : null}
        </View>
        <Hairline />
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: spacing.sm }}>
          <Text style={{ fontSize: typography.body.fontSize, color: colors.textPrimary }}>{t("paywall.previewMedicationName")}</Text>
          <Text style={{ fontSize: typography.caption.fontSize, fontVariant: ["tabular-nums"], color: colors.textSecondary }}>
            {t("paywall.previewMedicationDoses")}
          </Text>
        </View>
      </QuietSurface>

      <View style={{ gap: spacing.xs, marginTop: spacing.lg, marginBottom: spacing.lg }}>
        {pillars.map((goal) => (
          <View key={goal} style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
            <Ionicons name={GOAL_ICONS[goal]} size={18} color={colors.brandPrimary} accessibilityElementsHidden />
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

/** One example value in the record preview — label quiet, number hero-scale and tabular, unit whispered on the baseline. */
function PreviewMetric({ label, value }: { label: string; value: string }) {
  const { colors, typography, spacing } = useTheme();
  return (
    <View>
      <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginBottom: 2 }}>{label}</Text>
      <View style={{ flexDirection: "row", alignItems: "baseline" }}>
        <Text
          style={{
            fontSize: typography.metricLarge.fontSize,
            lineHeight: typography.metricLarge.lineHeight,
            fontWeight: typography.metricLarge.fontWeight,
            fontVariant: ["tabular-nums"],
            color: colors.textPrimary,
          }}
        >
          {value}
        </Text>
        <Text style={{ fontSize: typography.micro.fontSize, color: colors.textTertiary, marginLeft: spacing.xxs }}>/10</Text>
      </View>
    </View>
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
        borderColor: selected ? colors.brandPrimary : colors.hairline,
        backgroundColor: selected ? colors.selected : colors.surfaceElevated,
      }}
    >
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
          <Text style={{ fontSize: typography.body.fontSize, fontWeight: "600", color: selected ? colors.brandPrimary : colors.textPrimary }}>
            {label}
          </Text>
          {recommended ? (
            <View style={{ backgroundColor: colors.brandPrimary, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1 }}>
              <Text style={{ fontSize: typography.micro.fontSize, color: colors.accentForeground, fontWeight: "600" }}>
                {t("paywall.recommendedBadge")}
              </Text>
            </View>
          ) : null}
        </View>
        <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginTop: 2 }}>{priceLabel}</Text>
        {showTrialCopy ? (
          <Text style={{ fontSize: typography.micro.fontSize, color: colors.brandPrimary, marginTop: 2 }}>
            {t("paywall.trialBadge", { days: info.trialDays })}
          </Text>
        ) : null}
      </View>
      {selected ? <Ionicons name="checkmark-circle" size={20} color={colors.brandPrimary} accessibilityElementsHidden /> : null}
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
          <Text style={{ fontSize: typography.caption.fontSize, color: colors.brandPrimary }}>
            {restoring ? t("paywall.restoring") : t("paywall.restore")}
          </Text>
        </AccessibleTouchable>
        <Text style={{ color: colors.hairline }}>·</Text>
        <AccessibleTouchable onPress={onTerms} accessibilityRole="button" accessibilityLabel={t("paywall.terms")}>
          <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary }}>{t("paywall.terms")}</Text>
        </AccessibleTouchable>
        <Text style={{ color: colors.hairline }}>·</Text>
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
