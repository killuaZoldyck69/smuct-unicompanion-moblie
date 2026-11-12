import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/theme/colors";
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

        <View style={styles.programPanel}>
          <Text style={styles.programValue}>
            {profile.program || "B.Sc. (Hons) in Computer Science and Engineering"}
          </Text>
          <View style={styles.departmentRow}>
            <View style={styles.departmentDot} />
            <Text style={styles.departmentValue}>
              Department of {profile.department || "Computer Science and Engineering"}
            </Text>
          </View>
        </View>

        <View style={styles.termRow}>
          <Text style={styles.termLabel}>Current Term</Text>
          {isEditing ? (
            <TextInput
              style={styles.termEditInput}
              value={currentTerm}
              onChangeText={onChangeTerm}
              placeholder="e.g. Fall 2026"
              placeholderTextColor={PROFILE_COLORS.mutedText}
              autoCapitalize="words"
              accessibilityLabel="Current Term Input"
            />
          ) : (
            <Text style={styles.termValue}>{profile.currentTerm || "Fall 2026"}</Text>
          )}
        </View>
      </View>

      <View style={styles.statTilesRow}>
        {/* Semester Tile */}
        <View style={[styles.statTile, styles.semesterTile, isEditing && styles.statTileEditing]}>
          <Text style={[styles.statTileLabel, styles.semesterLabel]}>SEMESTER</Text>
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
        <View style={[styles.statTile, styles.batchTile]}>
          <Text style={[styles.statTileLabel, styles.batchLabel]}>BATCH</Text>
          <View style={styles.ordinalRow}>
            <Text style={[styles.statNumber, styles.batchNumber]}>{batchOrdinal.number}</Text>
            {batchOrdinal.suffix ? (
              <Text style={[styles.statSuffix, styles.batchNumber]}>{batchOrdinal.suffix}</Text>
            ) : null}
          </View>
        </View>

        {/* Section Tile */}
        <View style={[styles.statTile, styles.sectionTile, isEditing && styles.statTileEditing]}>
          <Text style={[styles.statTileLabel, styles.sectionLabel]}>SECTION</Text>
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
            <Text style={[styles.statNumber, styles.sectionNumber]}>{profile.section || "B"}</Text>
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
    borderColor: colors.blackAlpha02,
    padding: SPACING.lg,
  },
  topSection: {
    position: "relative",
    paddingBottom: SPACING.md,
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
    marginBottom: SPACING.md,
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

  programPanel: {
    backgroundColor: colors.slate50,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.softNeutralSurface,
    paddingHorizontal: 15,
    paddingVertical: 14,
    zIndex: 1,
  },
  programValue: {
    fontFamily,
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 20,
    color: PROFILE_COLORS.deepNavy,
    marginBottom: 7,
  },
  departmentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  departmentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.slate400,
  },
  departmentValue: {
    fontFamily,
    flex: 1,
    fontSize: 12,
    fontWeight: "500",
    color: PROFILE_COLORS.subtleText,
    lineHeight: 17,
  },
  termRow: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.coolTint,
    paddingHorizontal: 14,
    marginTop: SPACING.md,
    zIndex: 1,
  },
  termLabel: {
    fontFamily,
    fontSize: 12,
    fontWeight: "500",
    color: PROFILE_COLORS.subtleText,
  },
  termValue: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: colors.semantic.emerald.darker,
    backgroundColor: colors.semantic.emerald.tint,
    borderColor: colors.semantic.emerald.mintBorderStrong,
    borderWidth: 1,
    borderRadius: 999,
    overflow: "hidden",
    paddingHorizontal: 13,
    paddingVertical: 5,
  },
  termEditInput: {
    minWidth: 110,
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: PROFILE_COLORS.deepNavy,
    backgroundColor: colors.slate50,
    borderWidth: 1,
    borderColor: colors.semantic.blue.alpha15,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    textAlign: "right",
  },
  statTilesRow: {
    flexDirection: "row",
    gap: SPACING.md,
    paddingTop: SPACING.sm,
  },
  statTile: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: colors.white,
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: colors.navyAlpha05,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  statTileEditing: {
    backgroundColor: colors.semantic.blue.tint,
    borderColor: colors.semantic.blue.alpha20,
  },
  semesterTile: {
    backgroundColor: colors.semantic.indigo.tint,
    borderColor: colors.semantic.blue.softAlt,
  },
  batchTile: {
    backgroundColor: colors.semantic.emerald.tint,
    borderColor: colors.semantic.emerald.mintBorderSoft,
  },
  sectionTile: {
    backgroundColor: colors.semantic.amber.tint,
    borderColor: colors.semantic.amber.softBorder,
  },
  statTileLabel: {
    fontFamily,
    fontSize: 10,
    fontWeight: "700",
    color: PROFILE_COLORS.subtleText,
    letterSpacing: 0.5,
  },
  semesterLabel: { color: colors.semantic.indigo.soft },
  batchLabel: { color: colors.semantic.emerald.accent },
  sectionLabel: { color: colors.semantic.amber.accent },
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
  batchNumber: { color: colors.semantic.emerald.darker },
  sectionNumber: { color: colors.semantic.amber.deep },
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
