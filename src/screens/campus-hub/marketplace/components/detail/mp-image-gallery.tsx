import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { CAMPUS_HUB_COLORS, fontFamily } from "@/screens/campus-hub/shared/design-tokens";

const ACCENT = CAMPUS_HUB_COLORS.marketplaceAccent;

interface MPImageGalleryProps {
  images: string[];
  selectedIndex: number;
  isSold?: boolean;
  onSelectIndex: (idx: number) => void;
  onOpenViewer: (idx?: number) => void;
}

export function MPImageGallery({
  images,
  selectedIndex,
  isSold,
  onSelectIndex,
  onOpenViewer,
}: MPImageGalleryProps) {
  if (!images.length) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onOpenViewer(selectedIndex)}
        style={styles.mainWrapper}
        accessible
        accessibilityRole="imagebutton"
        accessibilityLabel="Product photo in fullscreen"
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

        {isSold && (
          <View style={styles.soldOverlay}>
            <View style={styles.soldBanner}>
              <Text style={styles.soldBannerText}>SOLD</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>

      {images.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.thumbScrollView}
          contentContainerStyle={styles.thumbnailRow}
        >
          {images.map((img, idx) => (
            <TouchableOpacity
              key={img}
              onPress={() => onSelectIndex(idx)}
              style={[
                styles.thumbBtn,
                selectedIndex === idx && styles.thumbBtnActive,
              ]}
              accessible
              accessibilityRole="button"
              accessibilityLabel={`Select photo ${idx + 1}`}
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
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
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
  soldOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  soldBanner: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
  },
  soldBannerText: {
    fontFamily,
    fontSize: 18,
    fontWeight: "900",
    color: CAMPUS_HUB_COLORS.deepNavy,
    letterSpacing: 1.5,
  },
  thumbScrollView: {
    width: "100%",
  },
  thumbnailRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    paddingVertical: 4,
    flexGrow: 1,
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
