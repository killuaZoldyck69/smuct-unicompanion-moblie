import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { TeacherProfileData } from "@/services/teacher-service";
import { PROFILE_COLORS, SPACING, fontFamily } from "../../constants";

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

  return (
    <View style={styles.card}>
      <View style={styles.avatarRow}>
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
          <Text style={styles.nameText}>{profile.name || sessionUser.name}</Text>
          <View style={styles.roleRow}>
            <View style={styles.roleBadge}>
              <Feather name="award" size={12} color="#047857" />
              <Text style={styles.roleBadgeText}>Faculty</Text>
            </View>
          </View>
          <Text style={styles.designationText}>{profile.designation || "Lecturer"}</Text>
          <Text style={styles.subText}>{profile.email || sessionUser.email}</Text>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: PROFILE_COLORS.white,
    borderRadius: PROFILE_COLORS.cardRadius,
    padding: SPACING.xl,
    marginBottom: SPACING.cardGap,
    borderWidth: 1,
    borderColor: PROFILE_COLORS.border,
    shadowColor: PROFILE_COLORS.deepNavy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#f1f5f9",
  },
  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
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
    marginLeft: 16,
    flex: 1,
  },
  nameText: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: PROFILE_COLORS.deepNavy,
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  roleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(5, 150, 105, 0.16)",
    gap: 4,
  },
  roleBadgeText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: "#047857",
  },
  designationText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: PROFILE_COLORS.deepNavy,
    marginBottom: 2,
  },
  subText: {
    fontFamily,
    fontSize: 12,
    color: PROFILE_COLORS.subtleText,
    lineHeight: 16,
  },
});
