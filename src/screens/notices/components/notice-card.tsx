// src/screens/notices/components/notice-card.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { NOTICE_COLORS, fontFamily } from "../constants";
import { NormalizedNotice } from "../types";
import { resolveNoticeVisualTheme } from "../theme/notice-visual-theme-resolver";

export interface NoticeCardProps {
  item: NormalizedNotice;
  onPress: (item: NormalizedNotice) => void;
  isAdmin?: boolean;
  onEdit?: (item: NormalizedNotice) => void;
  onDelete?: (item: NormalizedNotice) => void;
}

export const NoticeCard = React.memo(function NoticeCard({
  item,
  onPress,
  isAdmin = false,
  onEdit,
  onDelete,
}: NoticeCardProps) {
  const theme = resolveNoticeVisualTheme(item.category);
  const handlePress = React.useCallback(() => {
    if (
      Platform.OS === "web" &&
      typeof document !== "undefined" &&
      document.activeElement instanceof HTMLElement
    ) {
      document.activeElement.blur();
    }
    onPress(item);
  }, [item, onPress]);

  return (
    <View style={styles.card}>
      {/* 1. Left Color-Coded Vertical Accent Bar */}
      <View
        style={[
          styles.leftAccentBar,
          { backgroundColor: theme.accentBarColor },
        ]}
      />

      <View style={styles.cardContent}>
        <TouchableOpacity
          style={styles.mainPressable}
          activeOpacity={0.88}
          onPress={handlePress}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Notice: ${item.title}. Category: ${theme.label}. Published: ${item.formattedDate}. Tap to read official document.`}
        >
          {/* Row 1: Notice Title with NEW / IMPORTANT badge beside it */}
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={3}>
              {item.title}
            </Text>
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

          {/* Row 2: Reference / Memo */}
          {item.referenceNo ? (
            <Text style={styles.referenceText} numberOfLines={1}>
              Ref: {item.referenceNo}
            </Text>
          ) : null}

          {/* Row 3: Subtle Divider */}
          <View style={styles.divider} />
        </TouchableOpacity>

        {/* Row 4: Bottom Meta Row (Category Badge + Published Date + Actions) */}
        <View style={styles.bottomRow}>
          <TouchableOpacity
            style={styles.bottomMetaLeft}
            activeOpacity={0.88}
            onPress={handlePress}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Open notice: ${item.title}`}
          >
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
          </TouchableOpacity>

          <View style={styles.rightActionCluster}>
            {isAdmin && (
              <View style={styles.adminActionRow}>
                <TouchableOpacity
                  onPress={() => onEdit?.(item)}
                  style={[styles.adminBtnCircle, styles.adminEditBtn]}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Edit notice: ${item.title}`}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                >
                  <Feather name="edit-2" size={13} color="#2563eb" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => onDelete?.(item)}
                  style={[styles.adminBtnCircle, styles.adminDeleteBtn]}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Delete notice: ${item.title}`}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 6, right: 8 }}
                >
                  <Feather name="trash-2" size={13} color="#dc2626" />
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity
              onPress={handlePress}
              style={styles.chevronBtn}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Open notice: ${item.title}`}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
            >
              <Feather name="chevron-right" size={16} color="#94a3b8" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
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
  mainPressable: {
    width: "100%",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 6,
  },
  title: {
    flex: 1,
    fontFamily,
    fontSize: 17,
    fontWeight: "800",
    color: NOTICE_COLORS.deepNavy,
    lineHeight: 25,
    letterSpacing: -0.2,
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
    borderWidth: 1,
    borderColor: "rgba(220, 38, 38, 0.2)",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 2,
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
    borderWidth: 1,
    borderColor: "rgba(5, 150, 105, 0.2)",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 2,
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
    letterSpacing: 0.3,
  },
  rightActionCluster: {
    flexDirection: "row",
    alignItems: "center",
  },
  chevronBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  adminActionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 6,
    gap: 6,
  },
  adminBtnCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  adminEditBtn: {
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "rgba(37, 99, 235, 0.15)",
  },
  adminDeleteBtn: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "rgba(220, 38, 38, 0.15)",
  },
});
