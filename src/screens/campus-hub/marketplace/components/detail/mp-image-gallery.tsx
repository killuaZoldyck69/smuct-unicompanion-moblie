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
  isSold: boolean;
  onSelectIndex: (idx: number) => void;
  onOpenViewer: () => void;
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
    <View style={styles.card}>
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={onOpenViewer}
        style={styles.mainTouchable}
        accessible
        accessibilityRole="imagebutton"
        accessibilityLabel="Product photo. Tap to view full screen."
      >
        <Image
          source={{ uri: images[selectedIndex] }}
          style={styles.mainImage}
          resizeMode="contain"
        />

        {images.length > 1 && (
          <View style={styles.counterBadge}>
            <Feather name="camera" size={11} color="#ffffff" />
            <Text style={styles.counterText}>
              {selectedIndex + 1} / {images.length}
            </Text>
          </View>
        )}

        <View style={styles.zoomBadge}>
          <Feather name="maximize-2" size={11} color="#ffffff" />
          <Text style={styles.zoomText}>Tap to enlarge</Text>
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
          contentContainerStyle={styles.thumbnailRow}
        >
          {images.map((img, idx) => (
            <TouchableOpacity
              key={img}
              onPress={() => onSelectIndex(idx)}
              activeOpacity={0.8}
              style={[
                styles.thumbWrapper,
                selectedIndex === idx && styles.thumbWrapperActive,
              ]}
            >
              <Image source={{ uri: img }} style={styles.thumb} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
    ...CAMPUS_HUB_COLORS.shadow,
  },
  mainTouchable: {
    position: "relative",
    width: "100%",
    height: 260,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
  },
  mainImage: {
    width: "100%",
    height: "100%",
  },
  counterBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 10,
  },
  counterText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: "#ffffff",
  },
  zoomBadge: {
    position: "absolute",
    bottom: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  zoomText: {
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
  thumbnailRow: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: "#1e293b",
  },
  thumbWrapper: {
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
    opacity: 0.65,
  },
  thumbWrapperActive: {
    borderColor: ACCENT,
    opacity: 1,
  },
  thumb: {
    width: 52,
    height: 52,
    resizeMode: "cover",
  },
});
