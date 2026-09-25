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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

import { useSubmitLostFoundClaim } from "@/features/campus-hub/useLostFound";
import {
  uploadImageToCloudinary,
  CLOUDINARY_FOLDERS,
} from "@/services/cloudinary-service";
import type { LostFoundPost } from "@/services/lost-found-service";
import { CAMPUS_HUB_COLORS, fontFamily } from "../../shared/design-tokens";
import { ImagePickerRow } from "../../shared/image-picker-row";

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

  const handleSubmit = useCallback(async () => {
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

    let proofImageUrl: string | null = null;
    if (localImages.length > 0) {
      setIsUploading(true);
      try {
        const uploadRes = await uploadImageToCloudinary(
          localImages[0],
          CLOUDINARY_FOLDERS.CAMPUS_HUB.LOST_FOUND_CLAIMS
        );
        proofImageUrl = uploadRes.secureUrl;
      } catch (err: any) {
        setIsUploading(false);
        return Toast.show({
          type: "error",
          text1: "Upload Failed",
          text2: "Could not upload proof image. Check connection.",
        });
      }
      setIsUploading(false);
    }

    submitMutation.mutate(
      {
        message: trimmedMessage,
        answer: answer.trim() ? answer.trim() : null,
        proofImage: proofImageUrl,
      },
      {
        onSuccess: () => {
          Toast.show({
            type: "success",
            text1: "Claim Submitted!",
            text2: "The post owner has been notified and will review your claim.",
          });
          handleClose();
          onSuccess?.();
        },
        onError: (err: any) => {
          const msg =
            err.response?.data?.message || err.message || "Failed to submit claim.";
          Toast.show({
            type: "error",
            text1: "Submission Failed",
            text2: msg,
          });
        },
      }
    );
  }, [message, answer, localImages, post.verificationQuestion, submitMutation, handleClose, onSuccess]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {/* Modal Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeBtn}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Close claim modal"
            >
              <Feather name="x" size={20} color={CAMPUS_HUB_COLORS.deepNavy} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{claimActionTitle}</Text>
            <View style={{ width: 36 }} />
          </View>

          <ScrollView
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
                <Text style={styles.summaryLocation} numberOfLines={1}>
                  <Feather name="map-pin" size={11} color={CAMPUS_HUB_COLORS.subtleText} />{" "}
                  {post.location}
                </Text>
              </View>
              <Text style={styles.summaryTitle} numberOfLines={1}>
                {post.title}
              </Text>
            </View>

            {/* Verification Question Prompt (if configured by author) */}
            {!!post.verificationQuestion && (
              <View style={styles.verificationBox}>
                <View style={styles.verificationHeader}>
                  <Feather name="shield" size={15} color="#0284c7" />
                  <Text style={styles.verificationLabel}>OWNER'S VERIFICATION QUESTION</Text>
                </View>
                <Text style={styles.verificationQuestion}>
                  {post.verificationQuestion}
                </Text>
                <TextInput
                  style={styles.answerInput}
                  placeholder="Your answer (e.g. secret detail, serial number)..."
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

            {/* Optional Proof Image Picker */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>ATTACH PROOF PHOTO (OPTIONAL)</Text>
              <Text style={styles.helpText}>
                Upload a photo of an invoice, previous photo with the item, student ID, or screenshot.
              </Text>
              <ImagePickerRow
                images={localImages}
                onImagesChange={setLocalImages}
                maxImages={1}
                accent={ACCENT}
              />
            </View>

            {/* Submit CTA Button */}
            <TouchableOpacity
              style={[styles.submitBtn, isSubmitting && { opacity: 0.6 }]}
              onPress={handleSubmit}
              disabled={isSubmitting}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Submit claim"
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Feather name="send" size={16} color="#ffffff" style={{ marginRight: 8 }} />
                  <Text style={styles.submitBtnText}>Submit Claim</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CAMPUS_HUB_COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    ...CAMPUS_HUB_COLORS.shadow,
  },
  headerTitle: {
    fontFamily,
    fontSize: 16,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  summaryCard: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.subtleBorder,
    gap: 8,
  },
  summaryTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  summaryLocation: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  summaryTitle: {
    fontFamily,
    fontSize: 16,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
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
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ACCENT,
    paddingVertical: 16,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    marginTop: 10,
    ...CAMPUS_HUB_COLORS.heroShadow,
  },
  submitBtnText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
});
