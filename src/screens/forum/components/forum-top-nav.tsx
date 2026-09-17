import React, { memo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO_COLORS, fontFamily } from "../constants";

interface ForumTopNavProps {
  user?: { name?: string | null; image?: string | null } | null;
  onPressNotifications: () => void;
}

export const ForumTopNav = memo(function ForumTopNav({
  user,
  onPressNotifications,
}: ForumTopNavProps) {
  const initial = user?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <View style={styles.topNavBar}>
      <View style={styles.topNavLeft}>
        {user?.image ? (
          <Image
            source={{ uri: user.image }}
            style={styles.navAvatar}
            accessible={true}
            accessibilityLabel="Your profile avatar"
          />
        ) : (
          <View style={styles.navAvatarFallback}>
            <Text style={styles.navAvatarText}>{initial}</Text>
          </View>
        )}
        <Text style={styles.navBrandTitle}>UniCompanion</Text>
      </View>

      <TouchableOpacity
        style={styles.headerIconButton}
        onPress={onPressNotifications}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="View notices and notifications"
        activeOpacity={0.7}
      >
        <Feather name="bell" size={18} color={BENTO_COLORS.deepNavy} />
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  topNavBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: BENTO_COLORS.background,
  },
  topNavLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  navAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginRight: 10,
  },
  navAvatarFallback: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  navAvatarText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
  },
  navBrandTitle: {
    fontFamily,
    fontSize: 16,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    letterSpacing: -0.3,
  },
  headerIconButton: {
    width: 38,
    height: 38,
    borderRadius: BENTO_COLORS.pillRadius,
    backgroundColor: BENTO_COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    ...BENTO_COLORS.shadow,
  },
});
