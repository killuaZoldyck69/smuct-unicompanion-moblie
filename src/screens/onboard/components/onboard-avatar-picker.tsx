import React, { memo } from "react";
import { View, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ONBOARD_COLORS } from "../constants";

interface OnboardAvatarPickerProps {
  imageUri: string | null;
  onPickImage: () => void;
}

export const OnboardAvatarPicker = memo(function OnboardAvatarPicker({
  imageUri,
  onPickImage,
}: OnboardAvatarPickerProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onPickImage}
        style={styles.imagePlaceholder}
        activeOpacity={0.8}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Choose profile photo"
      >
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.profileImage}
            accessible={true}
            accessibilityLabel="Selected profile photo preview"
          />
        ) : (
          <Feather name="camera" size={32} color="#565e74" />
        )}
        <View style={styles.imageEditBadge}>
          <Feather name="plus" size={16} color="#FFF" />
        </View>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: 32,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 9999,
    backgroundColor: ONBOARD_COLORS.yellowAvatar,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 9999,
  },
  imageEditBadge: {
    position: "absolute",
    bottom: 0,
    right: 4,
    backgroundColor: ONBOARD_COLORS.deepNavy,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: ONBOARD_COLORS.background,
  },
});
