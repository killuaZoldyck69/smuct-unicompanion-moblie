import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import Toast from "react-native-toast-message";

import { uploadMultipleFilesToCloudinary } from "@/services/cloudinary-service";

const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  web: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  default: "sans-serif",
});

const BENTO_THEME = {
  canvas: "#f7f9fb",
  card: "#ffffff",
  deepNavy: "#131b2e",
  border: "rgba(19, 27, 46, 0.07)",
  subtleText: "#64748b",
  mintBanner: "#d6f5e3",
  mintText: "#064e3b",
  mintSubtext: "#047857",
};

const CAMPUS_TAGS = [
  {
    label: "General Notice",
    prefix: "[General Notice]\n",
    icon: "info" as const,
    bg: "#e0f2fe",
    border: "#bae6fd",
    text: "#0369a1",
  },
  {
    label: "Class Rescheduled",
    prefix: "[Class Rescheduled]\n",
    icon: "clock" as const,
    bg: "#fef3c7",
    border: "#fde68a",
    text: "#92400e",
  },
  {
    label: "Room / Lab Change",
    prefix: "[Room Change]\n",
    icon: "map-pin" as const,
    bg: "#f3e8ff",
    border: "#e9d5ff",
    text: "#6b21a8",
  },
  {
    label: "Urgent",
    prefix: "[URGENT]\n",
    icon: "alert-triangle" as const,
    bg: "#ffe4e6",
    border: "#fecdd3",
    text: "#be123c",
  },
  {
    label: "Exam Routine",
    prefix: "[Exam Routine]\n",
    icon: "calendar" as const,
    bg: "#dcfce7",
    border: "#bbf7d0",
    text: "#15803d",
  },
];

interface Attachment {
  name: string;
  url: string;
  size?: number;
  type?: string;
}

interface Props {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    content: string;
    attachedLinkUrl?: string;
    attachedLinkTitle?: string;
    attachments?: Attachment[];
    links?: { title: string; url: string }[];
  }) => void;
  isPending: boolean;
  initialData?: any;
}

export default function CreateAnnouncementModal({
  isVisible,
  onClose,
  onSubmit,
  isPending,
  initialData,
}: Props) {
  const insets = useSafeAreaInsets();
  const [content, setContent] = useState("");
  const [isLinkDrawerOpen, setIsLinkDrawerOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [tempLinkUrl, setTempLinkUrl] = useState("");
  const [tempLinkTitle, setTempLinkTitle] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);

  useEffect(() => {
    if (initialData) {
      setContent(initialData.content || "");
      const u = initialData.attachedLinkUrl || "";
      const t = initialData.attachedLinkTitle || "";
      setLinkUrl(u);
      setLinkTitle(t);
      setTempLinkUrl(u);
      setTempLinkTitle(t);
      setIsLinkDrawerOpen(false);
      setAttachments(Array.isArray(initialData.attachments) ? initialData.attachments : []);
    } else {
      setContent("");
      setLinkUrl("");
      setLinkTitle("");
      setTempLinkUrl("");
      setTempLinkTitle("");
      setIsLinkDrawerOpen(false);
      setAttachments([]);
    }
  }, [initialData, isVisible]);

  const handleApplyTag = (prefix: string) => {
    if (!content.trim()) {
      setContent(prefix);
    } else if (!content.includes(prefix.trim())) {
      setContent(`${prefix}${content}`);
    }
  };

  const handleOpenLinkDrawer = () => {
    setTempLinkUrl(linkUrl);
    setTempLinkTitle(linkTitle);
    setIsLinkDrawerOpen(true);
  };

  const handleSaveLink = () => {
    if (!tempLinkUrl.trim()) return;
    setLinkUrl(tempLinkUrl.trim());
    setLinkTitle(tempLinkTitle.trim());
    setIsLinkDrawerOpen(false);
  };

  const handleCancelLink = () => {
    setIsLinkDrawerOpen(false);
    setTempLinkUrl(linkUrl);
    setTempLinkTitle(linkTitle);
  };

  const handleRemoveLink = () => {
    setLinkUrl("");
    setLinkTitle("");
    setTempLinkUrl("");
    setTempLinkTitle("");
    setIsLinkDrawerOpen(false);
  };

  const handlePickFiles = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (res.canceled || !res.assets || res.assets.length === 0) return;

      if (attachments.length + res.assets.length > 5) {
        Toast.show({
          type: "error",
          text1: "Maximum 5 files",
          text2: "You can attach at most 5 files to an announcement.",
        });
        return;
      }

      setIsUploadingFiles(true);
      const uploaded = await uploadMultipleFilesToCloudinary(
        res.assets.map((asset) => ({
          uri: asset.uri,
          name: asset.name,
          mimeType: asset.mimeType || undefined,
          size: asset.size || undefined,
        })),
      );

      const newItems: Attachment[] = uploaded.map((u) => ({
        name: u.name,
        url: u.secureUrl,
        size: u.size,
        type: u.type,
      }));

      setAttachments((prev) => [...prev, ...newItems]);
      Toast.show({ type: "success", text1: "Files Attached" });
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "File Upload Failed",
        text2: err.message || "Failed to upload attached files.",
      });
    } finally {
      setIsUploadingFiles(false);
    }
  };

  const handleRemoveAttachment = (idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleClose = () => {
    if (isPending || isUploadingFiles) return;
    onClose();
  };

  const handleSubmit = () => {
    if (!content.trim() || isPending || isUploadingFiles) return;

    onSubmit({
      content: content.trim(),
      attachedLinkUrl: linkUrl.trim() || undefined,
      attachedLinkTitle: linkTitle.trim() || undefined,
      attachments: attachments.length > 0 ? attachments : undefined,
    });
  };

  const canSubmit = content.trim().length > 0 && !isUploadingFiles;
  const isEditing = !!initialData;

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle={Platform.OS === "ios" ? "pageSheet" : "fullScreen"}
      statusBarTranslucent={true}
      onRequestClose={handleClose}
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

      <View
        style={[
          styles.container,
          {
            paddingTop: Platform.OS === "android" ? insets.top : 0,
            paddingBottom: 0,
          },
        ]}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          {/* Soft Bento Top Header - Matched to Canvas with Centered Title */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={handleClose}
              disabled={isPending}
              style={styles.closeBtn}
              activeOpacity={0.75}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Cancel announcement"
            >
              <Feather name="x" size={20} color={BENTO_THEME.deepNavy} />
            </TouchableOpacity>

            <View style={styles.headerTitleWrap}>
              <Text style={styles.headerTitle}>
                {isEditing ? "Edit Announcement" : "New Announcement"}
              </Text>
            </View>

            {/* Spacer to keep title centered now that publish button moved to bottom */}
            <View style={styles.headerSpacer} />
          </View>

          {/* Scrollable Bento Canvas */}
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* 1. Soft Mint Campus Broadcast Hero Banner */}
            <View style={styles.heroBanner}>
              <View style={styles.heroIconCircle}>
                <Feather name="radio" size={16} color={BENTO_THEME.mintSubtext} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.heroTitle}>Class Broadcast</Text>
                <Text style={styles.heroSubtitle}>
                  Instantly visible to all students & faculty in this course hub
                </Text>
              </View>
            </View>

            {/* 2. Campus Bento Topic Tags */}
            <View style={styles.sectionHeaderRow}>
              <Feather name="tag" size={12} color={BENTO_THEME.subtleText} style={{ marginRight: 5 }} />
              <Text style={styles.sectionLabel}>CAMPUS TOPICS & PRESETS</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tagsRow}
              style={{ marginBottom: 14 }}
            >
              {CAMPUS_TAGS.map((t) => (
                <TouchableOpacity
                  key={t.label}
                  onPress={() => handleApplyTag(t.prefix)}
                  style={[
                    styles.tagPill,
                    { backgroundColor: t.bg, borderColor: t.border },
                  ]}
                  activeOpacity={0.75}
                >
                  <Feather
                    name={t.icon}
                    size={11}
                    color={t.text}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={[styles.tagPillText, { color: t.text }]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* 3. Main Message Bento Card */}
            <View style={styles.bentoCard}>
              <View style={styles.bentoCardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <View style={styles.cardIndicatorDot} />
                  <Text style={styles.cardHeaderLabel}>ANNOUNCEMENT MESSAGE</Text>
                </View>
                <View style={styles.charCountBadge}>
                  <Text style={styles.charCountText}>
                    {content.length} / 2000
                  </Text>
                </View>
              </View>

              <TextInput
                style={styles.textArea}
                value={content}
                onChangeText={setContent}
                placeholder="Share an announcement with your class... (e.g. Tomorrow's lecture will begin at 10:30 AM in Room 1501)"
                placeholderTextColor="#94a3b8"
                multiline
                textAlignVertical="top"
                maxLength={2000}
                accessible={true}
                accessibilityLabel="Announcement message"
              />

              {content.length > 0 && (
                <View style={styles.bentoCardFooter}>
                  <TouchableOpacity
                    onPress={() => setContent("")}
                    style={styles.clearBtn}
                    activeOpacity={0.7}
                  >
                    <Feather name="trash-2" size={12} color="#94a3b8" style={{ marginRight: 4 }} />
                    <Text style={styles.clearBtnText}>Clear text</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* 4. Attachments & Resources Bento Card */}
            <View style={[styles.bentoCard, { marginTop: 14 }]}>
              <View style={styles.bentoCardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <Feather
                    name="paperclip"
                    size={12}
                    color={BENTO_THEME.subtleText}
                    style={{ marginRight: 5 }}
                  />
                  <Text style={styles.cardHeaderLabel}>ATTACHMENTS & LINKS</Text>
                </View>
                {attachments.length > 0 && (
                  <View style={styles.attachmentCountPill}>
                    <Text style={styles.attachmentCountText}>
                      {attachments.length}/5 files
                    </Text>
                  </View>
                )}
              </View>

              {/* Dual Bento Action Buttons */}
              <View style={styles.attachmentActionsRow}>
                {/* Add Files Bento Button */}
                <TouchableOpacity
                  style={[
                    styles.attachmentActionBtn,
                    { backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" },
                  ]}
                  onPress={handlePickFiles}
                  disabled={isUploadingFiles || attachments.length >= 5}
                  activeOpacity={0.8}
                >
                  <View style={[styles.actionIconCircle, { backgroundColor: "#dcfce7" }]}>
                    {isUploadingFiles ? (
                      <ActivityIndicator size="small" color="#15803d" />
                    ) : (
                      <Feather name="file-plus" size={15} color="#15803d" />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.actionBtnTitle, { color: "#15803d" }]}>
                      {isUploadingFiles ? "Uploading..." : "Attach Files"}
                    </Text>
                    <Text style={[styles.actionBtnSubtitle, { color: "#166534" }]}>
                      PDF, PPT, Word, Images
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Add Link Bento Button */}
                <TouchableOpacity
                  style={[
                    styles.attachmentActionBtn,
                    { backgroundColor: "#eff6ff", borderColor: "#bfdbfe" },
                    linkUrl ? { borderColor: "#0284c7" } : null,
                  ]}
                  onPress={handleOpenLinkDrawer}
                  activeOpacity={0.8}
                >
                  <View style={[styles.actionIconCircle, { backgroundColor: "#dbeafe" }]}>
                    <Feather name="link-2" size={15} color="#1d4ed8" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.actionBtnTitle, { color: "#1d4ed8" }]}>
                      {linkUrl ? "Edit Link" : "Add Link"}
                    </Text>
                    <Text style={[styles.actionBtnSubtitle, { color: "#1e40af" }]}>
                      Drive, Slides, Web
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Inline Link Input Drawer - Independent state avoids keyboard closing */}
              {isLinkDrawerOpen && (
                <View style={styles.linkDrawer}>
                  <View style={styles.linkDrawerHeader}>
                    <Text style={styles.linkDrawerTitle}>Reference Link Details</Text>
                    <TouchableOpacity
                      onPress={handleCancelLink}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Feather name="x" size={15} color="#64748b" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.linkInputField}>
                    <Feather name="globe" size={13} color="#64748b" style={{ marginRight: 8 }} />
                    <TextInput
                      style={styles.linkTextInput}
                      placeholder="https://drive.google.com/... or web URL"
                      placeholderTextColor="#94a3b8"
                      value={tempLinkUrl}
                      onChangeText={setTempLinkUrl}
                      autoCapitalize="none"
                      keyboardType="url"
                      returnKeyType="next"
                    />
                  </View>

                  <View style={[styles.linkInputField, { marginTop: 8 }]}>
                    <Feather name="type" size={13} color="#64748b" style={{ marginRight: 8 }} />
                    <TextInput
                      style={styles.linkTextInput}
                      placeholder="Title (e.g. Chapter 4 Slides, Syllabus)"
                      placeholderTextColor="#94a3b8"
                      value={tempLinkTitle}
                      onChangeText={setTempLinkTitle}
                      returnKeyType="done"
                    />
                  </View>

                  <View style={styles.linkDrawerActions}>
                    <TouchableOpacity
                      style={styles.linkDrawerCancelBtn}
                      onPress={handleCancelLink}
                    >
                      <Text style={styles.linkDrawerCancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.linkDrawerDoneBtn,
                        !tempLinkUrl.trim() && { opacity: 0.5 },
                      ]}
                      disabled={!tempLinkUrl.trim()}
                      onPress={handleSaveLink}
                    >
                      <Text style={styles.linkDrawerDoneText}>Attach Link</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Attached Link Preview Pill */}
              {linkUrl && !isLinkDrawerOpen ? (
                <View style={styles.attachedLinkPill}>
                  <View style={styles.attachedLinkIconBox}>
                    <Feather name="link-2" size={14} color="#0284c7" />
                  </View>
                  <TouchableOpacity
                    style={{ flex: 1, marginRight: 8 }}
                    onPress={handleOpenLinkDrawer}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.attachedLinkTitle} numberOfLines={1}>
                      {linkTitle.trim() || linkUrl}
                    </Text>
                    {linkTitle.trim() ? (
                      <Text style={styles.attachedLinkUrl} numberOfLines={1}>
                        {linkUrl}
                      </Text>
                    ) : null}
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleRemoveLink}
                    style={styles.removeChipBtn}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Feather name="x" size={13} color="#64748b" />
                  </TouchableOpacity>
                </View>
              ) : null}

              {/* Uploaded Files Bento List */}
              {attachments.length > 0 && (
                <View style={styles.filesGrid}>
                  {attachments.map((file, idx) => (
                    <View key={idx} style={styles.fileCard}>
                      <View style={styles.fileCardIcon}>
                        <Feather
                          name={file.type?.includes("image") ? "image" : "file-text"}
                          size={14}
                          color="#0284c7"
                        />
                      </View>
                      <View style={{ flex: 1, marginRight: 6 }}>
                        <Text style={styles.fileCardName} numberOfLines={1}>
                          {file.name}
                        </Text>
                        {file.size ? (
                          <Text style={styles.fileCardSize}>
                            {formatFileSize(file.size)}
                          </Text>
                        ) : null}
                      </View>
                      <TouchableOpacity
                        onPress={() => handleRemoveAttachment(idx)}
                        style={styles.removeChipBtn}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                      >
                        <Feather name="x" size={13} color="#64748b" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>

          {/* Docked Bottom Bar */}
          <View
            style={[
              styles.bottomBar,
              {
                paddingBottom: Platform.OS === "ios" ? Math.max(insets.bottom, 10) : 10,
              },
            ]}
          >
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!canSubmit || isPending}
              style={[
                styles.publishBtn,
                (!canSubmit || isPending) && styles.publishBtnDisabled,
              ]}
              activeOpacity={0.85}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={isEditing ? "Save changes" : "Publish announcement"}
            >
              {isPending ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Feather
                    name="send"
                    size={16}
                    color={canSubmit ? "#ffffff" : "#94a3b8"}
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={[
                      styles.publishBtnText,
                      !canSubmit && styles.publishBtnTextDisabled,
                    ]}
                  >
                    {isEditing ? "Save Changes" : "Publish Announcement"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BENTO_THEME.canvas,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: BENTO_THEME.canvas,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(19, 27, 46, 0.04)",
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  headerTitleWrap: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: BENTO_THEME.deepNavy,
    letterSpacing: -0.3,
  },
  headerSpacer: {
    width: 38,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
  },

  // 1. Soft Mint Campus Broadcast Banner
  heroBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO_THEME.mintBanner,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(6, 78, 59, 0.08)",
  },
  heroIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  heroTitle: {
    fontFamily,
    fontSize: 13,
    fontWeight: "800",
    color: BENTO_THEME.mintText,
    marginBottom: 1,
  },
  heroSubtitle: {
    fontFamily,
    fontSize: 11,
    fontWeight: "500",
    color: BENTO_THEME.mintSubtext,
    lineHeight: 15,
  },

  // Section Label
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  sectionLabel: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: BENTO_THEME.subtleText,
  },

  // 2. Bento Topic Pills
  tagsRow: {
    gap: 8,
    paddingHorizontal: 2,
  },
  tagPill: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 9999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagPillText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
  },

  // 3. Bento Card Base
  bentoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: BENTO_THEME.border,
    padding: 16,
    shadowColor: "#131b2e",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  bentoCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#0284c7",
    marginRight: 6,
  },
  cardHeaderLabel: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: BENTO_THEME.subtleText,
  },
  charCountBadge: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  charCountText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "600",
    color: "#64748b",
  },

  textArea: {
    fontFamily,
    fontSize: 15,
    lineHeight: 23,
    color: BENTO_THEME.deepNavy,
    minHeight: 185,
    padding: 0,
  },
  bentoCardFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 10,
    marginTop: 8,
  },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearBtnText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: "#94a3b8",
  },

  // 4. Attachments Bento
  attachmentCountPill: {
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  attachmentCountText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "700",
    color: "#15803d",
  },
  attachmentActionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  attachmentActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 16,
    padding: 10,
    gap: 8,
  },
  actionIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtnTitle: {
    fontFamily,
    fontSize: 12,
    fontWeight: "800",
  },
  actionBtnSubtitle: {
    fontFamily,
    fontSize: 10,
    marginTop: 1,
  },

  // Link Drawer
  linkDrawer: {
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 12,
    marginTop: 12,
  },
  linkDrawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  linkDrawerTitle: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: BENTO_THEME.deepNavy,
  },
  linkInputField: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  linkTextInput: {
    flex: 1,
    fontFamily,
    fontSize: 12,
    color: BENTO_THEME.deepNavy,
    padding: 0,
  },
  linkDrawerActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 10,
  },
  linkDrawerCancelBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  linkDrawerCancelText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: "#64748b",
  },
  linkDrawerDoneBtn: {
    backgroundColor: BENTO_THEME.deepNavy,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  linkDrawerDoneText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: "#ffffff",
  },

  // Attached Link Pill
  attachedLinkPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f9ff",
    borderWidth: 1,
    borderColor: "#bae6fd",
    borderRadius: 14,
    padding: 10,
    marginTop: 10,
  },
  attachedLinkIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  attachedLinkTitle: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: "#0369a1",
  },
  attachedLinkUrl: {
    fontFamily,
    fontSize: 10,
    color: "#0284c7",
    marginTop: 1,
  },
  removeChipBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },

  // Uploaded Files Grid
  filesGrid: {
    marginTop: 10,
    gap: 6,
  },
  fileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 8,
  },
  fileCardIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#e0f2fe",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  fileCardName: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: BENTO_THEME.deepNavy,
  },
  fileCardSize: {
    fontFamily,
    fontSize: 10,
    color: "#64748b",
    marginTop: 1,
  },

  // Dedicated Fixed Bottom Action Bar
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: BENTO_THEME.canvas,
    borderTopWidth: 1,
    borderTopColor: "rgba(19, 27, 46, 0.05)",
  },
  publishBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BENTO_THEME.deepNavy,
    height: 48,
    borderRadius: 9999,
    shadowColor: BENTO_THEME.deepNavy,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
  publishBtnDisabled: {
    backgroundColor: "#e2e8f0",
    shadowOpacity: 0,
    elevation: 0,
  },
  publishBtnText: {
    fontFamily,
    fontSize: 15,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.1,
  },
  publishBtnTextDisabled: {
    color: "#94a3b8",
  },
});
