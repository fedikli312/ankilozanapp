import { useState } from "react";
import { ScrollView, Text, View } from "react-native";

import {
  Button,
  Chip,
  DateBlock,
  Hairline,
  HeroMetric,
  InlineAction,
  ListRow,
  MarginMark,
  MetricLine,
  QuietSurface,
  Section,
  SelectableCard,
  StepperField,
  ToggleRow,
  Wordmark,
  useTheme,
  type ColorTokens,
  type TypographyToken,
} from "@/design-system";

/**
 * Design System 2.0 showcase — DEVELOPMENT ONLY (Phase Design-B §29).
 *
 * Not Storybook, no new dependency: one plain screen rendering every
 * shared primitive with representative EN/TR content, reachable only by
 * navigating to `/dev/showcase` in a dev build. Guarded by `__DEV__` below
 * so a production build renders nothing even if this route is somehow
 * reached (deep link, stale bookmark) — there is no in-app entry point
 * anywhere (no tab, no button, no link) pointing here, on purpose.
 *
 * Still passes through the root `RouteGate` (`app/_layout.tsx`) like every
 * other route — this file does not touch entitlement/onboarding gating,
 * so during QA the device must already be in an onboarded+entitled state
 * for this screen to render, the same precondition every other live-QA
 * pass in this project has relied on.
 *
 * Purpose: a single place to eyeball the full token set and every shared
 * component at once — palette swatches, type scale, Margin Mark/Wordmark,
 * buttons, selection controls, metrics, rows, hairlines, quiet surfaces —
 * across light/dark (toggle the OS/simulator appearance; native only, see
 * `useTheme`'s doc comment for the web-preview light-mode override) and
 * against long EN/TR copy, without needing a real screen's data plumbing.
 */
export default function DesignShowcaseScreen() {
  if (!__DEV__) return null;
  return <ShowcaseContent />;
}

const LONG_EN = "Symptoms more intense today? This helps your care team see flare days clearly on your timeline.";
const LONG_TR = "Belirtilerin bugün daha mı yoğun? Bu, sağlık ekibinin alevlenme günlerini zaman çizelgende net görmesine yardımcı olur.";

function ShowcaseContent() {
  const { colors, typography, spacing } = useTheme();
  const [chipSelected, setChipSelected] = useState(true);
  const [cardSelected, setCardSelected] = useState(false);
  const [toggleValue, setToggleValue] = useState(true);
  const [stepperValue, setStepperValue] = useState(4);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl * 2 }}
    >
      <Text style={{ fontSize: typography.title.fontSize, fontWeight: typography.title.fontWeight, color: colors.textPrimary, marginBottom: spacing.xs }}>
        Design System 2.0
      </Text>
      <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginBottom: spacing.xl }}>
        Dev-only showcase — not part of production navigation.
      </Text>

      <ShowcaseHeading>Brand mark</ShowcaseHeading>
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xl, marginBottom: spacing.xl }}>
        <MarginMark size={44} />
        <Wordmark size="large" />
        <Wordmark variant="markOnly" />
      </View>

      <ShowcaseHeading>Color tokens</ShowcaseHeading>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.xl }}>
        {(Object.keys(colors) as (keyof ColorTokens)[]).map((name) => (
          <Swatch key={name} name={name} value={colors[name]} />
        ))}
      </View>

      <ShowcaseHeading>Typography scale</ShowcaseHeading>
      <View style={{ marginBottom: spacing.xl }}>
        {(Object.keys(typography) as (keyof typeof typography)[]).map((name) => {
          const token: TypographyToken = typography[name];
          return (
            <Text
              key={name}
              style={{
                fontSize: token.fontSize,
                lineHeight: token.lineHeight,
                fontWeight: token.fontWeight,
                letterSpacing: token.letterSpacing,
                textTransform: token.textTransform,
                fontVariant: token.tabular ? ["tabular-nums"] : undefined,
                color: colors.textPrimary,
                marginBottom: spacing.xs,
              }}
            >
              {name} — Aa 123 {token.tabular ? "(tabular)" : ""}
            </Text>
          );
        })}
      </View>

      <ShowcaseHeading>Hero metric / metric line</ShowcaseHeading>
      <View style={{ gap: spacing.lg, marginBottom: spacing.xl }}>
        <HeroMetric label="Pain today" value="4" unit="/10" context="Recorded 08:12" />
        <View style={{ flexDirection: "row", gap: spacing.xl }}>
          <MetricLine label="Fatigue" value="3.2" unit="/10" context="7-day average" />
          <MetricLine label="Stiffness" value="18" unit="dk" context="Bu sabah" />
        </View>
      </View>

      <ShowcaseHeading>Buttons</ShowcaseHeading>
      <View style={{ gap: spacing.sm, marginBottom: spacing.xl }}>
        <Button label="Primary action" onPress={() => {}} variant="primary" />
        <Button label="Secondary action" onPress={() => {}} variant="secondary" />
        <Button label="Quiet action" onPress={() => {}} variant="quiet" />
        <Button label="Destructive action" onPress={() => {}} variant="destructive" />
        <Button label="Disabled" onPress={() => {}} disabled />
      </View>

      <ShowcaseHeading>Selection controls</ShowcaseHeading>
      <View style={{ gap: spacing.md, marginBottom: spacing.xl }}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
          <Chip label="Sırt" selected={chipSelected} onPress={() => setChipSelected((v) => !v)} />
          <Chip label={LONG_TR} selected={false} onPress={() => {}} />
        </View>
        <SelectableCard
          icon="body-outline"
          label="Priority: Sırt ve bel bölgesi"
          caption={LONG_TR}
          selected={cardSelected}
          onPress={() => setCardSelected((v) => !v)}
        />
        <ToggleRow label="Symptoms more intense today?" description={LONG_EN} value={toggleValue} onValueChange={setToggleValue} />
        <StepperField label="Pain level" value={stepperValue} min={0} max={10} onChange={setStepperValue} />
      </View>

      <ShowcaseHeading>Rows / date block</ShowcaseHeading>
      <Section title="Appointments">
        <ListRow leading={<DateBlock day="07" month="EYL" emphasis="strong" />} label="Dr. Aylin Kaya — Romatoloji" caption={LONG_TR} chevron onPress={() => {}} />
        <ListRow leading={<DateBlock day="22" month="AUG" />} label="Past appointment" caption="Reviewed and closed" chevron onPress={() => {}} />
      </Section>

      <ShowcaseHeading>Quiet surface</ShowcaseHeading>
      <View style={{ marginBottom: spacing.xl }}>
        <QuietSurface>
          <Text style={{ fontSize: typography.body.fontSize, color: colors.textPrimary }}>{LONG_EN}</Text>
        </QuietSurface>
      </View>

      <ShowcaseHeading>Hairline + inline action</ShowcaseHeading>
      <View style={{ marginBottom: spacing.xl }}>
        <Hairline />
        <View style={{ marginTop: spacing.sm }}>
          <InlineAction label="View timeline" onPress={() => {}} />
        </View>
      </View>
    </ScrollView>
  );
}

function ShowcaseHeading({ children }: { children: string }) {
  const { colors, typography, spacing } = useTheme();
  return (
    <Text
      style={{
        fontSize: typography.sectionTitle.fontSize,
        fontWeight: typography.sectionTitle.fontWeight,
        letterSpacing: typography.sectionTitle.letterSpacing,
        textTransform: typography.sectionTitle.textTransform,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
      }}
    >
      {children}
    </Text>
  );
}

function Swatch({ name, value }: { name: string; value: string }) {
  const { colors, typography, spacing, radius } = useTheme();
  return (
    <View style={{ width: 96 }}>
      <View
        style={{
          height: 48,
          borderRadius: radius.small,
          borderWidth: 1,
          borderColor: colors.hairline,
          backgroundColor: value,
          marginBottom: spacing.xxs,
        }}
      />
      <Text numberOfLines={1} style={{ fontSize: typography.metadata.fontSize, color: colors.textSecondary }}>
        {name}
      </Text>
    </View>
  );
}
