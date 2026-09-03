// app/(tabs)/_layout.tsx
import React, { useEffect } from "react";
import { Tabs, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCurrentUser } from "@/hooks/use-current-user";

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
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false, // Hide labels for the minimalist look
        tabBarActiveTintColor: "#ffffff", // White icons when active
        tabBarInactiveTintColor: "#76777d", // Grey icons when inactive

        // 👇 NEW: Forces the icons to center perfectly, ignoring the hidden label space
        tabBarItemStyle: {
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        },

        tabBarStyle: {
          position: "absolute",
          // Push up safely above the Android navigation bar
          bottom: insets.bottom > 0 ? insets.bottom + 16 : 24,
          marginHorizontal: 20,
          height: 72,
          backgroundColor: "#131b2e", // Deep Navy background
          borderRadius: 36, // Perfect pill shape
          borderTopWidth: 0, // Remove default top line
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
          tabBarAccessibilityLabel: "Course hubs tab",
          href: userRole === "ADMIN" ? null : "/(tabs)/hubs",
          tabBarIcon: ({ color }) => (
            <Feather name="calendar" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="admin_users"
        options={{
          title: "Users",
          tabBarAccessibilityLabel: "Manage users tab",
          href: userRole === "ADMIN" ? "/(tabs)/admin_users" : null,
          tabBarIcon: ({ color }) => (
            <Feather name="users" size={24} color={color} />
          ),
        }}
      />

      {/* 3. MENU (All Roles) - CENTER BUTTON */}
      <Tabs.Screen
        name="menu"
        options={{
          title: "Menu",
          tabBarAccessibilityLabel: "Features menu tab",
          tabBarIcon: ({ focused }) => (
            <View
              style={[
                styles.centerButton,
                focused && styles.centerButtonActive,
              ]}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Open features menu"
            >
              <Feather name="plus" size={24} color="#131b2e" />
            </View>
          ),
        }}
      />

      {/* 4. FORUM (Student & Teacher) / ADD TEACHER (Admin) */}
      <Tabs.Screen
        name="forum"
        options={{
          title: "Forum",
          tabBarAccessibilityLabel: "Discussions forum tab",
          href: userRole === "ADMIN" ? null : "/(tabs)/forum",
          tabBarIcon: ({ color }) => (
            <Feather name="map" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="admin_add_teacher"
        options={{
          title: "Add Staff",
          tabBarAccessibilityLabel: "Add faculty staff tab",
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
          tabBarAccessibilityLabel: "User profile tab",
          tabBarIcon: ({ color }) => (
            <Feather name="user" size={24} color={color} />
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

// --- ISOLATED NEW DESIGN THEME (Soft Campus Bento) ---
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7f9fb",
  },
  centerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#76777d", // Grey background from the mockup
    justifyContent: "center",
    alignItems: "center",
  },
  centerButtonActive: {
    backgroundColor: "#ffffff", // Turns pure white when active
  },
});
