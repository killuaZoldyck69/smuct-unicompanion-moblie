import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/theme/colors";
import {
  CAMPUS_HUB_COLORS,
  fontFamily,
  titleFontFamily,
  formatCampusUserSubtitle,
} from "../../shared/design-tokens";
import type { LostFoundClaim } from "@/services/lost-found-service";

interface AcceptConfirmationSheetProps {
  visible: boolean;
  claim: LostFoundClaim | null;
  isLoading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

const ACCENT = CAMPUS_HUB_COLORS.emeraldFill;
const ACCENT_LIGHT = colors.semantic.emerald.border;
const ACCENT_TEXT = colors.semantic.emerald.darkText;

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
    bgColor: colors.semantic.emerald.tint,
    text: "Post status will change to ",
    bold: "RESOLVED",
  },
  {
    icon: "shield",
    iconColor: CAMPUS_HUB_COLORS.skyAccentInk,
    bgColor: colors.semantic.blue.tint,
    text: "Both parties' phone & email will be safely revealed to arrange handover.",
  },
  {
    icon: "x-circle",
    iconColor: CAMPUS_HUB_COLORS.mutedInk,
    bgColor: colors.slate100,
    text: "All other pending claims will be automatically declined.",
  },
];

export function AcceptConfirmationSheet({
  visible,
  claim,
  isLoading,
  onConfirm,
  onClose,
}: AcceptConfirmationSheetProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    setAvatarError(false);
  }, [claim?.claimant?.image]);

  if (!claim) return null;

  const claimant = claim.claimant;
  const claimantInitial = (claimant?.name ?? "?").charAt(0).toUpperCase();

  const claimantSubtitle = formatCampusUserSubtitle(claimant, "SMUCT Member");

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={isLoading ? undefined : onClose}
    >
      <View style={styles.overlay} accessibilityViewIsModal={true}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={isLoading ? undefined : onClose}
          accessible={false}
        />
        <View
          style={[
            styles.sheet,
            {
              maxHeight: Math.min(windowHeight * 0.88, 680),
              paddingLeft: Math.max(insets.left, 20),
              paddingRight: Math.max(insets.right, 20),
            },
          ]}
        >
          <View style={styles.handle} />

          <ScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}
            contentContainerStyle={styles.scrollBody}
          >
            <View style={styles.headingSection}>
              <View style={styles.iconRing}>
                <View style={styles.iconCircle}>
                  <Feather name="check" size={22} color={ACCENT} />
                </View>
              </View>
              <Text style={styles.title} maxFontSizeMultiplier={1.35}>
                Accept & Finalize Handover?
              </Text>
              <Text style={styles.subtitle} maxFontSizeMultiplier={1.35}>
                Confirming this claim will finalize the return process on campus.
              </Text>
            </View>

            <View style={styles.claimantCard}>
              <View style={styles.avatarWrap}>
                {claimant?.image && !avatarError ? (
                  <Image
                    source={{ uri: claimant.image }}
                    style={styles.avatar}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text
                      style={styles.avatarInitial}
                      maxFontSizeMultiplier={1.25}
                    >
                      {claimantInitial}
                    </Text>
                  </View>
                )}
                <View style={styles.verifiedDot} />
              </View>

              <View style={styles.claimantInfo}>
                <Text
                  style={styles.claimantName}
                  numberOfLines={1}
                  maxFontSizeMultiplier={1.35}
                >
                  {claimant?.name ?? "Claimant"}
                </Text>
                <Text
                  style={styles.claimantSub}
                  numberOfLines={1}
                  maxFontSizeMultiplier={1.35}
                >
                  {claimantSubtitle}
                </Text>
              </View>

              <View style={styles.claimantBadge}>
                <Text
                  style={styles.claimantBadgeText}
                  maxFontSizeMultiplier={1.25}
                >
                  CLAIMANT
                </Text>
              </View>
            </View>

            <View style={styles.consequenceList}>
              {CONSEQUENCES.map((item, idx) => (
                <View key={idx} style={styles.consequenceItem}>
                  <View
                    style={[
                      styles.consequenceIconWrap,
                      { backgroundColor: item.bgColor },
                    ]}
                  >
                    <Feather name={item.icon} size={14} color={item.iconColor} />
                  </View>
                  <Text
                    style={styles.consequenceText}
                    maxFontSizeMultiplier={1.35}
                  >
                    {item.text}
                    {item.bold && (
                      <Text style={styles.consequenceBold}>{item.bold}</Text>
                    )}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>

          <View
            style={[
              styles.footer,
              { paddingBottom: Math.max(insets.bottom + 12, 20) },
            ]}
          >
            <View style={styles.actionsRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.cancelBtn,
                  pressed && !isLoading && { opacity: 0.8 },
                ]}
                onPress={onClose}
                disabled={isLoading}
                android_ripple={{ color: CAMPUS_HUB_COLORS.androidRipple }}
                accessible
                accessibilityRole="button"
                accessibilityState={{ disabled: isLoading }}
                accessibilityLabel="Cancel"
              >
                <Text
                  style={styles.cancelBtnText}
                  maxFontSizeMultiplier={1.25}
                >
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.confirmBtn,
                  isLoading && styles.confirmBtnDisabled,
                  pressed && !isLoading && { opacity: 0.88 },
                ]}
                onPress={onConfirm}
                disabled={isLoading}
                android_ripple={{ color: CAMPUS_HUB_COLORS.androidRippleLight }}
                accessible
                accessibilityRole="button"
                accessibilityState={{ disabled: isLoading, busy: isLoading }}
                accessibilityLabel="Accept and resolve claim"
              >
                {isLoading ? (
                  <ActivityIndicator
                    size="small"
                    color={CAMPUS_HUB_COLORS.white}
                  />
                ) : (
                  <>
                    <Feather
                      name="check"
                      size={15}
                      color={CAMPUS_HUB_COLORS.white}
                      style={styles.confirmIcon}
                    />
                    <Text
                      style={styles.confirmBtnText}
                      maxFontSizeMultiplier={1.25}
                    >
                      Accept & Resolve
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.scrimDark,
    justifyContent: "flex-end",
  },
  sheet: {
    width: "100%",
    maxWidth: CAMPUS_HUB_COLORS.contentMaxWidth,
    alignSelf: "center",
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.cardBorder,
    paddingTop: 10,
    overflow: "hidden",
    ...CAMPUS_HUB_COLORS.heroShadow,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.slate300,
    alignSelf: "center",
    marginBottom: 14,
  },
  scrollBody: {
    paddingBottom: 14,
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
    backgroundColor: CAMPUS_HUB_COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: colors.semantic.emerald.mintBorderStrong,
  },
  title: {
    fontFamily: titleFontFamily,
    fontSize: 19,
    lineHeight: 24,
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
    maxWidth: 300,
  },

  // Claimant card
  claimantCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.slate50,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.slate200,
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
    borderColor: colors.slate200,
  },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: ACCENT_LIGHT,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.semantic.emerald.mintBorder,
  },
  avatarInitial: {
    fontFamily,
    fontSize: 17,
    fontWeight: "800",
    color: ACCENT_TEXT,
    includeFontPadding: false,
  },
  verifiedDot: {
    position: "absolute",
    bottom: 1,
    right: 1,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: colors.semantic.emerald.solid,
    borderWidth: 2,
    borderColor: CAMPUS_HUB_COLORS.white,
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
    paddingVertical: 4,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
  },
  claimantBadgeText: {
    fontFamily,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800",
    color: ACCENT_TEXT,
    letterSpacing: 0.4,
    includeFontPadding: false,
  },

  // Consequences
  consequenceList: {
    gap: 10,
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
    flexShrink: 1,
    paddingTop: 4,
  },
  consequenceBold: {
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },

  // Footer
  footer: {
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: CAMPUS_HUB_COLORS.subtleBorder,
    backgroundColor: CAMPUS_HUB_COLORS.white,
  },

  // Actions
  actionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    minHeight: 50,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    backgroundColor: colors.slate100,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.slate200,
    overflow: "hidden",
  },
  cancelBtnText: {
    fontFamily,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.neutralText,
    includeFontPadding: false,
  },
  confirmBtn: {
    flex: 1.8,
    minHeight: 50,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    backgroundColor: ACCENT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    ...CAMPUS_HUB_COLORS.shadow,
    overflow: "hidden",
  },
  confirmBtnDisabled: {
    opacity: 0.65,
    elevation: 0,
    shadowOpacity: 0,
  },
  confirmIcon: {
    marginRight: 7,
  },
  confirmBtnText: {
    fontFamily,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.white,
    includeFontPadding: false,
  },
});
