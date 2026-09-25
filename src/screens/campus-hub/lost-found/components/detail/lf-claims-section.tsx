import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { CAMPUS_HUB_COLORS, fontFamily } from "@/screens/campus-hub/shared/design-tokens";
import { ClaimListItem } from "@/screens/campus-hub/lost-found/components/claim-list-item";
import type { LostFoundClaim } from "@/services/lost-found-service";
import type { AuthorProfileModalData } from "@/screens/campus-hub/shared/author-modal";

const ACCENT = CAMPUS_HUB_COLORS.lostFoundAccent;

interface LFClaimsSectionProps {
  claims: LostFoundClaim[];
  isLoading: boolean;
  claimToAcceptId?: string | null;
  isAccepting: boolean;
  isRejecting: boolean;
  onAccept: (claim: LostFoundClaim) => void;
  onReject: (claimId: string) => void;
  onImagePress: (url: string) => void;
  onViewClaimant: (author: AuthorProfileModalData) => void;
}

export function LFClaimsSection({
  claims,
  isLoading,
  claimToAcceptId,
  isAccepting,
  isRejecting,
  onAccept,
  onReject,
  onImagePress,
  onViewClaimant,
}: LFClaimsSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <Feather name="inbox" size={18} color={CAMPUS_HUB_COLORS.deepNavy} />
        <Text style={styles.headerTitle}>Submitted Claims ({claims.length})</Text>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="small" color={ACCENT} />
        </View>
      ) : claims.length === 0 ? (
        <View style={styles.emptyCard}>
          <Feather name="inbox" size={32} color={CAMPUS_HUB_COLORS.subtleText} />
          <Text style={styles.emptyTitle}>No claims received yet</Text>
          <Text style={styles.emptySubtitle}>
            When someone claims this item, they'll appear here for your review.
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
            onViewClaimant={onViewClaimant as any}
            isAccepting={isAccepting && claimToAcceptId === claim.id}
            isRejecting={isRejecting}
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
    fontFamily,
    fontSize: 15,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  center: {
    paddingVertical: 20,
    alignItems: "center",
  },
  emptyCard: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.subtleBorder,
  },
  emptyTitle: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  emptySubtitle: {
    fontFamily,
    fontSize: 12,
    color: CAMPUS_HUB_COLORS.subtleText,
    textAlign: "center",
    lineHeight: 17,
  },
});
