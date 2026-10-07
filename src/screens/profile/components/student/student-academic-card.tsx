import React from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { StudentProfileData } from "@/services/student-service";
import {
  PROFILE_COLORS,
  SECTION_THEMES,
  SPACING,
  fontFamily,
} from "../../constants";
import { splitOrdinal } from "../../utils";
import { CampusIllustration } from "../illustrations/campus-illustration";

interface StudentAcademicCardProps {
  profile: StudentProfileData;
  isEditing: boolean;
  currentSemester: string;
  section: string;
  currentTerm: string;
  onChangeSemester: (val: string) => void;
  onChangeSection: (val: string) => void;
  onChangeTerm: (val: string) => void;
}

export const StudentAcademicCard = React.memo(function StudentAcademicCard({
  profile,
  isEditing,
  currentSemester,
  section,
  currentTerm,
  onChangeSemester,
  onChangeSection,
  onChangeTerm,
}: StudentAcademicCardProps) {
  const theme = SECTION_THEMES.ACADEMIC;

  const semesterOrdinal = splitOrdinal(
    isEditing ? currentSemester : profile.currentSemester || "1"
  );
  const batchOrdinal = splitOrdinal(profile.batch || "26");

  return (
    <View style={styles.card}>
      <View style={styles.topSection}>
        {/* Background Campus Illustration Watermark */}
        <View style={styles.watermarkContainer} pointerEvents="none">
          <CampusIllustration width={150} height={130} opacity={0.12} color={theme.primaryText} />
        </View>

        <View style={styles.sectionHeaderRow}>
          <View style={styles.headerLeft}>
            <View style={styles.sectionIconBadge}>
              <Ionicons name="school-outline" size={16} color={theme.primaryText} />
            </View>
            <Text style={styles.sectionTitle}>ACADEMIC RECORD</Text>
          </View>
        </View>

        <View style={styles.timelineContainer}>
          <View style={styles.timelineTrack} />

          <View style={styles.timelineItem}>
            <View style={styles.timelineDot} />
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>DEPARTMENT</Text>
              <Text style={styles.fieldValuePrimary} numberOfLines={1}>
                {profile.department || "Computer Science and Engineering"}
              </Text>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <View style={styles.timelineDot} />
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>PROGRAM</Text>
              <Text style={styles.fieldValuePrimary} numberOfLines={2}>
                {profile.program || "B.Sc. (Hons) in Computer Science and Engineering"}
              </Text>
            </View>
          </View>

          <View style={[styles.timelineItem, { marginBottom: 0 }]}>
            <View style={styles.timelineDot} />
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>CURRENT TERM / OFFER</Text>
              {isEditing ? (
                <TextInput
                  style={styles.termEditInput}
                  value={currentTerm}
                  onChangeText={onChangeTerm}
                  placeholder="e.g. Fall 2026"
                  placeholderTextColor={PROFILE_COLORS.mutedText}
                  autoCapitalize="words"
                  accessible={true}
                  accessibilityLabel="Current Term Input"
                />
              ) : (
                <Text style={styles.fieldValuePrimary}>
                  {profile.currentTerm || "Fall 2026"}
                </Text>
              )}
            </View>
          </View>
        </View>
      </View>

      <View style={styles.statTilesRow}>
        {/* Semester Tile */}
        <View style={[styles.statTile, isEditing && styles.statTileEditing]}>
          <Text style={styles.statTileLabel}>SEMESTER</Text>
          {isEditing ? (
            <TextInput
              style={styles.statEditInput}
              value={currentSemester}
              onChangeText={(text) => onChangeSemester(text.replace(/[^0-9]/g, ""))}
              keyboardType="number-pad"
              maxLength={2}
              placeholder="1"
              placeholderTextColor={PROFILE_COLORS.mutedText}
              selectTextOnFocus={true}
              textAlign="center"
            />
          ) : (
            <View style={styles.ordinalRow}>
              <Text style={styles.statNumber}>{semesterOrdinal.number}</Text>
              {semesterOrdinal.suffix ? (
                <Text style={styles.statSuffix}>{semesterOrdinal.suffix}</Text>
              ) : null}
            </View>
          )}
        </View>

        {/* Batch Tile (Read-Only) */}
        <View style={styles.statTile}>
          <Text style={styles.statTileLabel}>BATCH</Text>
          <View style={styles.ordinalRow}>
            <Text style={styles.statNumber}>{batchOrdinal.number}</Text>
            {batchOrdinal.suffix ? (
              <Text style={styles.statSuffix}>{batchOrdinal.suffix}</Text>
            ) : null}
          </View>
        </View>

        {/* Section Tile */}
        <View style={[styles.statTile, isEditing && styles.statTileEditing]}>
          <Text style={styles.statTileLabel}>SECTION</Text>
          {isEditing ? (
            <TextInput
              style={styles.statEditInput}
              value={section}
              onChangeText={(text) => onChangeSection(text.toUpperCase())}
              autoCapitalize="characters"
              maxLength={4}
              placeholder="A"
              placeholderTextColor={PROFILE_COLORS.mutedText}
              selectTextOnFocus={true}
              textAlign="center"
            />
          ) : (
            <Text style={styles.statNumber}>{profile.section || "B"}</Text>
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
  },
  topSection: {
    position: "relative",
    paddingBottom: SPACING.lg,
    overflow: "hidden", // contains the watermark
    marginHorizontal: -SPACING.lg, // negate padding to let watermark bleed
    paddingHorizontal: SPACING.lg,
  },
  watermarkContainer: {
    position: "absolute",
    right: 0,
    bottom: -10,
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

  timelineContainer: {
    position: "relative",
    paddingLeft: 10,
    zIndex: 1,
  },
  timelineTrack: {
    position: "absolute",
    left: 12, // centers line under the dot
    top: 6,
    bottom: 12,
    width: 1.5,
    backgroundColor: "rgba(19, 27, 46, 0.08)",
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: 20,
    position: "relative",
  },
  timelineDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "rgba(19, 27, 46, 0.2)",
    marginTop: 6,
    marginRight: 16,
    marginLeft: 0,
  },
  fieldContent: {
    flex: 1,
  },
  fieldLabel: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: PROFILE_COLORS.mutedText,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  fieldValuePrimary: {
    fontFamily,
    fontSize: 14,
    fontWeight: "600",
    color: PROFILE_COLORS.deepNavy,
    lineHeight: 18,
  },
  termEditInput: {
    fontFamily,
    fontSize: 14,
    fontWeight: "600",
    color: PROFILE_COLORS.deepNavy,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "rgba(37, 99, 235, 0.15)",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 2,
  },
  statTilesRow: {
    flexDirection: "row",
    gap: SPACING.xs,
    paddingTop: SPACING.sm,
  },
  statTile: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "rgba(19, 27, 46, 0.05)",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  statTileEditing: {
    backgroundColor: "#eff6ff",
    borderColor: "rgba(37, 99, 235, 0.2)",
  },
  statTileLabel: {
    fontFamily,
    fontSize: 10,
    fontWeight: "700",
    color: PROFILE_COLORS.subtleText,
    letterSpacing: 0.5,
  },
  ordinalRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
  },
  statNumber: {
    fontFamily,
    fontSize: 18,
    fontWeight: "700",
    color: SECTION_THEMES.ACADEMIC.primaryText,
    letterSpacing: -0.3,
  },
  statSuffix: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: SECTION_THEMES.ACADEMIC.primaryText,
    marginTop: 1,
    marginLeft: 1,
  },
  statEditInput: {
    fontFamily,
    fontSize: 18,
    fontWeight: "700",
    color: SECTION_THEMES.ACADEMIC.primaryText,
    padding: 0,
    margin: 0,
  },
});
