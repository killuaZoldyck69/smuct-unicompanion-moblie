import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import {
  PROFILE_COLORS,
  SECTION_THEMES,
  SPACING,
  fontFamily,
} from "../../constants";

interface TeacherCredentialsCardProps {
  expertiseFields: string[];
  academicQualifications: Record<string, string>;
  isEditing: boolean;
  onAddExpertise: (field: string) => void;
  onRemoveExpertise: (field: string) => void;
  onAddQualification: (degree: string, inst: string) => void;
  onRemoveQualification: (degree: string) => void;
}

export const TeacherCredentialsCard = React.memo(function TeacherCredentialsCard({
  expertiseFields,
  academicQualifications,
  isEditing,
  onAddExpertise,
  onRemoveExpertise,
  onAddQualification,
  onRemoveQualification,
}: TeacherCredentialsCardProps) {
  const [expertiseInput, setExpertiseInput] = useState("");
  const [degreeInput, setDegreeInput] = useState("");
  const [instInput, setInstInput] = useState("");

  const handleAddExpertise = useCallback(() => {
    const trimmed = expertiseInput.trim();
    if (trimmed) {
      onAddExpertise(trimmed);
      setExpertiseInput("");
    }
  }, [expertiseInput, onAddExpertise]);

  const handleAddQualification = useCallback(() => {
    const d = degreeInput.trim();
    const i = instInput.trim();
    if (d && i) {
      onAddQualification(d, i);
      setDegreeInput("");
      setInstInput("");
    }
  }, [degreeInput, instInput, onAddQualification]);

  const qualEntries = Object.entries(academicQualifications);

  return (
    <View style={styles.card}>
      {/* 1. Professional Expertise Sub-Section */}
      <View style={styles.sectionHeaderRow}>
        <View style={styles.headerIconBadge}>
          <Feather name="code" size={14} color={SECTION_THEMES.SKILLS.primaryText} />
        </View>
        <Text style={styles.sectionTitle}>PROFESSIONAL EXPERTISE</Text>
      </View>

      {isEditing && (
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={expertiseInput}
            onChangeText={setExpertiseInput}
            placeholder="Add expertise (e.g. Data Structures, ML)..."
            placeholderTextColor={PROFILE_COLORS.mutedText}
            returnKeyType="done"
            onSubmitEditing={handleAddExpertise}
            accessible={true}
            accessibilityLabel="Add expertise input"
          />
          <TouchableOpacity
            onPress={handleAddExpertise}
            style={styles.addBtn}
            activeOpacity={0.8}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Add expertise button"
          >
            <Feather name="plus" size={15} color="#ffffff" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.chipContainer}>
        {expertiseFields.length > 0 ? (
          expertiseFields.map((field, idx) => (
            <View key={idx} style={styles.chip}>
              <Text style={styles.chipText}>{field}</Text>
              {isEditing && (
                <TouchableOpacity
                  onPress={() => onRemoveExpertise(field)}
                  style={{ marginLeft: 6 }}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove expertise ${field}`}
                >
                  <Feather name="x" size={13} color={SECTION_THEMES.SKILLS.chipText} />
                </TouchableOpacity>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No expertise areas added yet.</Text>
        )}
      </View>

      <View style={styles.divider} />

      {/* 2. Academic Qualifications Sub-Section */}
      <View style={styles.sectionHeaderRow}>
        <View style={[styles.headerIconBadge, { backgroundColor: "#e0e7ff" }]}>
          <Feather name="book-open" size={14} color="#4338ca" />
        </View>
        <Text style={[styles.sectionTitle, { color: "#3730a3" }]}>
          QUALIFICATIONS
        </Text>
      </View>

      {isEditing && (
        <View style={styles.qualInputContainer}>
          <TextInput
            style={[styles.input, styles.qualInput]}
            value={degreeInput}
            onChangeText={setDegreeInput}
            placeholder="Degree (e.g. B.Sc. in CSE)"
            placeholderTextColor={PROFILE_COLORS.mutedText}
            accessible={true}
            accessibilityLabel="Degree input"
          />
          <View style={styles.qualRowInput}>
            <TextInput
              style={[styles.input, styles.qualInput, { flex: 1, marginBottom: 0 }]}
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
              style={[styles.addBtn, { marginLeft: 8, backgroundColor: "#4f46e5" }]}
              activeOpacity={0.8}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Add qualification button"
            >
              <Feather name="plus" size={15} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.qualList}>
        {qualEntries.length > 0 ? (
          qualEntries.map(([degree, inst], idx) => (
            <View key={idx} style={styles.qualItem}>
              <View style={styles.qualDot} />
              <View style={styles.qualContent}>
                <Text style={styles.qualDegree}>{degree}</Text>
                <Text style={styles.qualInst}>{inst}</Text>
              </View>
              {isEditing && (
                <TouchableOpacity
                  onPress={() => onRemoveQualification(degree)}
                  style={styles.deleteBtn}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove qualification ${degree}`}
                >
                  <Feather name="trash-2" size={15} color="#dc2626" />
                </TouchableOpacity>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No qualifications added yet.</Text>
        )}
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
    borderColor: PROFILE_COLORS.border,
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
  headerIconBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: SECTION_THEMES.SKILLS.badgeBg,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: SECTION_THEMES.SKILLS.primaryText,
    letterSpacing: 0.8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: PROFILE_COLORS.pillRadius,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: SECTION_THEMES.SKILLS.chipBorder,
  },
  input: {
    flex: 1,
    fontFamily,
    fontSize: 13,
    color: PROFILE_COLORS.neutralText,
    padding: 0,
    outlineStyle: "none" as any,
  },
  addBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: SECTION_THEMES.SKILLS.addBtnBg,
    alignItems: "center",
    justifyContent: "center",
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: PROFILE_COLORS.pillRadius,
    borderWidth: 1,
    borderColor: SECTION_THEMES.SKILLS.chipBorder,
  },
  chipText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: SECTION_THEMES.SKILLS.chipText,
  },
  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginVertical: SPACING.lg,
  },
  qualInputContainer: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 10,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  qualInput: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 8,
  },
  qualRowInput: {
    flexDirection: "row",
    alignItems: "center",
  },
  qualList: {
    gap: 8,
  },
  qualItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  qualDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4f46e5",
    marginRight: 10,
  },
  qualContent: {
    flex: 1,
  },
  qualDegree: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "700",
    color: PROFILE_COLORS.deepNavy,
  },
  qualInst: {
    fontFamily,
    fontSize: 12,
    color: PROFILE_COLORS.subtleText,
  },
  deleteBtn: {
    padding: 4,
    marginLeft: 8,
  },
  emptyText: {
    fontFamily,
    fontSize: 13,
    color: PROFILE_COLORS.mutedText,
  },
});
