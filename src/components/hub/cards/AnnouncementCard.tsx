import React, { memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Image, // 👈 Added Image import
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "../../../theme/colors";
import { typography } from "../../../theme/typography";
import { spacing, rounded, shadows } from "../../../theme/layout";
import { formatDate } from "../../../utils/dateFormatter";

interface Props {
  item: any;
  onCommentPress: (item: any) => void;
}

const AnnouncementCard = ({ item, onCommentPress }: Props) => (
  <View style={styles.card}>
    <View style={styles.cardHeaderRow}>
      <View style={styles.userInfoRow}>
        {/* 👈 Conditionally render the Image or the Fallback */}
        {item.creator?.image ? (
          <Image
            source={{ uri: item.creator.image }}
            style={styles.avatarImage}
          />
        ) : (
          <View style={styles.avatarFallbackSmall}>
            <Text style={styles.avatarTextSmall}>
              {item.creator?.name?.charAt(0)?.toUpperCase() || "U"}
            </Text>
          </View>
        )}
        <View>
          <Text style={styles.userName}>{item.creator?.name}</Text>
          <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
        </View>
      </View>
    </View>
    <Text style={styles.contentBody}>{item.content}</Text>

    {item.attachedLinkUrl && (
      <TouchableOpacity
        style={styles.attachmentPill}
        onPress={() => Linking.openURL(item.attachedLinkUrl)}
        activeOpacity={0.7}
      >
        <Feather
          name="link"
          size={16}
          color={colors.primary}
          style={{ marginRight: 8 }}
        />
        <Text style={styles.attachmentText} numberOfLines={1}>
          {item.attachedLinkTitle || item.attachedLinkUrl}
        </Text>
      </TouchableOpacity>
    )}

    <View style={styles.cardFooter}>
      <TouchableOpacity
        style={styles.footerAction}
        onPress={() => onCommentPress(item)}
        activeOpacity={0.6}
      >
        <Feather
          name="message-circle"
          size={16}
          color={colors.outline}
          style={{ marginRight: 6 }}
        />
        <Text style={styles.metaText}>
          {item.comments?.length || 0} Class comments
        </Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default memo(AnnouncementCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: rounded.xl,
    padding: spacing.stackLg,
    marginBottom: spacing.stackMd,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    ...shadows.level1,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.stackSm,
  },
  userInfoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    backgroundColor: colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
  },
  avatarFallbackSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryContainer,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarTextSmall: {
    ...typography.labelMd,
    color: colors.onPrimary,
    fontWeight: "700",
  },
  userName: {
    ...typography.labelMd,
    color: colors.onSurface,
    fontWeight: "800", // Made slightly bolder for better hierarchy
  },
  dateText: {
    ...typography.labelSm,
    color: colors.outline,
    fontSize: 11,
    marginTop: 2,
  },
  contentBody: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    lineHeight: 22,
    marginTop: 8, // Added a bit more breathing room
  },
  attachmentPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerHigh,
    padding: 12,
    borderRadius: rounded.md,
    marginTop: spacing.stackMd,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
  },
  attachmentText: {
    flex: 1,
    ...typography.bodyMd,
    color: colors.primary,
    fontWeight: "600",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.stackLg, // Increased separation from content
    paddingTop: spacing.stackSm,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainerHighest,
  },
  footerAction: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  metaText: { ...typography.labelSm, color: colors.outline },
});
