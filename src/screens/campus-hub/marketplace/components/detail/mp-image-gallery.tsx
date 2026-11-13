import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import { clampImageIndex } from "@/features/campus-hub/marketplace-logic";
import type { ListingStatus } from "@/services/marketplace-service";
import { CAMPUS_HUB_COLORS, fontFamily } from "@/screens/campus-hub/shared/design-tokens";

const ACCENT = CAMPUS_HUB_COLORS.marketplaceAccent;

interface MPImageGalleryProps {
  images: string[];
  selectedIndex: number;
  status?: ListingStatus;
  isSold?: boolean;
  onSelectIndex: (idx: number) => void;
  onOpenViewer: (idx?: number) => void;
}

export function MPImageGallery({
  images,
  selectedIndex,
  status,
  isSold,
  onSelectIndex,
  onOpenViewer,
}: MPImageGalleryProps) {
  const [failedUrls, setFailedUrls] = useState<Record<string, boolean>>({});

  if (!images || !images.length) return null;

  const safeIndex = clampImageIndex(selectedIndex, images.length);
  const activeUri = images[safeIndex];
  const isActiveBroken = Boolean(activeUri && failedUrls[activeUri]);
  const overlayStatusText =
    status === "CLOSED"
      ? "CLOSED"
      : status === "SOLD" || isSold
        ? "SOLD"
        : null;

  const markBroken = (uri: string) => {
    setFailedUrls((prev) => (prev[uri] ? prev : { ...prev, [uri]: true }));
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={isActiveBroken ? 1 : 0.9}
        onPress={() => {
          if (!isActiveBroken) onOpenViewer(safeIndex);
        }}
        style={styles.mainWrapper}
        accessible
        accessibilityRole="imagebutton"
        accessibilityLabel="Product photo in fullscreen"
      >
        {activeUri && !isActiveBroken ? (
          <Image
            source={{ uri: activeUri }}
            style={styles.mainImage}
            contentFit="cover"
            cachePolicy="memory-disk"
            onError={() => markBroken(activeUri)}
          />
        ) : (
          <View style={styles.brokenImageFallback}>
            <Feather name="image" size={28} color={CAMPUS_HUB_COLORS.subtleText} />
            <Text style={styles.brokenImageText}>Photo unavailable</Text>
          </View>
        )}

        {!isActiveBroken && (
          <View style={styles.zoomPill}>
            <Feather name="maximize-2" size={11} color={CAMPUS_HUB_COLORS.white} />
            <Text style={styles.zoomPillText}>Tap to enlarge</Text>
          </View>
        )}

        {overlayStatusText && (
          <View style={styles.soldOverlay}>
            <View style={styles.soldBanner}>
              <Text style={styles.soldBannerText}>{overlayStatusText}</Text>
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
          {images.map((img, idx) => {
            const isBroken = Boolean(failedUrls[img]);
            return (
              <TouchableOpacity
                key={`${img}-${idx}`}
                onPress={() => onSelectIndex(idx)}
                style={[
                  styles.thumbBtn,
                  safeIndex === idx && styles.thumbBtnActive,
                ]}
                accessible
                accessibilityRole="button"
                accessibilityLabel={`Select photo ${idx + 1}`}
              >
                {!isBroken ? (
                  <Image
                    source={{ uri: img }}
                    style={styles.thumbImage}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    onError={() => markBroken(img)}
                  />
                ) : (
                  <View style={styles.thumbBrokenFallback}>
                    <Feather name="image" size={16} color={CAMPUS_HUB_COLORS.subtleText} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
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
    backgroundColor: CAMPUS_HUB_COLORS.cardBorder,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.subtleBorder,
    ...CAMPUS_HUB_COLORS.shadow,
  },
  mainImage: {
    width: "100%",
    height: "100%",
  },
  brokenImageFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
  },
  brokenImageText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.subtleText,
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
    color: CAMPUS_HUB_COLORS.white,
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
    backgroundColor: CAMPUS_HUB_COLORS.cardBorder,
  },
  thumbBtnActive: {
    borderColor: ACCENT,
  },
  thumbImage: {
    width: "100%",
    height: "100%",
  },
  thumbBrokenFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
  },
});
