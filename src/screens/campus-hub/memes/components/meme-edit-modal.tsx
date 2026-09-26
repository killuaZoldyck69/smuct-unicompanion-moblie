import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Platform,
  ScrollView,
  useWindowDimensions,
  Keyboard,
  KeyboardAvoidingView,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useUpdateMeme } from "@/features/campus-hub/useMemes";
import type { Meme } from "@/services/meme-service";
import { CAMPUS_HUB_COLORS, fontFamily } from "../../shared/design-tokens";

interface MemeEditModalProps {
  visible: boolean;
  meme: Meme | null;
  onClose: () => void;
}

export const MemeEditModal = React.memo(function MemeEditModal({
  visible,
  meme,
  onClose,
}: MemeEditModalProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const [caption, setCaption] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const updateMemeMutation = useUpdateMeme();

  useEffect(() => {
    if (meme) {
      setCaption(meme.caption ?? "");
    }
  }, [meme]);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

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

  // When keyboard opens, ensure input is scrolled into view smoothly
  useEffect(() => {
    if (keyboardHeight > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 80);
    }
  }, [keyboardHeight]);

  const maxAllowedWithKeyboard = windowHeight - keyboardHeight - Math.max(insets.top, 24) - 10;
  const sheetMaxHeight =
    keyboardHeight > 0
      ? Math.max(260, maxAllowedWithKeyboard)
      : Math.round(windowHeight * 0.85);

  const previewHeight = keyboardHeight > 0 ? 110 : 165;

  const handleModalClose = useCallback(() => {
    if (updateMemeMutation.isPending) return;
    Keyboard.dismiss();
    onClose();
  }, [updateMemeMutation.isPending, onClose]);

  const handleSubmit = useCallback(() => {
    if (!meme) return;

    updateMemeMutation.mutate(
      {
        memeId: meme.id,
        data: {
          caption: caption.trim() || null,
        },
      },
      {
        onSuccess: () => {
          Toast.show({
            type: "success",
            text1: "Meme Updated! ✨",
            text2: "Your changes have been saved.",
          });
          handleModalClose();
        },
        onError: (err: any) => {
          Toast.show({
            type: "error",
            text1: "Update Failed",
            text2: err?.message || "Could not update meme.",
          });
        },
      }
    );
  }, [meme, caption, updateMemeMutation, handleModalClose]);

  if (!visible || !meme) return null;

  const isSaving = updateMemeMutation.isPending;
  const bottomPadding = keyboardHeight > 0 ? 8 : Math.max(insets.bottom, 14);

  return (
    <Modal
      visible={visible}
      transparent={true}
      statusBarTranslucent={true}
      animationType="slide"
      onRequestClose={handleModalClose}
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      <View style={styles.overlay}>
        {/* Backdrop dismiss */}
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
          <View style={[styles.sheet, { maxHeight: sheetMaxHeight }]}>
            {/* Drag Handle */}
            <View style={styles.dragHandle} />

            {/* Modal Header */}
            <View style={styles.header}>
              <View style={styles.headerTitleRow}>
                <View style={styles.headerIconCircle}>
                  <Feather name="edit-2" size={16} color={CAMPUS_HUB_COLORS.memeAccent} />
                </View>
                <Text style={styles.headerTitle}>Edit Caption</Text>
              </View>

              <TouchableOpacity
                onPress={handleModalClose}
                style={styles.closeBtn}
                activeOpacity={0.7}
                disabled={isSaving}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Close edit modal"
              >
                <Feather name="x" size={18} color={CAMPUS_HUB_COLORS.subtleText} />
              </TouchableOpacity>
            </View>

            {/* Scrollable Form Content */}
            <ScrollView
              ref={scrollViewRef}
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {/* Meme Thumbnail Preview Card */}
              <View style={[styles.previewContainer, { height: previewHeight }]}>
                <Image
                  source={{ uri: meme.imageUrl }}
                  style={styles.previewImage}
                  resizeMode="contain"
                />
              </View>

              {/* Caption Input Section */}
              <View style={styles.inputSection}>
                <View style={styles.inputHeader}>
                  <Text style={styles.inputLabel}>CAPTION (OPTIONAL)</Text>
                  <Text style={styles.charCount}>{caption.length}/280</Text>
                </View>

                <TextInput
                  style={styles.captionInput}
                  placeholder="Write a witty or relatable caption..."
                  placeholderTextColor={CAMPUS_HUB_COLORS.subtleText}
                  value={caption}
                  onChangeText={setCaption}
                  maxLength={280}
                  multiline={true}
                  numberOfLines={3}
                  textAlignVertical="top"
                  scrollEnabled={false}
                  editable={!isSaving}
                  accessible={true}
                  accessibilityLabel="Edit meme caption"
                />
              </View>

              {/* University Guidelines hint */}
              <View style={styles.guidelinesBox}>
                <Feather
                  name="info"
                  size={14}
                  color={CAMPUS_HUB_COLORS.subtleText}
                  style={{ marginTop: 2 }}
                />
                <Text style={styles.guidelinesText}>
                  Keep memes respectful and university-friendly. Inappropriate content will be removed.
                </Text>
              </View>
            </ScrollView>

            {/* Pinned Bottom Footer Action Buttons */}
            <View style={[styles.footer, { paddingBottom: bottomPadding }]}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={handleModalClose}
                disabled={isSaving}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
                onPress={handleSubmit}
                disabled={isSaving}
                activeOpacity={0.8}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <View style={styles.btnContentRow}>
                    <Feather name="check" size={16} color="#ffffff" />
                    <Text style={styles.saveBtnText}>Save Changes</Text>
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
    marginBottom: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: CAMPUS_HUB_COLORS.subtleBorder,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: CAMPUS_HUB_COLORS.memeAccentLight,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily,
    fontSize: 16,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flexGrow: 0,
    flexShrink: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
    gap: 12,
  },
  previewContainer: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  inputSection: {
    gap: 8,
  },
  inputHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inputLabel: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.6,
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  charCount: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  captionInput: {
    fontFamily,
    fontSize: 14,
    color: CAMPUS_HUB_COLORS.neutralText,
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.08)",
    padding: 12,
    minHeight: 74,
    lineHeight: 20,
  },
  guidelinesBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.04)",
  },
  guidelinesText: {
    fontFamily,
    fontSize: 11.5,
    color: CAMPUS_HUB_COLORS.subtleText,
    flex: 1,
    lineHeight: 16,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: CAMPUS_HUB_COLORS.subtleBorder,
    backgroundColor: CAMPUS_HUB_COLORS.white,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.neutralText,
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 13,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    backgroundColor: CAMPUS_HUB_COLORS.memeAccent,
    alignItems: "center",
    justifyContent: "center",
    ...CAMPUS_HUB_COLORS.shadow,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  btnContentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  saveBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
});
