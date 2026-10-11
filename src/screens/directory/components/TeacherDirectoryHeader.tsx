import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { DIRECTORY_COLORS, fontFamily } from "../constants";

interface TeacherDirectoryHeaderProps {
  onBack: () => void;
  totalCount?: number;
  isModal?: boolean;
}

export const TeacherDirectoryHeader = React.memo(
  function TeacherDirectoryHeader({
    onBack,
    totalCount,
    isModal = false,
  }: TeacherDirectoryHeaderProps) {
    return (
      <View style={styles.header}>
        <View style={styles.topRow}>
          <TouchableOpacity
            onPress={onBack}
            style={styles.backBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={isModal ? "Close faculty directory" : "Go back"}
          >
            <Feather
              name={isModal ? "x" : "arrow-left"}
              size={22}
              color={DIRECTORY_COLORS.textPrimary}
            />
          </TouchableOpacity>

          <View style={styles.titleCol}>
            <View style={styles.titleWithBadge}>
              <Text style={styles.title}>Faculty Directory</Text>
              {typeof totalCount === "number" && totalCount > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{totalCount}</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.subtitle}>
              Search professors, office rooms & contacts
            </Text>
          </View>
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  header: {
    backgroundColor: DIRECTORY_COLORS.surface,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: DIRECTORY_COLORS.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  titleCol: {
    flex: 1,
  },
  titleWithBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontFamily,
    fontSize: 20,
    fontWeight: "800",
    color: DIRECTORY_COLORS.textPrimary,
    letterSpacing: -0.4,
  },
  badge: {
    backgroundColor: DIRECTORY_COLORS.tealSoft,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: DIRECTORY_COLORS.pillRadius,
    borderWidth: 1,
    borderColor: DIRECTORY_COLORS.tealBorder,
  },
  badgeText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: DIRECTORY_COLORS.tealDark,
  },
  subtitle: {
    fontFamily,
    fontSize: 12,
    fontWeight: "500",
    color: DIRECTORY_COLORS.textSecondary,
    marginTop: 2,
  },
});
