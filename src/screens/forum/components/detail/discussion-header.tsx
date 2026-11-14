import React, { memo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { BENTO_COLORS, titleFontFamily } from "../../constants";

interface DiscussionHeaderProps {
  canManage: boolean;
  onOverflowPress: () => void;
  onSharePress?: () => void;
}

export const DiscussionHeader = memo(function DiscussionHeader({
  canManage,
  onOverflowPress,
  onSharePress,
}: DiscussionHeaderProps) {
  const router = useRouter();
  const hasMenu = Boolean(canManage || onOverflowPress);

  return (
    <View style={styles.topHeader}>
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.headerBtn}
        hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Feather name="arrow-left" size={20} color={BENTO_COLORS.deepNavy} />
      </TouchableOpacity>

      <Text style={styles.headerTitle}>Discussion</Text>

      {hasMenu ? (
        <TouchableOpacity
          onPress={onOverflowPress}
          style={styles.headerBtn}
          hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
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
      ) : onSharePress ? (
        <TouchableOpacity
          onPress={onSharePress}
          style={styles.headerBtn}
          hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Share discussion"
        >
          <Feather name="share-2" size={17} color={BENTO_COLORS.deepNavy} />
        </TouchableOpacity>
      ) : (
        <View style={styles.headerSpacer} />
      )}
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
    width: "100%",
    maxWidth: BENTO_COLORS.contentMaxWidth,
    alignSelf: "center",
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: BENTO_COLORS.white,
    borderWidth: 1,
    borderColor: BENTO_COLORS.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: titleFontFamily,
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.2,
    color: BENTO_COLORS.deepNavy,
  },
  headerSpacer: {
    width: 38,
  },
});
