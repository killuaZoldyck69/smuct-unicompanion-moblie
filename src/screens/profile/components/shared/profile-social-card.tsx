import React from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import {
  PROFILE_COLORS,
  SECTION_THEMES,
  SPACING,
  fontFamily,
} from "../../constants";
import {
  safeOpenURL,
  resolveSocialUrl,
  formatFriendlyLink,
} from "../../utils";

interface ProfileSocialCardProps {
  isEditing: boolean;
  linkedInUrl: string;
  personalWebsiteUrl: string;
  userName?: string;
  onChangeLinkedIn: (url: string) => void;
  onChangeWebsite: (url: string) => void;
}

export const ProfileSocialCard = React.memo(function ProfileSocialCard({
  isEditing,
  linkedInUrl,
  personalWebsiteUrl,
  userName,
  onChangeLinkedIn,
  onChangeWebsite,
}: ProfileSocialCardProps) {
  const theme = SECTION_THEMES.LINKS;

  const linkedInResolution = resolveSocialUrl(linkedInUrl, "linkedin", userName);
  const websiteResolution = resolveSocialUrl(personalWebsiteUrl, "website", userName);

  const hasLinkedIn = linkedInResolution.isValid;
  const hasWebsite = websiteResolution.isValid;

  // In read mode, if neither link is provided by the user, do not show anything
  if (!isEditing && !hasLinkedIn && !hasWebsite) {
    return null;
  }

  const friendlyLinkedIn = formatFriendlyLink(linkedInResolution.displayUrl);
  const friendlyWebsite = formatFriendlyLink(websiteResolution.displayUrl);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerIcon}>
          <Feather name="globe" size={14} color={theme.primaryText} />
        </View>
        <Text style={styles.cardHeader}>PORTFOLIO & SOCIAL PROFILES</Text>
      </View>

      {/* LinkedIn Row */}
      {(isEditing || hasLinkedIn) && (
        <View style={styles.itemRow}>
          <View style={styles.iconCircle}>
            <Feather name="linkedin" size={18} color="#0077b5" />
          </View>
          <View style={styles.itemContent}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>LinkedIn</Text>
            </View>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={linkedInUrl}
                onChangeText={onChangeLinkedIn}
                placeholder="https://linkedin.com/in/username"
                placeholderTextColor={PROFILE_COLORS.mutedText}
                autoCapitalize="none"
                keyboardType="url"
                accessible={true}
                accessibilityLabel="LinkedIn URL input"
              />
            ) : (
              <TouchableOpacity
                onPress={() => safeOpenURL(linkedInResolution.displayUrl)}
                style={styles.linkTouchable}
                activeOpacity={0.7}
                accessible={true}
                accessibilityRole="link"
                accessibilityLabel={`Open LinkedIn profile: ${linkedInResolution.displayUrl}`}
              >
                <Text style={styles.linkText} numberOfLines={1}>
                  {friendlyLinkedIn}
                </Text>
                <Feather
                  name="arrow-up-right"
                  size={14}
                  color="#0077b5"
                  style={{ marginLeft: 4 }}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Divider between LinkedIn and Website */}
      {(isEditing || (hasLinkedIn && hasWebsite)) && (
        <View style={styles.divider} />
      )}

      {/* Personal Website Row */}
      {(isEditing || hasWebsite) && (
        <View style={styles.itemRow}>
          <View style={styles.iconCircle}>
            <Feather name="external-link" size={17} color={theme.primaryText} />
          </View>
          <View style={styles.itemContent}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Personal Website</Text>
            </View>

            {isEditing ? (
              <TextInput
                style={styles.input}
                value={personalWebsiteUrl}
                onChangeText={onChangeWebsite}
                placeholder="https://yourwebsite.com"
                placeholderTextColor={PROFILE_COLORS.mutedText}
                autoCapitalize="none"
                keyboardType="url"
                accessible={true}
                accessibilityLabel="Personal Website URL input"
              />
            ) : (
              <TouchableOpacity
                onPress={() => safeOpenURL(websiteResolution.displayUrl)}
                style={styles.linkTouchable}
                activeOpacity={0.7}
                accessible={true}
                accessibilityRole="link"
                accessibilityLabel={`Open Personal Website: ${websiteResolution.displayUrl}`}
              >
                <Text style={styles.linkText} numberOfLines={1}>
                  {friendlyWebsite}
                </Text>
                <Feather
                  name="arrow-up-right"
                  size={14}
                  color={theme.primaryText}
                  style={{ marginLeft: 4 }}
                />
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
    padding: SPACING.lg, // 16px
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: PROFILE_COLORS.subtleBorder,
    ...PROFILE_COLORS.shadow,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
    gap: 6,
  },
  headerIcon: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: SECTION_THEMES.LINKS.badgeBg,
    alignItems: "center",
    justifyContent: "center",
  },
  cardHeader: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: SECTION_THEMES.LINKS.primaryText,
    letterSpacing: 0.8,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: SECTION_THEMES.LINKS.badgeBg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: SECTION_THEMES.LINKS.badgeBorder,
  },
  itemContent: {
    flex: 1,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  label: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: PROFILE_COLORS.subtleText,
  },
  linkTouchable: {
    flexDirection: "row",
    alignItems: "center",
  },
  linkText: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "600",
    color: SECTION_THEMES.LINKS.primaryText,
    maxWidth: "90%",
  },
  input: {
    fontFamily,
    fontSize: 13.5,
    color: PROFILE_COLORS.neutralText,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(0, 0, 0, 0.04)",
    marginVertical: SPACING.md,
  },
});
