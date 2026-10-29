import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
  Keyboard,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import Toast from "react-native-toast-message";
import { toastConfig } from "@/components/ui/toast-config";

import { useSubmitLostFoundClaim } from "@/features/campus-hub/useLostFound";
import {
  uploadImageToCloudinary,
  CLOUDINARY_FOLDERS,
} from "@/services/cloudinary-service";
import type { LostFoundPost } from "@/services/lost-found-service";
import { CAMPUS_HUB_COLORS, fontFamily } from "../../shared/design-tokens";
import { ImagePickerRow } from "../../shared/image-picker-row";
import { LocationBadge } from "./status-badge";

interface ClaimModalProps {
  visible: boolean;
  onClose: () => void;
  post: LostFoundPost;
  onSuccess?: () => void;
}

const ACCENT = CAMPUS_HUB_COLORS.lostFoundAccent;

export const ClaimModal = React.memo(function ClaimModal({
  visible,
  onClose,
  post,
  onSuccess,
}: ClaimModalProps) {
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState("");
  const [answer, setAnswer] = useState("");
  const [localImages, setLocalImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const submitMutation = useSubmitLostFoundClaim(post.id);
  const isSubmitting = isUploading || submitMutation.isPending;

  const isLost = post.type === "LOST";
  const claimActionTitle = isLost ? "I Found This Item" : "This Item Is Mine";
  const messagePlaceholder = isLost
    ? "Describe where and when you found it, item condition, or where it is safely kept..."
    : "Describe unique features, marks, contents, or circumstances when you lost it...";

  const handleClose = useCallback(() => {
    setMessage("");
    setAnswer("");
    setLocalImages([]);
    onClose();
  }, [onClose]);

  const canSubmit =
    message.trim().length >= 5 &&
    (!post.verificationQuestion || answer.trim().length > 0);

  const handleSubmit = useCallback(async () => {
    Keyboard.dismiss();
    const trimmedMessage = message.trim();
    if (trimmedMessage.length < 5) {
      return Toast.show({
        type: "error",
        text1: "Message too short",
        text2: "Please provide at least 5 characters of explanation/proof.",
      });
    }

    if (post.verificationQuestion && !answer.trim()) {
      return Toast.show({
        type: "error",
        text1: "Verification Required",
        text2: "Please answer the owner's verification question.",
      });
    }

    if (localImages.length > 1) {
      return Toast.show({
        type: "error",
        text1: "Photo Limit Exceeded",
        text2: "Only 1 proof photo can be attached.",
      });
    }

    let proofImageUrl: string | null = null;
    if (localImages.length > 0 && localImages[0]) {
      const uri = localImages[0];
      try {
        const info = await FileSystem.getInfoAsync(uri);
        if (
          info.exists &&
          typeof (info as any).size === "number" &&
          (info as any).size > 5 * 1024 * 1024
        ) {
          return Toast.show({
            type: "error",
            text1: "Photo Exceeds 5MB",
            text2:
              "Proof photo exceeds 5MB limit. Please choose a smaller photo.",
          });
        }
      } catch {}

      setIsUploading(true);
      try {
        const result = await uploadImageToCloudinary(
          uri,
          CLOUDINARY_FOLDERS.CAMPUS_HUB.LOST_FOUND_CLAIMS,
        );
        proofImageUrl = result.secureUrl;
      } catch (err: any) {
        setIsUploading(false);
        const errMsg =
          err?.response?.data?.message ||
          err?.message ||
          "Could not upload proof image. Check connection.";
        return Toast.show({
          type: "error",
          text1: "Upload Failed",
          text2: errMsg,
        });
      }
      setIsUploading(false);
    }

    submitMutation.mutate(
      {
        message: trimmedMessage,
        answer: answer.trim() ? answer.trim() : null,
        proofImage: proofImageUrl || null,
      },
      {
        onSuccess: () => {
          handleClose();
          onSuccess?.();
          setTimeout(() => {
            Toast.show({
              type: "success",
              text1: "Claim Submitted!",
              text2:
                "The post owner has been notified and will review your claim.",
            });
          }, 350);
        },
        onError: (err: any) => {
          const errorSources = err.response?.data?.errorSources;
          const detailedMsg =
            Array.isArray(errorSources) && errorSources.length > 0
              ? errorSources
                  .map((e: any) => e.message || `${e.path}: invalid`)
                  .join(". ")
              : null;
          const msg =
            detailedMsg ||
            err.response?.data?.message ||
            err.message ||
            "Failed to submit claim.";
          Toast.show({
            type: "error",
            text1: "Submission Failed",
            text2: msg,
          });
        },
      },
    );
  }, [
    message,
    answer,
    localImages,
    post.verificationQuestion,
    submitMutation,
    handleClose,
    onSuccess,
  ]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent={true}
      onRequestClose={handleClose}
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
        {/* Top Header Navigation Bar */}
        <View style={styles.topHeader}>
          <View style={styles.headerTitleGroup}>
            <Text style={styles.headerTitle}>{claimActionTitle}</Text>
            <View style={styles.hubBadge}>
              <Text style={styles.hubBadgeText}>CAMPUS HUB</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleClose}
            style={styles.circleBtn}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Close claim modal"
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="x" size={18} color={CAMPUS_HUB_COLORS.deepNavy} />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {/* Scrollable form content */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Post Summary Card */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryTop}>
                <View
                  style={[
                    styles.typeBadge,
                    {
                      backgroundColor: isLost
                        ? CAMPUS_HUB_COLORS.dangerBg
                        : CAMPUS_HUB_COLORS.marketplaceAccentLight,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.typeBadgeText,
                      {
                        color: isLost
                          ? CAMPUS_HUB_COLORS.dangerText
                          : CAMPUS_HUB_COLORS.marketplaceAccentText,
                      },
                    ]}
                  >
                    {isLost ? "LOST ITEM" : "FOUND ITEM"}
                  </Text>
                </View>
                {!!post.location && <LocationBadge location={post.location} />}
              </View>
              {/* Show FULL title, no truncation */}
              <Text style={styles.summaryTitle}>{post.title}</Text>
            </View>

            {/* Verification Question Prompt (if configured by author) */}
            {!!post.verificationQuestion && (
              <View style={styles.verificationBox}>
                <View style={styles.verificationHeader}>
                  <Feather name="shield" size={15} color="#0284c7" />
                  <Text style={styles.verificationLabel}>
                    OWNER'S VERIFICATION QUESTION
                  </Text>
                </View>
                <Text style={styles.verificationQuestion}>
                  {post.verificationQuestion}
                </Text>
                <TextInput
                  style={styles.answerInput}
                  placeholder="Your answer..."
                  placeholderTextColor={CAMPUS_HUB_COLORS.subtleText}
                  value={answer}
                  onChangeText={setAnswer}
                  maxLength={300}
                  accessible
                  accessibilityLabel="Verification answer"
                />
              </View>
            )}

            {/* Claim Message Input */}
            <View style={styles.formGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>CLAIM DETAILS & PROOF</Text>
                <Text style={styles.charCount}>{message.length}/1000</Text>
              </View>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={messagePlaceholder}
                placeholderTextColor={CAMPUS_HUB_COLORS.subtleText}
                value={message}
                onChangeText={setMessage}
                multiline
                textAlignVertical="top"
                maxLength={1000}
                accessible
                accessibilityLabel="Claim message"
              />
            </View>

            {/* Optional Proof Image Picker - 1 photo */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>ATTACH PROOF PHOTO (OPTIONAL)</Text>
              <Text style={styles.helpText}>
                Upload a proof photo (invoice, photo with item, serial number,
                ID, or receipt).
              </Text>
              <ImagePickerRow
                images={localImages}
                onImagesChange={setLocalImages}
                maxImages={1}
                maxSizeBytes={5 * 1024 * 1024}
                accent={ACCENT}
                hint="Max 1 photo • Up to 5MB"
              />
            </View>
          </ScrollView>

          {/* Bottom Docked Action Footer with Safe Area */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[
                styles.submitBtn,
                (!canSubmit || isSubmitting) && styles.submitBtnDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!canSubmit || isSubmitting}
              activeOpacity={0.8}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Submit claim"
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Feather
                    name="send"
                    size={16}
                    color="#ffffff"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.submitBtnText}>Submit Claim</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        {/* Embedded Toast Overlay for Modal Viewport */}
        <Toast config={toastConfig} topOffset={Math.max(insets.top + 8, 44)} />
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
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    backgroundColor: "#ffffff",
  },
  headerTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    marginRight: 8,
  },
  headerTitle: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
    letterSpacing: -0.3,
  },
  hubBadge: {
    backgroundColor: CAMPUS_HUB_COLORS.lostFoundAccentLight,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  hubBadgeText: {
    fontFamily,
    fontSize: 9,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.lostFoundAccentText,
    letterSpacing: 0.5,
  },
  circleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scroll: {
    padding: 20,
    paddingBottom: 24,
  },
  summaryCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 10,
  },
  summaryTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
  },
  typeBadgeText: {
    fontFamily,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  summaryTitle: {
    fontFamily,
    fontSize: 16,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
    lineHeight: 22,
  },
  verificationBox: {
    backgroundColor: "#f0f9ff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#bae6fd",
    gap: 10,
  },
  verificationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  verificationLabel: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: "#0369a1",
    letterSpacing: 0.5,
  },
  verificationQuestion: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
    lineHeight: 18,
  },
  answerInput: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily,
    fontSize: 13,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.neutralText,
    borderWidth: 1,
    borderColor: "#bae6fd",
  },
  formGroup: {
    marginBottom: 18,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.subtleText,
    letterSpacing: 0.4,
  },
  charCount: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  input: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily,
    fontSize: 14,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.neutralText,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.subtleBorder,
  },
  textArea: {
    minHeight: 120,
    paddingTop: 12,
  },
  helpText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "500",
    color: CAMPUS_HUB_COLORS.subtleText,
    marginBottom: 10,
    lineHeight: 16,
  },
  modalFooter: {
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderTopWidth: 1,
    borderTopColor: CAMPUS_HUB_COLORS.subtleBorder,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ACCENT,
    paddingVertical: 16,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    ...CAMPUS_HUB_COLORS.heroShadow,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitIcon: {
    marginRight: 8,
  },
  submitBtnText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
});
