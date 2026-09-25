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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface AcceptConfirmationSheetProps {
  visible: boolean;
  claim: LostFoundClaim | null;
  isLoading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const ACCENT = "#059669";
const ACCENT_LIGHT = "#d1fae5";
const ACCENT_TEXT = "#065f46";

// ---------------------------------------------------------------------------
// Bullet row data — defined outside component, never re-created on render
// ---------------------------------------------------------------------------
const CONSEQUENCES: {
  icon: React.ComponentProps<typeof Feather>["name"];
  iconColor: string;
  bgColor: string;
  text: string;
  bold?: string;
}[] = [
  {
    icon: "check-circle",
    iconColor: ACCENT,
    bgColor: "#ecfdf5",
    text: "Post status will change to ",
    bold: "RESOLVED",
  },
  {
    icon: "shield",
    iconColor: "#0284c7",
    bgColor: "#eff6ff",
    text: "Both parties' phone & email will be safely revealed to arrange handover.",
  },
  {
    icon: "x-circle",
    iconColor: "#94a3b8",
    bgColor: "#f8fafc",
    text: "All other pending claims will be automatically declined.",
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
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
  const claimantInitial = (claimant?.name ?? "?").charAt(0).toUpperCase();

  const claimantSubtitle = claimant?.teacherProfile
    ? `${claimant.teacherProfile.designation || "Lecturer"} • ${claimant.teacherProfile.department || ""}`
    : claimant?.studentProfile
    ? `${claimant.studentProfile.department || ""} • ID ${claimant.studentProfile.studentId || ""}`
    : "SMUCT Member";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose} accessible={false}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback accessible={false}>
            <View
              style={[
                styles.sheet,
                { paddingBottom: Math.max(insets.bottom + 12, 24) },
              ]}
            >
              {/* Grab handle */}
              <View style={styles.handle} />

              {/* Icon + heading */}
              <View style={styles.headingSection}>
                <View style={styles.iconRing}>
                  <View style={styles.iconCircle}>
                    <Feather name="check" size={22} color={ACCENT} />
                  </View>
                </View>
                <Text style={styles.title}>Accept & Finalize Handover?</Text>
                <Text style={styles.subtitle}>
                  Confirming this claim will finalize the return process on campus.
                </Text>
              </View>

              {/* Claimant identity card */}
              <View style={styles.claimantCard}>
                <View style={styles.avatarWrap}>
                  {claimant?.image ? (
                    <Image source={{ uri: claimant.image }} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarFallback}>
                      <Text style={styles.avatarInitial}>{claimantInitial}</Text>
                    </View>
                  )}
                  {/* Online dot */}
                  <View style={styles.verifiedDot} />
                </View>

                <View style={styles.claimantInfo}>
                  <Text style={styles.claimantName} numberOfLines={1}>
                    {claimant?.name ?? "Claimant"}
                  </Text>
                  <Text style={styles.claimantSub} numberOfLines={1}>
                    {claimantSubtitle}
                  </Text>
                </View>

                <View style={styles.claimantBadge}>
                  <Text style={styles.claimantBadgeText}>CLAIMANT</Text>
                </View>
              </View>

              {/* Consequences list */}
              <View style={styles.consequenceList}>
                {CONSEQUENCES.map((item, idx) => (
                  <View key={idx} style={styles.consequenceItem}>
                    <View style={[styles.consequenceIconWrap, { backgroundColor: item.bgColor }]}>
                      <Feather name={item.icon} size={14} color={item.iconColor} />
                    </View>
                    <Text style={styles.consequenceText}>
                      {item.text}
                      {item.bold && (
                        <Text style={styles.consequenceBold}>{item.bold}</Text>
                      )}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Divider */}
              <View style={styles.divider} />

              {/* Action buttons */}
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={onClose}
                  disabled={isLoading}
                  activeOpacity={0.7}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel="Cancel"
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.confirmBtn, isLoading && styles.confirmBtnDisabled]}
                  onPress={onConfirm}
                  disabled={isLoading}
                  activeOpacity={0.85}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel="Accept and resolve claim"
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                      <Feather name="check" size={15} color="#ffffff" style={styles.confirmIcon} />
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

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 10,
    paddingHorizontal: 20,
    // Crisp top shadow
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 24,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#e2e8f0",
    alignSelf: "center",
    marginBottom: 20,
  },

  // Heading
  headingSection: {
    alignItems: "center",
    marginBottom: 18,
  },
  iconRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: ACCENT_LIGHT,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(5, 150, 105, 0.2)",
  },
  title: {
    fontFamily,
    fontSize: 19,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
    textAlign: "center",
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily,
    fontSize: 13,
    fontWeight: "500",
    color: CAMPUS_HUB_COLORS.subtleText,
    textAlign: "center",
    lineHeight: 19,
    maxWidth: 280,
  },

  // Claimant card
  claimantCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.subtleBorder,
    gap: 12,
  },
  avatarWrap: {
    position: "relative",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "#e2e8f0",
  },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: ACCENT_LIGHT,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(5, 150, 105, 0.15)",
  },
  avatarInitial: {
    fontFamily,
    fontSize: 17,
    fontWeight: "800",
    color: ACCENT_TEXT,
  },
  verifiedDot: {
    position: "absolute",
    bottom: 1,
    right: 1,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: ACCENT,
    borderWidth: 2,
    borderColor: "#ffffff",
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
  claimantSub: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "500",
    color: CAMPUS_HUB_COLORS.subtleText,
    marginTop: 2,
  },
  claimantBadge: {
    backgroundColor: ACCENT_LIGHT,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
  },
  claimantBadgeText: {
    fontFamily,
    fontSize: 9,
    fontWeight: "800",
    color: ACCENT_TEXT,
    letterSpacing: 0.4,
  },

  // Consequences
  consequenceList: {
    gap: 10,
    marginBottom: 18,
  },
  consequenceItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  consequenceIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  consequenceText: {
    fontFamily,
    fontSize: 12.5,
    fontWeight: "500",
    lineHeight: 18,
    color: CAMPUS_HUB_COLORS.neutralText,
    flex: 1,
    paddingTop: 4,
  },
  consequenceBold: {
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: CAMPUS_HUB_COLORS.subtleBorder,
    marginBottom: 16,
  },

  // Actions
  actionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.subtleBorder,
  },
  cancelBtnText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.neutralText,
  },
  confirmBtn: {
    flex: 1.8,
    height: 50,
    borderRadius: 14,
    backgroundColor: ACCENT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  confirmBtnDisabled: {
    opacity: 0.65,
  },
  confirmIcon: {
    marginRight: 7,
  },
  confirmBtnText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "800",
    color: "#ffffff",
  },
});
