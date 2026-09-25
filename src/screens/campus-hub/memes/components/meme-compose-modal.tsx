import React, { useState, useCallback, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  useWindowDimensions,
  Keyboard,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { Feather } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import {
  uploadImageToCloudinary,
  CLOUDINARY_FOLDERS,
} from "@/services/cloudinary-service";
import { useCreateMeme } from "@/features/campus-hub/useMemes";
import { CAMPUS_HUB_COLORS, fontFamily } from "../../shared/design-tokens";

interface MemeComposeModalProps {
  visible: boolean;
  onClose: () => void;
}

export const MemeComposeModal = React.memo(function MemeComposeModal({
  visible,
  onClose,
}: MemeComposeModalProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const createMemeMutation = useCreateMeme();

  // Listen to keyboard show/hide events to dynamically adapt modal height
  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Compute responsive sheet height that NEVER exceeds the safe area below the status bar
  const defaultHeight = Math.round(windowHeight * 0.86);
  const maxAllowedWithKeyboard =
    windowHeight - keyboardHeight - Math.max(insets.top, 24) - 12;
  const sheetHeight =
    keyboardHeight > 0
      ? Math.max(280, Math.min(defaultHeight, maxAllowedWithKeyboard))
      : Math.min(defaultHeight, windowHeight - Math.max(insets.top, 24) - 16);

  const handlePickImage = useCallback(async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permission Required",
          "Photo library access is needed to pick a meme from your device.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 0.85,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setImageUri(result.assets[0].uri);
      }
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error picking image",
        text2: err.message || "Failed to open photo picker.",
      });
    }
  }, []);

  const handleClear = useCallback(() => {
    setImageUri(null);
    setCaption("");
    setIsUploading(false);
  }, []);

  const handleModalClose = useCallback(() => {
    if (isUploading) return;
    Keyboard.dismiss();
    handleClear();
    onClose();
  }, [isUploading, handleClear, onClose]);

  const handleSubmit = useCallback(async () => {
    if (!imageUri) {
      Toast.show({
        type: "error",
        text1: "No Image Selected",
        text2: "Please choose a meme image to upload.",
      });
      return;
    }

    try {
      setIsUploading(true);

      // 1. Upload to Cloudinary securely
      const uploadRes = await uploadImageToCloudinary(
        imageUri,
        CLOUDINARY_FOLDERS.CAMPUS_HUB.MEMES
      );

      // 2. Create Meme in backend
      createMemeMutation.mutate(
        {
          imageUrl: uploadRes.secureUrl,
          caption: caption.trim() || null,
        },
        {
          onSuccess: () => {
            Toast.show({
              type: "success",
              text1: "Meme Posted! 🎉",
              text2: "Your meme is now live on Campus Hub.",
            });
            handleClear();
            onClose();
          },
          onError: (err: any) => {
            setIsUploading(false);
            Toast.show({
              type: "error",
              text1: "Failed to post meme",
              text2: err.message || "Something went wrong.",
            });
          },
        },
      );
    } catch (err: any) {
      setIsUploading(false);
      Toast.show({
        type: "error",
        text1: "Upload Failed",
        text2: err.message || "Failed to upload image. Please try again.",
      });
    }
  }, [imageUri, caption, createMemeMutation, handleClear, onClose]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={handleModalClose}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />
      <View style={styles.overlay}>
        {/* Full-screen backdrop tap-to-dismiss */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={handleModalClose}
          accessible={false}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardAvoid}
        >
          <View style={[styles.sheet, { height: sheetHeight }]}>
            {/* Top Drag Handle */}
            <View style={styles.dragHandle} />

            {/* Header: Anchored permanently at top of sheet */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={handleModalClose}
                disabled={isUploading}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Close compose modal"
                activeOpacity={0.7}
              >
                <Feather
                  name="x"
                  size={20}
                  color={CAMPUS_HUB_COLORS.deepNavy}
                />
              </TouchableOpacity>

              <View style={styles.headerTitleGroup}>
                <Text style={styles.modalTitle}>Post a Meme</Text>
                <Text style={styles.modalSubtitle}>
                  Share a laugh with campus peers
                </Text>
              </View>

              <View style={{ width: 36 }} />
            </View>

            {/* Scrollable Form Content */}
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Image Picker Box */}
              <Text style={styles.sectionLabel}>MEME IMAGE *</Text>
              {imageUri ? (
                <View style={styles.previewBox}>
                  <Image
                    source={{ uri: imageUri }}
                    style={styles.previewImage}
                    resizeMode="contain"
                  />
                  <View style={styles.previewOverlay}>
                    <TouchableOpacity
                      style={styles.changeImageBtn}
                      onPress={handlePickImage}
                      disabled={isUploading}
                      activeOpacity={0.8}
                    >
                      <Feather name="repeat" size={14} color="#ffffff" />
                      <Text style={styles.previewBtnText}>Change</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.removeImageBtn}
                      onPress={() => setImageUri(null)}
                      disabled={isUploading}
                      activeOpacity={0.8}
                    >
                      <Feather name="trash-2" size={14} color="#ffffff" />
                      <Text style={styles.previewBtnText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.pickerBox}
                  onPress={handlePickImage}
                  activeOpacity={0.7}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Select meme image from gallery"
                >
                  <View style={styles.pickerIconCircle}>
                    <Feather
                      name="image"
                      size={28}
                      color={CAMPUS_HUB_COLORS.memeAccent}
                    />
                  </View>
                  <Text style={styles.pickerTitle}>Tap to select a meme</Text>
                  <Text style={styles.pickerSubtitle}>
                    PNG, JPG, WEBP, or GIF up to 10MB
                  </Text>
                </TouchableOpacity>
              )}

              {/* Caption Input */}
              <View style={styles.captionHeaderRow}>
                <Text style={styles.sectionLabel}>CAPTION (OPTIONAL)</Text>
                <Text style={styles.charCount}>{caption.length}/280</Text>
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="Add a funny punchline or context..."
                placeholderTextColor={CAMPUS_HUB_COLORS.subtleText}
                value={caption}
                onChangeText={setCaption}
                maxLength={280}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                editable={!isUploading}
              />

              {/* University Guidelines hint with generous breathing room */}
              <View style={styles.guidelinesBox}>
                <Feather
                  name="info"
                  size={15}
                  color={CAMPUS_HUB_COLORS.subtleText}
                  style={{ marginTop: 2 }}
                />
                <Text style={styles.guidelinesText}>
                  Keep memes respectful and university-friendly. Inappropriate
                  content will be removed.
                </Text>
              </View>
            </ScrollView>

            {/* Bottom Docked Action Footer with Safe Area */}
            <View
              style={[
                styles.modalFooter,
                {
                  paddingBottom:
                    keyboardHeight > 0 ? 14 : Math.max(insets.bottom, 16),
                },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  (!imageUri || isUploading) && styles.submitBtnDisabled,
                ]}
                onPress={handleSubmit}
                disabled={!imageUri || isUploading}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Publish meme"
                activeOpacity={0.8}
              >
                {isUploading ? (
                  <View style={styles.loadingRow}>
                    <ActivityIndicator size="small" color="#ffffff" />
                    <Text style={styles.submitBtnText}>Uploading Meme...</Text>
                  </View>
                ) : (
                  <View style={styles.loadingRow}>
                    <Feather name="send" size={16} color="#ffffff" />
                    <Text style={styles.submitBtnText}>Publish Meme</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(10, 15, 29, 0.65)",
    justifyContent: "flex-end",
  },
  keyboardAvoid: {
    width: "100%",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
    ...CAMPUS_HUB_COLORS.heroShadow,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(0, 0, 0, 0.15)",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 6,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 14,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: CAMPUS_HUB_COLORS.subtleBorder,
  },
  headerTitleGroup: {
    alignItems: "center",
  },
  modalTitle: {
    fontFamily,
    fontSize: 17,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontFamily,
    fontSize: 11.5,
    color: CAMPUS_HUB_COLORS.subtleText,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 20,
  },
  sectionLabel: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.subtleText,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  pickerBox: {
    height: 170,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "rgba(236, 72, 153, 0.25)",
    borderStyle: "dashed",
    backgroundColor: "#fdf2f8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    gap: 6,
  },
  pickerIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
    ...CAMPUS_HUB_COLORS.shadow,
  },
  pickerTitle: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  pickerSubtitle: {
    fontFamily,
    fontSize: 11,
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  previewBox: {
    height: 220,
    borderRadius: 18,
    backgroundColor: "#0f172a",
    overflow: "hidden",
    marginBottom: 18,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  previewOverlay: {
    position: "absolute",
    bottom: 12,
    flexDirection: "row",
    gap: 10,
  },
  changeImageBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(19, 27, 46, 0.85)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
  },
  removeImageBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(225, 29, 72, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
  },
  previewBtnText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: "#ffffff",
  },
  captionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  charCount: {
    fontFamily,
    fontSize: 11,
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  textInput: {
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily,
    fontSize: 14,
    color: CAMPUS_HUB_COLORS.neutralText,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    minHeight: 100,
    marginBottom: 16,
  },
  guidelinesBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#f1f5f9",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 4,
  },
  guidelinesText: {
    fontFamily,
    fontSize: 12,
    color: CAMPUS_HUB_COLORS.subtleText,
    flex: 1,
    lineHeight: 18,
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderTopWidth: 1,
    borderTopColor: CAMPUS_HUB_COLORS.subtleBorder,
    ...CAMPUS_HUB_COLORS.heroShadow,
  },
  submitBtn: {
    backgroundColor: CAMPUS_HUB_COLORS.memeAccent,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    ...CAMPUS_HUB_COLORS.heroShadow,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  submitBtnText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "800",
    color: "#ffffff",
  },
});
