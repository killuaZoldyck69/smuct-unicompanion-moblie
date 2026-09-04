import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { fontFamily } from "./design-tokens";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

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
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);

  React.useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, visible]);

  if (!images || images.length === 0) return null;

  const currentUri = images[currentIndex] || images[0];

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
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
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Close image viewer"
          >
            <Feather name="x" size={22} color="#ffffff" />
          </TouchableOpacity>

          {images.length > 1 && (
            <View style={styles.counterPill}>
              <Text style={styles.counterText}>
                {currentIndex + 1} / {images.length}
              </Text>
            </View>
          )}

          <View style={{ width: 40 }} />
        </View>

        {/* Full Image with Contain */}
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: currentUri }}
            style={styles.image}
            resizeMode="contain"
          />

          {images.length > 1 && currentIndex > 0 && (
            <TouchableOpacity
              style={[styles.navArrow, styles.leftArrow]}
              onPress={handlePrev}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Previous image"
            >
              <Feather name="chevron-left" size={28} color="#ffffff" />
            </TouchableOpacity>
          )}

          {images.length > 1 && currentIndex < images.length - 1 && (
            <TouchableOpacity
              style={[styles.navArrow, styles.rightArrow]}
              onPress={handleNext}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Next image"
            >
              <Feather name="chevron-right" size={28} color="#ffffff" />
            </TouchableOpacity>
          )}
        </View>

        {/* Thumbnail Selector if multiple */}
        {images.length > 1 && (
          <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            {images.map((img, idx) => (
              <TouchableOpacity
                key={img + idx}
                onPress={() => setCurrentIndex(idx)}
                style={[
                  styles.thumbItem,
                  currentIndex === idx && styles.thumbItemActive,
                ]}
              >
                <Image source={{ uri: img }} style={styles.thumbImage} resizeMode="cover" />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
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
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  counterPill: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  counterText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
  imageWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.75,
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
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
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
    borderColor: "#3b82f6",
  },
  thumbImage: {
    width: "100%",
    height: "100%",
  },
});
