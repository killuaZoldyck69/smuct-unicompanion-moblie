import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  Pressable,
  TextInput,
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
import Toast from "react-native-toast-message";
import { toastConfig } from "@/components/ui/toast-config";
import {
  ModalKeyboardAvoidingView,
  useSoftKeyboardOpen,
} from "@/components/ui/modal-keyboard-avoider";
import { colors } from "@/theme/colors";

import { useCurrentUser } from "@/hooks/use-current-user";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { extractApiErrorInfo } from "@/features/forum/forum-logic";
import {
  LOST_FOUND_LIMITS,
  validateClaimForm,
} from "@/features/campus-hub/lost-found-logic";
import { useSubmitLostFoundClaim } from "@/features/campus-hub/useLostFound";
import {
  deleteRemovedCloudinaryUploads,
  useUgcTermsRetry,
  validateLocalImageSizes,
} from "@/features/campus-hub/useLostFoundUpload";
import { UgcGuidelinesModal } from "@/screens/forum/components/ugc/ugc-guidelines-modal";
import {
  uploadImageToCloudinary,
  deleteFileFromCloudinaryApi,
  CLOUDINARY_FOLDERS,
} from "@/services/cloudinary-service";
import type {
  LostFoundPost,
  CreateClaimInput,
} from "@/services/lost-found-service";
import {
  CAMPUS_HUB_COLORS,
  fontFamily,
  titleFontFamily,
} from "../../shared/design-tokens";
import { ImagePickerRow } from "../../shared/image-picker-row";
import { LocationBadge } from "./status-badge";

interface ClaimModalProps {
  visible: boolean;
  onClose: () => void;
  post: LostFoundPost;
  onSuccess?: () => void;
}

const ACCENT = CAMPUS_HUB_COLORS.lostFoundAccent;
const ACCENT_FILL = CAMPUS_HUB_COLORS.lostFoundAccentFill;

export const ClaimModal = React.memo(function ClaimModal({
  visible,
  onClose,
  post,
  onSuccess,
}: ClaimModalProps) {
  const insets = useSafeAreaInsets();
  const isKeyboardOpen = useSoftKeyboardOpen(visible);
  const { user: currentUser } = useCurrentUser();
  const { isOffline } = useNetworkStatus();
  const [message, setMessage] = useState("");
  const [answer, setAnswer] = useState("");
  const [localImages, setLocalImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedProofMap, setUploadedProofMap] = useState<
    Record<string, string>
  >({});
  const claimMessageRef = useRef<TextInput>(null);
  const submittingRef = useRef(false);

  const submitMutation = useSubmitLostFoundClaim(post.id);
  const isSubmitting = isUploading || submitMutation.isPending;

  const isLost = post.type === "LOST";
  const claimActionTitle = isLost ? "I Found This Item" : "This Item Is Mine";
  const messagePlaceholder = isLost
    ? "Describe where and when you found it, item condition, or where it is safely kept..."
    : "Describe unique features, marks, contents, or circumstances when you lost it...";

  const cleanupUploadedProof = useCallback(() => {
    Object.values(uploadedProofMap).forEach((url) => {
      deleteFileFromCloudinaryApi(url, "image").catch((err) => {
        console.warn("[Cloudinary] Failed to remove proof image:", err);
      });
    });
    setUploadedProofMap({});
  }, [uploadedProofMap]);

  const submitClaimPayload = useCallback(
    (payload: CreateClaimInput) => {
      ugcRetry.queuePayload(payload);
      submitMutation.mutate(payload, {
        onSuccess: () => {
          ugcRetry.clearQueuedPayload();
          setUploadedProofMap({});
          setMessage("");
          setAnswer("");
          setLocalImages([]);
          onClose();
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
        onError: (err) => {
          if (ugcRetry.handleUgcError(err)) return;
          const info = extractApiErrorInfo(err, "Failed to submit claim.");
          Toast.show({
            type: "error",
            text1: "Submission Failed",
            text2: info.message,
          });
        },
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [submitMutation, onClose, onSuccess],
  );

  const ugcRetry = useUgcTermsRetry<CreateClaimInput>(
    currentUser?.id,
    submitClaimPayload,
  );

  const handleClose = useCallback(() => {
    if (isSubmitting) return;
    cleanupUploadedProof();
    ugcRetry.clearQueuedPayload();
    setMessage("");
    setAnswer("");
    setLocalImages([]);
    onClose();
  }, [isSubmitting, onClose, cleanupUploadedProof, ugcRetry]);

  const canSubmit =
    message.trim().length >= LOST_FOUND_LIMITS.MIN_CLAIM_MESSAGE &&
    (!post.verificationQuestion || answer.trim().length > 0);

  const handleSubmit = useCallback(async () => {
    if (submittingRef.current || isSubmitting) return;
    submittingRef.current = true;
    try {
      Keyboard.dismiss();
      if (isOffline) {
        Toast.show({
          type: "error",
          text1: "You're Offline",
          text2: "Reconnect to the internet before submitting a claim.",
        });
        return;
      }

      const validation = validateClaimForm({
        message,
        answer,
        hasVerificationQuestion: Boolean(post.verificationQuestion),
      });
      if (validation.error || !validation.payload) {
        Toast.show({
          type: "error",
          text1: "Check Your Claim",
          text2: validation.error || "Please complete the required details.",
        });
        return;
      }

      if (localImages.length > 1) {
        Toast.show({
          type: "error",
          text1: "Photo Limit Exceeded",
          text2: "Only 1 proof photo can be attached.",
        });
        return;
      }

      let proofImageUrl: string | null = null;
      if (localImages.length > 0 && localImages[0]) {
        const uri = localImages[0];
        if (uploadedProofMap[uri]) {
          proofImageUrl = uploadedProofMap[uri];
        } else {
          const sizeError = await validateLocalImageSizes([uri], "Proof photo");
          if (sizeError) {
            Toast.show({
              type: "error",
              text1: "Photo Exceeds 5MB",
              text2: sizeError,
            });
            return;
          }

          setIsUploading(true);
          try {
            const result = await uploadImageToCloudinary(
              uri,
              CLOUDINARY_FOLDERS.CAMPUS_HUB.LOST_FOUND_CLAIMS,
            );
            proofImageUrl = result.secureUrl;
            setUploadedProofMap((prev) => ({
              ...prev,
              [uri]: result.secureUrl,
            }));
          } catch (err) {
            setIsUploading(false);
            const info = extractApiErrorInfo(
              err,
              "Could not upload proof image. Check connection.",
            );
            Toast.show({
              type: "error",
              text1: "Upload Failed",
              text2: info.message,
            });
            return;
          }
          setIsUploading(false);
        }
      }

      submitClaimPayload({
        message: validation.payload.message,
        answer: validation.payload.answer,
        proofImage: proofImageUrl || null,
      });
    } finally {
      submittingRef.current = false;
    }
  }, [
    isSubmitting,
    isOffline,
    message,
    answer,
    localImages,
    post.verificationQuestion,
    uploadedProofMap,
    submitClaimPayload,
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
        backgroundColor={CAMPUS_HUB_COLORS.white}
        translucent={true}
      />
      <SafeAreaView style={styles.fullScreenContainer} edges={["top"]}>
        {/* Top Header Navigation Bar */}
        <View style={styles.topHeader}>
          <View style={styles.topHeaderInner}>
            <View style={styles.headerTitleGroup}>
              <Text style={styles.headerTitle}>{claimActionTitle}</Text>
              <View style={styles.hubBadge}>
                <Text
                  style={styles.hubBadgeText}
                  maxFontSizeMultiplier={1.25}
                >
                  CAMPUS HUB
                </Text>
              </View>
            </View>

            <Pressable
              onPress={handleClose}
              disabled={isSubmitting}
              style={({ pressed }) => [
                styles.circleBtn,
                isSubmitting && { opacity: 0.45 },
                pressed && !isSubmitting && { opacity: 0.75 },
              ]}
              android_ripple={{
                color: CAMPUS_HUB_COLORS.androidRipple,
                borderless: true,
              }}
              accessible={true}
              accessibilityRole="button"
              accessibilityState={{ disabled: isSubmitting }}
              accessibilityLabel="Close claim modal"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="x" size={18} color={CAMPUS_HUB_COLORS.deepNavy} />
            </Pressable>
          </View>
        </View>

        <ModalKeyboardAvoidingView
          enabled={visible}
          style={styles.keyboardAvoid}
        >
          {/* Scrollable form content */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
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
                        : CAMPUS_HUB_COLORS.foundTealBg,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.typeBadgeText,
                      {
                        color: isLost
                          ? CAMPUS_HUB_COLORS.dangerText
                          : CAMPUS_HUB_COLORS.foundTealText,
                      },
                    ]}
                    maxFontSizeMultiplier={1.25}
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
                  <Feather
                    name="shield"
                    size={15}
                    color={CAMPUS_HUB_COLORS.skyAccentInk}
                  />
                  <Text style={styles.verificationLabel}>
                    OWNER&apos;S VERIFICATION QUESTION
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
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => claimMessageRef.current?.focus()}
                  accessible
                  accessibilityLabel="Verification answer"
                />
              </View>
            )}

            {/* Claim Message Input */}
            <View style={styles.formGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>CLAIM DETAILS & PROOF</Text>
                <Text style={styles.charCount} maxFontSizeMultiplier={1.25}>
                  {message.length}/1000
                </Text>
              </View>
              <TextInput
                ref={claimMessageRef}
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
                onImagesChange={(imgs) => {
                  deleteRemovedCloudinaryUploads(
                    imgs,
                    uploadedProofMap,
                    setUploadedProofMap,
                  );
                  setLocalImages(imgs);
                }}
                maxImages={1}
                maxSizeBytes={LOST_FOUND_LIMITS.MAX_IMAGE_BYTES}
                accent={ACCENT}
                hint="Max 1 photo • Up to 5MB"
              />
            </View>
          </ScrollView>

          {/* Bottom Docked Action Footer with Safe Area */}
          <View
            style={[
              styles.modalFooter,
              { paddingBottom: isKeyboardOpen ? 12 : Math.max(insets.bottom, 16) },
            ]}
          >
            <View style={styles.modalFooterInner}>
              <Pressable
                style={({ pressed }) => [
                  styles.submitBtn,
                  (!canSubmit || isSubmitting) && styles.submitBtnDisabled,
                  pressed &&
                    canSubmit &&
                    !isSubmitting && { opacity: 0.88 },
                ]}
                onPress={handleSubmit}
                disabled={!canSubmit || isSubmitting}
                android_ripple={{ color: CAMPUS_HUB_COLORS.androidRippleLight }}
                accessible
                accessibilityRole="button"
                accessibilityState={{
                  disabled: !canSubmit || isSubmitting,
                  busy: isSubmitting,
                }}
                accessibilityLabel="Submit claim"
              >
                {isSubmitting ? (
                  <ActivityIndicator
                    size="small"
                    color={CAMPUS_HUB_COLORS.white}
                  />
                ) : (
                  <>
                    <Feather
                      name="send"
                      size={16}
                      color={CAMPUS_HUB_COLORS.white}
                      style={{ marginRight: 8 }}
                    />
                    <Text style={styles.submitBtnText}>Submit Claim</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </ModalKeyboardAvoidingView>

        <UgcGuidelinesModal
          visible={ugcRetry.showGuidelines}
          renderInline={true}
          isOffline={isOffline}
          isSubmitting={ugcRetry.isAcceptingGuidelines}
          onClose={() => ugcRetry.setShowGuidelines(false)}
          onAccept={ugcRetry.acceptGuidelines}
        />

        {/* Embedded Toast Overlay for Modal Viewport */}
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
    borderBottomWidth: 1,
    borderBottomColor: CAMPUS_HUB_COLORS.cardBorder,
    backgroundColor: CAMPUS_HUB_COLORS.white,
  },
  topHeaderInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    width: "100%",
    maxWidth: CAMPUS_HUB_COLORS.contentMaxWidth,
    alignSelf: "center",
  },
  headerTitleGroup: {
    flex: 1,
    alignItems: "flex-start",
    marginRight: 12,
  },
  headerTitle: {
    fontFamily: titleFontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
    letterSpacing: -0.3,
  },
  hubBadge: {
    backgroundColor: CAMPUS_HUB_COLORS.lostFoundAccentLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
    alignSelf: "flex-start",
  },
  hubBadgeText: {
    fontFamily,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.lostFoundAccentText,
    letterSpacing: 0.6,
    includeFontPadding: false,
  },
  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.slate100,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: CAMPUS_HUB_COLORS.background,
  },
  scroll: {
    padding: 20,
    paddingBottom: 24,
    width: "100%",
    maxWidth: CAMPUS_HUB_COLORS.contentMaxWidth,
    alignSelf: "center",
  },
  summaryCard: {
    backgroundColor: colors.slate50,
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: colors.slate200,
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
    lineHeight: 12,
    fontWeight: "800",
    letterSpacing: 0.4,
    includeFontPadding: false,
  },
  summaryTitle: {
    fontFamily,
    fontSize: 16,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
    lineHeight: 22,
  },
  verificationBox: {
    backgroundColor: CAMPUS_HUB_COLORS.skyTint,
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.skyBorder,
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
    color: CAMPUS_HUB_COLORS.skyAccentInk,
    letterSpacing: 0.5,
  },
  verificationQuestion: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
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
    borderColor: CAMPUS_HUB_COLORS.skyBorder,
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
    color: CAMPUS_HUB_COLORS.mutedInk,
    letterSpacing: 0.4,
  },
  charCount: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.mutedInk,
    fontVariant: ["tabular-nums"],
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
    borderColor: CAMPUS_HUB_COLORS.cardBorder,
  },
  textArea: {
    minHeight: 120,
    paddingTop: 12,
  },
  helpText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "500",
    color: CAMPUS_HUB_COLORS.mutedInk,
    marginBottom: 10,
    lineHeight: 16,
  },
  modalFooter: {
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderTopWidth: 1,
    borderTopColor: CAMPUS_HUB_COLORS.cardBorder,
    ...CAMPUS_HUB_COLORS.footerShadow,
  },
  modalFooterInner: {
    width: "100%",
    maxWidth: CAMPUS_HUB_COLORS.contentMaxWidth,
    alignSelf: "center",
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ACCENT_FILL,
    height: 50,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    overflow: "hidden",
    ...CAMPUS_HUB_COLORS.shadow,
  },
  submitBtnDisabled: {
    backgroundColor: colors.slate300,
    opacity: 0.65,
    elevation: 0,
    shadowOpacity: 0,
  },
  submitIcon: {
    marginRight: 8,
  },
  submitBtnText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.white,
  },
});
