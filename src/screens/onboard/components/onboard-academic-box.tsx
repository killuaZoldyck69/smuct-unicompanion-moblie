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
  hasStudentIdError?: boolean;
  program: string;
  onOpenProgramModal: () => void;
  hasProgramError?: boolean;
  batch: string;
  onChangeBatch: (text: string) => void;
  hasBatchError?: boolean;
}

export const OnboardAcademicBox = memo(function OnboardAcademicBox({
  studentId,
  onChangeStudentId,
  hasStudentIdError,
  program,
  onOpenProgramModal,
  hasProgramError,
  batch,
  onChangeBatch,
  hasBatchError,
}: OnboardAcademicBoxProps) {
  return (
    <View style={styles.bentoBox}>
      {/* 1. STUDENT ID AND BATCH NUMBER (SAME ROW, 2 COLUMNS) */}
      <View style={styles.row}>
        {/* Student ID Column */}
        <View
          style={[
            styles.inputWrapper,
            styles.halfFlex,
            hasStudentIdError && styles.inputWrapperError,
          ]}
        >
          <Feather
            name="hash"
            size={18}
            color={
              hasStudentIdError
                ? ONBOARD_COLORS.errorBorder
                : ONBOARD_COLORS.placeholderText
            }
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Student ID"
            placeholderTextColor={ONBOARD_COLORS.placeholderText}
            keyboardType="number-pad"
            value={studentId}
            onChangeText={(text) => onChangeStudentId(text.replace(/[^0-9]/g, ""))}
            accessible={true}
            accessibilityLabel="Student ID"
          />
        </View>

        {/* Batch Column */}
        <View
          style={[
            styles.inputWrapper,
            styles.halfFlex,
            hasBatchError && styles.inputWrapperError,
          ]}
        >
          <Feather
            name="users"
            size={18}
            color={
              hasBatchError
                ? ONBOARD_COLORS.errorBorder
                : ONBOARD_COLORS.placeholderText
            }
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Batch"
            placeholderTextColor={ONBOARD_COLORS.placeholderText}
            keyboardType="number-pad"
            maxLength={4}
            value={batch}
            onChangeText={(text) => onChangeBatch(text.replace(/[^0-9]/g, ""))}
            accessible={true}
            accessibilityLabel="Academic Batch"
          />
        </View>
      </View>

      {/* 2. ACADEMIC PROGRAM (FULL WIDTH) */}
      <TouchableOpacity
        style={[
          styles.inputWrapper,
          hasProgramError && styles.inputWrapperError,
        ]}
        onPress={onOpenProgramModal}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Academic Program: ${program || "Not selected"}`}
        activeOpacity={0.7}
      >
        <Feather
          name="smartphone"
          size={20}
          color={
            hasProgramError
              ? ONBOARD_COLORS.errorBorder
              : ONBOARD_COLORS.placeholderText
          }
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

      {/* 3. WARNING CALLOUT BANNER */}
      <View style={styles.warningContainer}>
        <Feather
          name="alert-circle"
          size={16}
          color={ONBOARD_COLORS.warningText}
          style={styles.warningIcon}
        />
        <Text style={styles.warningText}>
          Please fill this information carefully as Student ID, Program, and
          Batch cannot be changed later.
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  bentoBox: {
    width: "100%",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    gap: 14,
    backgroundColor: ONBOARD_COLORS.blueBox,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfFlex: {
    flex: 1,
    paddingHorizontal: 12,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: ONBOARD_COLORS.white,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 54,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  inputWrapperError: {
    borderColor: ONBOARD_COLORS.errorBorder,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14.5,
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
  warningContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: ONBOARD_COLORS.warningBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ONBOARD_COLORS.warningBorder,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 2,
  },
  warningIcon: {
    marginRight: 10,
  },
  warningText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: "600",
    color: ONBOARD_COLORS.warningText,
    lineHeight: 17,
  },
});
