import React, { useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Linking,
  StyleSheet,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { FACULTY_THEME, SPACING, fontFamily } from "../../constants";
import { DigitalPresenceWatermark } from "./faculty-illustrations";

interface TeacherSocialCardProps {
  isEditing: boolean;
  linkedInUrl: string;
  personalWebsiteUrl: string;
  onChangeLinkedIn: (url: string) => void;
  onChangeWebsite: (url: string) => void;
}

export const TeacherSocialCard = React.memo(function TeacherSocialCard({
  isEditing,
  linkedInUrl,
  personalWebsiteUrl,
  onChangeLinkedIn,
  onChangeWebsite,
}: TeacherSocialCardProps) {
  const handleOpenUrl = useCallback(async (url: string) => {
    if (!url) return;
    try {
      const targetUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`;
      const supported = await Linking.canOpenURL(targetUrl);
      if (supported) {
        await Linking.openURL(targetUrl);
      } else {
        await Linking.openURL(targetUrl);
      }
    } catch {
      Alert.alert("Cannot Open Link", `Could not navigate to: ${url}`);
    }
  }, []);

  if (!isEditing && !linkedInUrl && !personalWebsiteUrl) {
    return null;
  }

  return (
    <View style={styles.card}>
      {/* Subtle Digital Presence Watermark on Right */}
      <View style={styles.watermarkContainer} pointerEvents="none">
        <DigitalPresenceWatermark
          width={135}
          height={95}
          opacity={0.13}
          color="#2563eb"
        />
      </View>

      {/* Section Header */}
      <View style={styles.sectionHeaderRow}>
        <View style={styles.headerIconBadge}>
          <Feather name="link" size={14} color="#2563eb" />
        </View>
        <Text style={styles.sectionTitle}>PORTFOLIO & SOCIAL PROFILES</Text>
      </View>

      {/* LinkedIn Row */}
      {(isEditing || !!linkedInUrl) && (
        <View style={styles.itemRow}>
          <View style={[styles.iconWrapper, { backgroundColor: "#0a66c2" }]}>
            <Feather name="linkedin" size={16} color="#ffffff" />
          </View>

          <View style={styles.itemContent}>
            <Text style={styles.itemLabel}>LinkedIn</Text>
            {isEditing ? (
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={linkedInUrl}
                  onChangeText={onChangeLinkedIn}
                  placeholder="linkedin.com/in/..."
                  placeholderTextColor={FACULTY_THEME.secondaryText}
                  autoCapitalize="none"
                  autoCorrect={false}
                  accessible={true}
                  accessibilityLabel="LinkedIn profile input"
                />
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => handleOpenUrl(linkedInUrl)}
                style={styles.linkTouchRow}
                activeOpacity={0.7}
                accessible={true}
                accessibilityRole="link"
                accessibilityLabel={`Open LinkedIn profile: ${linkedInUrl}`}
              >
                <Text style={styles.urlText} numberOfLines={1} ellipsizeMode="tail">
                  {linkedInUrl}
                </Text>
                <Feather name="arrow-up-right" size={14} color="#2563eb" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Divider if both exist */}
      {(isEditing || (!!linkedInUrl && !!personalWebsiteUrl)) && (
        <View style={styles.divider} />
      )}

      {/* Website Row */}
      {(isEditing || !!personalWebsiteUrl) && (
        <View style={styles.itemRow}>
          <View style={[styles.iconWrapper, { backgroundColor: "#0f172a" }]}>
            <Feather name="globe" size={16} color="#ffffff" />
          </View>

          <View style={styles.itemContent}>
            <Text style={styles.itemLabel}>Website</Text>
            {isEditing ? (
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={personalWebsiteUrl}
                  onChangeText={onChangeWebsite}
                  placeholder="yourportfolio.edu"
                  placeholderTextColor={FACULTY_THEME.secondaryText}
                  autoCapitalize="none"
                  autoCorrect={false}
                  accessible={true}
                  accessibilityLabel="Website URL input"
                />
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => handleOpenUrl(personalWebsiteUrl)}
                style={styles.linkTouchRow}
                activeOpacity={0.7}
                accessible={true}
                accessibilityRole="link"
                accessibilityLabel={`Open website: ${personalWebsiteUrl}`}
              >
                <Text style={styles.urlText} numberOfLines={1} ellipsizeMode="tail">
                  {personalWebsiteUrl}
                </Text>
                <Feather name="arrow-up-right" size={14} color="#2563eb" style={{ marginLeft: 4 }} />
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
    backgroundColor: FACULTY_THEME.surface,
    borderRadius: FACULTY_THEME.cardRadius,
    padding: SPACING.xl,
    marginBottom: SPACING.cardGap,
    borderWidth: 1,
    borderColor: FACULTY_THEME.cardBorder,
    shadowColor: FACULTY_THEME.primaryNavy,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    position: "relative",
    overflow: "hidden",
  },
  watermarkContainer: {
    position: "absolute",
    right: -10,
    top: 6,
    zIndex: 0,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: SPACING.lg,
    zIndex: 1,
  },
  headerIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontFamily,
    fontSize: 12.5,
    fontWeight: "800",
    color: "#1e3a8a",
    letterSpacing: 0.8,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    zIndex: 1,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  itemContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemLabel: {
    fontFamily,
    fontSize: 14.5,
    fontWeight: "700",
    color: FACULTY_THEME.primaryNavy,
    marginRight: 10,
  },
  linkTouchRow: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
    maxWidth: "68%",
  },
  urlText: {
    fontFamily,
    fontSize: 13,
    color: "#2563eb",
    flexShrink: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(19, 27, 46, 0.06)",
    marginVertical: 12,
    marginLeft: 50,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(37, 99, 235, 0.25)",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  input: {
    fontFamily,
    fontSize: 13,
    color: FACULTY_THEME.primaryNavy,
    padding: 0,
    outlineStyle: "none" as any,
  },
});
