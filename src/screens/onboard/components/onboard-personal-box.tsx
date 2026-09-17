import React, { memo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ONBOARD_COLORS, BLOOD_GROUPS } from "../constants";

interface OnboardPersonalBoxProps {
  bloodGroup: string;
  onOpenBloodGroupModal: () => void;
}

export const OnboardPersonalBox = memo(function OnboardPersonalBox({
  bloodGroup,
  onOpenBloodGroupModal,
}: OnboardPersonalBoxProps) {
  const selectedLabel = bloodGroup
    ? BLOOD_GROUPS.find((b) => b.value === bloodGroup)?.label
    : null;

  return (
    <View style={styles.bentoBox}>
      <TouchableOpacity
        style={styles.inputWrapper}
        onPress={onOpenBloodGroupModal}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Blood Group: ${selectedLabel || "Not selected"}`}
        activeOpacity={0.7}
      >
        <Feather
          name="droplet"
          size={20}
          color={ONBOARD_COLORS.placeholderText}
          style={styles.inputIcon}
        />
        <Text
          style={[
            styles.dropdownText,
            !bloodGroup && { color: ONBOARD_COLORS.placeholderText },
          ]}
          numberOfLines={1}
        >
          {selectedLabel || "Blood Group"}
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
    backgroundColor: ONBOARD_COLORS.roseBox,
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
  dropdownText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: ONBOARD_COLORS.neutralText,
  },
});
