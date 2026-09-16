import React, { useState } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

const BENTO = {
  canvas: "#f8fafc",
  card: "#ffffff",
  navy: "#0f172a",
  slate: "#64748b",
  slateLight: "#94a3b8",
  border: "rgba(15, 23, 42, 0.08)",
  borderActive: "#0f172a",
  blueSoft: "#eff6ff",
  blueBorder: "#bfdbfe",
  blueText: "#1d4ed8",
  mintSoft: "#f0fdf4",
  mintBorder: "#bbf7d0",
  mintText: "#15803d",
  amberSoft: "#fffbeb",
  amberBorder: "#fde68a",
  amberText: "#b45309",
  purpleSoft: "#faf5ff",
  purpleBorder: "#e9d5ff",
  purpleText: "#7e22ce",
  roseSoft: "#fff1f2",
  roseBorder: "#fecdd3",
  roseText: "#e11d48",
};

const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  web: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  default: "sans-serif",
});

const QUICK_PRESETS = [
  { label: "General Notice", prefix: "[General Notice]\n" },
  { label: "Class Rescheduled", prefix: "[Class Rescheduled]\n" },
  { label: "Room / Lab Change", prefix: "[Room Change]\n" },
  { label: "Urgent Update", prefix: "[URGENT]\n" },
  { label: "Exam Routine", prefix: "[Exam Routine]\n" },
];

interface Props {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    content: string;
    attachedLinkUrl?: string;
    attachedLinkTitle?: string;
  }) => void;
  isPending: boolean;
}

export default function CreateAnnouncementModal({
  isVisible,
  onClose,
  onSubmit,
  isPending,
}: Props) {
  const [content, setContent] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");

  const handleApplyPreset = (prefix: string) => {
    if (!content.trim()) {
      setContent(prefix);
    } else {
      setContent(`${prefix}${content}`);
    }
  };

  const handleClose = () => {
    if (isPending) return;
    onClose();
  };

  const handleSubmit = () => {
    if (!content.trim() || isPending) return;

    onSubmit({
      content: content.trim(),
      attachedLinkUrl: linkUrl.trim() || undefined,
      attachedLinkTitle: linkTitle.trim() || undefined,
    });

    setContent("");
    setLinkUrl("");
    setLinkTitle("");
    setShowLinkInput(false);
  };

  const isFormValid = content.trim().length > 0;

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          {/* Bento Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={handleClose}
              disabled={isPending}
              style={styles.cancelBtn}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Cancel announcement"
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <View style={styles.headerCenterCol}>
              <Text style={styles.headerTitle}>New Announcement</Text>
              <Text style={styles.headerSubtitle}>
                Broadcast to all enrolled students
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isPending || !isFormValid}
              style={[
                styles.publishBtn,
                (!isFormValid || isPending) && styles.publishBtnDisabled,
              ]}
              activeOpacity={0.85}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Publish announcement"
            >
              {isPending ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Feather
                    name="send"
                    size={13}
                    color="#ffffff"
                    style={{ marginRight: 5 }}
                  />
                  <Text style={styles.publishBtnText}>Publish</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Form Scroll Area */}
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Broadcast Context Chip */}
            <View style={styles.broadcastBanner}>
              <View style={styles.broadcastIconBox}>
                <Feather name="volume-2" size={14} color={BENTO.blueText} />
              </View>
              <Text style={styles.broadcastText}>
                Visible immediately to everyone in this course hub.
              </Text>
            </View>

            {/* Quick Topic Presets */}
            <View style={styles.presetsSection}>
              <Text style={styles.presetsLabel}>QUICK TAGS</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.presetsRow}
              >
                {QUICK_PRESETS.map((p) => (
                  <TouchableOpacity
                    key={p.label}
                    onPress={() => handleApplyPreset(p.prefix)}
                    style={styles.presetChip}
                    activeOpacity={0.75}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={`Add ${p.label} tag`}
                  >
                    <Feather
                      name="tag"
                      size={11}
                      color={BENTO.navy}
                      style={{ marginRight: 4 }}
                    />
                    <Text style={styles.presetChipText}>{p.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Announcement Editor Card */}
            <View style={styles.editorCard}>
              <Text style={styles.fieldLabel}>ANNOUNCEMENT MESSAGE</Text>
              <TextInput
                style={styles.textArea}
                value={content}
                onChangeText={setContent}
                placeholder="Write an announcement to your class... (e.g. Tomorrow's class will begin at 10:30 AM in Room 1501)"
                placeholderTextColor={BENTO.slateLight}
                multiline
                autoFocus
                textAlignVertical="top"
                accessible={true}
                accessibilityLabel="Announcement message"
              />

              {/* Character & Info Bar */}
              <View style={styles.editorFooter}>
                <Text style={styles.charCountText}>
                  {content.length} characters
                </Text>
                {content.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setContent("")}
                    style={styles.clearBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Clear announcement message"
                  >
                    <Text style={styles.clearBtnText}>Clear</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Attached Reference Link Section */}
            {showLinkInput ? (
              <View style={styles.linkAttachmentCard}>
                <View style={styles.attachmentHeader}>
                  <View style={styles.attachmentTitleRow}>
                    <View style={styles.linkIconCircle}>
                      <Feather name="link-2" size={15} color={BENTO.blueText} />
                    </View>
                    <View>
                      <Text style={styles.attachmentTitle}>
                        Attached Reference Link
                      </Text>
                      <Text style={styles.attachmentSubtitle}>
                        Google Drive, Slides, or Web Resource
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() => {
                      setShowLinkInput(false);
                      setLinkUrl("");
                      setLinkTitle("");
                    }}
                    style={styles.removeLinkBtn}
                    activeOpacity={0.7}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Remove attached link"
                  >
                    <Feather
                      name="x"
                      size={13}
                      color={BENTO.roseText}
                      style={{ marginRight: 3 }}
                    />
                    <Text style={styles.removeLinkText}>Remove</Text>
                  </TouchableOpacity>
                </View>

                {/* URL Input */}
                <View style={[styles.inputCard, { marginBottom: 10 }]}>
                  <Feather
                    name="globe"
                    size={15}
                    color={BENTO.slate}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder="https://drive.google.com/... or https://..."
                    placeholderTextColor={BENTO.slateLight}
                    value={linkUrl}
                    onChangeText={setLinkUrl}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="url"
                    accessible={true}
                    accessibilityLabel="Attachment link URL"
                  />
                </View>

                {/* Title Input */}
                <View style={styles.inputCard}>
                  <Feather
                    name="type"
                    size={15}
                    color={BENTO.slate}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Link Title (e.g. Chapter 4 Slides, Syllabus)"
                    placeholderTextColor={BENTO.slateLight}
                    value={linkTitle}
                    onChangeText={setLinkTitle}
                    accessible={true}
                    accessibilityLabel="Attachment link title"
                  />
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addAttachmentBtn}
                onPress={() => setShowLinkInput(true)}
                activeOpacity={0.8}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Attach Link or Google Drive URL"
              >
                <View style={styles.addAttachmentIconCircle}>
                  <Feather name="link" size={14} color={BENTO.blueText} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.addAttachmentTitle}>
                    + Attach Link or Google Drive URL
                  </Text>
                  <Text style={styles.addAttachmentSubtitle}>
                    Include slides, docs, spreadsheets or references
                  </Text>
                </View>
                <Feather
                  name="chevron-right"
                  size={16}
                  color={BENTO.slateLight}
                />
              </TouchableOpacity>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BENTO.canvas,
    maxWidth: 640,
    width: "100%",
    alignSelf: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: BENTO.border,
  },
  cancelBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  cancelText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "600",
    color: BENTO.slate,
  },
  headerCenterCol: {
    alignItems: "center",
  },
  headerTitle: {
    fontFamily,
    fontSize: 17,
    fontWeight: "800",
    color: BENTO.navy,
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: BENTO.slate,
    marginTop: 1,
  },
  publishBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.navy,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  publishBtnDisabled: {
    backgroundColor: "#cbd5e1",
    opacity: 0.7,
  },
  publishBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },

  scrollContent: {
    padding: 18,
    paddingBottom: 40,
  },

  broadcastBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.blueSoft,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BENTO.blueBorder,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  broadcastIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  broadcastText: {
    flex: 1,
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: BENTO.blueText,
    lineHeight: 16,
  },

  presetsSection: {
    marginBottom: 16,
  },
  presetsLabel: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: BENTO.slate,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  presetsRow: {
    flexDirection: "row",
    gap: 8,
  },
  presetChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BENTO.border,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  presetChipText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: BENTO.navy,
  },

  // Editor Card
  editorCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BENTO.border,
    padding: 16,
    marginBottom: 16,
  },
  fieldLabel: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: BENTO.slate,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  textArea: {
    fontFamily,
    fontSize: 15,
    color: BENTO.navy,
    lineHeight: 22,
    minHeight: 160,
    padding: 0,
  },
  editorFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: BENTO.border,
    paddingTop: 10,
    marginTop: 12,
  },
  charCountText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: BENTO.slateLight,
  },
  clearBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  clearBtnText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: BENTO.slate,
  },

  // Attachment Card
  linkAttachmentCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BENTO.border,
    padding: 16,
  },
  attachmentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  attachmentTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  linkIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: BENTO.blueSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  attachmentTitle: {
    fontFamily,
    fontSize: 13,
    fontWeight: "800",
    color: BENTO.navy,
  },
  attachmentSubtitle: {
    fontFamily,
    fontSize: 11,
    color: BENTO.slate,
    marginTop: 1,
  },
  removeLinkBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.roseSoft,
    borderWidth: 1,
    borderColor: BENTO.roseBorder,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  removeLinkText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: BENTO.roseText,
  },

  inputCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.canvas,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BENTO.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontFamily,
    fontSize: 13,
    fontWeight: "600",
    color: BENTO.navy,
    padding: 0,
  },

  // Add Attachment Button
  addAttachmentBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BENTO.border,
    padding: 14,
  },
  addAttachmentIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: BENTO.blueSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  addAttachmentTitle: {
    fontFamily,
    fontSize: 13,
    fontWeight: "800",
    color: BENTO.navy,
    marginBottom: 2,
  },
  addAttachmentSubtitle: {
    fontFamily,
    fontSize: 11,
    color: BENTO.slate,
  },
});
