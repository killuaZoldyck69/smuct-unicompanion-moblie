import React from "react";
import {
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { Text } from "react-native";
import { CAMPUS_HUB_COLORS, fontFamily } from "@/screens/campus-hub/shared/design-tokens";

const ACCENT = CAMPUS_HUB_COLORS.lostFoundAccent;

interface LFImageGalleryProps {
  images: string[];
  selectedIndex: number;
  onSelectIndex: (idx: number) => void;
  onOpenViewer: (idx: number) => void;
}

export function LFImageGallery({
  images,
  selectedIndex,
  onSelectIndex,
  onOpenViewer,
}: LFImageGalleryProps) {
  if (!images.length) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onOpenViewer(selectedIndex)}
        style={styles.mainWrapper}
        accessible
        accessibilityRole="imagebutton"
        accessibilityLabel="View photo in fullscreen"
      >
        <Image
          source={{ uri: images[selectedIndex] }}
          style={styles.mainImage}
          resizeMode="cover"
        />
        <View style={styles.zoomPill}>
          <Feather name="maximize-2" size={11} color="#ffffff" />
          <Text style={styles.zoomPillText}>Tap to enlarge</Text>
        </View>
      </TouchableOpacity>

      {images.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbnailRow}
        >
          {images.map((img, idx) => (
            <TouchableOpacity
              key={img}
              onPress={() => onSelectIndex(idx)}
              style={[styles.thumbBtn, selectedIndex === idx && styles.thumbBtnActive]}
            >
              <Image source={{ uri: img }} style={styles.thumbImage} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  mainWrapper: {
    width: "100%",
    height: 220,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#e2e8f0",
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.subtleBorder,
    ...CAMPUS_HUB_COLORS.shadow,
  },
  mainImage: {
    width: "100%",
    height: "100%",
  },
  zoomPill: {
    position: "absolute",
    bottom: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  zoomPillText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: "#ffffff",
  },
  thumbnailRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 2,
  },
  thumbBtn: {
    width: 52,
    height: 52,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
    backgroundColor: "#e2e8f0",
  },
  thumbBtnActive: {
    borderColor: ACCENT,
  },
  thumbImage: {
    width: "100%",
    height: "100%",
  },
});
