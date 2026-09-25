import React from "react";
import {
  Modal,
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { fontFamily } from "../../shared/design-tokens";

interface MemeImageModalProps {
  visible: boolean;
  imageUrl: string | null;
  caption?: string | null;
  authorName?: string;
  onClose: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export const MemeImageModal = React.memo(function MemeImageModal({
  visible,
  imageUrl,
  caption,
  authorName,
  onClose,
}: MemeImageModalProps) {
  const insets = useSafeAreaInsets();

  if (!visible || !imageUrl) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <View style={styles.backdrop}>
        {/* Top Bar with Safe Area Spacing */}
        <View
          style={[
            styles.topBar,
            { paddingTop: insets.top > 0 ? insets.top + 8 : 16 },
          ]}
        >
          <View style={styles.authorBadge}>
            <Text style={styles.authorName} numberOfLines={1}>
              {authorName ? `Meme by ${authorName}` : "Meme Preview"}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Close image preview"
          >
            <Feather name="x" size={22} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Center Image Container */}
        <TouchableOpacity
          activeOpacity={1}
          style={styles.imageContainer}
          onPress={onClose}
        >
          <Image
            source={{ uri: imageUrl }}
            style={styles.fullImage}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Caption Container with Safe Area Bottom Padding */}
        {caption ? (
          <View
            style={[
              styles.captionContainer,
              { paddingBottom: insets.bottom > 0 ? insets.bottom + 16 : 22 },
            ]}
          >
            <Text style={styles.captionText}>{caption}</Text>
          </View>
        ) : (
          <View style={{ height: insets.bottom > 0 ? insets.bottom : 16 }} />
        )}
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(10, 15, 29, 0.96)",
    justifyContent: "space-between",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    zIndex: 10,
  },
  authorBadge: {
    flex: 1,
    marginRight: 16,
  },
  authorName: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.85)",
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  imageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  fullImage: {
    width: SCREEN_WIDTH - 16,
    height: SCREEN_HEIGHT * 0.72,
  },
  captionContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    backgroundColor: "rgba(19, 27, 46, 0.85)",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  captionText: {
    fontFamily,
    fontSize: 15,
    fontWeight: "600",
    color: "#ffffff",
    lineHeight: 22,
    textAlign: "center",
  },
});
