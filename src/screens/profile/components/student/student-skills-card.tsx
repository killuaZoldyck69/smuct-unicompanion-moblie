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
      <View style={styles.sectionHeaderRow}>
        <View style={[styles.sectionIconBadge, { backgroundColor: theme.badgeBg }]}>
          <Feather name="code" size={14} color={theme.primaryText} />
        </View>
        <Text style={[styles.sectionTitle, { color: theme.primaryText }]}>
          PROFESSIONAL SKILLS
        </Text>
      </View>

      {isEditing && (
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={inputValue}
            onChangeText={setInputValue}
            placeholder="Add a skill (e.g. React Native, UI/UX)..."
            placeholderTextColor={PROFILE_COLORS.mutedText}
            returnKeyType="done"
            onSubmitEditing={handleAdd}
            accessible={true}
            accessibilityLabel="Add skill text input"
          />
          <TouchableOpacity
            onPress={handleAdd}
            style={styles.addBtn}
            activeOpacity={0.8}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Add skill button"
          >
            <Feather name="plus" size={15} color="#ffffff" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.chipContainer}>
        {skills.length > 0 ? (
          skills.map((skill, idx) => (
            <View key={idx} style={styles.chip}>
              <Text style={styles.chipText}>{skill}</Text>
              {isEditing && (
                <TouchableOpacity
                  onPress={() => onRemoveSkill(skill)}
                  style={{ marginLeft: 6 }}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove skill ${skill}`}
                >
                  <Feather name="x" size={13} color={theme.chipText} />
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
    backgroundColor: PROFILE_COLORS.white,
    borderRadius: PROFILE_COLORS.cardRadius,
    padding: SPACING.xl,
    marginBottom: SPACING.cardGap,
    borderWidth: 1,
    borderColor: SECTION_THEMES.SKILLS.badgeBorder,
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
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
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
  emptyText: {
    fontFamily,
    fontSize: 13,
    color: PROFILE_COLORS.mutedText,
  },
});
