import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs, useRouter } from "expo-router";

import { AccessibleTouchable, useTheme } from "@/design-system";
import { DOMAIN_ICONS, type IoniconName } from "@/design-system/icons";
import { useTranslation } from "@/localization";

function TabIcon({ outline, filled, focused }: { outline: IoniconName; filled: IoniconName; focused: boolean }) {
  const { colors } = useTheme();
  // Selected state is never color-only (Design-B brief §19): the icon
  // itself switches from outline to filled glyph, a shape change, with
  // color as a secondary, reinforcing signal only.
  return <Ionicons name={focused ? filled : outline} size={22} color={focused ? colors.brandPrimary : colors.textSecondary} />;
}

/**
 * Profile is a persistent top-right icon on every tab's nav bar, not a
 * 5th tab (UX spec §A/§Q, PROJECT_MEMORY.md's approved 4-tab decision,
 * unchanged by the Design-B 3-visible-tab navigation shell).
 */
function ProfileHeaderButton() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <AccessibleTouchable
      onPress={() => router.push("/profile")}
      accessibilityRole="button"
      accessibilityLabel={t("profile.title")}
      style={{ paddingHorizontal: 12, alignItems: "center", justifyContent: "center" }}
    >
      <Ionicons name={DOMAIN_ICONS.profile.outline} size={22} color={colors.brandPrimary} />
    </AccessibleTouchable>
  );
}

/**
 * Design System 2.0 navigation shell (Phase Design-B §18-19,
 * `docs/DESIGN_DIRECTION_VALIDATION_2_0.md` §8/§12's approved final
 * navigation: Today / Health Record / Appointments).
 *
 * "Health Record" is a RELABEL of the existing `track` route/screen, not
 * a new destination — the route file, its path (`/track`), and its own
 * internal content are completely unchanged (Design-B is explicitly not
 * the Health Record content redesign; that is Design-E). Only this
 * layout's `title`/`tabBarLabel` change.
 *
 * Insights is no longer a visible tab (the redundant Track/Timeline/
 * Insights split `docs/DESIGN_RESEARCH_2_0.md` §10/§19 diagnosed) but its
 * route is NOT deleted — `href: null` hides it from the tab bar while
 * keeping `/insights` fully navigable, per the brief's explicit "do not
 * lose deep links" instruction. A temporary access point now lives on the
 * Health Record screen itself (`app/(tabs)/track.tsx`'s new "View
 * insights" link) so the screen remains reachable in the interim, ahead
 * of Design-E folding it in properly as a real mode of that tab.
 */
export default function TabsLayout() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerRight: () => <ProfileHeaderButton />,
        headerStyle: { backgroundColor: colors.surfaceElevated },
        headerTitleStyle: { color: colors.textPrimary },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: colors.surfaceElevated,
          borderTopColor: colors.hairline,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: colors.brandPrimary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: { fontSize: 10, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("today.title"),
          tabBarLabel: t("tabs.today"),
          tabBarIcon: ({ focused }) => <TabIcon outline="home-outline" filled="home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="track"
        options={{
          title: t("tabs.healthRecord"),
          tabBarLabel: t("tabs.healthRecord"),
          tabBarIcon: ({ focused }) => (
            <TabIcon outline={DOMAIN_ICONS.timeline.outline} filled={DOMAIN_ICONS.timeline.filled} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: t("appointments.listTitle"),
          tabBarLabel: t("tabs.appointments"),
          tabBarIcon: ({ focused }) => (
            <TabIcon outline={DOMAIN_ICONS.appointments.outline} filled={DOMAIN_ICONS.appointments.filled} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: t("insights.title"),
          href: null,
        }}
      />
    </Tabs>
  );
}
