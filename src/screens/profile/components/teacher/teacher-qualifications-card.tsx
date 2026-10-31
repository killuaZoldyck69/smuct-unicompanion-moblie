import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import {
  PROFILE_COLORS,
  SECTION_THEMES,
  SPACING,
  fontFamily,
} from "../../constants";
import { sortQualificationEntries } from "@/utils/qualification-order";
import Svg, { Path } from "react-native-svg";

interface TeacherQualificationsCardProps {
  academicQualifications: Record<string, string>;
  isEditing: boolean;
  onAddQualification: (degree: string, inst: string) => void;
  onRemoveQualification: (degree: string) => void;
}

export const TeacherQualificationsCard = React.memo(
  function TeacherQualificationsCard({
    academicQualifications,
    isEditing,
    onAddQualification,
    onRemoveQualification,
  }: TeacherQualificationsCardProps) {
    const theme = SECTION_THEMES.ACADEMIC;
    const [degreeInput, setDegreeInput] = useState("");
    const [instInput, setInstInput] = useState("");

    const handleAddQualification = useCallback(() => {
      const d = degreeInput.trim();
      const i = instInput.trim();
      if (d && i) {
        onAddQualification(d, i);
        setDegreeInput("");
        setInstInput("");
      }
    }, [degreeInput, instInput, onAddQualification]);

    const qualEntries = React.useMemo(() => {
      return sortQualificationEntries(
        Object.entries(academicQualifications || {}),
      );
    }, [academicQualifications]);

    return (
      <View style={styles.card}>
        <View style={styles.watermarkContainer} pointerEvents="none">
          <View style={styles.watermarkGlow} />
          <Svg width={94} height={108} viewBox="0 0 94 108">
            <Path
              d="M22 8h34l24 24v62a6 6 0 0 1-6 6H22a6 6 0 0 1-6-6V14a6 6 0 0 1 6-6Z"
              fill="none"
              stroke="#6366f1"
              strokeWidth={8}
              strokeLinejoin="round"
              strokeLinecap="round"
              opacity={0.09}
            />
            <Path
              d="M56 10v22h22M32 58h34M32 73h34"
              fill="none"
              stroke="#6366f1"
              strokeWidth={7}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.08}
            />
          </Svg>
        </View>

        <View style={styles.sectionHeaderRow}>
          <View style={styles.headerLeft}>
            <View style={styles.sectionIconBadge}>
              <Ionicons name="school-outline" size={16} color={theme.primaryText} />
            </View>
            <Text style={styles.sectionTitle}>QUALIFICATIONS</Text>
          </View>
        </View>

        {isEditing && (
          <View style={styles.editContainer}>
            <TextInput
              style={styles.editInput}
              value={degreeInput}
              onChangeText={setDegreeInput}
              placeholder="Degree (e.g. B.Sc. in CSE)"
              placeholderTextColor={PROFILE_COLORS.mutedText}
              accessible={true}
              accessibilityLabel="Degree input"
            />
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.editInput, { flex: 1, marginBottom: 0 }]}
                value={instInput}
                onChangeText={setInstInput}
                placeholder="Institution Name"
                placeholderTextColor={PROFILE_COLORS.mutedText}
                returnKeyType="done"
                onSubmitEditing={handleAddQualification}
                accessible={true}
                accessibilityLabel="Institution input"
              />
              <TouchableOpacity
                onPress={handleAddQualification}
                style={styles.addBtn}
                activeOpacity={0.8}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Add qualification"
              >
                <Feather name="plus" size={15} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.timelineContainer}>
          <View style={styles.timelineTrack} />

          {qualEntries.length > 0 ? (
            qualEntries.map(([degree, inst], idx) => {
              const isLast = idx === qualEntries.length - 1;
              return (
                <View
                  key={idx}
                  style={[styles.timelineItem, isLast && { marginBottom: 0 }]}
                >
                  <View
                    style={[
                      styles.timelineDot,
                      idx === 0
                        ? styles.timelineDotPrimary
                        : idx === 1
                          ? styles.timelineDotSecondary
                          : styles.timelineDotMuted,
                    ]}
                  />
                  <View style={styles.fieldContent}>
                    <Text style={styles.degreeTitle}>{degree}</Text>
                    <Text style={styles.institutionSubtitle}>{inst}</Text>
                  </View>
                  {isEditing && (
                    <TouchableOpacity
                      onPress={() => onRemoveQualification(degree)}
                      style={styles.deleteBtn}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={`Remove qualification ${degree}`}
                    >
                      <Feather name="trash-2" size={14} color="#dc2626" />
                    </TouchableOpacity>
                  )}
                </View>
              );
            })
          ) : (
            <Text style={styles.emptyText}>No academic qualifications added yet.</Text>
          )}
        </View>
      </View>
    );
  }
);

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
    width: 98,
    height: 110,
    right: -2,
    bottom: -7,
    alignItems: "center",
    justifyContent: "center",
  },
  watermarkGlow: {
    position: "absolute",
    width: 96,
    height: 96,
    right: -12,
    bottom: -12,
    borderTopLeftRadius: 70,
    backgroundColor: "#f5f3ff",
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
  editContainer: {
    backgroundColor: "#f8fafc",
    padding: 10,
    borderRadius: 10,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: "rgba(37, 99, 235, 0.15)",
  },
  editInput: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "600",
    color: PROFILE_COLORS.deepNavy,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "rgba(19, 27, 46, 0.08)",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 6,
    outlineStyle: "none" as any,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  addBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: SECTION_THEMES.ACADEMIC.iconColor,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  timelineContainer: {
    position: "relative",
    paddingLeft: 10,
    zIndex: 1,
  },
  timelineTrack: {
    position: "absolute",
    left: 12,
    top: 6,
    bottom: 12,
    width: 1.5,
    backgroundColor: "rgba(19, 27, 46, 0.08)",
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 18,
    position: "relative",
  },
  timelineDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 6,
    marginRight: 16,
  },
  timelineDotPrimary: {
    backgroundColor: "#2563eb",
  },
  timelineDotSecondary: {
    backgroundColor: "#6366f1",
  },
  timelineDotMuted: {
    backgroundColor: "#cbd5e1",
  },
  fieldContent: {
    flex: 1,
  },
  degreeTitle: {
    fontFamily,
    fontSize: 14.5,
    fontWeight: "800",
    color: PROFILE_COLORS.deepNavy,
    lineHeight: 19,
    letterSpacing: -0.2,
  },
  fieldValuePrimary: {
    fontFamily,
    fontSize: 14,
    fontWeight: "600",
    color: PROFILE_COLORS.deepNavy,
    lineHeight: 18,
  },
  institutionSubtitle: {
    fontFamily,
    fontSize: 12,
    color: PROFILE_COLORS.subtleText,
    marginTop: 2,
  },
  deleteBtn: {
    padding: 4,
    marginLeft: 8,
  },
  emptyText: {
    fontFamily,
    fontSize: 13,
    color: PROFILE_COLORS.subtleText,
    fontStyle: "italic",
    paddingLeft: 4,
  },
});
