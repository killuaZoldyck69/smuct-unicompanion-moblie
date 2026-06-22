import React, { memo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Feather } from "@expo/vector-icons";

import { colors } from "../../../theme/colors";
import { typography } from "../../../theme/typography";
import { spacing, rounded, shadows } from "../../../theme/layout";
import { formatDate } from "../../../utils/dateFormatter";

interface Props {
  item: any;
  onPress?: () => void;
}

const DiscussionCard = ({ item, onPress }: Props) => {
  const replyCount = item.replies?.length || 0;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.92}
      onPress={onPress}
    >
      {/* Question First */}
      <Text style={styles.discussionTitle}>{item.title}</Text>

      {!!item.content && (
        <Text style={styles.contentBody} numberOfLines={3}>
          {item.content}
        </Text>
      )}

      {/* Author Section */}
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
          <Text style={styles.authorText}>
            {item.author?.name || "Unknown User"} • {formatDate(item.createdAt)}
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.statItem}>
          <Feather name="message-circle" size={15} color={colors.outline} />
          <Text style={styles.statText}>
            {replyCount === 0
              ? "No replies yet"
              : `${replyCount} Reply${replyCount > 1 ? "ies" : ""}`}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default memo(DiscussionCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 18,
    padding: 18,
    marginBottom: spacing.stackMd,
    ...shadows.level1,
  },

  discussionTitle: {
    ...typography.titleLg,
    fontSize: 18,
    lineHeight: 24,
    color: colors.onSurface,
    fontWeight: "700",
    marginBottom: 8,
  },

  contentBody: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    lineHeight: 24,
    marginBottom: 16,
  },

  authorRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    backgroundColor: colors.surfaceContainerHigh,
  },

  avatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.secondaryContainer,
  },

  avatarText: {
    ...typography.labelMd,
    color: colors.secondary,
    fontWeight: "700",
  },

  authorText: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
    fontWeight: "500",
  },

  footer: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainerHighest,
  },

  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  statText: {
    ...typography.labelSm,
    color: colors.outline,
  },
});
