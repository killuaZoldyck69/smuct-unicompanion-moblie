import React from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import Svg, { Circle, G, Path } from "react-native-svg";
import { colors } from "@/theme/colors";
import {
  PROFILE_COLORS,
  SECTION_THEMES,
  SPACING,
  fontFamily,
} from "../../constants";
import { safeOpenURL } from "../../utils";

interface ProfileSocialCardProps {
  isEditing: boolean;
  linkedInUrl: string;
  personalWebsiteUrl: string;
  onChangeLinkedIn: (url: string) => void;
  onChangeWebsite: (url: string) => void;
}

const BrowserWatermark = () => (
  <Svg
    width={140}
    height={140}
    viewBox="0 0 140 140"
    style={styles.watermark}
    aria-hidden={true}
  >
    <G opacity={0.06} fill="none" stroke={colors.semantic.indigo.solid} strokeWidth={5}>
      <Circle cx="84" cy="68" r="52" />
      <Path d="m96 37-12 31 30-12-24-19Z" fill={colors.semantic.indigo.solid} stroke="none" />
    </G>
  </Svg>
);

export const ProfileSocialCard = React.memo(function ProfileSocialCard({
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
    <View style={styles.card}>
      <BrowserWatermark />

      <View style={styles.sectionHeaderRow}>
        <View style={styles.headerLeft}>
          <View style={styles.sectionIconBadge}>
            <Feather name="link" size={15} color={theme.primaryText} />
          </View>
          <Text style={styles.sectionTitle}>PORTFOLIO & SOCIAL PROFILES</Text>
        </View>
      </View>

      {(isEditing || !!linkedInUrl) && (
        <View style={styles.linkRow}>
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
                <Text style={styles.linkUrl} numberOfLines={1}>
                  {linkedInUrl}
                </Text>
                <View style={styles.linkArrow}>
                  <Feather name="arrow-up-right" size={15} color={colors.slate400} />
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {(isEditing || !!personalWebsiteUrl) && (
        <View
          style={[
            styles.linkRow,
            (isEditing || !!linkedInUrl) && styles.secondLinkRow,
          ]}
        >
          <View style={[styles.linkIconWrapper, styles.websiteIconWrapper]}>
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
                <View style={styles.linkArrow}>
                  <Feather name="arrow-up-right" size={15} color={colors.slate400} />
                </View>
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
    borderWidth: 1,
    borderColor: PROFILE_COLORS.subtleBorder,
    ...PROFILE_COLORS.shadow,
    padding: SPACING.lg,
    position: "relative",
    overflow: "hidden",
  },
  watermark: {
    position: "absolute",
    right: -24,
    top: -34,
    zIndex: 0,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.md,
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
    padding: 12,
    borderRadius: 16,
    backgroundColor: colors.slate50,
    borderWidth: 1,
    borderColor: colors.semantic.blue.soft,
  },
  secondLinkRow: {
    marginTop: 10,
  },
  linkIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.semantic.blue.linkedin,
    alignItems: "center",
    justifyContent: "center",
  },
  websiteIconWrapper: {
    backgroundColor: colors.navyInk,
  },
  linkContent: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  linkLabel: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: PROFILE_COLORS.deepNavy,
  },
  linkUrlRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    justifyContent: "space-between",
  },
  linkUrl: {
    fontFamily,
    fontSize: 12,
    fontWeight: "500",
    color: colors.semantic.blue.accent,
    flex: 1,
  },
  linkArrow: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.coolTint,
  },
  editInput: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "500",
    color: PROFILE_COLORS.deepNavy,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: PROFILE_COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 6,
    marginTop: 4,
  },
});
