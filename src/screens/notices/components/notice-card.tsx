// src/screens/notices/components/notice-card.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { NOTICE_COLORS, fontFamily } from "../constants";
import { NormalizedNotice } from "../types";
import { resolveNoticeVisualTheme } from "../theme/notice-visual-theme-resolver";

interface NoticeCardProps {
  item: NormalizedNotice;
  onPress: (item: NormalizedNotice) => void;
}

export const NoticeCard = React.memo(function NoticeCard({
  item,
  onPress,
}: NoticeCardProps) {
  const theme = resolveNoticeVisualTheme(item.category);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.88}
      onPress={() => onPress(item)}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Notice: ${item.title}. Category: ${theme.label}. Published: ${item.formattedDate}. Tap to read official document.`}
    >
      {/* 1. Left Color-Coded Vertical Accent Bar */}
      <View
        style={[
          styles.leftAccentBar,
          { backgroundColor: theme.accentBarColor },
        ]}
      />

      <View style={styles.cardContent}>
        {/* Row 1: Notice Title (Bengali / English with proper metrics) */}
        <Text style={styles.title} numberOfLines={3}>
          {item.title}
        </Text>

        {/* Row 2: Reference / Memo */}
        {item.referenceNo ? (
          <Text style={styles.referenceText} numberOfLines={1}>
            Ref: {item.referenceNo}
          </Text>
        ) : null}

        {/* Row 3: Subtle Divider */}
        <View style={styles.divider} />

        {/* Row 4: Bottom Meta Row (Category Badge + Published Date + Chevron) */}
        <View style={styles.bottomRow}>
          <View style={styles.bottomMetaLeft}>
            {/* Category Tag */}
            <View
              style={[
                styles.categoryBadge,
                {
                  backgroundColor: theme.badgeBg,
                  borderColor: theme.badgeBorder,
                },
              ]}
            >
              <Feather
                name={theme.icon}
                size={11}
                color={theme.badgeText}
                style={{ marginRight: 4 }}
              />
              <Text
                style={[
                  styles.categoryBadgeText,
                  { color: theme.badgeText },
                ]}
              >
                {theme.label.toUpperCase()}
              </Text>
            </View>

            {/* Published Date */}
            <View style={styles.dateGroup}>
              <Feather
                name="calendar"
                size={12}
                color={NOTICE_COLORS.subtleText}
                style={{ marginRight: 5 }}
              />
              <Text style={styles.dateText}>{item.formattedDate}</Text>
            </View>

            {/* Optional Important / New Tag */}
            {item.isImportant ? (
              <View style={styles.importantPill}>
                <Text style={styles.importantPillText}>★ IMPORTANT</Text>
              </View>
            ) : item.isNew ? (
              <View style={styles.newPill}>
                <View style={styles.newDot} />
                <Text style={styles.newPillText}>NEW</Text>
              </View>
            ) : null}
          </View>

          <Feather
            name="chevron-right"
            size={16}
            color="#94a3b8"
          />
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: NOTICE_COLORS.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: NOTICE_COLORS.mutedBorder,
    marginBottom: 14,
    overflow: "hidden",
    position: "relative",
    ...NOTICE_COLORS.shadow,
  },
  leftAccentBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3.5,
  },
  cardContent: {
    paddingLeft: 18,
    paddingRight: 16,
    paddingTop: 15,
    paddingBottom: 14,
  },
  title: {
    fontFamily,
    fontSize: 17,
    fontWeight: "800",
    color: NOTICE_COLORS.deepNavy,
    lineHeight: 25,
    letterSpacing: -0.2,
    marginBottom: 6,
  },
  referenceText: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "500",
    color: NOTICE_COLORS.subtleText,
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: NOTICE_COLORS.divider,
    marginVertical: 10,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bottomMetaLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    flex: 1,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
    borderWidth: 1,
  },
  categoryBadgeText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  dateGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: NOTICE_COLORS.subtleText,
  },
  importantPill: {
    backgroundColor: "#fee2e2",
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 5,
  },
  importantPillText: {
    fontFamily,
    fontSize: 9.5,
    fontWeight: "800",
    color: "#b91c1c",
  },
  newPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 5,
  },
  newDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#059669",
    marginRight: 4,
  },
  newPillText: {
    fontFamily,
    fontSize: 9.5,
    fontWeight: "800",
    color: "#059669",
  },
});
