import React, { useState, useCallback } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import {
  PROFILE_COLORS,
  SECTION_THEMES,
  SPACING,
  fontFamily,
} from "../../constants";
import { SkillsIllustration } from "../illustrations/skills-illustration";

interface StudentSkillsCardProps {
  skills: string[];
  isEditing: boolean;
  onAddSkill: (skill: string) => void;
  onRemoveSkill: (skill: string) => void;
}

export const StudentSkillsCard = React.memo(function StudentSkillsCard({
  skills,
  isEditing,
  onAddSkill,
  onRemoveSkill,
}: StudentSkillsCardProps) {
  const theme = SECTION_THEMES.SKILLS;
  const [inputValue, setInputValue] = useState("");

  const handleAdd = useCallback(() => {
    const trimmed = inputValue.trim();
    if (trimmed) {
      onAddSkill(trimmed);
      setInputValue("");
    }
  }, [inputValue, onAddSkill]);
  
  return (
    <View style={styles.card}>
      <View style={styles.watermarkContainer} pointerEvents="none">
        <SkillsIllustration width={120} height={100} opacity={0.12} color={theme.primaryText} />
      </View>

      <View style={styles.sectionHeaderRow}>
        <View style={styles.headerLeft}>
          <View style={styles.sectionIconBadge}>
            <Feather name="code" size={15} color={theme.primaryText} />
          </View>
          <Text style={styles.sectionTitle}>PROFESSIONAL SKILLS</Text>
        </View>
      </View>

      {isEditing && (
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={inputValue}
            onChangeText={setInputValue}
            placeholder="Add a skill..."
            placeholderTextColor={PROFILE_COLORS.mutedText}
            returnKeyType="done"
            onSubmitEditing={handleAdd}
            accessible={true}
          />
          <TouchableOpacity onPress={handleAdd} style={styles.addBtn} activeOpacity={0.8}>
            <Feather name="plus" size={15} color="#ffffff" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.chipContainer}>
        {skills.length > 0 ? (
          skills.map((skill, idx) => (
            <View
              key={idx}
              style={[
                styles.chip,
                idx % 3 === 0
                  ? styles.blueChip
                  : idx % 3 === 1
                    ? styles.greenChip
                    : styles.indigoChip,
              ]}
            >
              <View
                style={[
                  styles.chipDot,
                  idx % 3 === 0
                    ? styles.blueDot
                    : idx % 3 === 1
                      ? styles.greenDot
                      : styles.indigoDot,
                ]}
              />
              <Text
                style={[
                  styles.chipText,
                  idx % 3 === 0
                    ? styles.blueChipText
                    : idx % 3 === 1
                      ? styles.greenChipText
                      : styles.indigoChipText,
                ]}
              >
                {skill}
              </Text>
              {isEditing && (
                <TouchableOpacity onPress={() => onRemoveSkill(skill)} style={{ marginLeft: 6 }}>
                  <Feather name="x" size={13} color={theme.primaryText} />
                </TouchableOpacity>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No skills added yet.</Text>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fbfffd",
    borderRadius: PROFILE_COLORS.cardRadius,
    marginBottom: SPACING.cardGap,
    shadowColor: PROFILE_COLORS.deepNavy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#d1fae5",
    padding: SPACING.lg,
    position: "relative",
    overflow: "hidden",
  },
  watermarkContainer: {
    position: "absolute",
    right: -14,
    bottom: -30,
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
    backgroundColor: SECTION_THEMES.SKILLS.badgeBg,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
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
    borderColor: "rgba(16, 185, 129, 0.15)",
    zIndex: 1,
  },
  input: {
    flex: 1,
    fontFamily,
    fontSize: 14,
    color: PROFILE_COLORS.deepNavy,
    padding: 0,
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
    zIndex: 1,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  blueChip: {
    backgroundColor: "#f0f9ff",
    borderColor: "#dbeafe",
  },
  greenChip: {
    backgroundColor: "#ecfdf5",
    borderColor: "#c5f3df",
  },
  indigoChip: {
    backgroundColor: "#eef2ff",
    borderColor: "#dbe4ff",
  },
  chipDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  blueDot: { backgroundColor: "#22d3ee" },
  greenDot: { backgroundColor: "#10b981" },
  indigoDot: { backgroundColor: "#6366f1" },
  blueChipText: { color: "#0369a1" },
  greenChipText: { color: "#047857" },
  indigoChipText: { color: "#3730a3" },
  chipText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
  },
  emptyText: {
    fontFamily,
    fontSize: 14,
    color: PROFILE_COLORS.subtleText,
    fontStyle: "italic",
  },
});
