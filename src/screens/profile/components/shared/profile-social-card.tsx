import React from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { PROFILE_COLORS, fontFamily } from "../../constants";
import { safeOpenURL } from "../../utils";

interface ProfileSocialCardProps {
  isEditing: boolean;
  linkedInUrl: string;
  personalWebsiteUrl: string;
  onChangeLinkedIn: (url: string) => void;
  onChangeWebsite: (url: string) => void;
}

export const ProfileSocialCard = React.memo(function ProfileSocialCard({
  isEditing,
  linkedInUrl,
  personalWebsiteUrl,
  onChangeLinkedIn,
  onChangeWebsite,
}: ProfileSocialCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardHeader}>PORTFOLIO & SOCIAL PROFILES</Text>

      {/* LinkedIn */}
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
              placeholderTextColor="#94a3b8"
              autoCapitalize="none"
              keyboardType="url"
              accessible={true}
              accessibilityLabel="LinkedIn URL input"
            />
          ) : linkedInUrl ? (
            <TouchableOpacity
              onPress={() => safeOpenURL(linkedInUrl)}
              accessible={true}
              accessibilityRole="link"
              accessibilityLabel={`Open LinkedIn profile: ${linkedInUrl}`}
            >
              <Text style={styles.linkText} numberOfLines={1}>
                {linkedInUrl}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.emptyText}>Not provided</Text>
          )}
        </View>
      </View>

      <View style={styles.divider} />

      {/* Personal Website */}
      <View style={styles.itemRow}>
        <View style={styles.iconCircle}>
          <Feather name="globe" size={18} color="#0284c7" />
        </View>
        <View style={styles.itemContent}>
          <Text style={styles.label}>Personal Website</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={personalWebsiteUrl}
              onChangeText={onChangeWebsite}
              placeholder="https://portfolio.me"
              placeholderTextColor="#94a3b8"
              autoCapitalize="none"
              keyboardType="url"
              accessible={true}
              accessibilityLabel="Personal Website URL input"
            />
          ) : personalWebsiteUrl ? (
            <TouchableOpacity
              onPress={() => safeOpenURL(personalWebsiteUrl)}
              accessible={true}
              accessibilityRole="link"
              accessibilityLabel={`Open Personal Website: ${personalWebsiteUrl}`}
            >
              <Text style={styles.linkText} numberOfLines={1}>
                {personalWebsiteUrl}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.emptyText}>Not provided</Text>
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
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: PROFILE_COLORS.subtleBorder,
    ...PROFILE_COLORS.shadow,
  },
  cardHeader: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: PROFILE_COLORS.subtleText,
    letterSpacing: 1,
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  label: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: PROFILE_COLORS.subtleText,
    marginBottom: 2,
  },
  linkText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "600",
    color: "#0284c7",
  },
  emptyText: {
    fontFamily,
    fontSize: 13,
    color: "#94a3b8",
  },
  input: {
    fontFamily,
    fontSize: 14,
    color: PROFILE_COLORS.neutralText,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(0, 0, 0, 0.04)",
    marginVertical: 14,
  },
});
