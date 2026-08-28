import { Tabs, useRouter } from "expo-router";
import { Text } from "react-native";

import { AccessibleTouchable, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";

function TabIcon({ glyph, focused }: { glyph: string; focused: boolean }) {
  const { colors } = useTheme();
  return <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5, color: colors.accent }}>{glyph}</Text>;
}

/**
 * Profile is a persistent top-right icon on every tab's nav bar, not a 5th
 * tab (UX spec §A/§Q, PROJECT_MEMORY.md's approved 4-tab decision). Uses a
 * plain text glyph rather than an icon library — no new dependency, same
 * approach as the design system's existing glyph buttons (Chip's checkmark,
 * StepperField's +/-).
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
      <Text style={{ fontSize: 20, color: colors.accent }}>{"⚙"}</Text>
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
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { color: colors.textPrimary },
        headerShadowVisible: false,
        tabBarStyle: { backgroundColor: colors.background },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("today.title"),
          tabBarLabel: t("tabs.today"),
          tabBarIcon: ({ focused }) => <TabIcon glyph="☀" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="track"
        options={{
          title: t("track.title"),
          tabBarLabel: t("tabs.track"),
          tabBarIcon: ({ focused }) => <TabIcon glyph="📋" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: t("appointments.listTitle"),
          tabBarLabel: t("tabs.appointments"),
          tabBarIcon: ({ focused }) => <TabIcon glyph="📅" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: t("insights.title"),
          tabBarLabel: t("tabs.insights"),
          tabBarIcon: ({ focused }) => <TabIcon glyph="📈" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
