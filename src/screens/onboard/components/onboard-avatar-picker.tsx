import React, { memo, useState, useEffect } from "react";
import { View, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "@/theme/colors";
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
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    setLoadError(false);
  }, [imageUri]);

  const showPreview = Boolean(imageUri && !loadError);

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
          {showPreview && imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.profileImage}
              resizeMode="cover"
              onError={(e) => {
                console.warn(
                  "Profile image preview failed to load:",
                  e.nativeEvent.error,
                );
                setLoadError(true);
              }}
              accessible={true}
              accessibilityLabel="Selected profile photo preview"
            />
          ) : (
            <Feather
              name="camera"
              size={34}
              color={
                hasError
                  ? ONBOARD_COLORS.errorBorder
                  : colors.slate600
              }
            />
          )}
        </View>

        <View
          style={[
            styles.imageEditBadge,
            hasError && { backgroundColor: ONBOARD_COLORS.errorBorder },
          ]}
        >
          <Feather
            name={showPreview ? "edit-2" : "plus"}
            size={16}
            color={ONBOARD_COLORS.white}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: 24,
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
    width: 120,
    height: 120,
    borderRadius: 60,
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
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
});
