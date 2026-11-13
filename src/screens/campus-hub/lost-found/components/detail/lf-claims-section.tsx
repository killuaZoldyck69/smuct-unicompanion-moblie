import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "@/theme/colors";
import {
  CAMPUS_HUB_COLORS,
  fontFamily,
  titleFontFamily,
} from "@/screens/campus-hub/shared/design-tokens";
import { LostFoundClaimsSkeleton } from "@/screens/campus-hub/shared/skeleton-loaders";
import { ClaimListItem } from "@/screens/campus-hub/lost-found/components/claim-list-item";
import type {
  LostFoundClaim,
  LostFoundStatus,
} from "@/services/lost-found-service";
import type { AuthorProfileModalData } from "@/screens/campus-hub/shared/author-modal";

interface LFClaimsSectionProps {
  claims: LostFoundClaim[];
  isLoading: boolean;
  isError?: boolean;
  onRetry?: () => void;
  claimToAcceptId?: string | null;
  isAccepting: boolean;
  isRejecting: boolean;
  onAccept: (claim: LostFoundClaim) => void;
  onReject: (claimId: string) => void;
  onImagePress: (url: string) => void;
  onViewClaimant: (author: AuthorProfileModalData) => void;
  isAuthor?: boolean;
  postStatus?: LostFoundStatus;
}

export function LFClaimsSection({
  claims,
  isLoading,
  isError = false,
  onRetry,
  claimToAcceptId,
  isAccepting,
  isRejecting,
  onAccept,
  onReject,
  onImagePress,
  onViewClaimant,
  isAuthor = true,
  postStatus = "ACTIVE",
}: LFClaimsSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <Feather name="inbox" size={18} color={CAMPUS_HUB_COLORS.deepNavy} />
        <Text style={styles.headerTitle}>
          Submitted Claims ({claims.length})
        </Text>
      </View>

      {isLoading ? (
        <LostFoundClaimsSkeleton />
      ) : isError ? (
        <View style={styles.errorCard}>
          <Feather
            name="alert-circle"
            size={28}
            color={colors.semantic.red.accent}
          />
          <Text style={styles.emptyTitle}>Could not load claims</Text>
          <Text style={styles.emptySubtitle}>
            Please check your connection and try again.
          </Text>
          {onRetry && (
            <Pressable
              style={({ pressed }) => [
                styles.retryBtn,
                pressed && { opacity: 0.85 },
              ]}
              onPress={onRetry}
              android_ripple={{ color: CAMPUS_HUB_COLORS.androidRippleLight }}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Retry loading claims"
            >
              <Text style={styles.retryBtnText}>Retry</Text>
            </Pressable>
          )}
        </View>
      ) : claims.length === 0 ? (
        <View style={styles.emptyCard}>
          <Feather
            name="inbox"
            size={32}
            color={CAMPUS_HUB_COLORS.subtleText}
          />
          <Text style={styles.emptyTitle}>No claims received yet</Text>
          <Text style={styles.emptySubtitle}>
            When someone claims this item, they&apos;ll appear here for your
            review.
          </Text>
        </View>
      ) : (
        claims.map((claim) => (
          <ClaimListItem
            key={claim.id}
            claim={claim}
            onAccept={onAccept}
            onReject={onReject}
            onImagePress={onImagePress}
            onViewClaimant={(claimant) =>
              onViewClaimant(claimant as AuthorProfileModalData)
            }
            isAccepting={isAccepting && claimToAcceptId === claim.id}
            isRejecting={isRejecting}
            isAuthor={isAuthor}
            postStatus={postStatus}
          />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 6,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  headerTitle: {
    fontFamily: titleFontFamily,
    fontSize: 16,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
    fontVariant: ["tabular-nums"],
  },
  emptyCard: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: CAMPUS_HUB_COLORS.cardRadius,
    padding: 24,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.cardBorder,
    ...CAMPUS_HUB_COLORS.shadow,
  },
  errorCard: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: CAMPUS_HUB_COLORS.cardRadius,
    padding: 24,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.semantic.red.border,
    ...CAMPUS_HUB_COLORS.shadow,
  },
  retryBtn: {
    marginTop: 4,
    backgroundColor: CAMPUS_HUB_COLORS.lostFoundAccentFill,
    paddingHorizontal: 20,
    paddingVertical: 11,
    minHeight: 48,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  retryBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.white,
  },
  emptyTitle: {
    fontFamily: titleFontFamily,
    fontSize: 15,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  emptySubtitle: {
    fontFamily,
    fontSize: 12,
    color: CAMPUS_HUB_COLORS.mutedInk,
    textAlign: "center",
    lineHeight: 17,
  },
});
