import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { NoticeItem } from "@/services/notice-service";
import { formatDate } from "@/utils/date-formatter";
import { BENTO_COLORS, CATEGORY_THEMES, fontFamily } from "../constants";
import { getNoticeCategory, isImportantNotice, isNewNotice } from "../utils";

interface NoticeCardProps {
  item: NoticeItem;
  onPress: (item: NoticeItem) => void;
}

export const NoticeCard = React.memo(function NoticeCard({
  item,
  onPress,
}: NoticeCardProps) {
  const categoryKey = getNoticeCategory(item);
  const theme = CATEGORY_THEMES[categoryKey] || CATEGORY_THEMES.ADMIN;
  const isImportant = isImportantNotice(item);
  const isNew = isNewNotice(item.issueDate || item.createdAt);
  const formattedDate = formatDate(item.issueDate || item.createdAt);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => onPress(item)}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Notice: ${item.title}. Category: ${theme.label}. Published: ${formattedDate}. Tap to view full notice.`}
    >
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.datePill}>
            <Feather
              name="calendar"
              size={11}
              color={BENTO_COLORS.subtleText}
              style={{ marginRight: 5 }}
            />
            <Text style={styles.datePillText}>{formattedDate}</Text>
          </View>

          <View style={[styles.categoryPill, { backgroundColor: theme.pillBg }]}>
            <Feather
              name={theme.icon}
              size={11}
              color={theme.pillText}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.categoryPillText, { color: theme.pillText }]}>
              {theme.label.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          {isImportant ? (
            <View style={styles.importantPill}>
              <Text style={styles.importantPillText}>★ IMPORTANT</Text>
            </View>
          ) : isNew ? (
            <View style={styles.newPill}>
              <View style={styles.newDot} />
              <Text style={styles.newPillText}>NEW</Text>
            </View>
          ) : null}
        </View>
      </View>

      <Text style={styles.title} numberOfLines={3}>
        {item.title}
      </Text>

      {item.referenceNo ? (
        <Text style={styles.referenceText} numberOfLines={1}>
          Ref: {item.referenceNo}
        </Text>
      ) : null}

      <View style={styles.divider} />

      <View style={styles.footer}>
        <View style={styles.issuerInfo}>
          <View style={styles.issuerAvatar}>
            <Feather name="user" size={13} color={BENTO_COLORS.deepNavy} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.issuerName} numberOfLines={1}>
              {item.issuerName || "University Authority"}
            </Text>
            <Text style={styles.issuerDesignation} numberOfLines={1}>
              {item.issuerDesignation || "Registrar Office"}
            </Text>
          </View>
        </View>

        <View style={styles.actionArrow}>
          <Feather name="arrow-up-right" size={15} color={BENTO_COLORS.deepNavy} />
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: BENTO_COLORS.cardRadius,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    ...BENTO_COLORS.shadow,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  datePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  datePillText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: BENTO_COLORS.subtleText,
  },
  categoryPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  categoryPillText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  importantPill: {
    backgroundColor: "#fee2e2",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  importantPillText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: "#b91c1c",
  },
  newPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  newDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#059669",
    marginRight: 4,
  },
  newPillText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: "#059669",
  },
  title: {
    fontFamily,
    fontSize: 16,
    fontWeight: "800",
    color: BENTO_COLORS.neutralText,
    lineHeight: 22,
    marginBottom: 6,
  },
  referenceText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: BENTO_COLORS.subtleText,
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(0, 0, 0, 0.04)",
    marginVertical: 12,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  issuerInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  issuerAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  issuerName: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
  },
  issuerDesignation: {
    fontFamily,
    fontSize: 11,
    color: BENTO_COLORS.subtleText,
  },
  actionArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
});
