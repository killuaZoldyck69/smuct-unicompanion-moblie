import React from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import Svg, { Rect, Circle, G, Path } from "react-native-svg";
import { colors } from "@/theme/colors";
import {
  PROFILE_COLORS,
  SECTION_THEMES,
  SPACING,
  fontFamily,
} from "../../constants";
import { safeOpenURL } from "../../utils";

interface ProfileSocialCardProps {
  variant?: "student" | "teacher";
  isEditing: boolean;
  linkedInUrl: string;
  personalWebsiteUrl: string;
  onChangeLinkedIn: (url: string) => void;
  onChangeWebsite: (url: string) => void;
}

const BrowserWatermark = ({ variant }: { variant: "student" | "teacher" }) =>
  variant === "student" ? (
    <Svg
      width={140}
      height={140}
      viewBox="0 0 140 140"
      style={styles.studentWatermark}
      aria-hidden={true}
    >
      <G opacity={0.06} fill="none" stroke={colors.semantic.indigo.solid} strokeWidth={5}>
        <Circle cx="84" cy="68" r="52" />
        <Path d="m96 37-12 31 30-12-24-19Z" fill={colors.semantic.indigo.solid} stroke="none" />
      </G>
    </Svg>
  ) : (
  <Svg width={140} height={100} viewBox="0 0 140 100" style={styles.watermark}>
    <G opacity={0.08} fill={SECTION_THEMES.SOCIAL.primaryText}>
      {/* Browser Window */}
      <Rect x="20" y="20" width="100" height="70" rx="6" />
      {/* Top Bar */}
      <Circle cx="30" cy="28" r="2" fill={colors.white} />
      <Circle cx="36" cy="28" r="2" fill={colors.white} />
      <Circle cx="42" cy="28" r="2" fill={colors.white} />
      <Rect x="20" y="34" width="100" height="1" fill={colors.white} />
      {/* Content lines */}
      <Rect x="30" y="44" width="30" height="30" rx="15" fill={colors.white} />
      <Rect x="70" y="52" width="40" height="6" rx="3" fill={colors.white} />
      <Rect x="70" y="64" width="30" height="4" rx="2" fill={colors.white} />
    </G>
  </Svg>
  );

export const ProfileSocialCard = React.memo(function ProfileSocialCard({
  variant = "teacher",
  isEditing,
  linkedInUrl,
  personalWebsiteUrl,
  onChangeLinkedIn,
  onChangeWebsite,
}: ProfileSocialCardProps) {
  const theme = SECTION_THEMES.SOCIAL;

  if (!isEditing && !linkedInUrl && !personalWebsiteUrl) {
    return null;
  }

  return (
    <View style={[styles.card, variant === "student" && styles.studentCard]}>
      <BrowserWatermark variant={variant} />

      <View style={styles.sectionHeaderRow}>
        <View style={styles.headerLeft}>
          <View style={styles.sectionIconBadge}>
            <Feather name="link" size={15} color={theme.primaryText} />
          </View>
          <Text style={styles.sectionTitle}>PORTFOLIO & SOCIAL PROFILES</Text>
        </View>
      </View>

      {(isEditing || !!linkedInUrl) && (
        <View style={[styles.linkRow, variant === "student" && styles.studentLinkRow]}>
          <View style={styles.linkIconWrapper}>
            <Feather name="linkedin" size={18} color={colors.white} />
          </View>
          <View style={styles.linkContent}>
            <Text style={styles.linkLabel}>LinkedIn</Text>
            {isEditing ? (
               <TextInput
                 style={styles.editInput}
                 value={linkedInUrl}
                 onChangeText={onChangeLinkedIn}
                 placeholder="linkedin.com/in/..."
                 placeholderTextColor={PROFILE_COLORS.mutedText}
                 autoCapitalize="none"
                 autoCorrect={false}
                 accessible={true}
               />
             ) : (
              <TouchableOpacity
                onPress={() => safeOpenURL(linkedInUrl)}
                style={styles.linkUrlRow}
                activeOpacity={0.7}
                accessible={true}
                accessibilityRole="link"
              >
                <Text
                  style={[
                    styles.linkUrl,
                    variant === "student" && styles.studentLinkUrl,
                  ]}
                  numberOfLines={1}
                >
                  {linkedInUrl}
                </Text>
                {variant === "student" ? (
                  <View style={styles.studentArrow}>
                    <Feather name="arrow-up-right" size={15} color={colors.slate400} />
                  </View>
                ) : (
                  <Feather name="arrow-up-right" size={12} color={theme.primaryText} />
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {(isEditing || !!personalWebsiteUrl) && (
        <View
          style={[
            styles.linkRow,
            variant === "student" && styles.studentLinkRow,
            { marginTop: 12 },
          ]}
        >
          <View style={[styles.linkIconWrapper, { backgroundColor: colors.navyInk }]}>
            <Feather name="globe" size={18} color={colors.white} />
          </View>
          <View style={styles.linkContent}>
            <Text style={styles.linkLabel}>Website</Text>
            {isEditing ? (
               <TextInput
                 style={styles.editInput}
                 value={personalWebsiteUrl}
                 onChangeText={onChangeWebsite}
                 placeholder="yourwebsite.com"
                 placeholderTextColor={PROFILE_COLORS.mutedText}
                 autoCapitalize="none"
                 autoCorrect={false}
                 accessible={true}
               />
            ) : (
              <TouchableOpacity
                onPress={() => safeOpenURL(personalWebsiteUrl)}
                style={styles.linkUrlRow}
                activeOpacity={0.7}
                accessible={true}
                accessibilityRole="link"
              >
                <Text style={styles.linkUrl} numberOfLines={1}>
                  {personalWebsiteUrl}
                </Text>
                <Feather name="arrow-up-right" size={12} color={theme.primaryText} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: PROFILE_COLORS.white,
    borderRadius: PROFILE_COLORS.cardRadius,
    marginBottom: SPACING.cardGap,
    shadowColor: PROFILE_COLORS.deepNavy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.blackAlpha02,
    padding: SPACING.lg,
    position: "relative",
    overflow: "hidden",
  },
  studentCard: {
    borderRadius: 28,
    padding: SPACING.lg,
    shadowOpacity: 0.035,
  },
  watermark: {
    position: "absolute",
    right: -20,
    top: 10,
    zIndex: 0,
  },
  studentWatermark: {
    position: "absolute",
    right: -24,
    top: -34,
    zIndex: 0,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.lg,
    zIndex: 1,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: SECTION_THEMES.SOCIAL.badgeBg,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: SECTION_THEMES.SOCIAL.primaryText,
    letterSpacing: 0.8,
  },

  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    zIndex: 1,
    padding: 10,
    borderRadius: 14,
    backgroundColor: colors.semantic.sky.tint,
    borderWidth: 1,
    borderColor: colors.semantic.blue.soft,
  },
  studentLinkRow: {
    backgroundColor: colors.white,
    borderColor: colors.semantic.blue.soft,
    borderRadius: 16,
    padding: 12,
    shadowColor: colors.semantic.blue.darker,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 1,
  },
  linkIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.semantic.blue.linkedin,
    alignItems: "center",
    justifyContent: "center",
  },
  linkContent: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  linkLabel: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: PROFILE_COLORS.deepNavy,
  },
  linkUrlRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
    justifyContent: "space-between",
  },
  linkUrl: {
    fontFamily,
    fontSize: 11,
    fontWeight: "500",
    color: PROFILE_COLORS.subtleText,
    flex: 1,
  },
  studentLinkUrl: {
    color: colors.semantic.blue.accent,
  },
  studentArrow: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
    backgroundColor: colors.slate50,
    borderWidth: 1,
    borderColor: colors.coolTint,
  },
  editInput: {
    flex: 1,
    fontFamily,
    fontSize: 14,
    fontWeight: "400",
    color: PROFILE_COLORS.deepNavy,
    backgroundColor: colors.slate50,
    borderWidth: 1,
    borderColor: PROFILE_COLORS.border,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginLeft: 12,
  },
});
