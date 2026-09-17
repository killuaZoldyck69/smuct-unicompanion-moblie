import React, { memo } from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ONBOARD_COLORS, MAX_SECTION_LENGTH } from "../constants";

interface OnboardClassBoxProps {
  currentSemester: string;
  onChangeSemester: (text: string) => void;
  section: string;
  onChangeSection: (text: string) => void;
  batch: string;
  onChangeBatch: (text: string) => void;
}

export const OnboardClassBox = memo(function OnboardClassBox({
  currentSemester,
  onChangeSemester,
  section,
  onChangeSection,
  batch,
  onChangeBatch,
}: OnboardClassBoxProps) {
  return (
    <View style={styles.bentoBox}>
      <View style={styles.row}>
        <View style={[styles.inputWrapper, styles.halfFlex]}>
          <Feather
            name="calendar"
            size={20}
            color={ONBOARD_COLORS.placeholderText}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Semester"
            placeholderTextColor={ONBOARD_COLORS.placeholderText}
            keyboardType="number-pad"
            maxLength={2}
            value={currentSemester}
            onChangeText={onChangeSemester}
            accessible={true}
            accessibilityLabel="Current Semester (1 to 12)"
          />
        </View>

        <View style={[styles.inputWrapper, styles.halfFlex]}>
          <Feather
            name="grid"
            size={20}
            color={ONBOARD_COLORS.placeholderText}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Section"
            placeholderTextColor={ONBOARD_COLORS.placeholderText}
            autoCapitalize="characters"
            maxLength={MAX_SECTION_LENGTH}
            value={section}
            onChangeText={onChangeSection}
            accessible={true}
            accessibilityLabel="Class Section"
          />
        </View>
      </View>

      <View style={styles.inputWrapper}>
        <Feather
          name="users"
          size={20}
          color={ONBOARD_COLORS.placeholderText}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder="Batch"
          placeholderTextColor={ONBOARD_COLORS.placeholderText}
          value={batch}
          onChangeText={onChangeBatch}
          accessible={true}
          accessibilityLabel="Academic Batch"
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  bentoBox: {
    width: "100%",
    borderRadius: 32,
    padding: 24,
    marginBottom: 16,
    gap: 16,
    backgroundColor: ONBOARD_COLORS.mintBox,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfFlex: {
    flex: 1,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: ONBOARD_COLORS.white,
    borderRadius: 9999,
    paddingHorizontal: 20,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: ONBOARD_COLORS.neutralText,
    height: "100%",
  },
});
