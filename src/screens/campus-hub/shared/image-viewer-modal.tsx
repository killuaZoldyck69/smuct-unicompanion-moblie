import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  useWindowDimensions,
  StatusBar,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { colors } from "@/theme/colors";
import { CAMPUS_HUB_COLORS, fontFamily } from "./design-tokens";

interface ImageViewerModalProps {
  visible: boolean;
  images: string[];
  initialIndex?: number;
  onClose: () => void;
}

export const ImageViewerModal = React.memo(function ImageViewerModal({
  visible,
  images,
  initialIndex = 0,
  onClose,
}: ImageViewerModalProps) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [failedUris, setFailedUris] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const safeMax = Math.max(0, images.length - 1);
    setCurrentIndex(Math.min(Math.max(0, initialIndex), safeMax));
  }, [initialIndex, visible, images.length]);

  if (!images || images.length === 0) return null;

  const safeIndex = Math.min(Math.max(0, currentIndex), images.length - 1);
  const currentUri = images[safeIndex] || images[0];
  const hasCurrentError = Boolean(failedUris[currentUri]);

  const handleNext = () => {
    if (safeIndex < images.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (safeIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />

        {/* Top Header */}
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
          <Pressable
            style={({ pressed }) => [
              styles.closeBtn,
              pressed && { opacity: 0.78 },
            ]}
            onPress={onClose}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            android_ripple={{
              color: "rgba(255,255,255,0.28)",
              borderless: true,
            }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Close image viewer"
          >
            <Feather name="x" size={22} color="#ffffff" />
          </Pressable>

          {images.length > 1 && (
            <View style={styles.counterPill}>
              <Text style={styles.counterText} maxFontSizeMultiplier={1.25}>
                {safeIndex + 1} / {images.length}
              </Text>
            </View>
          )}

          <View style={{ width: 40 }} />
        </View>

        {/* Full Image with Contain */}
        <View style={styles.imageWrapper}>
          {hasCurrentError ? (
            <View
              style={[
                styles.errorFallback,
                { width: screenWidth, height: screenHeight * 0.75 },
              ]}
            >
              <Feather name="image" size={44} color="#94a3b8" />
              <Text style={styles.errorText}>Unable to load image</Text>
            </View>
          ) : (
            <Image
              source={{ uri: currentUri }}
              style={{ width: screenWidth, height: screenHeight * 0.75 }}
              contentFit="contain"
              cachePolicy="memory-disk"
              transition={150}
              onError={() =>
                setFailedUris((prev) => ({ ...prev, [currentUri]: true }))
              }
            />
          )}

          {images.length > 1 && safeIndex > 0 && (
            <Pressable
              style={({ pressed }) => [
                styles.navArrow,
                styles.leftArrow,
                pressed && { opacity: 0.78 },
              ]}
              onPress={handlePrev}
              android_ripple={{
                color: "rgba(255,255,255,0.28)",
                borderless: true,
              }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Previous image"
            >
              <Feather name="chevron-left" size={28} color="#ffffff" />
            </Pressable>
          )}

          {images.length > 1 && safeIndex < images.length - 1 && (
            <Pressable
              style={({ pressed }) => [
                styles.navArrow,
                styles.rightArrow,
                pressed && { opacity: 0.78 },
              ]}
              onPress={handleNext}
              android_ripple={{
                color: "rgba(255,255,255,0.28)",
                borderless: true,
              }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Next image"
            >
              <Feather name="chevron-right" size={28} color="#ffffff" />
            </Pressable>
          )}
        </View>

        {/* Thumbnail Selector if multiple */}
        {images.length > 1 && (
          <View
            style={[
              styles.bottomBar,
              { paddingBottom: Math.max(insets.bottom, 20) },
            ]}
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.bottomBarScroll}
            >
              {images.map((img, idx) => (
                <Pressable
                  key={img + idx}
                  onPress={() => setCurrentIndex(idx)}
                  style={[
                    styles.thumbItem,
                    safeIndex === idx && styles.thumbItemActive,
                  ]}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityState={{ selected: safeIndex === idx }}
                  accessibilityLabel={`Select photo ${idx + 1} of ${images.length}`}
                >
                  <Image
                    source={{ uri: img }}
                    style={styles.thumbImage}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                  />
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    zIndex: 10,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.whiteAlpha20,
    alignItems: "center",
    justifyContent: "center",
  },
  counterPill: {
    backgroundColor: colors.whiteAlpha20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  counterText: {
    fontFamily,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "700",
    color: colors.white,
    includeFontPadding: false,
    fontVariant: ["tabular-nums"],
  },
  imageWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  errorFallback: {
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  errorText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "600",
    color: colors.slate400,
  },
  navArrow: {
    position: "absolute",
    top: "50%",
    marginTop: -24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  leftArrow: {
    left: 16,
  },
  rightArrow: {
    right: 16,
  },
  bottomBar: {
    paddingTop: 12,
  },
  bottomBarScroll: {
    flexGrow: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
  },
  thumbItem: {
    width: 50,
    height: 50,
    borderRadius: 8,
    overflow: "hidden",
    opacity: 0.5,
    borderWidth: 2,
    borderColor: "transparent",
  },
  thumbItemActive: {
    opacity: 1,
    borderColor: CAMPUS_HUB_COLORS.marketplaceAccent,
  },
  thumbImage: {
    width: "100%",
    height: "100%",
  },
});
