import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";

import type { LostFoundClaim, LostFoundAuthor } from "@/services/lost-found-service";
import { CAMPUS_HUB_COLORS, fontFamily, timeAgo } from "../../shared/design-tokens";

interface ClaimListItemProps {
  claim: LostFoundClaim;
  onAccept: (claim: LostFoundClaim) => void;
  onReject: (claimId: string) => void;
  onImagePress: (imageUrl: string) => void;
  onViewClaimant: (claimant: LostFoundAuthor) => void;
  isAccepting?: boolean;
  isRejecting?: boolean;
}

export const ClaimListItem = React.memo(function ClaimListItem({
  claim,
  onAccept,
  onReject,
  onImagePress,
  onViewClaimant,
  isAccepting = false,
  isRejecting = false,
}: ClaimListItemProps) {
  const claimant = claim.claimant;
  const isPending = claim.status === "PENDING";
  const isAccepted = claim.status === "ACCEPTED";
  const isRejected = claim.status === "REJECTED";

  const studentInfo = claimant?.studentProfile
    ? `${claimant.studentProfile.department || ""} • ID: ${
        claimant.studentProfile.studentId || ""
      }`
    : claimant?.teacherProfile
    ? `${claimant.teacherProfile.designation || ""} • ${
        claimant.teacherProfile.department || ""
      }`
    : "SMUCT Member";

  return (
    <View style={[styles.card, isAccepted && styles.cardAccepted]}>
      {/* Claimant Header */}
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.claimantInfo}
          onPress={() => onViewClaimant(claimant)}
          activeOpacity={0.8}
          accessible
          accessibilityRole="button"
          accessibilityLabel={`View profile of ${claimant?.name ?? "claimant"}`}
        >
          {claimant?.image ? (
            <Image source={{ uri: claimant.image }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>
                {claimant?.name ? claimant.name.charAt(0).toUpperCase() : "?"}
              </Text>
            </View>
          )}
          <View style={styles.nameCol}>
            <Text style={styles.name} numberOfLines={1}>
              {claimant?.name ?? "Unknown User"}
            </Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {studentInfo}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Status Pill */}
        <View
          style={[
            styles.statusBadge,
            isPending && styles.badgePending,
            isAccepted && styles.badgeAccepted,
            isRejected && styles.badgeRejected,
          ]}
          accessible
          accessibilityLabel={`Claim status: ${claim.status}`}
        >
          <Feather
            name={isAccepted ? "check-circle" : isRejected ? "x-circle" : "clock"}
            size={11}
            color={isAccepted ? "#047857" : isRejected ? "#64748b" : "#b45309"}
            style={{ marginRight: 3 }}
          />
          <Text
            style={[
              styles.statusText,
              isPending && styles.textPending,
              isAccepted && styles.textAccepted,
              isRejected && styles.textRejected,
            ]}
          >
            {claim.status}
          </Text>
        </View>
      </View>

      {/* Verification Answer (if provided) */}
      {!!claim.answer && (
        <View style={styles.answerBox}>
          <View style={styles.answerLabelRow}>
            <Feather name="shield" size={12} color="#0284c7" />
            <Text style={styles.answerLabel}>VERIFICATION ANSWER GIVEN:</Text>
          </View>
          <Text style={styles.answerText}>{claim.answer}</Text>
        </View>
      )}

      {/* Message Content */}
      <Text style={styles.messageText}>{claim.message}</Text>

      {/* Attached Proof Image Box: framed attachment style to avoid fake in-app UI confusion */}
      {!!claim.proofImage && (
        <TouchableOpacity
          style={styles.proofAttachmentCard}
          onPress={() => onImagePress(claim.proofImage!)}
          activeOpacity={0.85}
          accessible
          accessibilityRole="button"
          accessibilityLabel="View attached proof photo in fullscreen"
        >
          <View style={styles.proofThumbWrapper}>
            <Image source={{ uri: claim.proofImage }} style={styles.proofThumb} />
            <View style={styles.proofOverlay}>
              <Feather name="maximize-2" size={12} color="#ffffff" />
            </View>
          </View>
          <View style={styles.proofTextCol}>
            <View style={styles.proofBadgeRow}>
              <Feather name="image" size={12} color="#0284c7" />
              <Text style={styles.proofBadgeTitle}>PROOF ATTACHMENT</Text>
            </View>
            <Text style={styles.proofInstructionText}>Tap to open full proof image</Text>
          </View>
          <Feather name="chevron-right" size={16} color={CAMPUS_HUB_COLORS.subtleText} />
        </TouchableOpacity>
      )}

      {/* Time & Action Footer */}
      <View style={styles.footerRow}>
        <Text style={styles.timeText}>Submitted {timeAgo(claim.createdAt)}</Text>

        {isPending && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.rejectBtn, isRejecting && { opacity: 0.6 }]}
              onPress={() => onReject(claim.id)}
              disabled={isAccepting || isRejecting}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Decline claim"
            >
              {isRejecting ? (
                <ActivityIndicator size="small" color="#64748b" />
              ) : (
                <Text style={styles.rejectBtnText}>Decline</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.acceptBtn, isAccepting && { opacity: 0.6 }]}
              onPress={() => onAccept(claim)}
              disabled={isAccepting || isRejecting}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Accept claim and verify owner"
            >
              {isAccepting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Feather name="check" size={13} color="#ffffff" style={{ marginRight: 4 }} />
                  <Text style={styles.acceptBtnText}>Accept Claim</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.subtleBorder,
    ...CAMPUS_HUB_COLORS.shadow,
    gap: 12,
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
  claimantInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#e2e8f0",
  },
  avatarPlaceholder: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontFamily,
    fontSize: 15,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  nameCol: {
    flex: 1,
  },
  name: {
    fontFamily,
    fontSize: 14,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  subtitle: {
    fontFamily,
    fontSize: 11,
    fontWeight: "500",
    color: CAMPUS_HUB_COLORS.subtleText,
    marginTop: 1,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
  },
  badgePending: {
    backgroundColor: "#fef3c7",
  },
  textPending: {
    color: "#b45309",
  },
  badgeAccepted: {
    backgroundColor: "#d1fae5",
  },
  textAccepted: {
    color: "#047857",
  },
  badgeRejected: {
    backgroundColor: "#f1f5f9",
  },
  textRejected: {
    color: "#64748b",
  },
  statusText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  answerBox: {
    backgroundColor: "#f0f9ff",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#bae6fd",
    gap: 4,
  },
  answerLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  answerLabel: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: "#0284c7",
    letterSpacing: 0.4,
  },
  answerText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "600",
    color: "#0f172a",
  },
  messageText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "500",
    color: CAMPUS_HUB_COLORS.neutralText,
    lineHeight: 19,
  },
  proofAttachmentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 10,
    gap: 12,
  },
  proofThumbWrapper: {
    position: "relative",
    width: 60,
    height: 60,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#0f172a",
  },
  proofThumb: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  proofOverlay: {
    position: "absolute",
    bottom: 2,
    right: 2,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    padding: 3,
    borderRadius: 4,
  },
  proofTextCol: {
    flex: 1,
    gap: 2,
  },
  proofBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  proofBadgeTitle: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: "#0284c7",
    letterSpacing: 0.5,
  },
  proofInstructionText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "500",
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: CAMPUS_HUB_COLORS.subtleBorder,
  },
  timeText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "500",
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 36,
  },
  rejectBtn: {
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
  },
  rejectBtnText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
  },
  acceptBtn: {
    backgroundColor: "#059669",
    ...CAMPUS_HUB_COLORS.shadow,
  },
  acceptBtnText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
  },
});
