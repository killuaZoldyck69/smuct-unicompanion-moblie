import React, { useState, useCallback } from "react";
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
  Keyboard,
  StatusBar,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
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
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const createMemeMutation = useCreateMeme();

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
        CLOUDINARY_FOLDERS.CAMPUS_HUB.MEMES,
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
      presentationStyle="fullScreen"
      statusBarTranslucent={true}
      onRequestClose={handleModalClose}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#ffffff"
        translucent={true}
      />
      <SafeAreaView
        style={styles.fullScreenContainer}
        edges={["top", "bottom"]}
      >
        {/* Top Header */}
        <View style={styles.topHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Post a Meme</Text>
            <View style={styles.hubBadge}>
              <Text style={styles.hubBadgeText}>CAMPUS HUB</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleModalClose}
            disabled={isUploading}
            style={styles.closeBtn}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Close compose modal"
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="x" size={18} color={CAMPUS_HUB_COLORS.deepNavy} />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardAvoid}
        >
          {/* Scrollable Form Content */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Image Picker Box */}
            <View style={styles.formGroup}>
              <Text style={styles.sectionLabel}>
                MEME IMAGE <Text style={styles.requiredStar}>*</Text>
              </Text>

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
                      <Feather name="refresh-cw" size={13} color="#ffffff" />
                      <Text style={styles.previewBtnText}>Change</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.removeImageBtn}
                      onPress={() => setImageUri(null)}
                      disabled={isUploading}
                      activeOpacity={0.8}
                    >
                      <Feather name="trash-2" size={13} color="#ffffff" />
                      <Text style={styles.previewBtnText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.pickerBox}
                  onPress={handlePickImage}
                  disabled={isUploading}
                  activeOpacity={0.8}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Pick meme image"
                >
                  <View style={styles.pickerIconCircle}>
                    <Feather
                      name="image"
                      size={24}
                      color={CAMPUS_HUB_COLORS.memeAccent}
                    />
                  </View>
                  <Text style={styles.pickerTitle}>Tap to select a meme</Text>
                  <Text style={styles.pickerSubtitle}>
                    PNG, JPG, WEBP, or GIF up to 10MB
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Caption Input Box */}
            <View style={styles.formGroup}>
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
                multiline={true}
                numberOfLines={3}
                textAlignVertical="top"
                editable={!isUploading}
                accessible={true}
                accessibilityLabel="Meme caption input"
              />
            </View>

            {/* Community Guidelines Card */}
            <View style={styles.guidelinesBox}>
              <Feather
                name="info"
                size={14}
                color={CAMPUS_HUB_COLORS.subtleText}
                style={{ marginTop: 2 }}
              />
              <Text style={styles.guidelinesText}>
                Keep memes respectful and university-friendly. Inappropriate
                content will be removed.
              </Text>
            </View>
          </ScrollView>

          {/* Bottom Docked Action Footer */}
          <View
            style={[
              styles.modalFooter,
              { paddingBottom: Math.max(insets.bottom, 14) },
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
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
});

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(19, 27, 46, 0.06)",
    backgroundColor: "#ffffff",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  hubBadge: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: CAMPUS_HUB_COLORS.memeAccentLight,
  },
  hubBadgeText: {
    fontSize: 9.5,
    fontFamily,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.memeAccentText,
    letterSpacing: 0.4,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 36,
    gap: 16,
  },
  formGroup: {
    gap: 6,
  },
  sectionLabel: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.subtleText,
    letterSpacing: 0.5,
  },
  requiredStar: {
    color: CAMPUS_HUB_COLORS.dangerText,
    fontWeight: "800",
  },
  pickerBox: {
    height: 200,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "rgba(236, 72, 153, 0.25)",
    borderStyle: "dashed",
    backgroundColor: "#fdf2f8",
    alignItems: "center",
    justifyContent: "center",
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
    height: 240,
    borderRadius: 18,
    backgroundColor: "#0f172a",
    overflow: "hidden",
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
    minHeight: 110,
  },
  guidelinesBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#f1f5f9",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  guidelinesText: {
    fontFamily,
    fontSize: 12,
    color: CAMPUS_HUB_COLORS.subtleText,
    flex: 1,
    lineHeight: 18,
  },
  modalFooter: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderTopWidth: 1,
    borderTopColor: "rgba(19, 27, 46, 0.06)",
  },
  submitBtn: {
    backgroundColor: CAMPUS_HUB_COLORS.memeAccent,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtnDisabled: {
    backgroundColor: "#fbcfe8",
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  submitBtnText: {
    fontFamily,
    fontSize: 14.5,
    fontWeight: "800",
    color: "#ffffff",
  },
});
