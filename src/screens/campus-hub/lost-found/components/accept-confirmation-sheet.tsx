import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Image,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CAMPUS_HUB_COLORS, fontFamily } from "../../shared/design-tokens";
import type { LostFoundClaim } from "@/services/lost-found-service";

interface AcceptConfirmationSheetProps {
  visible: boolean;
  claim: LostFoundClaim | null;
  isLoading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function AcceptConfirmationSheet({
  visible,
  claim,
  isLoading,
  onConfirm,
  onClose,
}: AcceptConfirmationSheetProps) {
  const insets = useSafeAreaInsets();

  if (!claim) return null;

  const claimant = claim.claimant;
  const claimantSubtitle = claimant?.studentProfile
    ? `${claimant.studentProfile.department || ""} • ID: ${claimant.studentProfile.studentId || ""}`
    : claimant?.teacherProfile
    ? `${claimant.teacherProfile.designation || ""} • ${claimant.teacherProfile.department || ""}`
    : "SMUCT Member";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom + 16, 28) }]}>
              {/* Grab handle */}
              <View style={styles.handle} />

              <View style={styles.header}>
                <View style={styles.iconCircle}>
                  <Feather name="check-circle" size={24} color="#059669" />
                </View>
                <Text style={styles.title}>Accept & Finalize Handover?</Text>
                <Text style={styles.subtitle}>
                  Confirming this claim will finalize the return process on campus.
                </Text>
              </View>

              {/* Claimant summary preview */}
              <View style={styles.claimantCard}>
                {claimant?.image ? (
                  <Image source={{ uri: claimant.image }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarInitial}>
                      {claimant?.name ? claimant.name.charAt(0).toUpperCase() : "?"}
                    </Text>
                  </View>
                )}
                <View style={styles.claimantInfo}>
                  <Text style={styles.claimantName} numberOfLines={1}>
                    {claimant?.name ?? "Claimant"}
                  </Text>
                  <Text style={styles.claimantSubtitle} numberOfLines={1}>
                    {claimantSubtitle}
                  </Text>
                </View>
              </View>

              {/* Consequence bullet points */}
              <View style={styles.bulletList}>
                <View style={styles.bulletItem}>
                  <Feather name="check" size={15} color="#059669" style={styles.bulletIcon} />
                  <Text style={styles.bulletText}>
                    Post status changes to <Text style={styles.boldText}>RESOLVED</Text>.
                  </Text>
                </View>
                <View style={styles.bulletItem}>
                  <Feather name="lock" size={15} color="#0284c7" style={styles.bulletIcon} />
                  <Text style={styles.bulletText}>
                    Mutual phone & email will be safely revealed to arrange handover.
                  </Text>
                </View>
                <View style={styles.bulletItem}>
                  <Feather name="x-circle" size={15} color="#64748b" style={styles.bulletIcon} />
                  <Text style={styles.bulletText}>
                    Any other pending claims will be automatically declined.
                  </Text>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={onClose}
                  disabled={isLoading}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel="Cancel"
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.confirmBtn}
                  onPress={onConfirm}
                  disabled={isLoading}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel="Confirm accept claim"
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                      <Feather name="check" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                      <Text style={styles.confirmBtnText}>Accept & Resolve</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingHorizontal: 22,
    ...CAMPUS_HUB_COLORS.heroShadow,
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#cbd5e1",
    alignSelf: "center",
    marginBottom: 16,
  },
  header: {
    alignItems: "center",
    marginBottom: 16,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#d1fae5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  title: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontFamily,
    fontSize: 13,
    color: CAMPUS_HUB_COLORS.subtleText,
    textAlign: "center",
    lineHeight: 18,
  },
  claimantCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e2e8f0",
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontFamily,
    fontSize: 16,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  claimantInfo: {
    flex: 1,
  },
  claimantName: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  claimantSubtitle: {
    fontFamily,
    fontSize: 12,
    color: CAMPUS_HUB_COLORS.subtleText,
    marginTop: 2,
  },
  bulletList: {
    gap: 10,
    marginBottom: 20,
    backgroundColor: "#f8fafc",
    padding: 14,
    borderRadius: 14,
  },
  bulletItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  bulletIcon: {
    marginTop: 2,
  },
  bulletText: {
    fontFamily,
    fontSize: 12,
    lineHeight: 17,
    color: CAMPUS_HUB_COLORS.neutralText,
    flex: 1,
  },
  boldText: {
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.neutralText,
  },
  confirmBtn: {
    flex: 1.6,
    height: 48,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    backgroundColor: "#059669",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    ...CAMPUS_HUB_COLORS.shadow,
  },
  confirmBtnText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "800",
    color: "#ffffff",
  },
});
