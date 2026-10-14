import React, { memo } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ONBOARD_COLORS, MAX_SECTION_LENGTH } from "../constants";

interface OnboardClassBoxProps {
  currentSemester: string;
  onChangeSemester: (text: string) => void;
  hasSemesterError?: boolean;
  section: string;
  onChangeSection: (text: string) => void;
  hasSectionError?: boolean;
  phoneNumber: string;
  onChangePhoneNumber: (text: string) => void;
  hasPhoneError?: boolean;
}

export const OnboardClassBox = memo(function OnboardClassBox({
  currentSemester,
  onChangeSemester,
  hasSemesterError,
  section,
  onChangeSection,
  hasSectionError,
  phoneNumber,
  onChangePhoneNumber,
  hasPhoneError,
}: OnboardClassBoxProps) {
  // Strip country code (+880 or 880) and leading zero so user always inputs the 10 digits
  const handlePhoneChange = (text: string) => {
    let digits = text.replace(/[^0-9]/g, "");
    if (digits.startsWith("880")) {
      digits = digits.slice(3);
    }
    if (digits.startsWith("0")) {
      digits = digits.slice(1);
    }
    onChangePhoneNumber(digits.slice(0, 10));
  };

  return (
    <View style={styles.bentoBox}>
      {/* 1. SEMESTER AND SECTION (ROW) */}
      <View style={styles.row}>
        {/* Semester: Integer only, 1 to 12 */}
        <View
          style={[
            styles.inputWrapper,
            styles.halfFlex,
            hasSemesterError && styles.inputWrapperError,
          ]}
        >
          <Feather
            name="calendar"
            size={18}
            color={
              hasSemesterError
                ? ONBOARD_COLORS.errorBorder
                : ONBOARD_COLORS.placeholderText
            }
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Semester"
            placeholderTextColor={ONBOARD_COLORS.placeholderText}
            keyboardType="number-pad"
            maxLength={2}
            value={currentSemester}
            onChangeText={(text) => onChangeSemester(text.replace(/[^0-9]/g, ""))}
            accessible={true}
            accessibilityLabel="Current Semester (1 to 12)"
          />
        </View>

        {/* Section: Exactly 1 uppercase character */}
        <View
          style={[
            styles.inputWrapper,
            styles.halfFlex,
            hasSectionError && styles.inputWrapperError,
          ]}
        >
          <Feather
            name="grid"
            size={18}
            color={
              hasSectionError
                ? ONBOARD_COLORS.errorBorder
                : ONBOARD_COLORS.placeholderText
            }
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Section"
            placeholderTextColor={ONBOARD_COLORS.placeholderText}
            autoCapitalize="characters"
            maxLength={MAX_SECTION_LENGTH}
            value={section}
            onChangeText={(text) =>
              onChangeSection(
                text.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 1)
              )
            }
            accessible={true}
            accessibilityLabel="Class Section (single uppercase letter)"
          />
        </View>
      </View>

      {/* 2. PHONE NUMBER WITH +880 BD COUNTRY CODE (10 DIGITS) */}
      <View
        style={[
          styles.inputWrapper,
          hasPhoneError && styles.inputWrapperError,
        ]}
      >
        <Feather
          name="phone"
          size={18}
          color={
            hasPhoneError
              ? ONBOARD_COLORS.errorBorder
              : ONBOARD_COLORS.placeholderText
          }
          style={styles.inputIcon}
        />
        {/* Country Code Prefix */}
        <View style={styles.countryCodeContainer}>
          <Text style={styles.countryCodeText}>+880</Text>
        </View>

        {/* 10-digit Phone Number Input */}
        <TextInput
          style={styles.input}
          placeholder="1XXXXXXXXX"
          placeholderTextColor={ONBOARD_COLORS.placeholderText}
          keyboardType="number-pad"
          maxLength={10}
          value={phoneNumber}
          onChangeText={handlePhoneChange}
          accessible={true}
          accessibilityLabel="10 digit Phone Number"
        />
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
    backgroundColor: ONBOARD_COLORS.mintBox,
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
  countryCodeContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 10,
    marginRight: 10,
    borderRightWidth: 1,
    borderRightColor: ONBOARD_COLORS.borderLight,
  },
  countryCodeText: {
    fontSize: 15,
    fontWeight: "700",
    color: ONBOARD_COLORS.neutralText,
    letterSpacing: 0.2,
  },
  input: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: "500",
    color: ONBOARD_COLORS.neutralText,
    height: "100%",
  },
});
