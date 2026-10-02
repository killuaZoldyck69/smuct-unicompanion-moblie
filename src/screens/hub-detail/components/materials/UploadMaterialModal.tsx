import React, { useState, useEffect, useCallback } from "react";
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
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { Feather } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import * as DocumentPicker from "expo-document-picker";

import { uploadMultipleFilesToCloudinary } from "@/services/cloudinary-service";
import {
  CreateMaterialPayload,
  MaterialAttachment,
  MaterialLink,
  MaterialSectionTab,
} from "./types";
import { formatFileSize, getFileIcon } from "./utils";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

interface UploadMaterialModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateMaterialPayload) => void;
  isPending: boolean;
  canManage: boolean;
  initialTab: MaterialSectionTab;
}

export const UploadMaterialModal: React.FC<UploadMaterialModalProps> = React.memo(
  ({ isVisible, onClose, onSubmit, isPending, canManage, initialTab }) => {
    const insets = useSafeAreaInsets();
    const [title, setTitle] = useState("");
    const [isStudentNote, setIsStudentNote] = useState(!canManage || initialTab === "STUDENT_NOTES");
    const [attachedFiles, setAttachedFiles] = useState<MaterialAttachment[]>([]);
    const [isUploadingFiles, setIsUploadingFiles] = useState(false);
    const [links, setLinks] = useState<MaterialLink[]>([]);
    const [isLinkDrawerOpen, setIsLinkDrawerOpen] = useState(false);
    const [tempLinkUrl, setTempLinkUrl] = useState("");
    const [tempLinkTitle, setTempLinkTitle] = useState("");

    // Sync state when modal visibility changes
    useEffect(() => {
      if (isVisible) {
        setIsStudentNote(!canManage || initialTab === "STUDENT_NOTES");
        setTitle("");
        setAttachedFiles([]);
        setLinks([]);
        setIsLinkDrawerOpen(false);
        setTempLinkUrl("");
        setTempLinkTitle("");
      }
    }, [isVisible, canManage, initialTab]);

    const applyLightStatusBar = useCallback(() => {
      StatusBar.setBarStyle("light-content", true);
      if (Platform.OS === "android") {
        StatusBar.setBackgroundColor("transparent", true);
        StatusBar.setTranslucent(true);
      }
    }, []);

    useEffect(() => {
      if (isVisible) {
        applyLightStatusBar();
        const t = setTimeout(applyLightStatusBar, 150);
        return () => clearTimeout(t);
      }
    }, [isVisible, applyLightStatusBar]);

    const handlePickFiles = async () => {
      try {
        const res = await DocumentPicker.getDocumentAsync({
          multiple: true,
          copyToCacheDirectory: true,
        });

        if (res.canceled || !res.assets || res.assets.length === 0) return;

        setIsUploadingFiles(true);
        const uploaded = await uploadMultipleFilesToCloudinary(
          res.assets.map((asset) => ({
            uri: asset.uri,
            name: asset.name,
            mimeType: asset.mimeType || undefined,
            size: asset.size || undefined,
          }))
        );

        const items: MaterialAttachment[] = uploaded.map((u) => ({
          name: u.name,
          url: u.secureUrl,
          size: u.size,
          type: u.type,
        }));

        setAttachedFiles((prev) => [...prev, ...items]);
        Toast.show({ type: "success", text1: "Files Attached" });
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

    const handleRemoveFile = (idx: number) => {
      setAttachedFiles((prev) => prev.filter((_, i) => i !== idx));
    };

    const handleAddLink = () => {
      const trimmedUrl = tempLinkUrl.trim();
      if (!trimmedUrl) return;

      const formattedUrl =
        trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://")
          ? trimmedUrl
          : `https://${trimmedUrl}`;

      setLinks((prev) => [
        ...prev,
        {
          url: formattedUrl,
          title: tempLinkTitle.trim() || formattedUrl,
        },
      ]);

      setTempLinkUrl("");
      setTempLinkTitle("");
      setIsLinkDrawerOpen(false);
    };

    const handleRemoveLink = (idx: number) => {
      setLinks((prev) => prev.filter((_, i) => i !== idx));
    };

    const handleSubmit = () => {
      if (!title.trim()) {
        Toast.show({
          type: "error",
          text1: "Title Required",
          text2: "Please enter a title for this material.",
        });
        return;
      }

      const primaryUrl =
        links[0]?.url ||
        attachedFiles[0]?.url ||
        "https://drive.google.com";

      onSubmit({
        title: title.trim(),
        description: undefined,
        driveUrl: primaryUrl,
        isStudentNote: canManage ? isStudentNote : true,
        attachments: attachedFiles.length > 0 ? attachedFiles : undefined,
        links: links.length > 0 ? links : undefined,
      });
    };

    const totalAttached = attachedFiles.length + links.length;

    return (
      <Modal
        visible={isVisible}
        animationType="slide"
        transparent={true}
        statusBarTranslucent={true}
        onRequestClose={onClose}
        onShow={applyLightStatusBar}
      >
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
        <ExpoStatusBar style="light" />

        <View style={styles.modalOverlay}>
          {/* Backdrop (tap to close) */}
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={isPending ? undefined : onClose}
            accessible={false}
          />

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.sheetWrap}
          >
            <View
              style={[
                styles.sheetContent,
                { paddingBottom: Math.max(insets.bottom + 10, 14) },
              ]}
            >
              {/* Drag Handle */}
              <View style={styles.dragHandleWrap}>
                <View style={styles.dragHandle} />
              </View>

              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <View style={styles.iconCircle}>
                    <Feather
                      name={isStudentNote ? "file-text" : "book-open"}
                      size={16}
                      color="#0f172a"
                    />
                  </View>
                  <View style={styles.headerTitleWrap}>
                    <Text style={styles.headerTitle} numberOfLines={1}>
                      {canManage && !isStudentNote
                        ? "Upload Course Material"
                        : "Share Student Resource"}
                    </Text>
                    <Text style={styles.headerSubtitle} numberOfLines={1}>
                      {canManage && !isStudentNote
                        ? "Publish official lecture & course syllabus files"
                        : "Contribute study guides, papers & student notes"}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Close upload modal"
                >
                  <Feather name="x" size={20} color="#0f172a" />
                </TouchableOpacity>
              </View>

              {/* Scrollable Form */}
              <ScrollView
                style={styles.formScroll}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                bounces={false}
              >
                {/* Type Switcher for Managers */}
                {canManage && (
                  <View style={styles.typeSelectorWrapper}>
                    <Text style={styles.fieldLabel}>PUBLISH DESTINATION</Text>
                    <View style={styles.typeSwitcher}>
                      <TouchableOpacity
                        style={[
                          styles.typeSwitchBtn,
                          !isStudentNote && styles.typeSwitchBtnActive,
                        ]}
                        onPress={() => setIsStudentNote(false)}
                        activeOpacity={0.8}
                      >
                        <Feather
                          name="book-open"
                          size={13}
                          color={!isStudentNote ? "#0f172a" : "#64748b"}
                          style={{ marginRight: 6 }}
                        />
                        <Text
                          style={[
                            styles.typeSwitchText,
                            !isStudentNote && styles.typeSwitchTextActive,
                          ]}
                        >
                          Course Material
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.typeSwitchBtn,
                          isStudentNote && styles.typeSwitchBtnActive,
                        ]}
                        onPress={() => setIsStudentNote(true)}
                        activeOpacity={0.8}
                      >
                        <Feather
                          name="users"
                          size={13}
                          color={isStudentNote ? "#0f172a" : "#64748b"}
                          style={{ marginRight: 6 }}
                        />
                        <Text
                          style={[
                            styles.typeSwitchText,
                            isStudentNote && styles.typeSwitchTextActive,
                          ]}
                        >
                          Student Resources
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Title Field */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>TITLE *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Chapter 4 Lecture Slides / Past Midterm Papers"
                    placeholderTextColor="#94a3b8"
                    value={title}
                    onChangeText={setTitle}
                  />
                </View>

                {/* Attachments & Materials Section */}
                <View style={styles.sectionBlock}>
                  <View style={styles.sectionHeaderBetween}>
                    <View style={styles.labelRow}>
                      <Feather
                        name="paperclip"
                        size={13}
                        color="#64748b"
                        style={{ marginRight: 6 }}
                      />
                      <Text style={styles.fieldLabel}>ATTACHMENTS & MATERIALS</Text>
                    </View>
                    {totalAttached > 0 && (
                      <View style={styles.countPill}>
                        <Text style={styles.countPillText}>{totalAttached} attached</Text>
                      </View>
                    )}
                  </View>

                  {/* Dual Action Buttons (Files & Links) */}
                  <View style={styles.attachmentActionsRow}>
                    {/* Attach Files Button */}
                    <TouchableOpacity
                      style={[
                        styles.attachmentActionBtn,
                        { backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" },
                      ]}
                      onPress={handlePickFiles}
                      disabled={isUploadingFiles}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.actionIconCircle, { backgroundColor: "#dcfce7" }]}>
                        {isUploadingFiles ? (
                          <ActivityIndicator size="small" color="#15803d" />
                        ) : (
                          <Feather name="file-plus" size={15} color="#15803d" />
                        )}
                      </View>
                      <View style={styles.actionTextCol}>
                        <Text style={[styles.actionBtnTitle, { color: "#15803d" }]}>
                          {isUploadingFiles ? "Uploading..." : "Attach Files"}
                        </Text>
                        <Text style={[styles.actionBtnSubtitle, { color: "#166534" }]}>
                          PDF, PPT, Word, Images
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {/* Add Link Button */}
                    <TouchableOpacity
                      style={[
                        styles.attachmentActionBtn,
                        { backgroundColor: "#eff6ff", borderColor: "#bfdbfe" },
                      ]}
                      onPress={() => setIsLinkDrawerOpen((prev) => !prev)}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.actionIconCircle, { backgroundColor: "#dbeafe" }]}>
                        <Feather name="link-2" size={15} color="#1d4ed8" />
                      </View>
                      <View style={styles.actionTextCol}>
                        <Text style={[styles.actionBtnTitle, { color: "#1d4ed8" }]}>
                          {isLinkDrawerOpen ? "Close Drawer" : "Add Link"}
                        </Text>
                        <Text style={[styles.actionBtnSubtitle, { color: "#1e40af" }]}>
                          Drive, Repo, Web
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>

                  {/* Inline Link Drawer */}
                  {isLinkDrawerOpen && (
                    <View style={styles.linkDrawer}>
                      <View style={styles.linkDrawerHeader}>
                        <Text style={styles.linkDrawerTitle}>Add Resource Link</Text>
                        <TouchableOpacity
                          onPress={() => setIsLinkDrawerOpen(false)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Feather name="x" size={15} color="#64748b" />
                        </TouchableOpacity>
                      </View>

                      <View style={styles.linkInputField}>
                        <Feather name="globe" size={14} color="#64748b" style={{ marginRight: 8 }} />
                        <TextInput
                          style={styles.linkTextInput}
                          placeholder="https://drive.google.com/... or web URL"
                          placeholderTextColor="#94a3b8"
                          value={tempLinkUrl}
                          onChangeText={setTempLinkUrl}
                          autoCapitalize="none"
                          keyboardType="url"
                        />
                      </View>

                      <View style={[styles.linkInputField, { marginTop: 8 }]}>
                        <Feather name="type" size={14} color="#64748b" style={{ marginRight: 8 }} />
                        <TextInput
                          style={styles.linkTextInput}
                          placeholder="Title (e.g. Google Drive Folder, Git Repo)"
                          placeholderTextColor="#94a3b8"
                          value={tempLinkTitle}
                          onChangeText={setTempLinkTitle}
                        />
                      </View>

                      <View style={styles.linkDrawerActions}>
                        <TouchableOpacity
                          style={styles.linkDrawerCancelBtn}
                          onPress={() => setIsLinkDrawerOpen(false)}
                        >
                          <Text style={styles.linkDrawerCancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.linkDrawerDoneBtn,
                            !tempLinkUrl.trim() && { opacity: 0.5 },
                          ]}
                          disabled={!tempLinkUrl.trim()}
                          onPress={handleAddLink}
                        >
                          <Text style={styles.linkDrawerDoneText}>Attach Link</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  {/* Attached Files List */}
                  {attachedFiles.length > 0 && (
                    <View style={styles.filesGrid}>
                      {attachedFiles.map((file, idx) => (
                        <View key={`file-${idx}`} style={styles.fileCard}>
                          <View style={styles.fileCardIcon}>
                            <Feather
                              name={getFileIcon(file.type, file.name)}
                              size={15}
                              color="#0f172a"
                            />
                          </View>
                          <View style={styles.fileCardTextCol}>
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
                            onPress={() => handleRemoveFile(idx)}
                            style={styles.removeChipBtn}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            accessible={true}
                            accessibilityRole="button"
                            accessibilityLabel={`Remove ${file.name}`}
                          >
                            <Feather name="x" size={14} color="#64748b" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Attached Links List */}
                  {links.length > 0 && (
                    <View style={styles.linksGrid}>
                      {links.map((item, idx) => (
                        <View key={`link-${idx}`} style={styles.linkCard}>
                          <View style={styles.linkCardIcon}>
                            <Feather name="link-2" size={15} color="#1d4ed8" />
                          </View>
                          <View style={styles.fileCardTextCol}>
                            <Text style={styles.linkCardTitle} numberOfLines={1}>
                              {item.title || item.url}
                            </Text>
                            <Text style={styles.linkCardUrl} numberOfLines={1}>
                              {item.url}
                            </Text>
                          </View>
                          <TouchableOpacity
                            onPress={() => handleRemoveLink(idx)}
                            style={styles.removeChipBtn}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            accessible={true}
                            accessibilityRole="button"
                            accessibilityLabel={`Remove link ${item.title || item.url}`}
                          >
                            <Feather name="x" size={14} color="#64748b" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </ScrollView>

              {/* Bottom Action Bar */}
              <View style={styles.footerBar}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.submitBtn,
                    (!title.trim() || isUploadingFiles || isPending) && styles.submitBtnDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={!title.trim() || isUploadingFiles || isPending}
                  activeOpacity={0.85}
                >
                  {isPending ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.submitBtnText}>Publish Material</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    );
  }
);

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "flex-end",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheetWrap: {
    width: "100%",
    justifyContent: "flex-end",
  },
  sheetContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.88,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 24,
  },
  dragHandleWrap: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 4,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#cbd5e1",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(15, 23, 42, 0.06)",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitle: {
    fontFamily,
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 2,
  },
  headerSubtitle: {
    fontFamily,
    fontSize: 11,
    color: "#64748b",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  formScroll: {
    maxHeight: SCREEN_HEIGHT * 0.58,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 8,
  },
  typeSelectorWrapper: {
    marginBottom: 14,
  },
  typeSwitcher: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.05)",
    marginTop: 6,
  },
  typeSwitchBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 9,
  },
  typeSwitchBtnActive: {
    backgroundColor: "#ffffff",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  typeSwitchText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
  },
  typeSwitchTextActive: {
    color: "#0f172a",
    fontWeight: "800",
  },
  fieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: "#64748b",
    letterSpacing: 0.5,
  },
  textInput: {
    fontFamily,
    fontSize: 13.5,
    color: "#0f172a",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.08)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 6,
  },
  sectionBlock: {
    marginBottom: 4,
  },
  sectionHeaderBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  countPill: {
    backgroundColor: "#e2e8f0",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countPillText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "700",
    color: "#0f172a",
  },
  attachmentActionsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  attachmentActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  actionTextCol: {
    flex: 1,
  },
  actionBtnTitle: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
  },
  actionBtnSubtitle: {
    fontFamily,
    fontSize: 10,
    fontWeight: "500",
    marginTop: 1,
  },
  filesGrid: {
    gap: 6,
    marginTop: 6,
  },
  fileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.08)",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  fileCardIcon: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  fileCardTextCol: {
    flex: 1,
    marginRight: 8,
  },
  fileCardName: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: "#0f172a",
  },
  fileCardSize: {
    fontFamily,
    fontSize: 10,
    color: "#64748b",
    marginTop: 1,
  },
  linksGrid: {
    gap: 6,
    marginTop: 6,
  },
  linkCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.08)",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  linkCardIcon: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  linkCardTitle: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: "#0f172a",
  },
  linkCardUrl: {
    fontFamily,
    fontSize: 10,
    color: "#1d4ed8",
    marginTop: 1,
  },
  removeChipBtn: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: "#f1f5f9",
  },
  linkDrawer: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.08)",
    padding: 12,
    marginBottom: 10,
  },
  linkDrawerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  linkDrawerTitle: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: "#0f172a",
  },
  linkInputField: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.08)",
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  linkTextInput: {
    flex: 1,
    fontFamily,
    fontSize: 12,
    color: "#0f172a",
    padding: 0,
  },
  linkDrawerActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 10,
  },
  linkDrawerCancelBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: "#f1f5f9",
  },
  linkDrawerCancelText: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "600",
    color: "#64748b",
  },
  linkDrawerDoneBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
    backgroundColor: "#1d4ed8",
  },
  linkDrawerDoneText: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "700",
    color: "#ffffff",
  },
  footerBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(15, 23, 42, 0.06)",
    backgroundColor: "#ffffff",
    gap: 12,
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#64748b",
  },
  submitBtn: {
    flex: 1,
    backgroundColor: "#0f172a",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "800",
    color: "#ffffff",
  },
});
