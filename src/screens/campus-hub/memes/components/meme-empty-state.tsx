import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { extractApiErrorInfo } from "@/features/forum/forum-logic";
import type { MemeFilter } from "@/services/meme-service";
import { colors } from "@/theme/colors";
import { CAMPUS_HUB_COLORS, fontFamily, titleFontFamily } from "../../shared/design-tokens";

interface MemeFeedEmptyStateProps {
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  isOffline: boolean;
  activeFilter: MemeFilter;
  onRetry: () => void;
  onOpenCompose: () => void;
}

export const MemeFeedEmptyState = React.memo(function MemeFeedEmptyState({
  isLoading,
  isError,
  error,
  isOffline,
  activeFilter,
  onRetry,
  onOpenCompose,
}: MemeFeedEmptyStateProps) {
  if (isLoading) return null;

  if (isError) {
    const errorMessage = extractApiErrorInfo(error, "Unable to load memes right now.").message;
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.errorIconCircle}>
          <Feather
            name={isOffline ? "wifi-off" : "alert-circle"}
            size={34}
            color={CAMPUS_HUB_COLORS.dangerText}
          />
        </View>
        <Text style={styles.emptyTitle}>Couldn&apos;t Load Memes</Text>
        <Text style={styles.emptySubtitle}>{errorMessage}</Text>
        <TouchableOpacity
          style={styles.emptyActionBtn}
          onPress={onRetry}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Retry loading memes"
        >
          <Feather name="refresh-cw" size={16} color={colors.white} />
          <Text style={styles.emptyActionText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <Feather name="smile" size={36} color={CAMPUS_HUB_COLORS.memeAccent} />
      </View>
      <Text style={styles.emptyTitle}>
        {activeFilter === "mine" ? "No Memes Posted Yet" : "No Memes Found"}
      </Text>
      <Text style={styles.emptySubtitle}>
        {activeFilter === "mine"
          ? "You haven't posted any memes yet. Share one with campus!"
          : "Be the first to bring some laughter to Campus Hub today."}
      </Text>
      <TouchableOpacity
        style={styles.emptyActionBtn}
        onPress={onOpenCompose}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Post your first meme"
      >
        <Feather name="plus" size={16} color={colors.white} />
        <Text style={styles.emptyActionText}>Upload a Meme</Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    paddingHorizontal: 30,
    gap: 12,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: CAMPUS_HUB_COLORS.memeAccentLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  errorIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: CAMPUS_HUB_COLORS.dangerBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: {
    fontFamily: titleFontFamily,
    fontSize: 17,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  emptySubtitle: {
    fontFamily,
    fontSize: 13,
    color: CAMPUS_HUB_COLORS.subtleText,
    textAlign: "center",
    lineHeight: 18,
  },
  emptyActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: 48,
    backgroundColor: CAMPUS_HUB_COLORS.memeAccent,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    marginTop: 8,
    ...CAMPUS_HUB_COLORS.heroShadow,
  },
  emptyActionText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: colors.white,
  },
});
