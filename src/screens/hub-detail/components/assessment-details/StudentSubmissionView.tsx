import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import * as DocumentPicker from "expo-document-picker";

import {
  AssessmentData,
  AssessmentTypeConfig,
  AssessmentSubmission,
  AssessmentAttachment,
} from "./types";
import { AssessmentResourcesSection } from "./AssessmentResourcesSection";
import {
  formatDueDate,
  formatFileSize,
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

interface SubmissionLink {
  title: string;
  url: string;
}

interface StudentSubmissionViewProps {
  assessment: AssessmentData;
  typeConfig: AssessmentTypeConfig;
  mySub?: AssessmentSubmission;
  isSubmitting: boolean;
  onSubmit: (payload: {
    submittedUrl?: string;
    content?: string;
    attachments?: AssessmentAttachment[];
    links?: SubmissionLink[];
    status: "SUBMITTED" | "HAND_SUBMISSION";
    isLate?: boolean;
  }) => void;
}

export const StudentSubmissionView: React.FC<StudentSubmissionViewProps> = React.memo(
  ({ assessment, typeConfig, mySub, isSubmitting, onSubmit }) => {
    const insets = useSafeAreaInsets();

    // Mode State: ONLINE vs OFFLINE
    const [submissionMethod, setSubmissionMethod] = useState<"ONLINE" | "OFFLINE">("ONLINE");

    // Submission Data State
    const [files, setFiles] = useState<AssessmentAttachment[]>([]);
    const [links, setLinks] = useState<SubmissionLink[]>([]);
    const [noteContent, setNoteContent] = useState("");

    // Drawers State
    const [activeDrawer, setActiveDrawer] = useState<"LINK" | "TEXT" | null>(null);
    const [tempLinkUrl, setTempLinkUrl] = useState("");
    const [tempLinkTitle, setTempLinkTitle] = useState("");
    const [tempNoteText, setTempNoteText] = useState("");
    const [isUploadingFiles, setIsUploadingFiles] = useState(false);

    // Synchronize initial data from existing submission or assessment
    useEffect(() => {
      if (mySub) {
        if (mySub.status === "HAND_SUBMISSION") {
          setSubmissionMethod("OFFLINE");
        } else {
          setSubmissionMethod("ONLINE");
        }

        if (Array.isArray(mySub.attachments) && mySub.attachments.length > 0) {
          setFiles(mySub.attachments);
        }

        if (mySub.submittedUrl) {
          setLinks([{ title: "Submitted Link", url: mySub.submittedUrl }]);
        }

        if (mySub.content) {
          setNoteContent(mySub.content);
        }
      } else if (assessment.submissionType === "HAND") {
        setSubmissionMethod("OFFLINE");
      }
    }, [mySub, assessment.submissionType]);

    // Pick & Upload Files with Validation
    const handlePickFiles = async () => {
      try {
        const res = await DocumentPicker.getDocumentAsync({
          multiple: true,
          copyToCacheDirectory: true,
        });

        if (res.canceled || !res.assets || res.assets.length === 0) return;

        // 1. Check file count limit
        if (files.length + res.assets.length > MAX_FILE_COUNT) {
          Toast.show({
            type: "error",
            text1: "File Limit Reached",
            text2: `You can upload up to ${MAX_FILE_COUNT} files total.`,
          });
          return;
        }

        // 2. Validate individual files
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

        setIsUploadingFiles(true);
        const uploaded = await uploadMultipleFilesToCloudinary(
          validAssets.map((asset) => ({
            uri: asset.uri,
            name: asset.name,
            mimeType: asset.mimeType || undefined,
            size: asset.size || undefined,
          }))
        );

        setFiles((prev) => [
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
        setIsUploadingFiles(false);
      }
    };

    // Remove handlers
    const handleRemoveFile = (idx: number) => {
      setFiles((prev) => prev.filter((_, i) => i !== idx));
    };

    const handleRemoveLink = (idx: number) => {
      setLinks((prev) => prev.filter((_, i) => i !== idx));
    };

    // Add Link
    const handleSaveLink = () => {
      if (!tempLinkUrl.trim()) return;
      const formatted =
        tempLinkUrl.startsWith("http://") || tempLinkUrl.startsWith("https://")
          ? tempLinkUrl.trim()
          : `https://${tempLinkUrl.trim()}`;

      setLinks((prev) => [
        ...prev,
        {
          title: tempLinkTitle.trim() || formatted,
          url: formatted,
        },
      ]);
      setTempLinkUrl("");
      setTempLinkTitle("");
      setActiveDrawer(null);
    };

    // Save Text Note
    const handleSaveNote = () => {
      setNoteContent(tempNoteText.trim());
      setActiveDrawer(null);
    };

    // Open text drawer
    const handleOpenTextDrawer = () => {
      setTempNoteText(noteContent);
      setActiveDrawer((prev) => (prev === "TEXT" ? null : "TEXT"));
    };

    // Submit Action
    const handleFormSubmit = () => {
      const isLate = Boolean(
        assessment.deadline &&
          new Date().getTime() > new Date(assessment.deadline).getTime()
      );

      if (submissionMethod === "OFFLINE") {
        onSubmit({
          status: "HAND_SUBMISSION",
          isLate,
        });
        return;
      }

      onSubmit({
        submittedUrl: links.length > 0 ? links[0].url : undefined,
        content: noteContent || undefined,
        attachments: files.length > 0 ? files : undefined,
        links: links.length > 0 ? links : undefined,
        status: "SUBMITTED",
        isLate,
      });
    };

    const isOnlineEmpty =
      submissionMethod === "ONLINE" &&
      files.length === 0 &&
      links.length === 0 &&
      !noteContent.trim();

    const isSubmitDisabled = isSubmitting || isUploadingFiles || isOnlineEmpty;

    const hasResources =
      (Array.isArray(assessment.attachments) && assessment.attachments.length > 0) ||
      (Array.isArray(assessment.links) && assessment.links.length > 0);

    return (
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollBody}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* 1. TOP SUMMARY CARD (MATCHES USER SCREENSHOT) */}
          <View style={styles.topHeroCard}>
            <View style={styles.heroTopRow}>
              <View
                style={[
                  styles.typeIconBox,
                  {
                    backgroundColor: typeConfig.iconBg,
                    borderColor: typeConfig.iconBorder,
                  },
                ]}
              >
                <Feather name={typeConfig.icon} size={20} color={typeConfig.iconColor} />
              </View>

              <View
                style={[
                  styles.typeBadgePill,
                  { backgroundColor: typeConfig.badgeBg },
                ]}
              >
                <Text style={[styles.typeBadgeText, { color: typeConfig.badgeText }]}>
                  {typeConfig.label}
                </Text>
              </View>
            </View>

            <Text style={styles.heroTitleText}>{assessment.title}</Text>

            <View style={styles.heroMetaRow}>
              <Text style={styles.metaLabelText}>Max Marks: </Text>
              <Text style={styles.metaValueText}>{assessment.totalMarks}</Text>
              <Text style={styles.metaDivider}>{"   |   "}</Text>
              <Text style={styles.metaLabelText}>Due: </Text>
              <Text style={styles.metaValueText}>
                {formatDueDate(assessment.deadline)}
              </Text>
            </View>

            {assessment.description ? (
              <View style={styles.instructionsContainer}>
                <Text style={styles.instructionsHeading}>Instructions:</Text>
                <Text style={styles.instructionsBody}>{assessment.description}</Text>
              </View>
            ) : null}
          </View>

          {/* COURSEWORK RESOURCES & ATTACHMENTS (FROM TEACHER) */}
          {hasResources && (
            <View style={styles.resourcesWrapper}>
              <AssessmentResourcesSection
                attachments={assessment.attachments}
                links={assessment.links}
              />
            </View>
          )}

          {/* PREVIOUS SUBMISSION STATUS (IF ANY) */}
          {mySub && (
            <View style={styles.mySubmissionCard}>
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
              {mySub.feedback ? (
                <View style={styles.feedbackBanner}>
                  <Text style={styles.feedbackBannerTitle}>Feedback:</Text>
                  <Text style={styles.feedbackBannerText}>{mySub.feedback}</Text>
                </View>
              ) : null}
            </View>
          )}

          {/* 2. SECTION: SUBMISSION METHOD */}
          <Text style={styles.sectionHeading}>Submission Method</Text>

          <View style={styles.radioGroupCard}>
            {/* Option 1: Online */}
            <TouchableOpacity
              style={styles.radioOptionRow}
              activeOpacity={0.8}
              onPress={() => setSubmissionMethod("ONLINE")}
            >
              <View
                style={[
                  styles.radioOuter,
                  submissionMethod === "ONLINE" && styles.radioOuterSelected,
                ]}
              >
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
              <View
                style={[
                  styles.radioOuter,
                  submissionMethod === "OFFLINE" && styles.radioOuterSelected,
                ]}
              >
                {submissionMethod === "OFFLINE" && <View style={styles.radioInner} />}
              </View>
              <View style={styles.radioTextCol}>
                <Text style={styles.radioTitle}>Offline</Text>
                <Text style={styles.radioSubtitle}>Submit manually (e.g. in class)</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* 3. SECTION: ADD YOUR SUBMISSION */}
          {submissionMethod === "ONLINE" ? (
            <View style={styles.addSubmissionSection}>
              <Text style={styles.sectionHeading}>Add your submission</Text>

              {/* 3 Action Tab Buttons */}
              <View style={styles.actionButtonsRow}>
                {/* Button 1: Upload Files */}
                <TouchableOpacity
                  style={styles.actionTabBtn}
                  activeOpacity={0.8}
                  onPress={handlePickFiles}
                  disabled={isUploadingFiles}
                >
                  {isUploadingFiles ? (
                    <ActivityIndicator size="small" color="#2563eb" style={{ marginRight: 6 }} />
                  ) : (
                    <Feather name="upload-cloud" size={16} color="#2563eb" style={{ marginRight: 6 }} />
                  )}
                  <Text style={styles.actionTabBtnText}>
                    {isUploadingFiles ? "Uploading..." : "Upload Files"}
                  </Text>
                </TouchableOpacity>

                {/* Button 2: Add Link */}
                <TouchableOpacity
                  style={[
                    styles.actionTabBtn,
                    activeDrawer === "LINK" && styles.actionTabBtnActive,
                  ]}
                  activeOpacity={0.8}
                  onPress={() =>
                    setActiveDrawer((prev) => (prev === "LINK" ? null : "LINK"))
                  }
                >
                  <Feather name="link-2" size={16} color="#2563eb" style={{ marginRight: 6 }} />
                  <Text style={styles.actionTabBtnText}>Add Link</Text>
                </TouchableOpacity>

                {/* Button 3: Add Text */}
                <TouchableOpacity
                  style={[
                    styles.actionTabBtn,
                    activeDrawer === "TEXT" && styles.actionTabBtnActive,
                  ]}
                  activeOpacity={0.8}
                  onPress={handleOpenTextDrawer}
                >
                  <Feather name="file-text" size={16} color="#2563eb" style={{ marginRight: 6 }} />
                  <Text style={styles.actionTabBtnText}>Add Text</Text>
                </TouchableOpacity>
              </View>

              {/* Inline Link Drawer */}
              {activeDrawer === "LINK" && (
                <View style={styles.drawerCard}>
                  <Text style={styles.drawerTitle}>Attach Web / Drive Link</Text>
                  <TextInput
                    style={styles.drawerInput}
                    placeholder="https://drive.google.com/... or GitHub link"
                    placeholderTextColor="#94a3b8"
                    value={tempLinkUrl}
                    onChangeText={setTempLinkUrl}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="url"
                  />
                  <TextInput
                    style={[styles.drawerInput, { marginTop: 8 }]}
                    placeholder="Title (optional, e.g. Project Repository)"
                    placeholderTextColor="#94a3b8"
                    value={tempLinkTitle}
                    onChangeText={setTempLinkTitle}
                  />
                  <View style={styles.drawerActions}>
                    <TouchableOpacity
                      style={styles.drawerCancelBtn}
                      onPress={() => setActiveDrawer(null)}
                    >
                      <Text style={styles.drawerCancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.drawerSaveBtn,
                        !tempLinkUrl.trim() && { opacity: 0.5 },
                      ]}
                      disabled={!tempLinkUrl.trim()}
                      onPress={handleSaveLink}
                    >
                      <Text style={styles.drawerSaveText}>Attach Link</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Inline Text Drawer */}
              {activeDrawer === "TEXT" && (
                <View style={styles.drawerCard}>
                  <Text style={styles.drawerTitle}>Submission Notes / Text</Text>
                  <TextInput
                    style={[styles.drawerInput, { height: 80, textAlignVertical: "top" }]}
                    placeholder="Write your notes, submission summary, or answers here..."
                    placeholderTextColor="#94a3b8"
                    value={tempNoteText}
                    onChangeText={setTempNoteText}
                    multiline
                  />
                  <View style={styles.drawerActions}>
                    <TouchableOpacity
                      style={styles.drawerCancelBtn}
                      onPress={() => setActiveDrawer(null)}
                    >
                      <Text style={styles.drawerCancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.drawerSaveBtn}
                      onPress={handleSaveNote}
                    >
                      <Text style={styles.drawerSaveText}>Save Note</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Uploaded Files List */}
              {files.map((file, idx) => (
                <View key={`file-${idx}`} style={styles.itemCard}>
                  <View style={styles.fileIconBox}>
                    <Feather name="file-text" size={18} color="#2563eb" />
                  </View>
                  <View style={styles.fileInfoCol}>
                    <Text style={styles.fileNameText} numberOfLines={1}>
                      {file.name}
                    </Text>
                    {file.size ? (
                      <Text style={styles.fileSizeText}>
                        {formatFileSize(file.size)}
                      </Text>
                    ) : null}
                  </View>
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => handleRemoveFile(idx)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Feather name="x" size={16} color="#64748b" />
                  </TouchableOpacity>
                </View>
              ))}

              {/* Attached Links List */}
              {links.map((link, idx) => (
                <View key={`link-${idx}`} style={styles.itemCard}>
                  <View style={styles.fileIconBox}>
                    <Feather name="link-2" size={18} color="#2563eb" />
                  </View>
                  <View style={styles.fileInfoCol}>
                    <Text style={styles.fileNameText} numberOfLines={1}>
                      {link.title || link.url}
                    </Text>
                    <Text style={styles.fileSizeText} numberOfLines={1}>
                      {link.url}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => handleRemoveLink(idx)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Feather name="x" size={16} color="#64748b" />
                  </TouchableOpacity>
                </View>
              ))}

              {/* Attached Note Preview */}
              {noteContent ? (
                <View style={styles.itemCard}>
                  <View style={styles.fileIconBox}>
                    <Feather name="edit-3" size={18} color="#2563eb" />
                  </View>
                  <View style={styles.fileInfoCol}>
                    <Text style={styles.fileNameText} numberOfLines={1}>
                      Text Submission Note
                    </Text>
                    <Text style={styles.fileSizeText} numberOfLines={2}>
                      {noteContent}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => setNoteContent("")}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Feather name="x" size={16} color="#64748b" />
                  </TouchableOpacity>
                </View>
              ) : null}

              {/* Helper Text (Exactly from screenshot) */}
              <View style={styles.helperTextContainer}>
                <Text style={styles.helperText}>
                  You can upload up to 5 files (max 10MB each).
                </Text>
                <Text style={styles.helperText}>
                  Allowed types: pdf, doc, docx, zip, rar, jpg, png.
                </Text>
              </View>
            </View>
          ) : (
            /* Offline Mode Information Card */
            <View style={styles.offlineNoticeCard}>
              <View style={styles.offlineIconBox}>
                <Feather name="clipboard" size={20} color="#0f172a" />
              </View>
              <Text style={styles.offlineTitle}>In-Class Physical Submission</Text>
              <Text style={styles.offlineDesc}>
                Submit your hardcopy / paper work directly to the teacher during class. Tap Submit below to declare your physical submission.
              </Text>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* 4. FIXED BOTTOM SUBMIT BUTTON */}
        <View
          style={[
            styles.fixedBottomBar,
            { paddingBottom: Math.max(insets.bottom + 12, 20) },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.submitButton,
              isSubmitDisabled && styles.submitButtonDisabled,
            ]}
            onPress={handleFormSubmit}
            disabled={isSubmitDisabled}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.submitButtonText}>
                {mySub ? "Resubmit" : "Submit"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollBody: {
    padding: 16,
    paddingBottom: 24,
  },
  topHeroCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.06)",
    marginBottom: 16,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  typeIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
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
  resourcesWrapper: {
    marginBottom: 16,
  },
  heroTitleText: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  heroMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 2,
  },
  metaLabelText: {
    fontFamily,
    fontSize: 13,
    color: "#64748b",
  },
  metaValueText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
  },
  metaDivider: {
    fontFamily,
    fontSize: 13,
    color: "#cbd5e1",
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
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#bbf7d0",
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
  sectionHeading: {
    fontFamily,
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 10,
    marginTop: 6,
  },
  radioGroupCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.07)",
    marginBottom: 16,
  },
  radioOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#cbd5e1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  radioOuterSelected: {
    borderColor: "#0f172a",
    backgroundColor: "#0f172a",
  },
  radioInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ffffff",
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
    backgroundColor: "rgba(15, 23, 42, 0.05)",
  },
  addSubmissionSection: {
    marginBottom: 16,
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  actionTabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f7ff",
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#dbeafe",
  },
  actionTabBtnActive: {
    borderColor: "#2563eb",
    backgroundColor: "#e0f2fe",
  },
  actionTabBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#2563eb",
  },
  drawerCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    padding: 12,
    marginBottom: 14,
  },
  drawerTitle: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 8,
  },
  drawerInput: {
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontFamily,
    fontSize: 13,
    color: "#0f172a",
  },
  drawerActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  drawerCancelBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  drawerCancelText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
  },
  drawerSaveBtn: {
    backgroundColor: "#0f172a",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  drawerSaveText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.08)",
    padding: 12,
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
    marginRight: 8,
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
    borderRadius: 6,
    backgroundColor: "#f8fafc",
  },
  helperTextContainer: {
    marginTop: 10,
    paddingHorizontal: 4,
  },
  helperText: {
    fontFamily,
    fontSize: 11.5,
    color: "#64748b",
    lineHeight: 18,
  },
  offlineNoticeCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.08)",
    padding: 16,
    alignItems: "center",
    marginTop: 6,
  },
  offlineIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  offlineTitle: {
    fontFamily,
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 4,
  },
  offlineDesc: {
    fontFamily,
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 18,
  },
  fixedBottomBar: {
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "rgba(15, 23, 42, 0.06)",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  submitButton: {
    height: 50,
    borderRadius: 25,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#cbd5e1",
  },
  submitButtonText: {
    fontFamily,
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
  },
});
