import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import { colors } from "@/theme/colors";
import {
  CAMPUS_HUB_COLORS,
  fontFamily,
} from "@/screens/campus-hub/shared/design-tokens";

const ACCENT = CAMPUS_HUB_COLORS.lostFoundAccentFill;

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
  const [failedUris, setFailedUris] = useState<Record<string, boolean>>({});

  if (!images.length) return null;

  const safeIndex = Math.min(Math.max(0, selectedIndex), images.length - 1);
  const currentUri = images[safeIndex];

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => onOpenViewer(safeIndex)}
        style={({ pressed }) => [
          styles.mainWrapper,
          pressed && { opacity: 0.94 },
        ]}
        android_ripple={{ color: CAMPUS_HUB_COLORS.androidRipple }}
        accessible
        accessibilityRole="imagebutton"
        accessibilityLabel={`View photo ${safeIndex + 1} of ${images.length} in fullscreen`}
      >
        {failedUris[currentUri] ? (
          <View style={styles.fallbackBox}>
            <Feather
              name="image"
              size={32}
              color={CAMPUS_HUB_COLORS.subtleText}
            />
            <Text style={styles.fallbackText}>Photo unavailable</Text>
          </View>
        ) : (
          <Image
            source={{ uri: currentUri }}
            style={styles.mainImage}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={150}
            onError={() =>
              setFailedUris((prev) => ({ ...prev, [currentUri]: true }))
            }
          />
        )}
        <View style={styles.zoomPill}>
          <Feather name="maximize-2" size={11} color="#ffffff" />
          <Text style={styles.zoomPillText} maxFontSizeMultiplier={1.25}>
            Tap to enlarge
          </Text>
        </View>
      </Pressable>

      {images.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.thumbScrollView}
          contentContainerStyle={styles.thumbnailRow}
        >
          {images.map((img, idx) => (
            <Pressable
              key={img}
              onPress={() => onSelectIndex(idx)}
              style={({ pressed }) => [
                styles.thumbBtn,
                safeIndex === idx && styles.thumbBtnActive,
                pressed && { opacity: 0.85 },
              ]}
              android_ripple={{ color: CAMPUS_HUB_COLORS.androidRipple }}
              accessible
              accessibilityRole="button"
              accessibilityState={{ selected: safeIndex === idx }}
              accessibilityLabel={`Select photo ${idx + 1} of ${images.length}`}
            >
              {failedUris[img] ? (
                <View style={styles.thumbFallback}>
                  <Feather
                    name="image"
                    size={14}
                    color={CAMPUS_HUB_COLORS.subtleText}
                  />
                </View>
              ) : (
                <Image
                  source={{ uri: img }}
                  style={styles.thumbImage}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                  onError={() =>
                    setFailedUris((prev) => ({ ...prev, [img]: true }))
                  }
                />
              )}
            </Pressable>
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
    aspectRatio: 4 / 3,
    maxHeight: 340,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: colors.slate200,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.cardBorder,
    ...CAMPUS_HUB_COLORS.shadow,
  },
  mainImage: {
    width: "100%",
    height: "100%",
  },
  fallbackBox: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
  },
  fallbackText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.mutedInk,
  },
  thumbFallback: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
  },
  zoomPill: {
    position: "absolute",
    bottom: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(15, 23, 42, 0.78)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  zoomPillText: {
    fontFamily,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "700",
    color: "#ffffff",
    includeFontPadding: false,
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
    minWidth: 52,
    minHeight: 52,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
    backgroundColor: colors.slate200,
  },
  thumbBtnActive: {
    borderColor: ACCENT,
  },
  thumbImage: {
    width: "100%",
    height: "100%",
  },
});
