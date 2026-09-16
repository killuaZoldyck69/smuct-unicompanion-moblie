import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { StudentProfileData } from "@/services/student-service";
import {
  PROFILE_COLORS,
  SECTION_THEMES,
  SPACING,
  fontFamily,
} from "../../constants";
import { splitOrdinal } from "../../utils";

interface StudentAcademicCardProps {
  profile: StudentProfileData;
  isEditing: boolean;
  currentSemester: string;
  section: string;
  onChangeSemester: (val: string) => void;
  onChangeSection: (val: string) => void;
}

export const StudentAcademicCard = React.memo(function StudentAcademicCard({
  profile,
  isEditing,
  currentSemester,
  section,
  onChangeSemester,
  onChangeSection,
}: StudentAcademicCardProps) {
  const theme = SECTION_THEMES.ACADEMIC;

  const semesterOrdinal = splitOrdinal(
    isEditing ? currentSemester : profile.currentSemester || "1"
  );
  const batchOrdinal = splitOrdinal(profile.batch || "26");

  return (
    <View style={styles.card}>
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionIconBadge}>
          <Feather name="award" size={14} color={theme.primaryText} />
        </View>
        <Text style={styles.sectionTitle}>ACADEMIC RECORD</Text>
      </View>

      <View style={styles.primaryList}>
        <View style={styles.fieldRow}>
          <View style={styles.fieldIcon}>
            <Feather name="layers" size={14} color={theme.primaryText} />
          </View>
          <View style={styles.fieldContent}>
            <Text style={styles.fieldLabel}>FACULTY</Text>
            <Text style={styles.fieldValuePrimary}>
              {profile.faculty || "Faculty of Creative Technology"}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.fieldRow}>
          <View style={styles.fieldIcon}>
            <Feather name="book" size={14} color={theme.primaryText} />
          </View>
          <View style={styles.fieldContent}>
            <Text style={styles.fieldLabel}>DEPARTMENT</Text>
            <Text style={styles.fieldValuePrimary}>
              {profile.department || "N/A"}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.fieldRow}>
          <View style={styles.fieldIcon}>
            <Feather name="compass" size={14} color={theme.primaryText} />
          </View>
          <View style={styles.fieldContent}>
            <Text style={styles.fieldLabel}>PROGRAM</Text>
            <Text style={styles.fieldValuePrimary}>
              {profile.program || "N/A"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.statTilesRow}>
        {/* Semester Tile */}
        <View style={[styles.statTile, isEditing && styles.statTileEditing]}>
          <Text style={styles.statTileLabel}>SEMESTER</Text>
          {isEditing ? (
            <View style={styles.statEditInputWrapper}>
              <TextInput
                style={styles.statEditInput}
                value={currentSemester}
                onChangeText={(text) => onChangeSemester(text.replace(/[^0-9]/g, ""))}
                keyboardType="number-pad"
                maxLength={2}
                placeholder="1"
                placeholderTextColor="#94a3b8"
                selectTextOnFocus={true}
                accessible={true}
                accessibilityLabel="Current Semester Input"
              />
            </View>
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
          <View style={styles.statTileLabelRow}>
            <Text style={styles.statTileLabel}>BATCH</Text>
            {isEditing && (
              <Feather
                name="lock"
                size={9}
                color={PROFILE_COLORS.subtleText}
                style={{ marginLeft: 3, marginBottom: 4 }}
              />
            )}
          </View>
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
            <View style={styles.statEditInputWrapper}>
              <TextInput
                style={styles.statEditInput}
                value={section}
                onChangeText={(text) => onChangeSection(text.toUpperCase())}
                autoCapitalize="characters"
                maxLength={4}
                placeholder="A"
                placeholderTextColor="#94a3b8"
                selectTextOnFocus={true}
                accessible={true}
                accessibilityLabel="Section Input"
              />
            </View>
          ) : (
            <Text style={styles.statNumber}>{profile.section || "A"}</Text>
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
    padding: SPACING.xl,
    marginBottom: SPACING.cardGap,
    borderWidth: 1,
    borderColor: SECTION_THEMES.ACADEMIC.badgeBorder,
    shadowColor: PROFILE_COLORS.deepNavy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: SPACING.md,
  },
  sectionIconBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: SECTION_THEMES.ACADEMIC.badgeBg,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: SECTION_THEMES.ACADEMIC.primaryText,
    letterSpacing: 0.8,
  },
  primaryList: {
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: "rgba(37, 99, 235, 0.08)",
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  fieldIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  fieldContent: {
    flex: 1,
  },
  fieldLabel: {
    fontFamily,
    fontSize: 10,
    fontWeight: "700",
    color: PROFILE_COLORS.subtleText,
    letterSpacing: 0.6,
  },
  fieldValuePrimary: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "700",
    color: PROFILE_COLORS.deepNavy,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(37, 99, 235, 0.06)",
    marginVertical: 4,
  },
  statTilesRow: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  statTile: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(37, 99, 235, 0.10)",
    minHeight: 78,
    overflow: "hidden",
  },
  statTileEditing: {
    backgroundColor: "#eff6ff",
    borderColor: "rgba(37, 99, 235, 0.32)",
  },
  statTileLabelRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statTileLabel: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: PROFILE_COLORS.subtleText,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  ordinalRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  statNumber: {
    fontFamily,
    fontSize: 21,
    fontWeight: "800",
    color: SECTION_THEMES.ACADEMIC.primaryText,
    letterSpacing: -0.3,
  },
  statSuffix: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: SECTION_THEMES.ACADEMIC.primaryText,
    marginTop: 2,
    marginLeft: 1,
  },
  statEditInputWrapper: {
    width: "100%",
    maxWidth: 58,
    height: 38,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: SECTION_THEMES.ACADEMIC.primaryText,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
    shadowColor: SECTION_THEMES.ACADEMIC.primaryText,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  statEditInput: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: SECTION_THEMES.ACADEMIC.primaryText,
    textAlign: "center",
    width: "100%",
    height: "100%",
    paddingVertical: 0,
    paddingHorizontal: 4,
    borderWidth: 0,
    backgroundColor: "transparent",
    outlineStyle: "none" as any,
  },
});
