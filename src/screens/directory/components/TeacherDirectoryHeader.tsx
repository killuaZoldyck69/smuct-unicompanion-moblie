import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { DIRECTORY_COLORS } from "../constants";

interface TeacherDirectoryHeaderProps {
  onBack?: () => void;
  totalCount?: number;
  isModal?: boolean;
}

export const TeacherDirectoryHeader = React.memo(
  function TeacherDirectoryHeader({
    totalCount,
  }: TeacherDirectoryHeaderProps) {
    return (
      <View style={styles.header}>
        <View style={styles.headerTitlesContainer}>
          <View style={styles.titleWithBadge}>
            <Text style={styles.screenTitle}>Faculty Directory</Text>
            {typeof totalCount === "number" && totalCount > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{totalCount}</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.screenSubtitle}>
            Search professors, office rooms & contacts
          </Text>
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  header: {
    backgroundColor: DIRECTORY_COLORS.surface,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
  },
  headerTitlesContainer: {
    alignItems: "flex-start",
  },
  titleWithBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  screenTitle: {
    fontFamily: Platform.select({
      web: "'Bricolage Grotesque', sans-serif",
      android: "BricolageGrotesque_800ExtraBold",
      default: "BricolageGrotesque_800ExtraBold",
    }),
    fontSize: 24,
    fontWeight: "800",
    color: DIRECTORY_COLORS.textPrimary,
    letterSpacing: -0.4,
    lineHeight: 30,
  },
  title: {
    fontFamily: Platform.select({
      web: "'Bricolage Grotesque', sans-serif",
      android: "BricolageGrotesque_800ExtraBold",
      default: "BricolageGrotesque_800ExtraBold",
    }),
    fontSize: 24,
    fontWeight: "800",
    color: DIRECTORY_COLORS.textPrimary,
    letterSpacing: -0.4,
    lineHeight: 30,
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
    fontFamily: Platform.select({
      web: "'Onest', sans-serif",
      android: "Onest_700Bold",
      default: "Onest_700Bold",
    }),
    fontSize: 11,
    fontWeight: "800",
    color: DIRECTORY_COLORS.tealDark,
  },
  screenSubtitle: {
    fontFamily: Platform.select({
      web: "'Onest', sans-serif",
      android: "Onest_500Medium",
      default: "Onest_500Medium",
    }),
    fontSize: 13,
    fontWeight: "500",
    color: DIRECTORY_COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 18,
    letterSpacing: -0.1,
  },
  subtitle: {
    fontFamily: Platform.select({
      web: "'Onest', sans-serif",
      android: "Onest_500Medium",
      default: "Onest_500Medium",
    }),
    fontSize: 13,
    fontWeight: "500",
    color: DIRECTORY_COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 18,
    letterSpacing: -0.1,
  },
});
