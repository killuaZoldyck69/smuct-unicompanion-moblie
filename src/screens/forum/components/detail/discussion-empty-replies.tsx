import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO_COLORS, fontFamily } from "../../constants";

export const DiscussionEmptyReplies = memo(function DiscussionEmptyReplies() {
  return (
    <View style={styles.emptyCard}>
      <Feather
        name="message-circle"
        size={28}
        color={BENTO_COLORS.subtleText}
        style={styles.emptyIcon}
      />
      <Text style={styles.emptyTitle}>No Responses Yet</Text>
      <Text style={styles.emptyDescription}>
        Be the first to share an answer or helpful perspective.
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  emptyCard: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: BENTO_COLORS.cardRadius,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    ...BENTO_COLORS.shadow,
  },
  emptyIcon: {
    marginBottom: 8,
  },
  emptyTitle: {
    fontFamily,
    fontSize: 15,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
    marginBottom: 4,
  },
  emptyDescription: {
    fontFamily,
    fontSize: 12,
    fontWeight: "400",
    color: BENTO_COLORS.subtleText,
    textAlign: "center",
  },
});
