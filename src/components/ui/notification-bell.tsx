import React from "react";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { useUnreadNotificationCount } from "@/features/notifications/useNotifications";

interface NotificationBellProps {
  style?: StyleProp<ViewStyle>;
  iconColor?: string;
  iconSize?: number;
  accessibilityLabel?: string;
}

export const NotificationBell = React.memo(function NotificationBell({
  style,
  iconColor = "#131b2e",
  iconSize = 20,
  accessibilityLabel = "Notifications",
}: NotificationBellProps) {
  const router = useRouter();
  const { data: unreadCount = 0 } = useUnreadNotificationCount();

  return (
    <TouchableOpacity
      onPress={() => router.push("/(tabs)/notifications")}
      style={[styles.button, style]}
      activeOpacity={0.7}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={
        unreadCount > 0
          ? `${accessibilityLabel}, ${unreadCount} unread`
          : accessibilityLabel
      }
    >
      <Feather name="bell" size={iconSize} color={iconColor} />
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  button: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -1,
    right: -2,
    minWidth: 17,
    height: 17,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: "#ef4444",
    borderWidth: 1.5,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: "#fff", fontSize: 9, fontWeight: "800" },
});
