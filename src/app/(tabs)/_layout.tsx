// app/(tabs)/_layout.tsx
import React, { useEffect } from "react";
import { Tabs, useRouter } from "expo-router";
import {
  ActivityIndicator,
  View,
  StyleSheet,
  Image,
  ImageSourcePropType,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCurrentUser } from "@/hooks/use-current-user";

const TAB_ICONS = {
  home: require("@/assets/tab-icons/home.png"),
  lecture: require("@/assets/tab-icons/lecture.png"),
  menu: require("@/assets/tab-icons/main-menu.png"),
  group: require("@/assets/tab-icons/group.png"),
  user: require("@/assets/tab-icons/user.png"),
} as const;

interface TabBarIconProps {
  source: ImageSourcePropType;
  focused: boolean;
  size?: number;
}

const TabIcon = React.memo(function TabIcon({
  source,
  focused,
  size = 25,
}: TabBarIconProps) {
  return (
    <View style={styles.tabIconWrapper}>
      <Image
        source={source}
        style={{
          width: size,
          height: size,
          opacity: focused ? 1 : 0.55,
          transform: [{ scale: focused ? 1.08 : 1 }],
        }}
        resizeMode="contain"
      />
      <View
        style={[
          styles.activeIndicator,
          focused && styles.activeIndicatorFocused,
        ]}
      />
    </View>
  );
});

export default function TabsLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { role: userRole, isPending, isAuthenticated } = useCurrentUser();

  useEffect(() => {
    if (!isPending && !isAuthenticated) {
      router.replace("/(auth)/login");
    }
  }, [isPending, isAuthenticated, router]);

  // Wait until the session and user object are completely populated
  if (isPending || !isAuthenticated) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#131b2e" />
      </View>
    );
  }

  return (
    <Tabs
      backBehavior="history"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: "#ffffff",
        tabBarInactiveTintColor: "#76777d",

        tabBarItemStyle: {
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        },

        tabBarStyle: {
          position: "absolute",
          bottom: insets.bottom > 0 ? insets.bottom + 16 : 24,
          marginHorizontal: 20,
          height: 72,
          backgroundColor: "#131b2e",
          borderRadius: 36,
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 24,
          paddingBottom: 0,
          paddingTop: 16,
        },
      }}
    >
      {/* 1. HOME (All Roles) */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarAccessibilityLabel: "Home tab",
          tabBarIcon: ({ focused }) => (
            <TabIcon source={TAB_ICONS.home} focused={focused} />
          ),
        }}
      />

      {/* 2. HUBS (Student & Teacher) / MANAGE USERS (Admin) */}
      <Tabs.Screen
        name="hubs"
        options={{
          title: "Hubs",
          tabBarAccessibilityLabel: "Course hubs tab",
          href: userRole === "ADMIN" ? null : "/(tabs)/hubs",
          tabBarIcon: ({ focused }) => (
            <TabIcon source={TAB_ICONS.lecture} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="admin_users"
        options={{
          title: "Users",
          tabBarAccessibilityLabel: "Manage users tab",
          href: userRole === "ADMIN" ? "/(tabs)/admin_users" : null,
          tabBarIcon: ({ focused }) => (
            <TabIcon source={TAB_ICONS.group} focused={focused} />
          ),
        }}
      />

      {/* 3. MENU (All Roles) - CENTER BUTTON */}
      <Tabs.Screen
        name="menu"
        options={{
          title: "Explore",
          tabBarAccessibilityLabel: "Explore university services directory",
          tabBarIcon: ({ focused }) => (
            <View
              style={[
                styles.centerButton,
                focused && styles.centerButtonActive,
              ]}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Explore university services directory"
            >
              <Image
                source={TAB_ICONS.menu}
                style={[
                  styles.centerIconImage,
                  { opacity: focused ? 1 : 0.8 },
                ]}
                resizeMode="contain"
              />
            </View>
          ),
        }}
      />

      {/* 4. FORUM (Student & Teacher) / ADD TEACHER (Admin) */}
      <Tabs.Screen
        name="forum/index"
        options={{
          title: "Forum",
          tabBarAccessibilityLabel: "Discussions forum tab",
          href: userRole === "ADMIN" ? null : "/(tabs)/forum",
          tabBarIcon: ({ focused }) => (
            <TabIcon source={TAB_ICONS.group} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="forum/[id]"
        options={{ href: null, tabBarStyle: { display: "none" } }}
      />
      <Tabs.Screen
        name="admin_add_teacher"
        options={{
          title: "Add Staff",
          tabBarAccessibilityLabel: "Add faculty staff tab",
          href: userRole === "ADMIN" ? "/(tabs)/admin_add_teacher" : null,
          tabBarIcon: ({ focused }) => (
            <TabIcon source={TAB_ICONS.lecture} focused={focused} />
          ),
        }}
      />

      {/* 5. PROFILE (All Roles) */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarAccessibilityLabel: "User profile tab",
          tabBarIcon: ({ focused }) => (
            <TabIcon source={TAB_ICONS.user} focused={focused} />
          ),
        }}
      />

      {/* ========================================== */}
      {/* 6. HIDDEN SCREENS (Accessible only via router.push) */}
      {/* ========================================== */}
      <Tabs.Screen name="admin_calendar" options={{ href: null }} />
      <Tabs.Screen name="blood" options={{ href: null }} />
      <Tabs.Screen name="community" options={{ href: null }} />
      <Tabs.Screen name="my-schedule" options={{ href: null }} />
      <Tabs.Screen name="notices" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7f9fb",
  },
  tabIconWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  activeIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "transparent",
    marginTop: 4,
  },
  activeIndicatorFocused: {
    backgroundColor: "#ffffff",
  },
  centerButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  centerButtonActive: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderColor: "rgba(255, 255, 255, 0.35)",
    transform: [{ scale: 1.05 }],
  },
  centerIconImage: {
    width: 25,
    height: 25,
  },
});
