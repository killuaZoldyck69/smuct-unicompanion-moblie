import React from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import Svg, { Rect, Circle, G } from "react-native-svg";
import {
  PROFILE_COLORS,
  SECTION_THEMES,
  SPACING,
  fontFamily,
} from "../../constants";

interface ProfileSocialCardProps {
  isEditing: boolean;
  linkedInUrl: string;
  personalWebsiteUrl: string;
  userName: string;
  onChangeLinkedIn: (url: string) => void;
  onChangeWebsite: (url: string) => void;
}

const BrowserWatermark = () => (
  <Svg width={140} height={100} viewBox="0 0 140 100" style={styles.watermark}>
    <G opacity={0.08} fill={SECTION_THEMES.SOCIAL.primaryText}>
      {/* Browser Window */}
      <Rect x="20" y="20" width="100" height="70" rx="6" />
      {/* Top Bar */}
      <Circle cx="30" cy="28" r="2" fill="#fff" />
      <Circle cx="36" cy="28" r="2" fill="#fff" />
      <Circle cx="42" cy="28" r="2" fill="#fff" />
      <Rect x="20" y="34" width="100" height="1" fill="#fff" />
      {/* Content lines */}
      <Rect x="30" y="44" width="30" height="30" rx="15" fill="#fff" />
      <Rect x="70" y="52" width="40" height="6" rx="3" fill="#fff" />
      <Rect x="70" y="64" width="30" height="4" rx="2" fill="#fff" />
    </G>
  </Svg>
);

export const ProfileSocialCard = React.memo(function ProfileSocialCard({
  isEditing,
  linkedInUrl,
  personalWebsiteUrl,
  userName,
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
            <Feather name="linkedin" size={18} color="#ffffff" />
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
              <View style={styles.linkUrlRow}>
                <Text style={styles.linkUrl} numberOfLines={1}>
                  {linkedInUrl}
                </Text>
                <Feather name="arrow-up-right" size={12} color={theme.primaryText} />
              </View>
            )}
          </View>
        </View>
      )}

      {(isEditing || !!personalWebsiteUrl) && (
        <View style={[styles.linkRow, { marginTop: 12 }]}>
          <View style={[styles.linkIconWrapper, { backgroundColor: "#0f172a" }]}>
            <Feather name="globe" size={18} color="#ffffff" />
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
              <View style={styles.linkUrlRow}>
                <Text style={styles.linkUrl} numberOfLines={1}>
                  {personalWebsiteUrl}
                </Text>
                <Feather name="arrow-up-right" size={12} color={theme.primaryText} />
              </View>
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
    borderColor: "rgba(0,0,0,0.02)",
    padding: SPACING.lg,
    position: "relative",
    overflow: "hidden",
  },
  watermark: {
    position: "absolute",
    right: -20,
    top: 10,
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
  },
  linkIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#0A66C2", // LinkedIn blue
    alignItems: "center",
    justifyContent: "center",
  },
  linkContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  linkLabel: {
    fontFamily,
    fontSize: 14,
    fontWeight: "600",
    color: PROFILE_COLORS.deepNavy,
  },
  linkUrlRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
    justifyContent: "flex-end",
  },
  linkUrl: {
    fontFamily,
    fontSize: 13,
    fontWeight: "500",
    color: SECTION_THEMES.SOCIAL.primaryText,
    maxWidth: 150,
    textAlign: "right",
  },
  editInput: {
    flex: 1,
    fontFamily,
    fontSize: 14,
    fontWeight: "400",
    color: PROFILE_COLORS.deepNavy,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: PROFILE_COLORS.border,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginLeft: 12,
  },
});
