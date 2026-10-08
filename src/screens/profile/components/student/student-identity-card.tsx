import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import Svg, { Circle, G } from "react-native-svg";
import { StudentProfileData } from "@/services/student-service";
import { PROFILE_COLORS, SPACING, fontFamily } from "../../constants";

interface StudentIdentityCardProps {
  profile: StudentProfileData;
  sessionUser: {
    id: string;
    name: string;
    email: string;
    role?: string;
  };
  isUploading: boolean;
  onPickAvatar: (safeName: string) => void;
}

const IdentityWatermark = () => (
  <Svg width={120} height={120} viewBox="0 0 120 120" style={styles.watermark}>
    <G opacity={0.06}>
      <Circle cx="100" cy="10" r="40" fill="#2563EB" />
      <Circle cx="120" cy="80" r="30" fill="#2563EB" />
    </G>
  </Svg>
);

export const StudentIdentityCard = React.memo(function StudentIdentityCard({
  profile,
  sessionUser,
  isUploading,
  onPickAvatar,
}: StudentIdentityCardProps) {
  const safeName = (profile.name || "student").replace(/\s+/g, "").toLowerCase();

  return (
    <View style={styles.card}>
      <IdentityWatermark />
      
      <View style={styles.avatarRow}>
        <TouchableOpacity
          onPress={() => onPickAvatar(safeName)}
          disabled={isUploading}
          style={styles.avatarContainer}
          activeOpacity={0.8}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Change profile picture"
        >
          {profile.image ? (
            <Image
              source={{ uri: profile.image }}
              style={styles.avatar}
              accessible={true}
              accessibilityLabel={`${profile.name}'s profile picture`}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Feather name="user" size={32} color={PROFILE_COLORS.subtleText} />
            </View>
          )}
          
          <View style={styles.cameraBadge}>
            {isUploading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Feather name="camera" size={12} color="#ffffff" />
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.avatarTextContainer}>
          <Text style={styles.nameText} numberOfLines={1}>
            {profile.name || sessionUser.name}
          </Text>
          <View style={styles.roleRow}>
            <View style={styles.rolePill}>
              <Ionicons name="school" size={12} color={PROFILE_COLORS.subtleText} />
              <Text style={styles.rolePillText}>Student</Text>
            </View>
            {profile.isCR && (
              <View style={[styles.rolePill, styles.crPill]}>
                <Text style={styles.crPillText}>CR</Text>
              </View>
            )}
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ID:</Text>
            <Text style={styles.subText}>{profile.studentId}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <View style={styles.emailIconWrapper}>
              <Feather name="mail" size={12} color={PROFILE_COLORS.subtleText} />
            </View>
            <Text style={styles.subText} numberOfLines={1}>
              {profile.email || sessionUser.email}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    position: "relative",
    backgroundColor: PROFILE_COLORS.white,
    borderRadius: PROFILE_COLORS.cardRadius,
    padding: SPACING.xl,
    marginBottom: SPACING.cardGap,
    shadowColor: PROFILE_COLORS.deepNavy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.02)",
    overflow: "hidden",
  },
  watermark: {
    position: "absolute",
    right: -20,
    top: -20,
    zIndex: 0,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    zIndex: 1,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f1f5f9",
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    backgroundColor: PROFILE_COLORS.deepNavy,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: PROFILE_COLORS.white,
  },
  avatarTextContainer: {
    flex: 1,
    justifyContent: "center",
  },
  nameText: {
    fontFamily,
    fontSize: 20,
    fontWeight: "700",
    color: PROFILE_COLORS.deepNavy,
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  roleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  rolePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  rolePillText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: PROFILE_COLORS.deepNavy,
  },
  crPill: {
    backgroundColor: "#e0e7ff",
  },
  crPillText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: "#4338ca",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  emailIconWrapper: {
    width: 14,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  infoLabel: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: PROFILE_COLORS.subtleText,
    lineHeight: 16,
    includeFontPadding: false,
  },
  subText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "500",
    color: PROFILE_COLORS.subtleText,
    lineHeight: 16,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
});
