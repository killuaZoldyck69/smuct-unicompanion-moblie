import React from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { toastConfig } from "@/components/ui/toast-config";
import { MEME_LIMITS } from "@/features/campus-hub/meme-logic";
import { useMemeCompose } from "@/features/campus-hub/useMemeCompose";
import { UgcGuidelinesModal } from "@/screens/forum/components/ugc/ugc-guidelines-modal";
import { colors } from "@/theme/colors";
import {
  CAMPUS_HUB_COLORS,
  fontFamily,
  titleFontFamily,
} from "../../shared/design-tokens";

interface MemeComposeModalProps {
  visible: boolean;
  onClose: () => void;
}

export const MemeComposeModal = React.memo(function MemeComposeModal({
  visible,
  onClose,
}: MemeComposeModalProps) {
  const insets = useSafeAreaInsets();
  const {
    imageUri,
    caption,
    setCaption,
    isOffline,
    isBusy,
    showGuidelines,
    isAcceptingGuidelines,
    handlePickImage,
    handleRemoveImage,
    handleClose,
    submitMeme,
    acceptGuidelines,
    dismissGuidelines,
  } = useMemeCompose(visible, onClose);

  const isSubmitDisabled = !imageUri || isBusy;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent={true}
      navigationBarTranslucent={true}
      onRequestClose={handleClose}
    >
      <StatusBar barStyle="dark-content" backgroundColor={CAMPUS_HUB_COLORS.white} translucent={true} />
      <SafeAreaView style={styles.fullScreenContainer} edges={["top", "bottom"]}>
        <View style={styles.topHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Post a Meme</Text>
            <View style={styles.hubBadge}>
              <Text style={styles.hubBadgeText}>CAMPUS HUB</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleClose}
            disabled={isBusy}
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

        <KeyboardAvoidingView behavior="padding" style={styles.keyboardAvoid}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.formGroup}>
              <Text style={styles.sectionLabel}>
                MEME IMAGE <Text style={styles.requiredStar}>*</Text>
              </Text>

              {imageUri ? (
                <View style={styles.previewBox}>
                  <Image
                    source={{ uri: imageUri }}
                    style={styles.previewImage}
                    contentFit="contain"
                    cachePolicy="memory-disk"
                  />
                  <View style={styles.previewOverlay}>
                    <TouchableOpacity
                      style={styles.changeImageBtn}
                      onPress={() => {
                        void handlePickImage();
                      }}
                      disabled={isBusy}
                      activeOpacity={0.8}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel="Change meme image"
                    >
                      <Feather name="refresh-cw" size={13} color={colors.white} />
                      <Text style={styles.previewBtnText}>Change</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.removeImageBtn}
                      onPress={handleRemoveImage}
                      disabled={isBusy}
                      activeOpacity={0.8}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel="Remove meme image"
                    >
                      <Feather name="trash-2" size={13} color={colors.white} />
                      <Text style={styles.previewBtnText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.pickerBox}
                  onPress={() => {
                    void handlePickImage();
                  }}
                  disabled={isBusy}
                  activeOpacity={0.8}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Pick meme image"
                >
                  <View style={styles.pickerIconCircle}>
                    <Feather name="image" size={24} color={CAMPUS_HUB_COLORS.memeAccent} />
                  </View>
                  <Text style={styles.pickerTitle}>Tap to select a meme</Text>
                  <Text style={styles.pickerSubtitle}>PNG, JPG, WEBP, or GIF up to 5MB</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.formGroup}>
              <View style={styles.captionHeaderRow}>
                <Text style={styles.sectionLabel}>CAPTION (OPTIONAL)</Text>
                <Text style={styles.charCount}>
                  {caption.length}/{MEME_LIMITS.MAX_CAPTION}
                </Text>
              </View>

              <TextInput
                style={styles.textInput}
                placeholder="Add a funny punchline or context..."
                placeholderTextColor={CAMPUS_HUB_COLORS.subtleText}
                value={caption}
                onChangeText={setCaption}
                maxLength={MEME_LIMITS.MAX_CAPTION}
                multiline={true}
                numberOfLines={3}
                textAlignVertical="top"
                editable={!isBusy}
                accessible={true}
                accessibilityLabel="Meme caption input"
              />
            </View>

            <View style={styles.guidelinesBox}>
              <Feather
                name="info"
                size={14}
                color={CAMPUS_HUB_COLORS.subtleText}
                style={styles.guidelinesIcon}
              />
              <Text style={styles.guidelinesText}>
                Keep memes respectful and university-friendly. Inappropriate content will be removed.
              </Text>
            </View>
          </ScrollView>

          <View style={[styles.modalFooter, { paddingBottom: Math.max(insets.bottom, 14) }]}>
            <TouchableOpacity
              style={[styles.submitBtn, isSubmitDisabled && styles.submitBtnDisabled]}
              onPress={() => {
                void submitMeme();
              }}
              disabled={isSubmitDisabled}
              accessible={true}
              accessibilityRole="button"
              accessibilityState={{ disabled: isSubmitDisabled }}
              accessibilityLabel="Publish meme"
              activeOpacity={0.8}
            >
              {isBusy ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color={CAMPUS_HUB_COLORS.memeDisabledText} />
                  <Text style={[styles.submitBtnText, styles.submitBtnTextDisabled]}>
                    Publishing Meme...
                  </Text>
                </View>
              ) : (
                <View style={styles.loadingRow}>
                  <Feather
                    name="send"
                    size={16}
                    color={isSubmitDisabled ? CAMPUS_HUB_COLORS.memeDisabledText : colors.white}
                  />
                  <Text style={[styles.submitBtnText, isSubmitDisabled && styles.submitBtnTextDisabled]}>
                    Publish Meme
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        <UgcGuidelinesModal
          visible={showGuidelines}
          onClose={dismissGuidelines}
          onAccept={acceptGuidelines}
          isSubmitting={isAcceptingGuidelines}
          isOffline={isOffline}
          renderInline={true}
        />

        <Toast config={toastConfig} topOffset={Math.max(insets.top + 8, 44)} />
      </SafeAreaView>
    </Modal>
  );
});

const styles = StyleSheet.create({
  fullScreenContainer: { flex: 1, backgroundColor: CAMPUS_HUB_COLORS.white },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.navyAlpha06,
    backgroundColor: CAMPUS_HUB_COLORS.white,
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  headerTitle: {
    fontSize: 18,
    fontFamily: titleFontFamily,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
    letterSpacing: -0.3,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
    justifyContent: "center",
    alignItems: "center",
  },
  keyboardAvoid: { flex: 1 },
  scrollView: { flex: 1, backgroundColor: CAMPUS_HUB_COLORS.white },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 36, gap: 16 },
  formGroup: { gap: 6 },
  sectionLabel: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.subtleText,
    letterSpacing: 0.5,
  },
  requiredStar: { color: CAMPUS_HUB_COLORS.dangerText, fontWeight: "800" },
  pickerBox: {
    height: 200,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: CAMPUS_HUB_COLORS.memeAccentBorderSoft,
    borderStyle: "dashed",
    backgroundColor: CAMPUS_HUB_COLORS.memeAccentLight,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  pickerIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.memeAccentBorderSubtle,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  pickerTitle: { fontFamily, fontSize: 14, fontWeight: "700", color: CAMPUS_HUB_COLORS.deepNavy },
  pickerSubtitle: { fontFamily, fontSize: 11, color: CAMPUS_HUB_COLORS.subtleText },
  previewBox: {
    height: 240,
    borderRadius: 18,
    backgroundColor: colors.navyInk,
    overflow: "hidden",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  previewImage: { width: "100%", height: "100%" },
  previewOverlay: { position: "absolute", bottom: 12, flexDirection: "row", gap: 10 },
  changeImageBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: CAMPUS_HUB_COLORS.memeOverlayDark,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
  },
  removeImageBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: CAMPUS_HUB_COLORS.memeOverlayDanger,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
  },
  previewBtnText: { fontFamily, fontSize: 11, fontWeight: "700", color: colors.white },
  captionHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  charCount: {
    fontFamily,
    fontSize: 11,
    color: CAMPUS_HUB_COLORS.subtleText,
    fontVariant: ["tabular-nums"],
  },
  textInput: {
    backgroundColor: colors.slate50,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily,
    fontSize: 14,
    color: CAMPUS_HUB_COLORS.neutralText,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.cardBorder,
    minHeight: 110,
  },
  guidelinesBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  guidelinesIcon: { marginTop: 2 },
  guidelinesText: { fontFamily, fontSize: 12, color: CAMPUS_HUB_COLORS.subtleText, flex: 1, lineHeight: 18 },
  modalFooter: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderTopWidth: 1,
    borderTopColor: colors.navyAlpha06,
  },
  submitBtn: {
    backgroundColor: CAMPUS_HUB_COLORS.memeAccent,
    borderRadius: 12,
    minHeight: 48,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtnDisabled: { backgroundColor: CAMPUS_HUB_COLORS.memeDisabledBg },
  loadingRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  submitBtnText: { fontFamily, fontSize: 14.5, fontWeight: "800", color: colors.white },
  submitBtnTextDisabled: { color: CAMPUS_HUB_COLORS.memeDisabledText },
});
