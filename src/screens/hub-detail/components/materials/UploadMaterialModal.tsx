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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { Feather } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import * as DocumentPicker from "expo-document-picker";

import { uploadMultipleFilesToCloudinary } from "@/services/cloudinary-service";
import { CreateMaterialPayload, MaterialAttachment, MaterialSectionTab } from "./types";

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
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [driveUrl, setDriveUrl] = useState("");
    const [isStudentNote, setIsStudentNote] = useState(!canManage || initialTab === "STUDENT_NOTES");
    const [attachedFiles, setAttachedFiles] = useState<MaterialAttachment[]>([]);
    const [isUploadingFiles, setIsUploadingFiles] = useState(false);

    // Sync isStudentNote based on canManage and initialTab
    useEffect(() => {
      if (isVisible) {
        setIsStudentNote(!canManage || initialTab === "STUDENT_NOTES");
        setTitle("");
        setDescription("");
        setDriveUrl("");
        setAttachedFiles([]);
      }
    }, [isVisible, canManage, initialTab]);

    const applyDarkStatusBar = useCallback(() => {
      StatusBar.setBarStyle("dark-content", true);
      if (Platform.OS === "android") {
        StatusBar.setBackgroundColor("transparent", true);
        StatusBar.setTranslucent(true);
      }
    }, []);

    useEffect(() => {
      if (isVisible) {
        applyDarkStatusBar();
        const t = setTimeout(applyDarkStatusBar, 150);
        return () => clearTimeout(t);
      }
    }, [isVisible, applyDarkStatusBar]);

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

    const handleSubmit = () => {
      if (!title.trim()) {
        Toast.show({ type: "error", text1: "Title Required", text2: "Please enter a title for this material." });
        return;
      }

      let validUrl = driveUrl.trim();
      if (validUrl && !/^https?:\/\//i.test(validUrl)) {
        validUrl = `https://${validUrl}`;
      }

      // If no drive link and no attachments, require at least one
      if (!validUrl && attachedFiles.length === 0) {
        validUrl = "https://drive.google.com";
      }

      onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        driveUrl: validUrl || (attachedFiles[0]?.url ?? "https://drive.google.com"),
        isStudentNote: canManage ? isStudentNote : true,
        attachments: attachedFiles.length > 0 ? attachedFiles : undefined,
      });
    };

    return (
      <Modal
        visible={isVisible}
        animationType="slide"
        presentationStyle={Platform.OS === "ios" ? "pageSheet" : "fullScreen"}
        statusBarTranslucent={true}
        onRequestClose={onClose}
        onShow={applyDarkStatusBar}
      >
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
        <ExpoStatusBar style="dark" />

        <SafeAreaView style={styles.modalRoot} edges={["top"]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.keyboardContainer}
          >
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
                <View>
                  <Text style={styles.headerTitle}>
                    {canManage && !isStudentNote
                      ? "Upload Course Material"
                      : "Share Student Resource"}
                  </Text>
                  <Text style={styles.headerSubtitle}>
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
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
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

              {/* Description Field */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>DESCRIPTION (OPTIONAL)</Text>
                <TextInput
                  style={[styles.textInput, styles.textAreaInput]}
                  placeholder="Topics covered, exam tips, or notes..."
                  placeholderTextColor="#94a3b8"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Attach Files Button & List */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>ATTACH DOCUMENTS / PDF</Text>
                <TouchableOpacity
                  style={styles.attachBtn}
                  onPress={handlePickFiles}
                  disabled={isUploadingFiles}
                  activeOpacity={0.8}
                >
                  {isUploadingFiles ? (
                    <ActivityIndicator size="small" color="#2563eb" style={{ marginRight: 8 }} />
                  ) : (
                    <Feather name="upload-cloud" size={16} color="#2563eb" style={{ marginRight: 8 }} />
                  )}
                  <Text style={styles.attachBtnText}>
                    {isUploadingFiles ? "Uploading Files..." : "Choose Files from Device"}
                  </Text>
                </TouchableOpacity>

                {attachedFiles.map((file, idx) => (
                  <View key={`file-${idx}`} style={styles.fileItemRow}>
                    <View style={styles.fileItemIcon}>
                      <Feather name="file-text" size={14} color="#2563eb" />
                    </View>
                    <Text style={styles.fileItemName} numberOfLines={1}>
                      {file.name}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveFile(idx)}
                      style={styles.removeFileBtn}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Feather name="x" size={14} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              {/* Web / Google Drive Link Field */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>GOOGLE DRIVE / WEB LINK (OPTIONAL)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="https://drive.google.com/... or GitHub link"
                  placeholderTextColor="#94a3b8"
                  value={driveUrl}
                  onChangeText={setDriveUrl}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                />
              </View>

              <View style={{ height: 24 }} />
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
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    );
  }
);

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
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
  headerTitle: {
    fontFamily,
    fontSize: 15.5,
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
  scrollContent: {
    padding: 16,
  },
  typeSelectorWrapper: {
    marginBottom: 16,
  },
  typeSwitcher: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.05)",
  },
  typeSwitchBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
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
    marginBottom: 16,
  },
  fieldLabel: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: "#64748b",
    letterSpacing: 0.5,
    marginBottom: 8,
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
    paddingVertical: 11,
  },
  textAreaInput: {
    height: 76,
    textAlignVertical: "top",
  },
  attachBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eff6ff",
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(37, 99, 235, 0.3)",
    marginBottom: 8,
  },
  attachBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#2563eb",
  },
  fileItemRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.06)",
  },
  fileItemIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  fileItemName: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: "#0f172a",
    flex: 1,
    marginRight: 8,
  },
  removeFileBtn: {
    padding: 4,
  },
  footerBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
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
