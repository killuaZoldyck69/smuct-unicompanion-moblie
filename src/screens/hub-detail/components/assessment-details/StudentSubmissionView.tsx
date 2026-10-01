import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import * as DocumentPicker from "expo-document-picker";

import {
  AssessmentData,
  AssessmentTypeConfig,
  AssessmentSubmission,
  AssessmentAttachment,
} from "./types";
import {
  formatDueDate,
  formatFileSize,
  openSafeUrl,
  isValidHttpUrl,
  ALLOWED_FILE_EXTENSIONS,
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_COUNT,
} from "./utils";
import { uploadMultipleFilesToCloudinary } from "@/services/cloudinary-service";

const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

interface StudentSubmissionViewProps {
  assessment: AssessmentData;
  typeConfig: AssessmentTypeConfig;
  mySub?: AssessmentSubmission;
  isSubmitting: boolean;
  onSubmit: (payload: {
    submittedUrl?: string;
    content?: string;
    attachments?: AssessmentAttachment[];
    status: "SUBMITTED" | "HAND_SUBMISSION";
    isLate?: boolean;
  }) => void;
}

export const StudentSubmissionView: React.FC<StudentSubmissionViewProps> = React.memo(
  ({ assessment, typeConfig, mySub, isSubmitting, onSubmit }) => {
    // Mode State
    const [submissionMethod, setSubmissionMethod] = useState<"ONLINE" | "OFFLINE">(
      assessment.submissionType === "HAND" ? "OFFLINE" : "ONLINE"
    );

    // Inputs State
    const [submissionUrl, setSubmissionUrl] = useState("");
    const [linkInputText, setLinkInputText] = useState("");
    const [showLinkInput, setShowLinkInput] = useState(false);
    const [submissionContent, setSubmissionContent] = useState("");
    const [showTextInput, setShowTextInput] = useState(false);
    const [submissionAttachments, setSubmissionAttachments] = useState<AssessmentAttachment[]>([]);
    const [isUploadingFile, setIsUploadingFile] = useState(false);

    // Pick & Upload Files with Validation
    const handlePickFiles = async () => {
      try {
        const res = await DocumentPicker.getDocumentAsync({
          multiple: true,
          copyToCacheDirectory: true,
        });

        if (res.canceled || !res.assets || res.assets.length === 0) return;

        // 1. Check file count limit
        if (submissionAttachments.length + res.assets.length > MAX_FILE_COUNT) {
          Toast.show({
            type: "error",
            text1: "File Limit Reached",
            text2: `You can upload up to ${MAX_FILE_COUNT} files total.`,
          });
          return;
        }

        // 2. Validate individual files (size and extension)
        const validAssets: any[] = [];
        for (const asset of res.assets) {
          if (asset.size && asset.size > MAX_FILE_SIZE_BYTES) {
            Toast.show({
              type: "error",
              text1: "File Too Large",
              text2: `"${asset.name}" exceeds the 10MB limit.`,
            });
            return;
          }

          const ext = asset.name.split(".").pop()?.toLowerCase();
          if (!ext || !ALLOWED_FILE_EXTENSIONS.includes(ext)) {
            Toast.show({
              type: "error",
              text1: "Unsupported File Format",
              text2: `"${asset.name}" is not an allowed type.`,
            });
            return;
          }

          validAssets.push(asset);
        }

        if (validAssets.length === 0) return;

        setIsUploadingFile(true);
        const uploaded = await uploadMultipleFilesToCloudinary(
          validAssets.map((asset) => ({
            uri: asset.uri,
            name: asset.name,
            mimeType: asset.mimeType || undefined,
            size: asset.size || undefined,
          }))
        );

        setSubmissionAttachments((prev) => [
          ...prev,
          ...uploaded.map((u) => ({
            name: u.name,
            url: u.secureUrl,
            size: u.size,
            type: u.type,
          })),
        ]);

        Toast.show({ type: "success", text1: "Files Attached Successfully!" });
      } catch (err: any) {
        Toast.show({
          type: "error",
          text1: "Upload Failed",
          text2: err.message || "Failed to upload file",
        });
      } finally {
        setIsUploadingFile(false);
      }
    };

    const handleAddLink = () => {
      const trimmed = linkInputText.trim();
      if (!trimmed) return;

      const safeUrl = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

      if (!isValidHttpUrl(safeUrl)) {
        Toast.show({
          type: "error",
          text1: "Invalid URL",
          text2: "Please enter a valid web link (e.g. Google Drive, GitHub).",
        });
        return;
      }

      setSubmissionUrl(safeUrl);
      setLinkInputText("");
      setShowLinkInput(false);
      Toast.show({ type: "success", text1: "Link Added" });
    };

    const handleFormSubmit = () => {
      if (submissionMethod === "ONLINE") {
        const hasUrl = Boolean(submissionUrl.trim());
        const hasFiles = submissionAttachments.length > 0;
        const hasText = Boolean(submissionContent.trim());

        if (!hasUrl && !hasFiles && !hasText) {
          Toast.show({
            type: "error",
            text1: "Submission Empty",
            text2: "Please upload a file, add a link, or enter text to submit.",
          });
          return;
        }
      }

      const isLate =
        assessment.deadline &&
        new Date().getTime() > new Date(assessment.deadline).getTime();

      onSubmit({
        submittedUrl: submissionUrl.trim() || undefined,
        content: submissionContent.trim() || undefined,
        attachments: submissionAttachments.length > 0 ? submissionAttachments : undefined,
        status: submissionMethod === "OFFLINE" ? "HAND_SUBMISSION" : "SUBMITTED",
        isLate: Boolean(isLate),
      });
    };

    const isOnlineEmpty =
      submissionMethod === "ONLINE" &&
      !submissionUrl &&
      submissionAttachments.length === 0 &&
      !submissionContent.trim();

    return (
      <View style={styles.container}>
        {/* TOP COMPACT HERO (IMAGE 2) */}
        <View style={styles.topHeroCard}>
          <View style={styles.heroTopRow}>
            <View
              style={[
                styles.typeIconContainer,
                {
                  backgroundColor: typeConfig.iconBg,
                  borderColor: typeConfig.iconBorder,
                },
              ]}
            >
              <Feather name={typeConfig.icon} size={20} color={typeConfig.iconColor} />
            </View>

            <View style={[styles.typeBadgePill, { backgroundColor: typeConfig.badgeBg }]}>
              <Text style={[styles.typeBadgeText, { color: typeConfig.badgeText }]}>
                {typeConfig.label}
              </Text>
            </View>
          </View>

          <Text style={styles.heroTitleText}>{assessment.title}</Text>
          <Text style={styles.heroMetaText}>
            Max Marks: {assessment.totalMarks} {"  "}|{"  "}Due:{" "}
            {formatDueDate(assessment.deadline)}
          </Text>

          {/* Description & Reference Materials */}
          {assessment.description ? (
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsHeading}>Instructions:</Text>
              <Text style={styles.instructionsBody}>{assessment.description}</Text>
            </View>
          ) : null}
        </View>

        {/* CURRENT SUBMISSION CARD (IF ALREADY SUBMITTED) */}
        {mySub && (
          <View style={styles.mySubmissionCard}>
            <View style={styles.subStatusRow}>
              <View style={styles.subStatusBadge}>
                <Feather
                  name="check-circle"
                  size={14}
                  color="#15803d"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.subStatusBadgeText}>
                  {mySub.marks !== null && mySub.marks !== undefined
                    ? `Graded: ${mySub.marks} / ${assessment.totalMarks} Marks`
                    : mySub.isLate
                    ? "Submitted (Late)"
                    : "Work Submitted"}
                </Text>
              </View>
            </View>

            {mySub.feedback ? (
              <View style={styles.feedbackBanner}>
                <Text style={styles.feedbackBannerTitle}>Instructor Feedback:</Text>
                <Text style={styles.feedbackBannerText}>{mySub.feedback}</Text>
              </View>
            ) : null}

            {mySub.submittedUrl ? (
              <TouchableOpacity
                style={styles.subAttachmentLink}
                onPress={() => openSafeUrl(mySub.submittedUrl)}
              >
                <Feather name="link-2" size={14} color="#2563eb" style={{ marginRight: 6 }} />
                <Text style={styles.subAttachmentLinkText} numberOfLines={1}>
                  {mySub.submittedUrl}
                </Text>
              </TouchableOpacity>
            ) : null}

            <Text style={styles.resubmitNotice}>
              You can submit updated files or links below to replace your previous submission.
            </Text>
          </View>
        )}

        {/* SECTION: SUBMISSION METHOD (IMAGE 2) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Submission Method</Text>
        </View>

        <View style={styles.radioGroupCard}>
          {/* Option 1: Online */}
          <TouchableOpacity
            style={styles.radioOptionRow}
            activeOpacity={0.8}
            onPress={() => setSubmissionMethod("ONLINE")}
          >
            <View style={styles.radioOuter}>
              {submissionMethod === "ONLINE" && <View style={styles.radioInner} />}
            </View>
            <View style={styles.radioTextCol}>
              <Text style={styles.radioTitle}>Online (Files/Links/Text)</Text>
              <Text style={styles.radioSubtitle}>Upload files or add links</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.radioDivider} />

          {/* Option 2: Offline */}
          <TouchableOpacity
            style={styles.radioOptionRow}
            activeOpacity={0.8}
            onPress={() => setSubmissionMethod("OFFLINE")}
          >
            <View style={styles.radioOuter}>
              {submissionMethod === "OFFLINE" && <View style={styles.radioInner} />}
            </View>
            <View style={styles.radioTextCol}>
              <Text style={styles.radioTitle}>Offline</Text>
              <Text style={styles.radioSubtitle}>Submit manually (e.g. in class)</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* SECTION: ADD YOUR SUBMISSION (IMAGE 2) */}
        {submissionMethod === "ONLINE" && (
          <View style={styles.addSubmissionSection}>
            <Text style={styles.sectionTitle}>Add your submission</Text>

            {/* 3 Action Tab Buttons */}
            <View style={styles.actionButtonsRow}>
              {/* Button 1: Upload Files */}
              <TouchableOpacity
                style={styles.actionTabBtn}
                activeOpacity={0.8}
                onPress={handlePickFiles}
                disabled={isUploadingFile}
              >
                {isUploadingFile ? (
                  <ActivityIndicator size="small" color="#2563eb" style={{ marginRight: 6 }} />
                ) : (
                  <Feather name="cloud-snow" size={16} color="#2563eb" style={{ marginRight: 6 }} />
                )}
                <Text style={styles.actionTabBtnText}>
                  {isUploadingFile ? "Uploading..." : "Upload Files"}
                </Text>
              </TouchableOpacity>

              {/* Button 2: Add Link */}
              <TouchableOpacity
                style={styles.actionTabBtn}
                activeOpacity={0.8}
                onPress={() => {
                  setShowLinkInput((prev) => !prev);
                  setShowTextInput(false);
                }}
              >
                <Feather name="link-2" size={16} color="#2563eb" style={{ marginRight: 6 }} />
                <Text style={styles.actionTabBtnText}>Add Link</Text>
              </TouchableOpacity>

              {/* Button 3: Add Text */}
              <TouchableOpacity
                style={styles.actionTabBtn}
                activeOpacity={0.8}
                onPress={() => {
                  setShowTextInput((prev) => !prev);
                  setShowLinkInput(false);
                }}
              >
                <Feather name="file-text" size={16} color="#2563eb" style={{ marginRight: 6 }} />
                <Text style={styles.actionTabBtnText}>Add Text</Text>
              </TouchableOpacity>
            </View>

            {/* Inline Link Input */}
            {showLinkInput && (
              <View style={styles.inlineInputBox}>
                <TextInput
                  style={styles.inlineTextInput}
                  placeholder="https://drive.google.com/... or link"
                  placeholderTextColor="#94a3b8"
                  value={linkInputText}
                  onChangeText={setLinkInputText}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity style={styles.inlineAddBtn} onPress={handleAddLink}>
                  <Text style={styles.inlineAddBtnText}>Add</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Inline Text Input */}
            {showTextInput && (
              <View style={styles.inlineInputBox}>
                <TextInput
                  style={[styles.inlineTextInput, { height: 75, textAlignVertical: "top" }]}
                  placeholder="Write your notes or answer text here..."
                  placeholderTextColor="#94a3b8"
                  value={submissionContent}
                  onChangeText={setSubmissionContent}
                  multiline
                />
              </View>
            )}

            {/* Attached Files List */}
            {submissionAttachments.map((att, idx) => (
              <View key={`att-${idx}`} style={styles.attachedCard}>
                <View style={styles.fileIconBox}>
                  <Feather name="file-text" size={18} color="#2563eb" />
                </View>
                <View style={styles.fileInfoCol}>
                  <Text style={styles.fileNameText} numberOfLines={1}>
                    {att.name}
                  </Text>
                  {att.size ? (
                    <Text style={styles.fileSizeText}>{formatFileSize(att.size)}</Text>
                  ) : null}
                </View>
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() =>
                    setSubmissionAttachments((prev) => prev.filter((_, i) => i !== idx))
                  }
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Feather name="x" size={16} color="#64748b" />
                </TouchableOpacity>
              </View>
            ))}

            {/* Attached Link Item */}
            {submissionUrl ? (
              <View style={styles.attachedCard}>
                <View style={styles.fileIconBox}>
                  <Feather name="link-2" size={18} color="#2563eb" />
                </View>
                <View style={styles.fileInfoCol}>
                  <Text style={styles.fileNameText} numberOfLines={1}>
                    {submissionUrl}
                  </Text>
                  <Text style={styles.fileSizeText}>Attached URL</Text>
                </View>
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => setSubmissionUrl("")}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Feather name="x" size={16} color="#64748b" />
                </TouchableOpacity>
              </View>
            ) : null}

            {/* Helper Text (Image 2) */}
            <View style={styles.helperTextContainer}>
              <Text style={styles.helperText}>
                You can upload up to 5 files (max 10MB each).
              </Text>
              <Text style={styles.helperText}>
                Allowed types: pdf, doc, docx, zip, rar, jpg, png.
              </Text>
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />

        {/* FIXED BOTTOM SUBMIT BUTTON (IMAGE 2) */}
        <View style={styles.fixedBottomBar}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              (isSubmitting || isOnlineEmpty) && styles.submitButtonDisabled,
            ]}
            onPress={handleFormSubmit}
            disabled={isSubmitting || isOnlineEmpty}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.submitButtonText}>Submit</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },
  topHeroCard: {
    marginBottom: 16,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  typeIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  typeBadgePill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  typeBadgeText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
  },
  heroTitleText: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
    lineHeight: 24,
    marginBottom: 6,
  },
  heroMetaText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
  },
  instructionsContainer: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.04)",
  },
  instructionsHeading: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 4,
  },
  instructionsBody: {
    fontFamily,
    fontSize: 12.5,
    color: "#64748b",
    lineHeight: 18,
  },
  mySubmissionCard: {
    backgroundColor: "#f0fdf4",
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  subStatusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  subStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  subStatusBadgeText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "800",
    color: "#15803d",
  },
  feedbackBanner: {
    backgroundColor: "#ffffff",
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  feedbackBannerTitle: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: "#15803d",
  },
  feedbackBannerText: {
    fontFamily,
    fontSize: 12,
    color: "#0f172a",
    marginTop: 2,
  },
  subAttachmentLink: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  subAttachmentLinkText: {
    fontFamily,
    fontSize: 12,
    color: "#2563eb",
    flex: 1,
    fontWeight: "600",
  },
  resubmitNotice: {
    fontFamily,
    fontSize: 11,
    color: "#64748b",
    marginTop: 8,
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily,
    fontSize: 14.5,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 10,
  },
  radioGroupCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.06)",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1.5,
  },
  radioOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#0f172a",
  },
  radioTextCol: {
    flex: 1,
  },
  radioTitle: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
  radioSubtitle: {
    fontFamily,
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  radioDivider: {
    height: 1,
    backgroundColor: "rgba(15, 23, 42, 0.04)",
    marginVertical: 4,
  },
  addSubmissionSection: {
    marginTop: 20,
  },
  actionButtonsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  actionTabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f9ff",
    borderWidth: 1,
    borderColor: "#bae6fd",
    paddingVertical: 10,
    borderRadius: 12,
  },
  actionTabBtnText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: "#0284c7",
  },
  inlineInputBox: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  inlineTextInput: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: "#0f172a",
  },
  inlineAddBtn: {
    backgroundColor: "#0f172a",
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  inlineAddBtnText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "800",
    color: "#ffffff",
  },
  attachedCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.06)",
    marginBottom: 8,
  },
  fileIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  fileInfoCol: {
    flex: 1,
  },
  fileNameText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
  },
  fileSizeText: {
    fontFamily,
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
  },
  removeBtn: {
    padding: 6,
  },
  helperTextContainer: {
    marginTop: 8,
    gap: 2,
  },
  helperText: {
    fontFamily,
    fontSize: 11.5,
    color: "#64748b",
    lineHeight: 16,
  },
  fixedBottomBar: {
    position: "absolute",
    bottom: 0,
    left: -18,
    right: -18,
    backgroundColor: "#ffffff",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(15, 23, 42, 0.06)",
  },
  submitButton: {
    backgroundColor: "#0f172a",
    borderRadius: 9999,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "800",
    color: "#ffffff",
  },
});
