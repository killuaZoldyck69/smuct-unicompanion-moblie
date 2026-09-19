import React, { memo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO_COLORS, fontFamily } from "../constants";

interface ForumTopNavProps {
  user?: { name?: string | null; image?: string | null } | null;
  onPressNotifications: () => void;
  onPressCompose?: () => void;
}

export const ForumTopNav = memo(function ForumTopNav({
  onPressNotifications,
  onPressCompose,
}: ForumTopNavProps) {
  return (
    <View style={styles.topNavBar}>
      <View style={styles.topNavLeft}>
        <Text style={styles.navBrandTitle}>UniCompanion</Text>
      </View>

      <View style={styles.topNavRight}>
        {onPressCompose && (
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={onPressCompose}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Ask a question"
            activeOpacity={0.7}
          >
            <Feather name="plus" size={20} color={BENTO_COLORS.deepNavy} />
          </TouchableOpacity>
        )}

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
  topNavRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
