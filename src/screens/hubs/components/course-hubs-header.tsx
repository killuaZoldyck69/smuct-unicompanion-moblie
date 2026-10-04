import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
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
      {/* Subtle Academic Decorative Background (Non-intrusive) */}
      <View style={styles.decorativeLayer} pointerEvents="none">
        <View style={styles.glowCircle} />
        <View style={styles.contourRing} />
        <View style={styles.mortarboardWatermark}>
          <Ionicons
            name="school-outline"
            size={88}
            color="#3b5bf5"
            style={{ opacity: 0.04 }}
          />
        </View>
      </View>

      {/* Top Bar: Title & Action Buttons */}
      <View style={styles.topRow}>
        <View style={styles.titleColumn}>
          <Text style={styles.title}>Course Hubs</Text>
          <Text style={styles.subtitle}>
            Your classes, resources and academic journey — all in one place.
          </Text>
        </View>

        <View style={styles.actionButtonsGroup}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onOpenNotifications}
            activeOpacity={0.7}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="View university notices and notifications"
          >
            <Feather name="bell" size={19} color={BENTO_COLORS.deepNavy} />
          </TouchableOpacity>

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
    paddingBottom: 16,
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
    top: -40,
    right: -20,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(59, 91, 245, 0.04)",
  },
  contourRing: {
    position: "absolute",
    top: -20,
    right: 20,
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "rgba(19, 27, 46, 0.05)",
  },
  mortarboardWatermark: {
    position: "absolute",
    top: -4,
    right: 14,
    transform: [{ rotate: "-10deg" }],
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
    fontSize: 29,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    letterSpacing: -0.6,
  },
  subtitle: {
    fontFamily,
    fontSize: 14,
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
