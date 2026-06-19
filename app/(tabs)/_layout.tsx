// app/(tabs)/_layout.tsx
import React from "react";
import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { authClient } from "../../src/services/auth-client";
import { colors } from "../../src/theme/colors";
import { typography } from "../../src/theme/typography";
import { shadows } from "../../src/theme/layout";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  const { data: session, isPending } = authClient.useSession();

  // Wait until the session and user object are completely populated
  if (isPending || !session?.user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primaryContainer} />
      </View>
    );
  }

  // Safely extract the exact role without using a "STUDENT" fallback
  const userRole = (session.user as any).role;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primaryContainer,
        tabBarInactiveTintColor: colors.outline,
        tabBarStyle: {
          backgroundColor: colors.surfaceContainerLowest,
          borderTopWidth: 1,
          borderTopColor: colors.surfaceContainerHighest,
          height: 65 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          ...typography.labelSm,
          marginTop: 4,
        },
      }}
    >
      {/* 1. HOME (All Roles) */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Feather name="home" size={24} color={color} />
          ),
        }}
      />

      {/* 2. HUBS (Student & Teacher) / MANAGE USERS (Admin) */}
      <Tabs.Screen
        name="hubs"
        options={{
          title: "Hubs",
          href: userRole === "ADMIN" ? null : "/(tabs)/hubs",
          tabBarIcon: ({ color }) => (
            <Feather name="layers" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="admin_users"
        options={{
          title: "Users",
          href: userRole === "ADMIN" ? "/(tabs)/admin_users" : null,
          tabBarIcon: ({ color }) => (
            <Feather name="users" size={24} color={color} />
          ),
        }}
      />

      {/* 3. MENU (All Roles) - FLOATING CENTER BUTTON */}
      <Tabs.Screen
        name="menu"
        options={{
          title: "Menu",
          tabBarLabel: () => null,
          tabBarIcon: ({ focused }) => (
            <View
              style={[
                styles.floatingButton,
                focused && styles.floatingButtonActive,
              ]}
            >
              <Feather name="grid" size={26} color={colors.onPrimary} />
            </View>
          ),
        }}
      />

      {/* 4. FORUM (Student & Teacher) / ADD TEACHER (Admin) */}
      <Tabs.Screen
        name="forum"
        options={{
          title: "Forum",
          href: userRole === "ADMIN" ? null : "/(tabs)/forum",
          tabBarIcon: ({ color }) => (
            <Feather name="message-square" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="admin_add_teacher"
        options={{
          title: "Add Staff",
          href: userRole === "ADMIN" ? "/(tabs)/admin_add_teacher" : null,
          tabBarIcon: ({ color }) => (
            <Feather name="user-plus" size={24} color={color} />
          ),
        }}
      />

      {/* 5. PROFILE (All Roles) */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Feather name="user" size={24} color={color} />
          ),
        }}
      />

      {/* ========================================== */}
      {/* 6. HIDDEN SCREENS (Accessible only via router.push) */}
      {/* ========================================== */}
      <Tabs.Screen
        name="admin_calendar"
        options={{
          href: null, // Forcefully hidden from tab bar
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          href: null, // Safeguard: Hides the old community file if it still exists
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  floatingButton: {
    top: -15,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryContainer,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.level1,
  },
  floatingButtonActive: {
    backgroundColor: colors.secondary,
  },
});
