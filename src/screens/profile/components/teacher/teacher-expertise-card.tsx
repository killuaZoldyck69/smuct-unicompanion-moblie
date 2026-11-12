import React, { useState, useCallback } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import Svg, { Circle, Path } from "react-native-svg";
import { colors } from "@/theme/colors";
import {
  PROFILE_COLORS,
  SECTION_THEMES,
  SPACING,
  fontFamily,
} from "../../constants";


interface TeacherExpertiseCardProps {
  expertiseFields: string[];
  isEditing: boolean;
  onAddExpertise: (field: string) => void;
  onRemoveExpertise: (field: string) => void;
}

export const TeacherExpertiseCard = React.memo(function TeacherExpertiseCard({
  expertiseFields,
  isEditing,
  onAddExpertise,
  onRemoveExpertise,
}: TeacherExpertiseCardProps) {
  const theme = SECTION_THEMES.SKILLS;
  const [inputValue, setInputValue] = useState("");

  const handleAdd = useCallback(() => {
    const trimmed = inputValue.trim();
    if (trimmed) {
      onAddExpertise(trimmed);
      setInputValue("");
    }
  }, [inputValue, onAddExpertise]);

  return (
    <View style={styles.card}>
      <View style={styles.watermarkContainer} pointerEvents="none">
        <View style={styles.watermarkGlow} />
        <Svg width={112} height={88} viewBox="0 0 112 88">
          <Path
            d="M37 20 13 43l24 22M75 13 57 74M83 20l24 23-24 22"
            fill="none"
            stroke={colors.semantic.teal.light}
            strokeWidth={8}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.1}
          />
          <Circle cx={99} cy={12} r={5} fill={colors.semantic.teal.light} opacity={0.1} />
          <Circle cx={105} cy={76} r={5} fill={colors.semantic.teal.light} opacity={0.1} />
        </Svg>
      </View>

      <View style={styles.sectionHeaderRow}>
        <View style={styles.headerLeft}>
          <View style={styles.sectionIconBadge}>
            <Feather name="code" size={15} color={theme.primaryText} />
          </View>
          <Text style={styles.sectionTitle}>PROFESSIONAL EXPERTISE</Text>
        </View>
      </View>

      {isEditing && (
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={inputValue}
            onChangeText={setInputValue}
            placeholder="Add expertise (e.g. Data Structure)..."
            placeholderTextColor={PROFILE_COLORS.mutedText}
            returnKeyType="done"
            onSubmitEditing={handleAdd}
            accessible={true}
          />
          <TouchableOpacity onPress={handleAdd} style={styles.addBtn} activeOpacity={0.8}>
            <Feather name="plus" size={15} color={colors.white} />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.chipContainer}>
        {expertiseFields.length > 0 ? (
          expertiseFields.map((field, idx) => (
            <View key={idx} style={styles.chip}>
              <Text style={styles.chipText}>{field}</Text>
              {isEditing && (
                <TouchableOpacity onPress={() => onRemoveExpertise(field)} style={{ marginLeft: 6 }}>
                  <Feather name="x" size={13} color={theme.primaryText} />
                </TouchableOpacity>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No expertise fields added yet.</Text>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: PROFILE_COLORS.white,
    borderRadius: PROFILE_COLORS.cardRadius,
    marginBottom: SPACING.cardGap,
    borderWidth: 1,
    borderColor: PROFILE_COLORS.subtleBorder,
    ...PROFILE_COLORS.shadow,
    padding: SPACING.lg,
    position: "relative",
    overflow: "hidden",
  },
  watermarkContainer: {
    position: "absolute",
    width: 116,
    height: 92,
    right: -2,
    bottom: -3,
    zIndex: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  watermarkGlow: {
    position: "absolute",
    width: 100,
    height: 88,
    right: -12,
    bottom: -10,
    borderTopLeftRadius: 70,
    backgroundColor: colors.semantic.teal.tint,
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
    backgroundColor: colors.slate50,
    borderRadius: PROFILE_COLORS.pillRadius,
    paddingHorizontal: 12,
    paddingVertical: 4,
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
    backgroundColor: SECTION_THEMES.SKILLS.chipBg,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: PROFILE_COLORS.pillRadius,
    borderWidth: 1,
    borderColor: SECTION_THEMES.SKILLS.chipBorder,
  },
  chipText: {
    fontFamily,
    fontSize: 12.5,
    fontWeight: "700",
    color: SECTION_THEMES.SKILLS.chipText,
  },
  emptyText: {
    fontFamily,
    fontSize: 13,
    color: PROFILE_COLORS.subtleText,
    fontStyle: "italic",
  },
});
