import React, { memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
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
  onCommentPress: (item: any) => void;
}

const AnnouncementCard = ({ item, onCommentPress }: Props) => (
  <View style={styles.card}>
    {/* Author Header */}
    <View style={styles.cardHeaderRow}>
      <View style={styles.userInfoRow}>
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

    {/* Announcement Content */}
    <Text style={styles.contentBody}>{item.content}</Text>

    {/* Attachment Link */}
    {item.attachedLinkUrl && (
      <TouchableOpacity
        style={styles.attachmentPill}
        onPress={() => Linking.openURL(item.attachedLinkUrl)}
        activeOpacity={0.7}
        accessible={true}
        accessibilityRole="link"
        accessibilityLabel={`Attached link: ${item.attachedLinkTitle || item.attachedLinkUrl}`}
      >
        <Feather
          name="link"
          size={15}
          color="#0369a1"
          style={{ marginRight: 8 }}
        />
        <Text style={styles.attachmentText} numberOfLines={1}>
          {item.attachedLinkTitle || item.attachedLinkUrl}
        </Text>
      </TouchableOpacity>
    )}

    {/* Footer */}
    <View style={styles.cardFooter}>
      <TouchableOpacity
        style={styles.commentPill}
        onPress={() => onCommentPress(item)}
        activeOpacity={0.7}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`View ${item.comments?.length || 0} class comments`}
      >
        <Feather
          name="message-circle"
          size={14}
          color={BENTO_COLORS.deepNavy}
          style={{ marginRight: 6 }}
        />
        <Text style={styles.commentPillText}>
          {item.comments?.length || 0} Class Comments
        </Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default memo(AnnouncementCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: BENTO_COLORS.cardRadius,
    padding: 20,
    marginBottom: 14,
    ...BENTO_COLORS.shadow,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  userInfoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: "#edf2f7",
  },
  avatarFallbackSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BENTO_COLORS.deepNavy,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarTextSmall: {
    fontFamily,
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "800",
  },
  userName: {
    fontFamily,
    fontSize: 15,
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
  contentBody: {
    fontFamily,
    fontSize: 14,
    color: "#334155",
    lineHeight: 22,
    marginBottom: 12,
  },
  attachmentPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: BENTO_COLORS.pillRadius,
    marginBottom: 12,
  },
  attachmentText: {
    flex: 1,
    fontFamily,
    fontSize: 13,
    color: "#0369a1",
    fontWeight: "700",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
  },
  commentPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  commentPillText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
  },
});
