import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { TeacherProfileData } from "@/services/teacher-service";
import {
  PROFILE_COLORS,
  SECTION_THEMES,
  SPACING,
  fontFamily,
} from "../../constants";
import { CampusBuildingWatermark } from "./faculty-illustrations";

interface TeacherAcademicCardProps {
  profile: TeacherProfileData;
  isEditing: boolean;
  designation: string;
  department: string;
  officeRoom: string;
  consultationHours: string;
  onChangeDesignation: (val: string) => void;
  onChangeDepartment: (val: string) => void;
  onChangeOfficeRoom: (val: string) => void;
  onChangeConsultationHours: (val: string) => void;
}

export const TeacherAcademicCard = React.memo(function TeacherAcademicCard({
  profile,
  isEditing,
  designation,
  department,
  officeRoom,
  consultationHours,
  onChangeDesignation,
  onChangeDepartment,
  onChangeOfficeRoom,
  onChangeConsultationHours,
}: TeacherAcademicCardProps) {
  const theme = SECTION_THEMES.ACADEMIC;

  const displayOfficeRoom = profile.roomNumber
    ? `Office: ${profile.roomNumber}`
    : (profile as any).officeRoom
      ? `Office: ${(profile as any).officeRoom}`
      : "Not provided";

  const displayHours =
    (profile as any).consultationHours || (profile as any).officeHours || "Not provided";

  return (
    <View style={styles.card}>
      {/* Background Campus Illustration Watermark on Right */}
      <View style={styles.watermarkContainer} pointerEvents="none">
        <CampusBuildingWatermark
          width={150}
          height={125}
          opacity={0.13}
          color={theme.primaryText}
        />
      </View>

      {/* Header */}
      <View style={styles.sectionHeaderRow}>
        <View style={styles.headerLeft}>
          <View style={styles.sectionIconBadge}>
            <Ionicons name="business-outline" size={16} color={theme.primaryText} />
          </View>
          <Text style={styles.sectionTitle}>ACADEMIC POSITION</Text>
        </View>
      </View>

      {/* Row 1: Designation */}
      <View style={styles.infoRow}>
        <View style={styles.iconCircle}>
          <Feather name="user" size={16} color={theme.primaryText} />
        </View>
        <View style={styles.fieldContent}>
          <Text style={styles.fieldLabel}>Designation</Text>
          {isEditing ? (
            <TextInput
              style={styles.editInput}
              value={designation}
              onChangeText={onChangeDesignation}
              placeholder="e.g. Lecturer"
              placeholderTextColor={PROFILE_COLORS.mutedText}
              accessible={true}
              accessibilityLabel="Faculty Designation Input"
            />
          ) : (
            <Text style={styles.fieldValue} numberOfLines={1}>
              {profile.designation || "Not provided"}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.divider} />

      {/* Row 2: Department */}
      <View style={styles.infoRow}>
        <View style={styles.iconCircle}>
          <Ionicons name="business-outline" size={16} color={theme.primaryText} />
        </View>
        <View style={styles.fieldContent}>
          <Text style={styles.fieldLabel}>Department</Text>
          {isEditing ? (
            <TextInput
              style={styles.editInput}
              value={department}
              onChangeText={onChangeDepartment}
              placeholder="e.g. Computer Science and Engineering"
              placeholderTextColor={PROFILE_COLORS.mutedText}
              accessible={true}
              accessibilityLabel="Faculty Department Input"
            />
          ) : (
            <Text style={styles.fieldValue} numberOfLines={2}>
              {profile.department || "Not provided"}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.divider} />

      {/* Row 3: Office Room */}
      <View style={styles.infoRow}>
        <View style={styles.iconCircle}>
          <Feather name="map-pin" size={16} color={theme.primaryText} />
        </View>
        <View style={styles.fieldContent}>
          <Text style={styles.fieldLabel}>Office Room</Text>
          {isEditing ? (
            <TextInput
              style={styles.editInput}
              value={officeRoom}
              onChangeText={onChangeOfficeRoom}
              placeholder="e.g. Office: 1803"
              placeholderTextColor={PROFILE_COLORS.mutedText}
              accessible={true}
              accessibilityLabel="Faculty Office Room Input"
            />
          ) : (
            <Text style={styles.fieldValue} numberOfLines={1}>
              {displayOfficeRoom}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.divider} />

      {/* Row 4: Consultation Hours */}
      <View style={styles.infoRow}>
        <View style={styles.iconCircle}>
          <Feather name="clock" size={16} color={theme.primaryText} />
        </View>
        <View style={styles.fieldContent}>
          <Text style={styles.fieldLabel}>Consultation Hours</Text>
          {isEditing ? (
            <TextInput
              style={styles.editInput}
              value={consultationHours}
              onChangeText={onChangeConsultationHours}
              placeholder="e.g. 11:00 pm"
              placeholderTextColor={PROFILE_COLORS.mutedText}
              accessible={true}
              accessibilityLabel="Faculty Consultation Hours Input"
            />
          ) : (
            <Text style={styles.fieldValue} numberOfLines={1}>
              {displayHours}
            </Text>
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
  watermarkContainer: {
    position: "absolute",
    right: 0,
    bottom: -8,
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
    backgroundColor: SECTION_THEMES.ACADEMIC.badgeBg,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: SECTION_THEMES.ACADEMIC.primaryText,
    letterSpacing: 0.8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    zIndex: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  fieldContent: {
    flex: 1,
    paddingRight: 28, // Clear right watermark
  },
  fieldLabel: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "500",
    color: PROFILE_COLORS.subtleText,
    marginBottom: 3,
  },
  fieldValue: {
    fontFamily,
    fontSize: 14.5,
    fontWeight: "700",
    color: PROFILE_COLORS.deepNavy,
    lineHeight: 19,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(19, 27, 46, 0.05)",
    marginVertical: 6,
    marginLeft: 50,
  },
  editInput: {
    fontFamily,
    fontSize: 14,
    fontWeight: "600",
    color: PROFILE_COLORS.deepNavy,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "rgba(37, 99, 235, 0.15)",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 2,
    outlineStyle: "none" as any,
  },
});
