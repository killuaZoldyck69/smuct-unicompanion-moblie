import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  Platform,
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
import {
  LOST_FOUND_LIMITS,
  validateClaimForm,
} from "@/features/campus-hub/lost-found-logic";
import { useSubmitLostFoundClaim } from "@/features/campus-hub/useLostFound";
import {
  deleteRemovedCloudinaryUploads,
  requireOnline,
  scheduleSuccessToast,
  showApiErrorToast,
  uploadPendingLostFoundImages,
  useUgcTermsRetry,
} from "@/features/campus-hub/useLostFoundUpload";
import { UgcGuidelinesModal } from "@/screens/forum/components/ugc/ugc-guidelines-modal";
import {
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
} from "../../shared/design-tokens";
import { ImagePickerRow } from "../../shared/image-picker-row";
import {
  LostFoundModalFooter,
  LostFoundModalHeader,
} from "./lost-found-modal-chrome";
import { LocationBadge, TypeBadge } from "./status-badge";

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

  const ugcRetry = useUgcTermsRetry<CreateClaimInput>(currentUser?.id);

  const submitClaimPayload = useCallback(
    (payload: CreateClaimInput) => {
      ugcRetry.queuePayload(payload, submitClaimPayload);
      submitMutation.mutate(payload, {
        onSuccess: () => {
          ugcRetry.clearQueuedPayload();
          setUploadedProofMap({});
          setMessage("");
          setAnswer("");
          setLocalImages([]);
          onClose();
          onSuccess?.();
          scheduleSuccessToast(
            "Claim Submitted!",
            "The post owner has been notified and will review your claim.",
          );
        },
        onError: (err) => {
          if (ugcRetry.handleUgcError(err)) return;
          showApiErrorToast(err, "Submission Failed", "Failed to submit claim.");
        },
      });
    },
    [ugcRetry, submitMutation, onClose, onSuccess],
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
      if (!requireOnline(isOffline, "Reconnect to the internet before submitting a claim.")) {
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
        const uploaded = await uploadPendingLostFoundImages({
          uris: [uri],
          uploadedMap: uploadedProofMap,
          folder: CLOUDINARY_FOLDERS.CAMPUS_HUB.LOST_FOUND_CLAIMS,
          singlePhotoLabel: "Proof photo",
          uploadErrorTitle: "Upload Failed",
          uploadErrorFallback: "Could not upload proof image. Check connection.",
          setIsUploading,
          setUploadedMap: setUploadedProofMap,
        });
        if (!uploaded) return;
        proofImageUrl = uploaded[uri] ?? null;
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
      <SafeAreaView
        style={[
          styles.fullScreenContainer,
          {
            paddingLeft: insets.left,
            paddingRight: insets.right,
          },
        ]}
        edges={["top"]}
        accessibilityViewIsModal={true}
      >
        <LostFoundModalHeader
          title={claimActionTitle}
          closeLabel="Close claim modal"
          isSubmitting={isSubmitting}
          onClose={handleClose}
        />

        <ModalKeyboardAvoidingView
          enabled={visible}
          style={styles.keyboardAvoid}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.summaryCard}>
              <View style={styles.summaryTop}>
                <TypeBadge type={post.type} />
                {!!post.location && <LocationBadge location={post.location} />}
              </View>
              <Text style={styles.summaryTitle}>{post.title}</Text>
            </View>

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

          <LostFoundModalFooter
            label="Submit Claim"
            accessibilityLabel="Submit claim"
            iconName="send"
            canSubmit={canSubmit}
            isSubmitting={isSubmitting}
            paddingBottom={isKeyboardOpen ? 12 : Math.max(insets.bottom, 16)}
            accentFillColor={ACCENT_FILL}
            onSubmit={handleSubmit}
          />
        </ModalKeyboardAvoidingView>

        <UgcGuidelinesModal
          visible={ugcRetry.showGuidelines}
          renderInline={true}
          isOffline={isOffline}
          isSubmitting={ugcRetry.isAcceptingGuidelines}
          onClose={() => ugcRetry.setShowGuidelines(false)}
          onAccept={ugcRetry.acceptGuidelines}
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
});
