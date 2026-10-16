import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { FACULTY_COLORS } from "../constants";
import { AddFacultyFormData, SelectorType } from "../types";

interface AcademicPositionSectionProps {
  formData: AddFacultyFormData;
  setActiveSelector: (type: SelectorType) => void;
}

export const AcademicPositionSection = React.memo(
  function AcademicPositionSection({
    formData,
    setActiveSelector,
  }: AcademicPositionSectionProps) {
    return (
      <View style={styles.card}>
        {/* Section Header */}
        <View style={styles.headerRow}>
          <View style={styles.titleGroup}>
            <View style={styles.iconBox}>
              <Feather
                name="book-open"
                size={18}
                color={FACULTY_COLORS.academicIconColor}
              />
            </View>
            <Text style={styles.sectionTitle}>Academic Position</Text>
          </View>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>REQUIRED</Text>
          </View>
        </View>

        {/* Field: Faculty */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>
            Faculty <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.selectorWrapper}
            onPress={() => setActiveSelector("faculty")}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Select Faculty"
          >
            <Feather
              name="book"
              size={18}
              color={FACULTY_COLORS.academicIconColor}
              style={styles.fieldIcon}
            />
            <Text
              style={[
                styles.selectorText,
                !formData.faculty && styles.placeholderText,
              ]}
              numberOfLines={1}
            >
              {formData.faculty || "Select Faculty"}
            </Text>
            <Feather
              name="chevron-down"
              size={18}
              color={FACULTY_COLORS.academicIconColor}
            />
          </TouchableOpacity>
        </View>

        {/* Field: Department */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>
            Department <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.selectorWrapper}
            onPress={() => setActiveSelector("department")}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Select Department"
          >
            <Feather
              name="home"
              size={18}
              color={FACULTY_COLORS.academicIconColor}
              style={styles.fieldIcon}
            />
            <Text
              style={[
                styles.selectorText,
                !formData.department && styles.placeholderText,
              ]}
              numberOfLines={1}
            >
              {formData.department || "Select Department"}
            </Text>
            <Feather
              name="chevron-down"
              size={18}
              color={FACULTY_COLORS.academicIconColor}
            />
          </TouchableOpacity>
          {!formData.faculty && (
            <Text style={styles.helperText}>Choose a faculty first</Text>
          )}
        </View>

        {/* Field: Designation */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>
            Designation <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.selectorWrapper}
            onPress={() => setActiveSelector("designation")}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Select Designation"
          >
            <Feather
              name="check-circle"
              size={18}
              color={FACULTY_COLORS.academicIconColor}
              style={styles.fieldIcon}
            />
            <Text
              style={[
                styles.selectorText,
                !formData.designation && styles.placeholderText,
              ]}
              numberOfLines={1}
            >
              {formData.designation || "Select Designation"}
            </Text>
            <Feather
              name="chevron-down"
              size={18}
              color={FACULTY_COLORS.academicIconColor}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: FACULTY_COLORS.academicCardBg,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: FACULTY_COLORS.academicCardBorder,
    padding: 20,
    marginTop: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  titleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: FACULTY_COLORS.academicIconBg,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: FACULTY_COLORS.textPrimary,
  },
  badge: {
    backgroundColor: FACULTY_COLORS.academicBadgeBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: FACULTY_COLORS.academicBadgeText,
    letterSpacing: 0.4,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: FACULTY_COLORS.textPrimary,
    marginBottom: 8,
  },
  requiredAsterisk: {
    color: FACULTY_COLORS.danger,
    fontWeight: "700",
  },
  selectorWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: FACULTY_COLORS.academicFieldBg,
    borderWidth: 1.5,
    borderColor: FACULTY_COLORS.academicFieldBorder,
    borderRadius: 14,
    height: 52,
    paddingHorizontal: 14,
  },
  fieldIcon: {
    marginRight: 10,
  },
  selectorText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: FACULTY_COLORS.textPrimary,
  },
  placeholderText: {
    color: FACULTY_COLORS.textMuted,
    fontWeight: "400",
  },
  helperText: {
    fontSize: 12,
    color: FACULTY_COLORS.academicHelperText,
    marginTop: 6,
    marginLeft: 2,
    fontWeight: "500",
  },
});
