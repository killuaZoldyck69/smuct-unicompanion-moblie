// src/screens/notices/components/notice-header.tsx
import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { NOTICE_COLORS, fontFamily } from "../constants";

const NOTICE_HEADER_BG = require("@/assets/header-bg-images/notice-screen-bg.png");

export interface NoticeHeaderProps {
  title?: string;
  badgeText?: string;
  hasBackButton?: boolean;
  onBack?: () => void;
  isAdmin?: boolean;
}

export const NoticeHeader = React.memo(function NoticeHeader({
  title = "Noticeboard",
  badgeText = "Official University Announcements",
  hasBackButton = false,
  onBack,
  isAdmin = false,
}: NoticeHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {hasBackButton && (
          <TouchableOpacity
            onPress={onBack}
            style={styles.backButton}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            activeOpacity={0.7}
          >
            <Feather
              name="arrow-left"
              size={20}
              color={NOTICE_COLORS.deepNavy}
            />
          </TouchableOpacity>
        )}

        {/* Left: Title + badge row */}
        <View style={styles.titleGroup}>
          <View style={styles.titleWithBadge}>
            <Text style={styles.title}>{title}</Text>
            {isAdmin && (
              <View style={styles.adminBadge}>
                <Text style={styles.adminBadgeText}>ADMIN</Text>
              </View>
            )}
          </View>
          <View style={styles.badgeRow}>
            <Text
              style={styles.badgeText}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {badgeText}
            </Text>
          </View>
        </View>

        {/* Right: Notice Screen Illustration */}
        <View style={styles.illustrationWrap} pointerEvents="none">
          <Image
            source={NOTICE_HEADER_BG}
            style={styles.illustration}
            resizeMode="contain"
            accessible={false}
          />
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: NOTICE_COLORS.background,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  titleGroup: {
    flex: 1,
    paddingTop: 6,
    marginRight: 8,
  },
  title: {
    fontFamily,
    fontSize: 24,
    fontWeight: "800",
    color: NOTICE_COLORS.deepNavy,
    letterSpacing: -0.6,
    lineHeight: 34,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
  },
  badgeText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "500",
    color: NOTICE_COLORS.subtleText,
    letterSpacing: -0.2,
  },
  illustrationWrap: {
    width: 104,
    height: 66,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -4,
  },
  illustration: {
    width: 135,
    height: 90,
    opacity: 0.9,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: NOTICE_COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
    ...NOTICE_COLORS.shadow,
  },
  titleWithBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  adminBadge: {
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "rgba(37, 99, 235, 0.2)",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  adminBadgeText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: "#2563eb",
    letterSpacing: 0.5,
  },
});
