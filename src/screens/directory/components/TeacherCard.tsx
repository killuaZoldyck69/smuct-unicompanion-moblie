import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { TeacherDirectoryItem } from "@/services/directory-service";
import { DIRECTORY_COLORS, fontFamily } from "../constants";

interface TeacherCardProps {
  teacher: TeacherDirectoryItem;
  onPress: (teacher: TeacherDirectoryItem) => void;
}

export const TeacherCard = React.memo(function TeacherCard({
  teacher,
  onPress,
}: TeacherCardProps) {
  const profile = teacher.teacherProfile;
  const initial = teacher.name?.charAt(0)?.toUpperCase() || "T";

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.75}
      onPress={() => onPress(teacher)}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Teacher ${teacher.name}, ${profile?.designation || "Faculty Member"}, ${profile?.department || "Department not specified"}`}
      accessibilityHint="Tap to view full teacher details and contact information"
    >
      <View style={styles.topRow}>
        {/* Avatar */}
        {teacher.image ? (
          <Image
            source={{ uri: teacher.image }}
            style={styles.avatarImage}
            accessibilityLabel={`${teacher.name}'s photo`}
          />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
        )}

        {/* Basic Info */}
        <View style={styles.infoCol}>
          <View style={styles.nameRow}>
            <Text style={styles.nameText} numberOfLines={1}>
              {teacher.name}
            </Text>
            <View style={styles.verifiedBadge}>
              <Feather name="check" size={10} color="#ffffff" />
            </View>
          </View>

          <Text style={styles.designationText} numberOfLines={1}>
            {profile?.designation || "Faculty Member"}
          </Text>

          <Text style={styles.departmentText} numberOfLines={1}>
            {profile?.department || "Academic Faculty"}
          </Text>
        </View>

        {/* Chevron */}
        <View style={styles.chevronWrapper}>
          <Feather
            name="chevron-right"
            size={18}
            color={DIRECTORY_COLORS.textMuted}
          />
        </View>
      </View>

      {/* Meta Pills Row */}
      <View style={styles.metaRow}>
        {profile?.teacherId ? (
          <View style={styles.idBadge}>
            <Feather
              name="hash"
              size={11}
              color={DIRECTORY_COLORS.blueBadge}
              style={{ marginRight: 3 }}
            />
            <Text style={styles.idBadgeText}>ID: {profile.teacherId}</Text>
          </View>
        ) : null}

        {profile?.officeRoom ? (
          <View style={styles.roomBadge}>
            <Feather
              name="map-pin"
              size={11}
              color={DIRECTORY_COLORS.tealDark}
              style={{ marginRight: 3 }}
            />
            <Text style={styles.roomBadgeText}>{profile.officeRoom}</Text>
          </View>
        ) : null}

        <View style={styles.quickContacts}>
          {teacher.phoneNumber ? (
            <View style={styles.contactIconPill}>
              <Feather
                name="phone"
                size={11}
                color={DIRECTORY_COLORS.textSecondary}
              />
            </View>
          ) : null}
          {teacher.email ? (
            <View style={styles.contactIconPill}>
              <Feather
                name="mail"
                size={11}
                color={DIRECTORY_COLORS.textSecondary}
              />
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: DIRECTORY_COLORS.surface,
    borderRadius: DIRECTORY_COLORS.cardRadius,
    borderWidth: 1,
    borderColor: DIRECTORY_COLORS.cardBorder,
    padding: 16,
    marginBottom: 12,
    ...DIRECTORY_COLORS.cardShadow,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: DIRECTORY_COLORS.surfaceMuted,
  },
  avatarFallback: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: DIRECTORY_COLORS.blueSoft,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: DIRECTORY_COLORS.blueBorder,
  },
  avatarText: {
    fontFamily,
    fontSize: 20,
    fontWeight: "800",
    color: DIRECTORY_COLORS.blueText,
  },
  infoCol: {
    flex: 1,
    marginLeft: 14,
    marginRight: 6,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  nameText: {
    fontFamily,
    fontSize: 16,
    fontWeight: "800",
    color: DIRECTORY_COLORS.textPrimary,
    letterSpacing: -0.2,
    flexShrink: 1,
  },
  verifiedBadge: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: DIRECTORY_COLORS.tealDark,
    alignItems: "center",
    justifyContent: "center",
  },
  designationText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: DIRECTORY_COLORS.blueText,
    marginTop: 2,
  },
  departmentText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "500",
    color: DIRECTORY_COLORS.textSecondary,
    marginTop: 1,
  },
  chevronWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: DIRECTORY_COLORS.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: DIRECTORY_COLORS.divider,
  },
  idBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DIRECTORY_COLORS.blueSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: DIRECTORY_COLORS.blueBorder,
  },
  idBadgeText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: DIRECTORY_COLORS.blueText,
    letterSpacing: 0.2,
  },
  roomBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DIRECTORY_COLORS.tealSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: DIRECTORY_COLORS.tealBorder,
  },
  roomBadgeText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: DIRECTORY_COLORS.tealDark,
  },
  quickContacts: {
    marginLeft: "auto",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  contactIconPill: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: DIRECTORY_COLORS.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
});
