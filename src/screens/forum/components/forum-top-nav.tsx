import React, { memo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO_COLORS, titleFontFamily } from "../constants";
import { NotificationBell } from "@/components/ui/notification-bell";

interface ForumTopNavProps {
  user?: { name?: string | null; image?: string | null } | null;
  onPressCompose?: () => void;
}

export const ForumTopNav = memo(function ForumTopNav({
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
            hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Ask a question"
            activeOpacity={0.7}
          >
            <Feather name="plus" size={20} color={BENTO_COLORS.deepNavy} />
          </TouchableOpacity>
        )}

        <NotificationBell
          style={styles.headerIconButton}
          iconSize={18}
          accessibilityLabel="View notifications"
        />
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
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
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
    fontFamily: titleFontFamily,
    fontSize: 16,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    letterSpacing: -0.3,
  },
  headerIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: BENTO_COLORS.white,
    borderWidth: 1,
    borderColor: BENTO_COLORS.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
});
