import React, { memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { formatDate } from "@/utils/date-formatter";

const BENTO_COLORS = {
  deepNavy: "#131b2e",
  white: "#ffffff",
  neutralText: "#191c1d",
  subtleText: "#64748b",
  cardRadius: 24,
  pillRadius: 9999,
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
    elevation: 2,
  },
};

const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

interface Props {
  item: any;
  onPress?: () => void;
}

const DiscussionCard = ({ item, onPress }: Props) => {
  const replyCount = item.replies?.length || 0;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={onPress}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Discussion: ${item.title}, by ${item.author?.name || "Unknown User"}, ${replyCount} replies`}
    >
      {/* Author Header Row */}
      <View style={styles.authorRow}>
        {item.author?.image ? (
          <Image
            source={{ uri: item.author.image }}
            style={styles.avatarImage}
          />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarText}>
              {item.author?.name?.charAt(0)?.toUpperCase() || "U"}
            </Text>
          </View>
        )}

        <View style={{ flex: 1 }}>
          <Text style={styles.authorNameText}>
            {item.author?.name || "Student"}
          </Text>
          <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
        </View>

        <View style={styles.actionArrowCircle}>
          <Feather
            name="arrow-up-right"
            size={14}
            color={BENTO_COLORS.deepNavy}
          />
        </View>
      </View>

      {/* Discussion Title */}
      <Text style={styles.discussionTitle}>{item.title}</Text>

      {/* Content preview */}
      {!!item.content && (
        <Text style={styles.contentBody} numberOfLines={2}>
          {item.content}
        </Text>
      )}

      {/* Footer Pill */}
      <View style={styles.footer}>
        <View style={styles.replyPill}>
          <Feather
            name="message-circle"
            size={13}
            color={BENTO_COLORS.deepNavy}
            style={{ marginRight: 6 }}
          />
          <Text style={styles.replyPillText}>
            {replyCount === 0
              ? "No replies yet"
              : `${replyCount} Repl${replyCount > 1 ? "ies" : "y"}`}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default memo(DiscussionCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: BENTO_COLORS.cardRadius,
    padding: 20,
    marginBottom: 14,
    ...BENTO_COLORS.shadow,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
    backgroundColor: "#edf2f7",
  },
  avatarFallback: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e0f2fe",
  },
  avatarText: {
    fontFamily,
    fontSize: 14,
    color: "#0369a1",
    fontWeight: "800",
  },
  authorNameText: {
    fontFamily,
    fontSize: 14,
    color: BENTO_COLORS.deepNavy,
    fontWeight: "800",
  },
  dateText: {
    fontFamily,
    fontSize: 11,
    color: BENTO_COLORS.subtleText,
    fontWeight: "500",
    marginTop: 2,
  },
  actionArrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
  },
  discussionTitle: {
    fontFamily,
    fontSize: 17,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    lineHeight: 22,
    marginBottom: 6,
  },
  contentBody: {
    fontFamily,
    fontSize: 13,
    color: BENTO_COLORS.subtleText,
    lineHeight: 18,
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
  },
  replyPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  replyPillText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
  },
});
