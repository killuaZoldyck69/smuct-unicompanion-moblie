import React from "react";
import { Feather } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
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
  useCatAnimation?: boolean;
}

export const NotificationBell = React.memo(function NotificationBell({
  style,
  iconColor = "#131b2e",
  iconSize = 20,
  accessibilityLabel = "Notifications",
  useCatAnimation = false,
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
      {useCatAnimation ? (
        <View pointerEvents="none" style={styles.catAnimation}>
          <LottieView
            source={require("@/assets/icons/cat.json")}
            autoPlay
            loop
            resizeMode="contain"
            style={styles.catAnimation}
          />
        </View>
      ) : (
        <Feather name="bell" size={iconSize} color={iconColor} />
      )}
      {unreadCount > 0 && (
        <View style={[styles.badge, useCatAnimation && styles.catBadge]}>
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
  catAnimation: {
    width: 144,
    height: 144,
  },
  badge: {
    position: "absolute",
    top: -1,
    right: -2,
    minWidth: 17,
    height: 17,
    paddingHorizontal: 4,
    borderRadius: 100,
    borderWidth: 0.5,
    borderColor: "#808080",
    alignItems: "center",
    justifyContent: "center",
  },
  catBadge: {
    top: 4,
    right: 38,
  },
  badgeText: { color: "#000000", fontSize: 9, fontWeight: "800" },
});
