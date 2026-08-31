import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs, useRouter } from "expo-router";
import type { ComponentProps } from "react";

import { AccessibleTouchable, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

function TabIcon({ outline, filled, focused }: { outline: IoniconName; filled: IoniconName; focused: boolean }) {
  const { colors } = useTheme();
  return <Ionicons name={focused ? filled : outline} size={22} color={focused ? colors.accent : colors.textSecondary} />;
}

/**
 * Profile is a persistent top-right icon on every tab's nav bar, not a 5th
 * tab (UX spec §A/§Q, PROJECT_MEMORY.md's approved 4-tab decision).
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
      <Ionicons name="settings-outline" size={22} color={colors.accent} />
    </AccessibleTouchable>
  );
}

export default function TabsLayout() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerRight: () => <ProfileHeaderButton />,
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { color: colors.textPrimary },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.borderHairline,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
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
          title: t("track.title"),
          tabBarLabel: t("tabs.track"),
          tabBarIcon: ({ focused }) => <TabIcon outline="pulse-outline" filled="pulse" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: t("appointments.listTitle"),
          tabBarLabel: t("tabs.appointments"),
          tabBarIcon: ({ focused }) => <TabIcon outline="calendar-outline" filled="calendar" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: t("insights.title"),
          tabBarLabel: t("tabs.insights"),
          tabBarIcon: ({ focused }) => <TabIcon outline="analytics-outline" filled="analytics" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
