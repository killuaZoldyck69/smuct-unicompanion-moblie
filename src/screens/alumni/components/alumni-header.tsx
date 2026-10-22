import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO, fontFamily } from "../constants";

interface AlumniHeaderProps {
  totalCount?: number;
  filteredCount?: number;
  hasBackButton?: boolean;
  onBackPress?: () => void;
  isAdmin?: boolean;
  title?: string;
  subtitle?: string;
  onAddPress?: () => void;
  onCsvPress?: () => void;
}

export const AlumniHeader: React.FC<AlumniHeaderProps> = React.memo(
  ({
    totalCount = 0,
    filteredCount,
    hasBackButton = false,
    onBackPress,
    isAdmin = false,
    title = "Alumni Network",
    subtitle,
    onAddPress,
    onCsvPress,
  }) => {
    const displayCount =
      typeof filteredCount === "number" ? filteredCount : totalCount;

    const defaultSubtitle =
      displayCount > 0
        ? `${displayCount} verified graduates`
        : "Connect with SMUCT graduates";

    return (
      <View style={styles.header}>
        {/* Left: Optional Back Button + Titles */}
        <View style={styles.headerLeftCol}>
          {hasBackButton && (
            <TouchableOpacity
              onPress={onBackPress}
              style={styles.backBtn}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              activeOpacity={0.7}
            >
              <Feather name="arrow-left" size={19} color={BENTO.navy} />
            </TouchableOpacity>
          )}

          <View style={styles.headerTitleGroup}>
            <View style={styles.titleRow}>
              <Text style={styles.screenTitle}>{title}</Text>
              {isAdmin && (
                <View style={styles.adminBadge}>
                  <Feather
                    name="shield"
                    size={11}
                    color={BENTO.navy}
                    style={{ marginRight: 3 }}
                  />
                  <Text style={styles.adminBadgeText}>ADMIN</Text>
                </View>
              )}
            </View>
            <Text style={styles.screenSubtitle}>
              {subtitle || defaultSubtitle}
            </Text>
          </View>
        </View>

        {/* Right: Admin Quick Action Buttons or Header Illustration */}
        {isAdmin && (onAddPress || onCsvPress) ? (
          <View style={styles.headerActionBtns}>
            {onCsvPress && (
              <TouchableOpacity
                onPress={onCsvPress}
                style={styles.headerIconBtn}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Import alumni via CSV file"
                activeOpacity={0.7}
              >
                <Feather name="upload" size={17} color={BENTO.navy} />
              </TouchableOpacity>
            )}

            {onAddPress && (
              <TouchableOpacity
                onPress={onAddPress}
                style={[styles.headerIconBtn, styles.headerAddBtn]}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Add new alumnus"
                activeOpacity={0.7}
              >
                <Feather name="user-plus" size={17} color="#ffffff" />
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.headerIllustrationWrap} pointerEvents="none">
            <Image
              source={require("@/assets/header-bg-images/alumni-screen-bg.png")}
              style={styles.headerIllustration}
              resizeMode="contain"
              accessible={false}
            />
          </View>
        )}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: BENTO.canvas,
  },
  headerLeftCol: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: BENTO.card,
    borderWidth: 1,
    borderColor: BENTO.border,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleGroup: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  screenTitle: {
    fontFamily,
    fontSize: 22,
    fontWeight: "800",
    color: BENTO.navy,
    letterSpacing: -0.5,
  },
  adminBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.primaryLight,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.2)",
  },
  adminBadgeText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: BENTO.navy,
    letterSpacing: 0.5,
  },
  screenSubtitle: {
    fontFamily,
    fontSize: 12,
    color: BENTO.slate,
    marginTop: 3,
    fontWeight: "500",
  },
  headerActionBtns: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: BENTO.card,
    borderWidth: 1,
    borderColor: BENTO.border,
    alignItems: "center",
    justifyContent: "center",
  },
  headerAddBtn: {
    backgroundColor: BENTO.navy,
    borderColor: BENTO.navy,
  },
  headerIllustrationWrap: {
    width: 100,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
  },
  headerIllustration: {
    width: 160,
    height: 80,
    opacity: 0.8,
  },
});

