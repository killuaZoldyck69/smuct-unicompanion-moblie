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
import { Feather } from "@expo/vector-icons";
import { CAMPUS_HUB_COLORS, fontFamily } from "./design-tokens";

interface ImagePickerRowProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  accent?: string;
}

export const ImagePickerRow = React.memo(function ImagePickerRow({
  images,
  onImagesChange,
  maxImages = 4,
  accent = CAMPUS_HUB_COLORS.deepNavy,
}: ImagePickerRowProps) {
  const pickImage = useCallback(async () => {
    if (images.length >= maxImages) {
      Alert.alert(
        "Limit reached",
        `You can upload at most ${maxImages} photos.`
      );
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
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: maxImages - images.length,
    });

    if (!result.canceled) {
      const newUris = result.assets.map((a) => a.uri);
      onImagesChange([...images, ...newUris].slice(0, maxImages));
    }
  }, [images, maxImages, onImagesChange]);

  const removeImage = useCallback(
    (index: number) => {
      onImagesChange(images.filter((_, i) => i !== index));
    },
    [images, onImagesChange]
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>PHOTOS ({images.length}/{maxImages})</Text>
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
  label: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.subtleText,
    marginBottom: 8,
    letterSpacing: 0.4,
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
