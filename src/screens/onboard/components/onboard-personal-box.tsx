import React, { memo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ONBOARD_COLORS, BLOOD_GROUPS } from "../constants";

interface OnboardPersonalBoxProps {
  bloodGroup: string;
  onOpenBloodGroupModal: () => void;
  hasBloodGroupError?: boolean;
}

export const OnboardPersonalBox = memo(function OnboardPersonalBox({
  bloodGroup,
  onOpenBloodGroupModal,
  hasBloodGroupError,
}: OnboardPersonalBoxProps) {
  const selectedLabel = bloodGroup
    ? BLOOD_GROUPS.find((b) => b.value === bloodGroup)?.label
    : null;

  return (
    <View style={styles.bentoBox}>
      <TouchableOpacity
        style={[
          styles.inputWrapper,
          hasBloodGroupError && styles.inputWrapperError,
        ]}
        onPress={onOpenBloodGroupModal}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Blood Group: ${selectedLabel || "Not selected"}`}
        activeOpacity={0.7}
      >
        <Feather
          name="droplet"
          size={20}
          color={hasBloodGroupError ? ONBOARD_COLORS.errorBorder : "#DC2626"}
          style={styles.inputIcon}
        />
        <Text
          style={[
            styles.dropdownText,
            !bloodGroup && { color: ONBOARD_COLORS.placeholderText },
          ]}
          numberOfLines={1}
        >
          {selectedLabel || "Blood Group (Optional)"}
        </Text>
        <Feather
          name="chevron-down"
          size={20}
          color={
            hasBloodGroupError
              ? ONBOARD_COLORS.errorBorder
              : ONBOARD_COLORS.placeholderText
          }
        />
      </TouchableOpacity>
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
    backgroundColor: ONBOARD_COLORS.roseBox,
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
    marginRight: 12,
  },
  dropdownText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: ONBOARD_COLORS.neutralText,
  },
});
