// src/screens/notices/components/notice-header.tsx
import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { NOTICE_COLORS, fontFamily } from "../constants";

const NOTICE_HEADER_BG = require("@/assets/header-bg-images/notice-screen-bg.png");

interface NoticeHeaderProps {
  badgeText?: string;
}

export const NoticeHeader = React.memo(function NoticeHeader({
  badgeText = "Official University Announcements",
}: NoticeHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {/* Left: Title + badge row */}
        <View style={styles.titleGroup}>
          <Text style={styles.title}>Noticeboard</Text>
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
});
