import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { CAMPUS_HUB_COLORS, fontFamily, timeAgo } from "@/screens/campus-hub/shared/design-tokens";
import type { LostFoundClaim } from "@/services/lost-found-service";

const ACCENT = CAMPUS_HUB_COLORS.lostFoundAccent;

interface LFMyClaimCardProps {
  claim: LostFoundClaim;
  isResolved: boolean;
  isWithdrawing: boolean;
  onOpenProof: (url: string) => void;
  onWithdraw: (claimId: string) => void;
}

export function LFMyClaimCard({
  claim,
  isResolved,
  isWithdrawing,
  onOpenProof,
  onWithdraw,
}: LFMyClaimCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>YOUR SUBMITTED CLAIM</Text>
      <View
        style={[
          styles.card,
          claim.status === "ACCEPTED" && styles.cardAccepted,
        ]}
      >
        <View style={styles.topRow}>
          <View style={styles.statusPill}>
            <Text style={styles.statusText}>STATUS: {claim.status}</Text>
          </View>
          <Text style={styles.time}>{timeAgo(claim.createdAt)}</Text>
        </View>

        {!!claim.answer && (
          <View style={styles.answerBox}>
            <Text style={styles.answerLabel}>YOUR ANSWER:</Text>
            <Text style={styles.answerText}>{claim.answer}</Text>
          </View>
        )}

        <Text style={styles.message}>{claim.message}</Text>

        {!!claim.proofImage && (
          <TouchableOpacity
            style={styles.proofBtn}
            onPress={() => onOpenProof(claim.proofImage!)}
            accessible
            accessibilityRole="button"
            accessibilityLabel="View your attached proof photo"
          >
            <Image source={{ uri: claim.proofImage }} style={styles.proofImg} />
            <View style={styles.proofTextCol}>
              <Text style={styles.proofTitle}>Attached Proof Photo</Text>
              <Text style={styles.proofSub}>Tap to view in fullscreen</Text>
            </View>
            <Feather name="maximize-2" size={16} color={CAMPUS_HUB_COLORS.subtleText} />
          </TouchableOpacity>
        )}

        {claim.status === "PENDING" && !isResolved && (
          <TouchableOpacity
            style={styles.withdrawBtn}
            onPress={() => onWithdraw(claim.id)}
            disabled={isWithdrawing}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Withdraw claim"
          >
            {isWithdrawing ? (
              <ActivityIndicator size="small" color={CAMPUS_HUB_COLORS.dangerText} />
            ) : (
              <>
                <Feather name="x-circle" size={13} color={CAMPUS_HUB_COLORS.dangerText} />
                <Text style={styles.withdrawBtnText}>Withdraw Claim</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
  },
  sectionTitle: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.subtleText,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  card: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.subtleBorder,
    ...CAMPUS_HUB_COLORS.shadow,
    gap: 10,
  },
  cardAccepted: {
    borderColor: "#10b981",
    backgroundColor: "#f0fdf4",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusPill: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
  },
  statusText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: "#b45309",
  },
  time: {
    fontFamily,
    fontSize: 11,
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  answerBox: {
    backgroundColor: "#f0f9ff",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#bae6fd",
    gap: 2,
  },
  answerLabel: {
    fontFamily,
    fontSize: 9,
    fontWeight: "800",
    color: "#0284c7",
  },
  answerText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: "#0f172a",
  },
  message: {
    fontFamily,
    fontSize: 13,
    color: CAMPUS_HUB_COLORS.neutralText,
    lineHeight: 18,
  },
  proofBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 8,
    gap: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  proofImg: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#0f172a",
  },
  proofTextCol: {
    flex: 1,
  },
  proofTitle: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  proofSub: {
    fontFamily,
    fontSize: 10,
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  withdrawBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 10,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
    marginTop: 4,
  },
  withdrawBtnText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.dangerText,
  },
});
