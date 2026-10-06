import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO_COLORS, fontFamily } from "../constants";

interface CourseHubsHeaderProps {
  onOpenNotifications: () => void;
  onOpenSettings: () => void;
}

export const CourseHubsHeader = React.memo(function CourseHubsHeader({
  onOpenNotifications,
  onOpenSettings,
}: CourseHubsHeaderProps) {
  return (
    <View style={styles.headerContainer}>
      {/* Background Illustration & Glow */}
      <View style={styles.decorativeLayer} pointerEvents="none">
        <View style={styles.glowCircle} />
        <Image
          source={require("@/assets/icons/student-benefits.png")}
          style={styles.bgIllustration}
          resizeMode="contain"
        />
      </View>

      {/* Top Bar: Title & Action Buttons */}
      <View style={styles.topRow}>
        <View style={styles.titleColumn}>
          <Text style={styles.title}>Course Hubs</Text>
          <Text style={styles.subtitle}>
            Your classes, resources — all in one place.
          </Text>
        </View>

        <View style={styles.actionButtonsGroup}>
          {/* <TouchableOpacity
            style={styles.iconButton}
            onPress={onOpenNotifications}
            activeOpacity={0.7}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="View university notices and notifications"
          >
            <Feather name="bell" size={19} color={BENTO_COLORS.deepNavy} />
          </TouchableOpacity> */}

          <TouchableOpacity
            style={styles.iconButton}
            onPress={onOpenSettings}
            activeOpacity={0.7}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Course Hub options and settings"
          >
            <Feather name="settings" size={19} color={BENTO_COLORS.deepNavy} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    position: "relative",
    overflow: "hidden",
  },
  decorativeLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  glowCircle: {
    position: "absolute",
    top: -30,
    right: -20,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(59, 91, 245, 0.05)",
  },
  bgIllustration: {
    position: "absolute",
    top: -2,
    right: -120,
    width: "100%",
    height: "100%",
    opacity: 0.85,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 14,
  },
  titleColumn: {
    flex: 1,
  },
  title: {
    fontFamily,
    fontSize: 24,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    letterSpacing: -0.6,
  },
  subtitle: {
    fontFamily,
    fontSize: 13,
    color: BENTO_COLORS.textSecondary,
    lineHeight: 20,
    marginTop: 5,
  },
  actionButtonsGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: BENTO_COLORS.border,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
});
