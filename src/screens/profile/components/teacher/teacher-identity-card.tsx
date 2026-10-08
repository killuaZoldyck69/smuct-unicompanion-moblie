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
import { TeacherProfileData } from "@/services/teacher-service";
import { PROFILE_COLORS, SPACING, fontFamily } from "../../constants";
import { AcademicHaloWatermark } from "./faculty-illustrations";

interface TeacherIdentityCardProps {
  profile: TeacherProfileData;
  sessionUser: {
    id: string;
    name: string;
    email: string;
    role?: string;
  };
  isUploading: boolean;
  onPickAvatar: (safeName: string) => void;
}

export const TeacherIdentityCard = React.memo(function TeacherIdentityCard({
  profile,
  sessionUser,
  isUploading,
  onPickAvatar,
}: TeacherIdentityCardProps) {
  const safeName = (profile.name || "faculty").replace(/\s+/g, "").toLowerCase();
  const displayName = profile.name || sessionUser.name;
  const displayEmail = profile.email || sessionUser.email;
  const displayDesignation = profile.designation || "Lecturer";
  const displayId =
    profile.teacherId ||
    (profile as any).employeeId ||
    (profile as any).facultyId ||
    (sessionUser as any).teacherId ||
    profile.id;

  return (
    <View style={styles.card}>
      <View style={styles.avatarRow}>
        <View style={styles.avatarWrapper}>
          {/* Subtle Academic Halo Geometry behind portrait */}
          <View style={styles.haloBackground} pointerEvents="none">
            <AcademicHaloWatermark width={110} height={110} opacity={0.3} color="#10b981" />
          </View>

          <TouchableOpacity
            onPress={() => onPickAvatar(safeName)}
            disabled={isUploading}
            style={styles.avatarContainer}
            activeOpacity={0.8}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Change faculty profile picture"
          >
            {profile.image ? (
              <Image
                source={{ uri: profile.image }}
                style={styles.avatar}
                accessible={true}
                accessibilityLabel={`${displayName}'s profile picture`}
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
        </View>

        <View style={styles.avatarTextContainer}>
          {/* Full Faculty Name */}
          <Text style={styles.nameText}>
            {displayName}
          </Text>

          {/* Designation Tag (e.g. Lecturer) */}
          <View style={styles.roleRow}>
            <View style={styles.rolePill}>
              <Ionicons name="school" size={12} color="#047857" />
              <Text style={styles.rolePillText}>{displayDesignation}</Text>
            </View>
          </View>

          {/* Faculty ID */}
          {displayId ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>ID:</Text>
              <Text style={styles.subText}>{displayId}</Text>
            </View>
          ) : null}

          {/* Email */}
          <View style={styles.infoRow}>
            <View style={styles.emailIconWrapper}>
              <Feather name="mail" size={12} color={PROFILE_COLORS.subtleText} />
            </View>
            <Text style={styles.subText} numberOfLines={1}>
              {displayEmail}
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
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    zIndex: 1,
  },
  avatarWrapper: {
    position: "relative",
    marginRight: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  haloBackground: {
    position: "absolute",
    top: -15,
    left: -15,
    zIndex: 0,
  },
  avatarContainer: {
    position: "relative",
    zIndex: 1,
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
    lineHeight: 25,
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
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  rolePillText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: "#047857",
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
    fontWeight: "700",
    color: PROFILE_COLORS.subtleText,
    lineHeight: 16,
    includeFontPadding: false,
  },
  subText: {
    fontFamily,
    fontSize: 12,
    color: PROFILE_COLORS.subtleText,
    flexShrink: 1,
    lineHeight: 16,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
});
