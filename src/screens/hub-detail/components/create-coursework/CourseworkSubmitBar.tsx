import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO, fontFamily } from "./constants";

interface Props {
  onSubmit: () => void;
  isFormValid: boolean;
  isPending: boolean;
  isUploading: boolean;
  bottomInset: number;
  label?: string;
}

export const CourseworkSubmitBar: React.FC<Props> = ({
  onSubmit,
  isFormValid,
  isPending,
  isUploading,
  bottomInset,
  label = "Publish Coursework",
}) => {
  const isDisabled = !isFormValid || isPending || isUploading;

  return (
    <View
      style={[
        styles.bottomBar,
        {
          paddingBottom: Math.max(bottomInset + 12, 20),
        },
      ]}
    >
      <TouchableOpacity
        onPress={onSubmit}
        disabled={isDisabled}
        style={[styles.publishBtn, isDisabled && styles.publishBtnDisabled]}
        activeOpacity={0.85}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        {isPending ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <>
            <Feather
              name="check"
              size={16}
              color={!isDisabled ? "#ffffff" : "#94a3b8"}
              style={{ marginRight: 8 }}
            />
            <Text
              style={[
                styles.publishBtnText,
                isDisabled && styles.publishBtnTextDisabled,
              ]}
            >
              {isUploading ? "Uploading Files..." : label}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomBar: {
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: BENTO.border,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  publishBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BENTO.navy,
    borderRadius: 14,
    paddingVertical: 14,
  },
  publishBtnDisabled: {
    backgroundColor: "#e2e8f0",
  },
  publishBtnText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
  publishBtnTextDisabled: {
    color: "#94a3b8",
  },
});
