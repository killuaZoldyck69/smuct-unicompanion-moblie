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
  resolvePersonalWebsite,
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

  // Step 0 Option 3: Resolve test dev URLs to clean placeholder
  const websiteResolution = resolvePersonalWebsite(personalWebsiteUrl, userName);
  const displayWebsite = websiteResolution.displayUrl;

  const friendlyLinkedIn = formatFriendlyLink(linkedInUrl);
  const friendlyWebsite = formatFriendlyLink(displayWebsite);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerIcon}>
          <Feather name="globe" size={14} color={theme.primaryText} />
        </View>
        <Text style={styles.cardHeader}>PORTFOLIO & SOCIAL PROFILES</Text>
      </View>

      {/* LinkedIn Row */}
      <View style={styles.itemRow}>
        <View style={styles.iconCircle}>
          <Feather name="linkedin" size={18} color="#0077b5" />
        </View>
        <View style={styles.itemContent}>
          <Text style={styles.label}>LinkedIn</Text>
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
          ) : linkedInUrl ? (
            <TouchableOpacity
              onPress={() => safeOpenURL(linkedInUrl)}
              style={styles.linkTouchable}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="link"
              accessibilityLabel={`Open LinkedIn profile: ${linkedInUrl}`}
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
          ) : (
            <Text style={styles.emptyText}>Not provided</Text>
          )}
        </View>
      </View>

      <View style={styles.divider} />

      {/* Personal Website Row (Step 0 - Option 3 Placeholder applied) */}
      <View style={styles.itemRow}>
        <View style={styles.iconCircle}>
          <Feather name="external-link" size={17} color={theme.primaryText} />
        </View>
        <View style={styles.itemContent}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Personal Website</Text>
            {websiteResolution.isPlaceholder && !isEditing && (
              <View style={styles.placeholderBadge}>
                <Text style={styles.placeholderBadgeText}>SAMPLE</Text>
              </View>
            )}
          </View>

          {isEditing ? (
            <TextInput
              style={styles.input}
              value={personalWebsiteUrl}
              onChangeText={onChangeWebsite}
              placeholder="https://portfolio.me/username"
              placeholderTextColor={PROFILE_COLORS.mutedText}
              autoCapitalize="none"
              keyboardType="url"
              accessible={true}
              accessibilityLabel="Personal Website URL input"
            />
          ) : (
            <TouchableOpacity
              onPress={() => safeOpenURL(displayWebsite)}
              style={styles.linkTouchable}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="link"
              accessibilityLabel={`Open Personal Website: ${displayWebsite}`}
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
  placeholderBadge: {
    backgroundColor: "rgba(2, 132, 199, 0.1)",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  placeholderBadgeText: {
    fontFamily,
    fontSize: 9,
    fontWeight: "800",
    color: "#0284c7",
    letterSpacing: 0.5,
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
  emptyText: {
    fontFamily,
    fontSize: 13,
    color: PROFILE_COLORS.mutedText,
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
