import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { FACULTY_COLORS } from "../constants";
import { AddFacultyFormData, Qualification } from "../types";

interface AcademicProfileSectionProps {
  formData: AddFacultyFormData;
  updateField: <K extends keyof AddFacultyFormData>(
    field: K,
    value: AddFacultyFormData[K],
  ) => void;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean | ((prev: boolean) => boolean)) => void;
  onOpenExpertiseModal: () => void;
  onRemoveExpertise: (field: string) => void;
  onOpenQualModal: () => void;
  onRemoveQual: (id: string) => void;
  onFocusLink?: () => void;
  onBlurLink?: () => void;
}

export const AcademicProfileSection = React.memo(
  function AcademicProfileSection({
    formData,
    updateField,
    isExpanded,
    setIsExpanded,
    onOpenExpertiseModal,
    onRemoveExpertise,
    onOpenQualModal,
    onRemoveQual,
    onFocusLink,
    onBlurLink,
  }: AcademicProfileSectionProps) {
    return (
      <View style={styles.card}>
        {/* Section Header */}
        <TouchableOpacity
          style={styles.headerRow}
          onPress={() => setIsExpanded((prev) => !prev)}
          activeOpacity={0.7}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Toggle Academic profile section"
        >
          <View style={styles.titleGroup}>
            <View style={styles.iconBox}>
              <Feather
                name="file-text"
                size={18}
                color={FACULTY_COLORS.profileIconColor}
              />
            </View>
            <Text style={styles.sectionTitle}>Academic Profile</Text>
          </View>

          <View style={styles.headerRight}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>OPTIONAL</Text>
            </View>
            <Feather
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={18}
              color={FACULTY_COLORS.profileIconColor}
            />
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.contentContainer}>
            {/* 1. Expertise & Research */}
            <View style={styles.subSection}>
              <Text style={styles.subSectionTitle}>Expertise & Research</Text>
              <View style={styles.tagsContainer}>
                {formData.expertiseFields.map((field) => (
                  <View key={field} style={styles.tagChip}>
                    <Text style={styles.tagText}>{field}</Text>
                    <TouchableOpacity
                      onPress={() => onRemoveExpertise(field)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={`Remove expertise ${field}`}
                    >
                      <Feather
                        name="x"
                        size={13}
                        color={FACULTY_COLORS.profileIconColor}
                      />
                    </TouchableOpacity>
                  </View>
                ))}

                {/* Add Field Button */}
                <TouchableOpacity
                  style={styles.addTagButton}
                  onPress={onOpenExpertiseModal}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Add research field"
                >
                  <Text style={styles.addTagButtonText}>+ Add field</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 2. Qualifications */}
            <View style={styles.subSection}>
              <View style={styles.qualHeaderRow}>
                <Text style={styles.subSectionTitle}>Qualifications</Text>
                <TouchableOpacity
                  onPress={onOpenQualModal}
                  style={styles.addQualBtn}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Add qualification"
                >
                  <Feather
                    name="plus"
                    size={14}
                    color={FACULTY_COLORS.profileIconColor}
                  />
                  <Text style={styles.addQualBtnText}>Add</Text>
                </TouchableOpacity>
              </View>

              {formData.qualifications.length === 0 ? (
                <Text style={styles.emptyText}>
                  No qualifications added yet
                </Text>
              ) : (
                <View style={styles.qualList}>
                  {formData.qualifications.map((qual: Qualification) => (
                    <View key={qual.id} style={styles.qualCard}>
                      <View style={styles.qualBadge}>
                        {qual.degree ? (
                          <Text style={styles.qualBadgeText}>{qual.degree}</Text>
                        ) : (
                          <Feather
                            name="award"
                            size={18}
                            color={FACULTY_COLORS.qualBadgeText}
                          />
                        )}
                      </View>
                      <View style={styles.qualDetails}>
                        <Text style={styles.qualDegreeTitle} numberOfLines={1}>
                          {qual.field}
                        </Text>
                        <Text style={styles.qualInstitution} numberOfLines={1}>
                          {qual.institution}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => onRemoveQual(qual.id)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        style={styles.qualDeleteBtn}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel={`Remove qualification ${qual.field}`}
                      >
                        <Feather
                          name="x"
                          size={14}
                          color={FACULTY_COLORS.textMuted}
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* 3. Professional Links */}
            <View style={styles.subSection}>
              <Text style={styles.subSectionTitle}>Professional Links</Text>
              <View style={styles.linkInputWrapper}>
                <Feather
                  name="link-2"
                  size={18}
                  color={FACULTY_COLORS.linkIconColor}
                  style={styles.linkIcon}
                />
                <TextInput
                  style={styles.linkInput}
                  placeholder="linkedin.com/in/faculty-member"
                  placeholderTextColor={FACULTY_COLORS.textMuted}
                  value={formData.linkedInUrl}
                  onChangeText={(text) => updateField("linkedInUrl", text)}
                  autoCapitalize="none"
                  keyboardType="url"
                  onFocus={onFocusLink}
                  onBlur={onBlurLink}
                  accessible={true}
                  accessibilityLabel="LinkedIn profile URL"
                />
              </View>
            </View>
          </View>
        )}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: FACULTY_COLORS.profileCardBg,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: FACULTY_COLORS.profileCardBorder,
    padding: 20,
    marginTop: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    backgroundColor: FACULTY_COLORS.profileIconBg,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: FACULTY_COLORS.textPrimary,
  },
  headerRight: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  badge: {
    backgroundColor: FACULTY_COLORS.profileBadgeBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: "700",
    color: FACULTY_COLORS.profileBadgeText,
    letterSpacing: 0.4,
  },
  contentContainer: {
    marginTop: 8,
  },
  subSection: {
    marginTop: 12,
  },
  subSectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tagChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: FACULTY_COLORS.tagBg,
    borderWidth: 1.5,
    borderColor: FACULTY_COLORS.tagBorder,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "600",
    color: FACULTY_COLORS.tagText,
  },
  addTagButton: {
    backgroundColor: FACULTY_COLORS.addTagBg,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: FACULTY_COLORS.addTagBorder,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    justifyContent: "center",
  },
  addTagButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: FACULTY_COLORS.addTagText,
  },
  qualHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  addQualBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: FACULTY_COLORS.profileBadgeBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 6,
  },
  addQualBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: FACULTY_COLORS.profileIconColor,
  },
  emptyText: {
    fontSize: 13,
    color: FACULTY_COLORS.textMuted,
    fontStyle: "italic",
    marginVertical: 4,
  },
  qualList: {
    gap: 8,
  },
  qualCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: FACULTY_COLORS.qualCardBg,
    borderWidth: 1.5,
    borderColor: FACULTY_COLORS.qualCardBorder,
    borderRadius: 14,
    padding: 12,
    gap: 12,
  },
  qualBadge: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: FACULTY_COLORS.qualBadgeBg,
    alignItems: "center",
    justifyContent: "center",
  },
  qualBadgeText: {
    fontSize: 13,
    fontWeight: "800",
    color: FACULTY_COLORS.qualBadgeText,
  },
  qualDetails: {
    flex: 1,
  },
  qualDegreeTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E1B4B",
    marginBottom: 2,
  },
  qualInstitution: {
    fontSize: 12,
    color: FACULTY_COLORS.textSecondary,
  },
  qualDeleteBtn: {
    padding: 4,
  },
  linkInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: FACULTY_COLORS.linkFieldBg,
    borderWidth: 1.5,
    borderColor: FACULTY_COLORS.linkFieldBorder,
    borderRadius: 14,
    height: 50,
    paddingHorizontal: 14,
  },
  linkIcon: {
    marginRight: 10,
  },
  linkInput: {
    flex: 1,
    fontSize: 14,
    color: FACULTY_COLORS.textPrimary,
    paddingVertical: 0,
  },
});
