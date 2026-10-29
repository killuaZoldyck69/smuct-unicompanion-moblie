import React, { useCallback } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import Toast from "react-native-toast-message";
import { Feather } from "@expo/vector-icons";
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
        "Please allow photo library access to upload images."
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
        let size = asset.fileSize;
        if (size == null && asset.uri) {
          try {
            const info = await FileSystem.getInfoAsync(asset.uri);
            if (info.exists && typeof (info as any).size === "number") {
              size = (info as any).size;
            }
          } catch {}
        }

        if (size != null && size > maxSizeBytes) {
          oversizedCount++;
        } else {
          validUris.push(asset.uri);
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
    [images, onImagesChange]
  );

  const limitMb = (maxSizeBytes / (1024 * 1024)).toFixed(0);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>
          {label ?? `PHOTOS (${images.length}/${maxImages})`}
        </Text>
        <Text style={styles.hintText}>
          {hint ??
            (maxImages === 1
              ? `Max 1 photo • Up to ${limitMb}MB`
              : `Max ${maxImages} photos • Up to ${limitMb}MB each`)}
        </Text>
      </View>

      <View style={styles.row}>
        {images.map((uri, index) => (
          <View key={uri} style={styles.slot}>
            <Image source={{ uri }} style={styles.thumbnail} />
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => removeImage(index)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Remove photo ${index + 1}`}
            >
              <Feather name="x" size={10} color="#ffffff" />
            </TouchableOpacity>
          </View>
        ))}
        {images.length < maxImages && (
          <TouchableOpacity
            style={[styles.addSlot, { borderColor: accent }]}
            onPress={pickImage}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Add photo"
            activeOpacity={0.7}
          >
            <Feather name="camera" size={20} color={accent} />
            <Text style={[styles.addText, { color: accent }]}>Add</Text>
          </TouchableOpacity>
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
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.subtleText,
    letterSpacing: 0.4,
  },
  hintText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.subtleText,
    flexShrink: 1,
    textAlign: "right",
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
    resizeMode: "cover",
  },
  removeBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
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
    gap: 4,
  },
  addText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "700",
  },
});
