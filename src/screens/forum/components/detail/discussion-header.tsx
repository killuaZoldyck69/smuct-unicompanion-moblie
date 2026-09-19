import React, { memo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { BENTO_COLORS, fontFamily } from "../../constants";

interface DiscussionHeaderProps {
  canManage: boolean;
  onOverflowPress: () => void;
}

export const DiscussionHeader = memo(function DiscussionHeader({
  canManage,
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

      {canManage ? (
        <TouchableOpacity
          onPress={onOverflowPress}
          style={styles.headerBtn}
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
  headerTitle: {
    fontFamily,
    fontSize: 17,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
  },
  headerSpacer: {
    width: 38,
  },
});
