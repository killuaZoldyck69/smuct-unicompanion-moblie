import React, { memo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { ONBOARD_COLORS } from "../constants";

interface OnboardAcademicBoxProps {
  studentId: string;
  onChangeStudentId: (text: string) => void;
  program: string;
  onOpenProgramModal: () => void;
}

export const OnboardAcademicBox = memo(function OnboardAcademicBox({
  studentId,
  onChangeStudentId,
  program,
  onOpenProgramModal,
}: OnboardAcademicBoxProps) {
  return (
    <View style={styles.bentoBox}>
      <View style={styles.inputWrapper}>
        <Feather
          name="hash"
          size={20}
          color={ONBOARD_COLORS.placeholderText}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder="Student ID"
          placeholderTextColor={ONBOARD_COLORS.placeholderText}
          keyboardType="number-pad"
          value={studentId}
          onChangeText={onChangeStudentId}
          accessible={true}
          accessibilityLabel="Student ID"
        />
      </View>

      <TouchableOpacity
        style={styles.inputWrapper}
        onPress={onOpenProgramModal}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Academic Program: ${program || "Not selected"}`}
        activeOpacity={0.7}
      >
        <Feather
          name="book"
          size={20}
          color={ONBOARD_COLORS.placeholderText}
          style={styles.inputIcon}
        />
        <Text
          style={[
            styles.dropdownText,
            !program && { color: ONBOARD_COLORS.placeholderText },
          ]}
          numberOfLines={1}
        >
          {program || "Academic Program"}
        </Text>
        <Feather
          name="chevron-down"
          size={20}
          color={ONBOARD_COLORS.placeholderText}
        />
      </TouchableOpacity>
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
    backgroundColor: ONBOARD_COLORS.blueBox,
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
  dropdownText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: ONBOARD_COLORS.neutralText,
  },
});
