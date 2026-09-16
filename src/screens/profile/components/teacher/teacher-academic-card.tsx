import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { TeacherProfileData } from "@/services/teacher-service";
import {
  PROFILE_COLORS,
  SECTION_THEMES,
  SPACING,
  fontFamily,
} from "../../constants";

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
  const theme = SECTION_THEMES.FACULTY_ACADEMIC;

  const displayOfficeRoom = profile.roomNumber
    ? `Office: ${profile.roomNumber}`
    : (profile as any).officeRoom
      ? `Office: ${(profile as any).officeRoom}`
      : "Not provided";

  const displayHours =
    (profile as any).consultationHours || (profile as any).officeHours || "Not provided";

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerIconBadge}>
          <Feather name="award" size={14} color={theme.primaryText} />
        </View>
        <Text style={styles.sectionTitle}>ACADEMIC POSITION</Text>
      </View>

      {/* Designation */}
      <View style={styles.infoRow}>
        <View style={styles.iconCircle}>
          <Feather name="briefcase" size={16} color={theme.iconColor} />
        </View>
        <View style={styles.rowContent}>
          <Text style={styles.label}>Designation</Text>
          {isEditing ? (
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={designation}
                onChangeText={onChangeDesignation}
                placeholder="e.g. Senior Lecturer"
                placeholderTextColor={PROFILE_COLORS.mutedText}
                accessible={true}
                accessibilityLabel="Faculty Designation Input"
              />
            </View>
          ) : (
            <Text style={styles.valueText}>{profile.designation || "Not provided"}</Text>
          )}
        </View>
      </View>

      <View style={styles.divider} />

      {/* Department */}
      <View style={styles.infoRow}>
        <View style={styles.iconCircle}>
          <Feather name="book" size={16} color={theme.iconColor} />
        </View>
        <View style={styles.rowContent}>
          <Text style={styles.label}>Department</Text>
          {isEditing ? (
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={department}
                onChangeText={onChangeDepartment}
                placeholder="e.g. Computer Science and Engineering"
                placeholderTextColor={PROFILE_COLORS.mutedText}
                accessible={true}
                accessibilityLabel="Faculty Department Input"
              />
            </View>
          ) : (
            <Text style={styles.valueText}>{profile.department || "Not provided"}</Text>
          )}
        </View>
      </View>

      <View style={styles.divider} />

      {/* Office Room */}
      <View style={styles.infoRow}>
        <View style={styles.iconCircle}>
          <Feather name="map-pin" size={16} color={theme.iconColor} />
        </View>
        <View style={styles.rowContent}>
          <Text style={styles.label}>Office Room</Text>
          {isEditing ? (
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={officeRoom}
                onChangeText={onChangeOfficeRoom}
                placeholder="e.g. Room 402, Building A"
                placeholderTextColor={PROFILE_COLORS.mutedText}
                accessible={true}
                accessibilityLabel="Faculty Office Room Input"
              />
            </View>
          ) : (
            <Text style={styles.valueText}>{displayOfficeRoom}</Text>
          )}
        </View>
      </View>

      <View style={styles.divider} />

      {/* Consultation Hours */}
      <View style={[styles.infoRow, { marginBottom: 0 }]}>
        <View style={styles.iconCircle}>
          <Feather name="clock" size={16} color={theme.iconColor} />
        </View>
        <View style={styles.rowContent}>
          <Text style={styles.label}>Consultation Hours</Text>
          {isEditing ? (
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={consultationHours}
                onChangeText={onChangeConsultationHours}
                placeholder="e.g. Sun-Tue 11:00 AM - 1:00 PM"
                placeholderTextColor={PROFILE_COLORS.mutedText}
                accessible={true}
                accessibilityLabel="Faculty Consultation Hours Input"
              />
            </View>
          ) : (
            <Text style={styles.valueText}>{displayHours}</Text>
          )}
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: SECTION_THEMES.FACULTY_ACADEMIC.badgeBg, // #fefce8
    borderRadius: PROFILE_COLORS.cardRadius,
    padding: SPACING.xl,
    marginBottom: SPACING.cardGap,
    borderWidth: 1,
    borderColor: SECTION_THEMES.FACULTY_ACADEMIC.badgeBorder,
    shadowColor: "#854d0e",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: SPACING.lg,
  },
  headerIconBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: SECTION_THEMES.FACULTY_ACADEMIC.iconCircleBg,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: SECTION_THEMES.FACULTY_ACADEMIC.primaryText,
    letterSpacing: 0.8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: SECTION_THEMES.FACULTY_ACADEMIC.iconCircleBg, // #fef9c3
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  rowContent: {
    flex: 1,
  },
  label: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "700",
    color: "#a16207",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  valueText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: SECTION_THEMES.FACULTY_ACADEMIC.primaryText, // #854d0e
  },
  divider: {
    height: 1,
    backgroundColor: SECTION_THEMES.FACULTY_ACADEMIC.divider,
    marginVertical: 8,
  },
  inputWrapper: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(202, 138, 4, 0.25)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 2,
  },
  input: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "700",
    color: SECTION_THEMES.FACULTY_ACADEMIC.primaryText,
    padding: 0,
    outlineStyle: "none" as any,
  },
});
