import React, { memo } from "react";
import { View, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ONBOARD_COLORS } from "../constants";

interface OnboardAvatarPickerProps {
  imageUri: string | null;
  onPickImage: () => void;
  hasError?: boolean;
}

export const OnboardAvatarPicker = memo(function OnboardAvatarPicker({
  imageUri,
  onPickImage,
  hasError,
}: OnboardAvatarPickerProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onPickImage}
        style={styles.avatarWrapper}
        activeOpacity={0.8}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Choose profile photo"
      >
        <View style={[styles.imageCircle, hasError && styles.imageCircleError]}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.profileImage}
              resizeMode="cover"
              accessible={true}
              accessibilityLabel="Selected profile photo preview"
            />
          ) : (
            <Feather
              name="camera"
              size={34}
              color={hasError ? ONBOARD_COLORS.errorBorder : "#565e74"}
            />
          )}
        </View>

        <View
          style={[
            styles.imageEditBadge,
            hasError && { backgroundColor: ONBOARD_COLORS.errorBorder },
          ]}
        >
          <Feather name={imageUri ? "edit-2" : "plus"} size={16} color="#FFF" />
        </View>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: 28,
  },
  avatarWrapper: {
    position: "relative",
    width: 120,
    height: 120,
  },
  imageCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: ONBOARD_COLORS.yellowAvatar,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  imageCircleError: {
    borderWidth: 2.5,
    borderColor: ONBOARD_COLORS.errorBorder,
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  imageEditBadge: {
    position: "absolute",
    bottom: 0,
    right: 2,
    backgroundColor: ONBOARD_COLORS.deepNavy,
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: ONBOARD_COLORS.background,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
});
