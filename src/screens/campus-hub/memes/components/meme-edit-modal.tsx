import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
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
import { useCurrentUser } from "@/hooks/use-current-user";
import { useNetworkStatus } from "@/hooks/use-network-status";
import {
  requireOnline,
  scheduleSuccessToast,
  showApiErrorToast,
  useUgcTermsRetry,
} from "@/features/campus-hub/campus-hub-upload";
import { MEME_LIMITS, sanitizeMemeCaption } from "@/features/campus-hub/meme-logic";
import { useUpdateMeme } from "@/features/campus-hub/useMemes";
import { UgcGuidelinesModal } from "@/screens/forum/components/ugc/ugc-guidelines-modal";
import type { Meme } from "@/services/meme-service";
import { colors } from "@/theme/colors";
import {
  CAMPUS_HUB_COLORS,
  fontFamily,
  titleFontFamily,
} from "../../shared/design-tokens";

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
  const { user } = useCurrentUser();
  const { isOffline } = useNetworkStatus();
  const [caption, setCaption] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);
  const submitLockRef = useRef(false);

  const updateMemeMutation = useUpdateMeme();
  const {
    showGuidelines,
    setShowGuidelines,
    isAcceptingGuidelines,
    queuePayload,
    clearQueuedPayload,
    handleUgcError,
    acceptGuidelines,
  } = useUgcTermsRetry<void>(user?.id);

  useEffect(() => {
    if (meme) {
      setCaption(meme.caption ?? "");
    }
    if (!visible) {
      submitLockRef.current = false;
      clearQueuedPayload();
    }
  }, [meme, visible, clearQueuedPayload]);

  const handleModalClose = useCallback(() => {
    if (updateMemeMutation.isPending) return;
    Keyboard.dismiss();
    clearQueuedPayload();
    onClose();
  }, [updateMemeMutation.isPending, clearQueuedPayload, onClose]);

  const handleSubmit = useCallback(async () => {
    if (!meme || submitLockRef.current || updateMemeMutation.isPending) return;
    if (
      !requireOnline(
        isOffline,
        "Reconnect to the internet before saving caption changes.",
      )
    ) {
      return;
    }

    const sanitized = sanitizeMemeCaption(caption);
    if (sanitized.error) {
      Toast.show({
        type: "error",
        text1: "Invalid Caption",
        text2: sanitized.error,
      });
      return;
    }

    submitLockRef.current = true;
    try {
      await updateMemeMutation.mutateAsync({
        memeId: meme.id,
        data: { caption: sanitized.caption },
      });
      Keyboard.dismiss();
      clearQueuedPayload();
      onClose();
      scheduleSuccessToast("Meme Updated!", "Your caption changes were saved.");
    } catch (err) {
      if (handleUgcError(err)) {
        queuePayload(undefined, () => {
          void handleSubmit();
        });
        return;
      }
      showApiErrorToast(err, "Update Failed", "Could not update meme caption.");
    } finally {
      submitLockRef.current = false;
    }
  }, [
    meme,
    caption,
    isOffline,
    updateMemeMutation,
    clearQueuedPayload,
    onClose,
    handleUgcError,
    queuePayload,
  ]);

  if (!visible || !meme) return null;

  const isSaving = updateMemeMutation.isPending;

  return (
    <Modal
      visible={visible}
      presentationStyle="fullScreen"
      statusBarTranslucent={true}
      navigationBarTranslucent={true}
      animationType="slide"
      onRequestClose={handleModalClose}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor={CAMPUS_HUB_COLORS.white}
        translucent={true}
      />
      <SafeAreaView
        style={styles.fullScreenContainer}
        edges={["top", "bottom"]}
      >
        <View style={styles.topHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Edit Caption</Text>
            <View style={styles.hubBadge}>
              <Text style={styles.hubBadgeText}>CAMPUS HUB</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleModalClose}
            style={styles.closeBtn}
            activeOpacity={0.7}
            disabled={isSaving}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Close edit modal"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="x" size={18} color={CAMPUS_HUB_COLORS.deepNavy} />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView behavior="padding" style={styles.keyboardAvoid}>
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.formGroup}>
              <Text style={styles.sectionLabel}>MEME IMAGE</Text>
              <View style={styles.previewContainer}>
                <Image
                  source={{ uri: meme.imageUrl }}
                  style={styles.previewImage}
                  contentFit="contain"
                  cachePolicy="memory-disk"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <View style={styles.captionHeaderRow}>
                <Text style={styles.sectionLabel}>CAPTION (OPTIONAL)</Text>
                <Text style={styles.charCount}>
                  {caption.length}/{MEME_LIMITS.MAX_CAPTION}
                </Text>
              </View>

              <TextInput
                style={styles.captionInput}
                placeholder="Write a witty or relatable caption..."
                placeholderTextColor={CAMPUS_HUB_COLORS.subtleText}
                value={caption}
                onChangeText={setCaption}
                maxLength={MEME_LIMITS.MAX_CAPTION}
                multiline={true}
                numberOfLines={3}
                textAlignVertical="top"
                editable={!isSaving}
                accessible={true}
                accessibilityLabel="Edit meme caption"
              />
            </View>

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

          <View
            style={[
              styles.footer,
              { paddingBottom: Math.max(insets.bottom, 14) },
            ]}
          >
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={handleModalClose}
              disabled={isSaving}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Cancel caption edit"
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
              onPress={() => {
                void handleSubmit();
              }}
              disabled={isSaving}
              activeOpacity={0.8}
              accessible={true}
              accessibilityRole="button"
              accessibilityState={{ disabled: isSaving }}
              accessibilityLabel="Save caption changes"
            >
              {isSaving ? (
                <ActivityIndicator
                  size="small"
                  color={CAMPUS_HUB_COLORS.memeDisabledText}
                />
              ) : (
                <View style={styles.btnContentRow}>
                  <Feather name="check" size={16} color={colors.white} />
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        <UgcGuidelinesModal
          visible={showGuidelines}
          onClose={() => {
            clearQueuedPayload();
            setShowGuidelines(false);
          }}
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
  fullScreenContainer: {
    flex: 1,
    backgroundColor: CAMPUS_HUB_COLORS.white,
  },
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
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: titleFontFamily,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: CAMPUS_HUB_COLORS.white,
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
  previewContainer: {
    width: "100%",
    height: 240,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: colors.navyInk,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.subtleBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  previewImage: {
    width: "100%",
    height: "100%",
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
    fontVariant: ["tabular-nums"],
  },
  captionInput: {
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
  guidelinesText: {
    fontFamily,
    fontSize: 12,
    color: CAMPUS_HUB_COLORS.subtleText,
    flex: 1,
    lineHeight: 18,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderTopWidth: 1,
    borderTopColor: colors.navyAlpha06,
  },
  cancelBtn: {
    flex: 1,
    minHeight: 48,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  saveBtn: {
    flex: 2,
    minHeight: 48,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: CAMPUS_HUB_COLORS.memeAccent,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnDisabled: {
    backgroundColor: CAMPUS_HUB_COLORS.memeDisabledBg,
  },
  btnContentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  saveBtnText: {
    fontFamily,
    fontSize: 14.5,
    fontWeight: "800",
    color: colors.white,
  },
});
