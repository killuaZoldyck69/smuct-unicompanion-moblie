import React, { useEffect } from "react";
import {
  BackHandler,
  Modal,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { colors } from "@/theme/colors";
import { CAMPUS_HUB_COLORS, fontFamily } from "../../shared/design-tokens";

interface MemePreviewPayload {
  id?: string;
  imageUrl: string;
  caption?: string | null;
  authorName?: string;
}

interface MemeImageModalProps {
  visible: boolean;
  imageUrl?: string | null;
  caption?: string | null;
  authorName?: string;
  meme?: MemePreviewPayload | null;
  renderInline?: boolean;
  onClose: () => void;
}

export const MemeImageModal = React.memo(function MemeImageModal({
  visible,
  imageUrl,
  caption,
  authorName,
  meme,
  renderInline = false,
  onClose,
}: MemeImageModalProps) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const resolvedUrl = meme?.imageUrl ?? imageUrl ?? null;
  const resolvedCaption = meme?.caption ?? caption ?? null;
  const resolvedAuthor = meme?.authorName ?? authorName;

  useEffect(() => {
    if (!renderInline || !visible) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [renderInline, visible, onClose]);

  if (!visible || !resolvedUrl) return null;

  const content = (
    <View style={[styles.backdrop, renderInline && styles.inlineBackdrop]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.black} />
      <View
        style={[
          styles.topBar,
          { paddingTop: insets.top > 0 ? insets.top + 8 : 16 },
        ]}
      >
        <View style={styles.authorBadge}>
          <Text style={styles.authorName} numberOfLines={1}>
            {resolvedAuthor ? `Meme by ${resolvedAuthor}` : "Meme Preview"}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={onClose}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Close image preview"
        >
          <Feather name="x" size={22} color={colors.white} />
        </TouchableOpacity>
      </View>

      <Pressable
        style={styles.imageContainer}
        onPress={onClose}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Tap background to close meme preview"
      >
        <Image
          source={{ uri: resolvedUrl }}
          style={{
            width: Math.max(screenWidth - 16, 200),
            height: Math.round(screenHeight * 0.72),
          }}
          contentFit="contain"
          cachePolicy="memory-disk"
          transition={200}
        />
      </Pressable>

      {resolvedCaption ? (
        <View
          style={[
            styles.captionContainer,
            { paddingBottom: insets.bottom > 0 ? insets.bottom + 16 : 22 },
          ]}
        >
          <Text style={styles.captionText}>{resolvedCaption}</Text>
        </View>
      ) : (
        <View style={{ height: insets.bottom > 0 ? insets.bottom : 16 }} />
      )}
    </View>
  );

  if (renderInline) {
    return content;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
      navigationBarTranslucent={true}
    >
      {content}
    </Modal>
  );
});

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: CAMPUS_HUB_COLORS.memeBackdropDark,
    justifyContent: "space-between",
  },
  inlineBackdrop: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 110,
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
    color: CAMPUS_HUB_COLORS.memeWhiteTextSoft,
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.whiteAlpha15,
    alignItems: "center",
    justifyContent: "center",
  },
  imageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  captionContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    backgroundColor: CAMPUS_HUB_COLORS.memeOverlayDark,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  captionText: {
    fontFamily,
    fontSize: 15,
    fontWeight: "600",
    color: colors.white,
    lineHeight: 22,
    textAlign: "center",
  },
});
