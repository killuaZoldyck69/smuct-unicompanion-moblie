import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { TeacherDirectoryItem } from "@/services/directory-service";
import { THEME, AVATAR_PASTELS, fontFamily } from "../constants";
import { getDepartmentShortName } from "@/data/programs";

export interface TeacherCardProps {
  teacher: TeacherDirectoryItem;
  index: number;
  onPress: (teacher: TeacherDirectoryItem) => void;
}

export const TeacherCard = React.memo(function TeacherCard({
  teacher,
  index,
  onPress,
}: TeacherCardProps) {
  const profile = teacher.teacherProfile;
  const initial = teacher.name?.charAt(0)?.toUpperCase() || "T";
  const pastel = AVATAR_PASTELS[index % AVATAR_PASTELS.length];

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => onPress(teacher)}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Faculty Member ${teacher.name}, ${profile?.designation || "Faculty Member"}, ${profile?.department || "Academic Department"}`}
      accessibilityHint="Tap to view full faculty profile, office location, and contact information"
    >
      <View style={styles.cardInnerRow}>
        {/* Pastel Avatar Container */}
        <View
          style={[
            styles.avatarBox,
            { backgroundColor: pastel.bg, borderColor: pastel.border },
          ]}
        >
          {teacher.image ? (
            <Image
              source={{ uri: teacher.image }}
              style={styles.avatarImage}
              accessible={true}
              accessibilityLabel={`${teacher.name}'s photo`}
            />
          ) : (
            <View style={styles.avatarFallbackCircle}>
              <Text style={styles.avatarFallbackLetter}>{initial}</Text>
            </View>
          )}
        </View>

        {/* Content Column */}
        <View style={styles.cardContent}>
          {/* Name & Leadership Badge Row */}
          <View style={styles.nameRow}>
            <Text style={styles.nameText} numberOfLines={1}>
              {teacher.name}
            </Text>

            {Boolean(profile?.administrativeRole) && (
              <View style={styles.adminRoleBadge}>
                <Text style={styles.adminRoleBadgeText}>
                  {profile?.administrativeRole}
                </Text>
              </View>
            )}
          </View>

          {/* Designation */}
          <Text style={styles.designationText} numberOfLines={1}>
            {profile?.designation || "Faculty Member"}
          </Text>

          {/* Department & ID Subtitle */}
          <Text style={styles.departmentText} numberOfLines={1}>
            {profile?.teacherId ? `${profile.teacherId} • ` : ""}
            {getDepartmentShortName(profile?.department)}
          </Text>
        </View>

      </View>

    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.cardBg,
    borderRadius: 20,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  cardInnerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    marginRight: 14,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 14,
  },
  avatarFallbackCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  avatarFallbackLetter: {
    fontFamily,
    fontSize: 14,
    fontWeight: "800",
    color: "#334155",
  },
  cardContent: {
    flex: 1,
    marginRight: 8,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
    flexWrap: "wrap",
  },
  nameText: {
    fontFamily,
    fontSize: 15,
    fontWeight: "700",
    color: THEME.textPrimary,
    flexShrink: 1,
  },
  adminRoleBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  adminRoleBadgeText: {
    fontFamily,
    fontSize: 9.5,
    fontWeight: "800",
    color: "#92400E",
    letterSpacing: 0.3,
  },
  designationText: {
    fontFamily,
    fontSize: 12.5,
    fontWeight: "700",
    color: THEME.primary,
    marginBottom: 1,
  },
  departmentText: {
    fontFamily,
    fontSize: 12,
    color: THEME.textSecondary,
    fontWeight: "500",
  },
});
