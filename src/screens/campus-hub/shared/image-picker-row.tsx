import React, { useCallback, useState } from "react";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system/legacy";
import Toast from "react-native-toast-message";
import { Feather } from "@expo/vector-icons";
import { colors } from "@/theme/colors";
import { CAMPUS_HUB_COLORS, fontFamily } from "./design-tokens";

const DEFAULT_MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

interface ImagePickerRowProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  maxSizeBytes?: number;
  accent?: string;
  label?: string;
  hint?: string;
}

export const ImagePickerRow = React.memo(function ImagePickerRow({
  images,
  onImagesChange,
  maxImages = 2,
  maxSizeBytes = DEFAULT_MAX_SIZE_BYTES,
  accent = CAMPUS_HUB_COLORS.deepNavy,
  label,
  hint,
}: ImagePickerRowProps) {
  const [failedUris, setFailedUris] = useState<Record<string, boolean>>({});

  const pickImage = useCallback(async () => {
    if (images.length >= maxImages) {
      Toast.show({
        type: "info",
        text1: "Photo Limit Reached",
        text2: `You can upload at most ${maxImages} photos.`,
      });
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission required",
        "Please allow photo library access to upload images.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.85,
      allowsMultipleSelection: true,
      selectionLimit: maxImages - images.length,
    });

    if (!result.canceled && result.assets) {
      const validUris: string[] = [];
      let oversizedCount = 0;

      for (const asset of result.assets) {
        let candidateUri = asset.uri;
        let size = asset.fileSize;

        try {
          const actions: ImageManipulator.Action[] =
            asset.width && asset.width > 1280
              ? [{ resize: { width: 1280 } }]
              : [];
          const manipulated = await ImageManipulator.manipulateAsync(
            asset.uri,
            actions,
            {
              compress: 0.75,
              format: ImageManipulator.SaveFormat.JPEG,
            },
          );
          candidateUri = manipulated.uri;
          size = undefined;
        } catch {
          candidateUri = asset.uri;
        }

        if (size == null && candidateUri) {
          try {
            const info = await FileSystem.getInfoAsync(candidateUri);
            if (
              info.exists &&
              typeof (info as { size?: number }).size === "number"
            ) {
              size = (info as { size: number }).size;
            }
          } catch {}
        }

        if (size != null && size > maxSizeBytes) {
          oversizedCount++;
        } else {
          validUris.push(candidateUri);
        }
      }

      if (oversizedCount > 0) {
        const limitMb = (maxSizeBytes / (1024 * 1024)).toFixed(0);
        Toast.show({
          type: "error",
          text1: "Photo Exceeds 5MB",
          text2: `${oversizedCount} photo(s) exceeded the ${limitMb}MB limit and could not be added.`,
        });
      }

      if (validUris.length > 0) {
        onImagesChange([...images, ...validUris].slice(0, maxImages));
      }
    }
  }, [images, maxImages, maxSizeBytes, onImagesChange]);

  const removeImage = useCallback(
    (index: number) => {
      onImagesChange(images.filter((_, i) => i !== index));
    },
    [images, onImagesChange],
  );

  const limitMb = (maxSizeBytes / (1024 * 1024)).toFixed(0);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.label} maxFontSizeMultiplier={1.25}>
          {label ?? `PHOTOS (${images.length}/${maxImages})`}
        </Text>
        <Text style={styles.hintText} maxFontSizeMultiplier={1.25}>
          {hint ??
            (maxImages === 1
              ? `Max 1 photo • Up to ${limitMb}MB`
              : `Max ${maxImages} photos • Up to ${limitMb}MB each`)}
        </Text>
      </View>

      <View style={styles.row}>
        {images.map((uri, index) => (
          <View key={uri} style={styles.slot}>
            {failedUris[uri] ? (
              <View style={styles.thumbnailFallback}>
                <Feather
                  name="image"
                  size={18}
                  color={CAMPUS_HUB_COLORS.subtleText}
                />
              </View>
            ) : (
              <Image
                source={{ uri }}
                style={styles.thumbnail}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={150}
                onError={() =>
                  setFailedUris((prev) => ({ ...prev, [uri]: true }))
                }
              />
            )}
            <Pressable
              style={({ pressed }) => [
                styles.removeBtn,
                pressed && { opacity: 0.8 },
              ]}
              onPress={() => removeImage(index)}
              hitSlop={{ top: 13, bottom: 13, left: 13, right: 13 }}
              android_ripple={{
                color: CAMPUS_HUB_COLORS.androidRippleLight,
              }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Remove photo ${index + 1}`}
            >
              <Feather name="x" size={12} color={CAMPUS_HUB_COLORS.white} />
            </Pressable>
          </View>
        ))}
        {images.length < maxImages && (
          <Pressable
            style={({ pressed }) => [
              styles.addSlot,
              { borderColor: accent },
              pressed && { opacity: 0.78 },
            ]}
            onPress={pickImage}
            android_ripple={{ color: CAMPUS_HUB_COLORS.androidRipple }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Add photo"
          >
            <Feather name="camera" size={20} color={accent} />
            <Text
              style={[styles.addText, { color: accent }]}
              maxFontSizeMultiplier={1.25}
            >
              Add
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
});

const SLOT_SIZE = 76;

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    gap: 8,
  },
  label: {
    fontFamily,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.subtleText,
    letterSpacing: 0.4,
    includeFontPadding: false,
  },
  hintText: {
    fontFamily,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.subtleText,
    flexShrink: 1,
    textAlign: "right",
    includeFontPadding: false,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  slot: {
    width: SLOT_SIZE,
    height: SLOT_SIZE,
    borderRadius: 12,
    overflow: "hidden",
  },
  thumbnail: {
    width: SLOT_SIZE,
    height: SLOT_SIZE,
    backgroundColor: CAMPUS_HUB_COLORS.background,
  },
  thumbnailFallback: {
    width: SLOT_SIZE,
    height: SLOT_SIZE,
    backgroundColor: CAMPUS_HUB_COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },
  removeBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.scrimDark,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  addSlot: {
    width: SLOT_SIZE,
    height: SLOT_SIZE,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: CAMPUS_HUB_COLORS.background,
    overflow: "hidden",
    gap: 4,
  },
  addText: {
    fontFamily,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "700",
    includeFontPadding: false,
  },
});
