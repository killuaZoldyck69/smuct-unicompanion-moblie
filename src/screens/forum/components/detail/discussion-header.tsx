import React, { memo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { BENTO_COLORS, fontFamily } from "../../constants";

interface DiscussionHeaderProps {
  canManage: boolean;
  onShare: () => void;
  onOverflowPress: () => void;
}

export const DiscussionHeader = memo(function DiscussionHeader({
  canManage,
  onShare,
  onOverflowPress,
}: DiscussionHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.topHeader}>
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.headerBtn}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Feather name="arrow-left" size={20} color={BENTO_COLORS.deepNavy} />
      </TouchableOpacity>

      <Text style={styles.headerTitle}>Discussion</Text>

      <View style={styles.headerActionsRow}>
        <TouchableOpacity
          onPress={onShare}
          style={styles.headerBtn}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Share discussion"
        >
          <Feather name="share-2" size={17} color={BENTO_COLORS.deepNavy} />
        </TouchableOpacity>

        {canManage && (
          <TouchableOpacity
            onPress={onOverflowPress}
            style={[styles.headerBtn, styles.headerBtnMargin]}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="More discussion options"
          >
            <Feather
              name="more-vertical"
              size={18}
              color={BENTO_COLORS.deepNavy}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: BENTO_COLORS.background,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: BENTO_COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    ...BENTO_COLORS.shadow,
  },
  headerBtnMargin: {
    marginLeft: 8,
  },
  headerTitle: {
    fontFamily,
    fontSize: 17,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
  },
  headerActionsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
});
