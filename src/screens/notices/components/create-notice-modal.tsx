// src/screens/notices/components/create-notice-modal.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

import { useCreateNotice, useUpdateNotice } from "@/features/notices/useNotices";
import { NormalizedNotice } from "../types";
import { NOTICE_COLORS, fontFamily } from "../constants";

export interface CreateNoticeModalProps {
  visible: boolean;
  onClose: () => void;
  noticeToEdit?: NormalizedNotice | null;
}

export const CreateNoticeModal = React.memo(function CreateNoticeModal({
  visible,
  onClose,
  noticeToEdit,
}: CreateNoticeModalProps) {
  const insets = useSafeAreaInsets();
  const isEditing = !!noticeToEdit;

  const [title, setTitle] = useState("");
  const [referenceNo, setReferenceNo] = useState("");
  const [body, setBody] = useState("");
  const [issuerName, setIssuerName] = useState("");
  const [issuerDesignation, setIssuerDesignation] = useState("");
  const [copyTo, setCopyTo] = useState<string[]>([]);
  const [ccInput, setCcInput] = useState("");

  const createNoticeMutation = useCreateNotice();
  const updateNoticeMutation = useUpdateNotice();
  const isPending =
    createNoticeMutation.isPending || updateNoticeMutation.isPending;

  // Initialize or reset form state when modal opens or noticeToEdit changes
  useEffect(() => {
    if (noticeToEdit) {
      setTitle(noticeToEdit.title || "");
      setReferenceNo(noticeToEdit.referenceNo || "");
      setBody(noticeToEdit.body || "");
      setIssuerName(noticeToEdit.issuerName || "");
      setIssuerDesignation(noticeToEdit.issuerDesignation || "");
      setCopyTo(noticeToEdit.copyTo ? [...noticeToEdit.copyTo] : []);
    } else {
      setTitle("");
      setReferenceNo("");
      setBody("");
      setIssuerName("");
      setIssuerDesignation("");
      setCopyTo([]);
    }
    setCcInput("");
  }, [noticeToEdit, visible]);

  const handleAddCc = () => {
    const trimmed = ccInput.trim();
    if (!trimmed) return;
    if (copyTo.includes(trimmed)) {
      setCcInput("");
      return;
    }
    setCopyTo([...copyTo, trimmed]);
    setCcInput("");
  };

  const handleRemoveCc = (indexToRemove: number) => {
    setCopyTo(copyTo.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async () => {
    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();
    const trimmedIssuerName = issuerName.trim();
    const trimmedIssuerDesignation = issuerDesignation.trim();

    if (!trimmedTitle) {
      Toast.show({
        type: "error",
        text1: "Title Required",
        text2: "Please enter a subject or title for the notice.",
      });
      return;
    }

    if (!trimmedBody) {
      Toast.show({
        type: "error",
        text1: "Body Text Required",
        text2: "Please enter the announcement body content.",
      });
      return;
    }

    if (!trimmedIssuerName || !trimmedIssuerDesignation) {
      Toast.show({
        type: "error",
        text1: "Signatory Required",
        text2: "Please enter both the issuer name and designation.",
      });
      return;
    }

    try {
      if (isEditing && noticeToEdit) {
        await updateNoticeMutation.mutateAsync({
          id: noticeToEdit.id,
          data: {
            title: trimmedTitle,
            referenceNo: referenceNo.trim() || null,
            body: trimmedBody,
            issuerName: trimmedIssuerName,
            issuerDesignation: trimmedIssuerDesignation,
            copyTo,
          },
        });

        Toast.show({
          type: "success",
          text1: "Notice Updated",
          text2: "Official notice changes have been saved successfully.",
        });
      } else {
        await createNoticeMutation.mutateAsync({
          title: trimmedTitle,
          referenceNo: referenceNo.trim() || undefined,
          body: trimmedBody,
          issuerName: trimmedIssuerName,
          issuerDesignation: trimmedIssuerDesignation,
          copyTo,
        });

        Toast.show({
          type: "success",
          text1: "Notice Published",
          text2: "Official announcement published to the campus noticeboard.",
        });
      }

      onClose();
    } catch {
      Toast.show({
        type: "error",
        text1: isEditing ? "Update Failed" : "Publish Failed",
        text2: "An error occurred while saving the notice. Please try again.",
      });
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.modalOverlay,
          { paddingTop: Math.max(insets.top, 24) },
        ]}
      >
        <TouchableOpacity
          style={styles.backdropDismiss}
          activeOpacity={1}
          onPress={onClose}
          accessible={false}
        />

        <View style={styles.sheetContainer}>
          {/* Top Handle Bar */}
          <View style={styles.handleBar} />

          {/* Modal Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={onClose}
              style={styles.circleBtn}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close notice modal"
              activeOpacity={0.7}
            >
              <Feather name="x" size={18} color={NOTICE_COLORS.deepNavy} />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>
              {isEditing ? "Edit Official Notice" : "Draft Official Notice"}
            </Text>

            {isEditing ? (
              <View style={styles.editBadge}>
                <Text style={styles.editBadgeText}>EDIT</Text>
              </View>
            ) : (
              <View style={{ width: 38 }} />
            )}
          </View>

          {/* Scrollable Form Content */}
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{ flex: 1 }}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Document Metadata Group */}
              <View style={styles.sectionHeader}>
                <Feather
                  name="file-text"
                  size={14}
                  color={NOTICE_COLORS.deepNavy}
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.sectionTitle}>DOCUMENT METADATA</Text>
              </View>

              {/* Title */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>
                  Notice Title <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Vacation for Eid-Ul-Adha 2026, Exam Schedule"
                  placeholderTextColor={NOTICE_COLORS.subtleText}
                  value={title}
                  onChangeText={setTitle}
                  accessible={true}
                  accessibilityLabel="Notice Title"
                />
              </View>

              {/* Reference Number */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Reference / Memo Number (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. SMUCT/REG/GEN/2026/042"
                  placeholderTextColor={NOTICE_COLORS.subtleText}
                  value={referenceNo}
                  onChangeText={setReferenceNo}
                  accessible={true}
                  accessibilityLabel="Reference Number"
                />
              </View>

              {/* Content Body Group */}
              <View style={styles.sectionHeader}>
                <Feather
                  name="align-left"
                  size={14}
                  color={NOTICE_COLORS.deepNavy}
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.sectionTitle}>MAIN ANNOUNCEMENT BODY</Text>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>
                  Official Text <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Enter the official paragraphs, instructions, eligibility, or directives..."
                  placeholderTextColor={NOTICE_COLORS.subtleText}
                  value={body}
                  onChangeText={setBody}
                  multiline={true}
                  numberOfLines={5}
                  textAlignVertical="top"
                  accessible={true}
                  accessibilityLabel="Notice Body Text"
                />
              </View>

              {/* Signatory Details Group */}
              <View style={styles.sectionHeader}>
                <Feather
                  name="user-check"
                  size={14}
                  color={NOTICE_COLORS.deepNavy}
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.sectionTitle}>SIGNATORY & AUTHORITY</Text>
              </View>

              <View style={styles.fieldRow}>
                <View style={styles.fieldHalf}>
                  <Text style={styles.label}>
                    Issuer Name <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Dr. Par Mosiur Rahman"
                    placeholderTextColor={NOTICE_COLORS.subtleText}
                    value={issuerName}
                    onChangeText={setIssuerName}
                    accessible={true}
                    accessibilityLabel="Issuer Name"
                  />
                </View>

                <View style={styles.fieldHalf}>
                  <Text style={styles.label}>
                    Designation <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Registrar"
                    placeholderTextColor={NOTICE_COLORS.subtleText}
                    value={issuerDesignation}
                    onChangeText={setIssuerDesignation}
                    accessible={true}
                    accessibilityLabel="Issuer Designation"
                  />
                </View>
              </View>

              {/* Copy To (CC) Group */}
              <View style={styles.sectionHeader}>
                <Feather
                  name="users"
                  size={14}
                  color={NOTICE_COLORS.deepNavy}
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.sectionTitle}>COPY TO (CC RECIPIENTS)</Text>
              </View>

              <View style={styles.ccInputRow}>
                <TextInput
                  style={[styles.input, { flex: 1, marginRight: 8 }]}
                  placeholder="e.g. Deans of all Faculties, All Students"
                  placeholderTextColor={NOTICE_COLORS.subtleText}
                  value={ccInput}
                  onChangeText={setCcInput}
                  onSubmitEditing={handleAddCc}
                  returnKeyType="done"
                  accessible={true}
                  accessibilityLabel="Add recipient to CC"
                />
                <TouchableOpacity
                  style={styles.addCcBtn}
                  onPress={handleAddCc}
                  activeOpacity={0.8}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Add CC recipient"
                >
                  <Feather name="plus" size={18} color="#ffffff" />
                </TouchableOpacity>
              </View>

              {copyTo.length > 0 && (
                <View style={styles.ccChipsContainer}>
                  {copyTo.map((recipient, idx) => (
                    <View key={idx} style={styles.ccChip}>
                      <Text style={styles.ccChipText}>
                        {idx + 1}. {recipient}
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleRemoveCc(idx)}
                        style={styles.ccRemoveBtn}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                      >
                        <Feather name="x" size={13} color="#dc2626" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          </KeyboardAvoidingView>

          {/* Sticky Bottom Actions */}
          <View
            style={[
              styles.footer,
              { paddingBottom: Math.max(insets.bottom, 16) },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.submitButton,
                isPending && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isPending}
              activeOpacity={0.85}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={isEditing ? "Save notice changes" : "Publish notice"}
            >
              {isPending ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <>
                  <Feather
                    name={isEditing ? "check-circle" : "check"}
                    size={18}
                    color="#ffffff"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.submitButtonText}>
                    {isEditing ? "Save Notice Changes" : "Publish Official Notice"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    justifyContent: "flex-end",
  },
  backdropDismiss: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheetContainer: {
    backgroundColor: NOTICE_COLORS.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    height: "92%",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
  },
  handleBar: {
    width: 38,
    height: 4.5,
    borderRadius: 2.25,
    backgroundColor: "#cbd5e1",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: NOTICE_COLORS.divider,
  },
  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: NOTICE_COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: NOTICE_COLORS.mutedBorder,
    ...NOTICE_COLORS.shadow,
  },
  headerTitle: {
    fontFamily,
    fontSize: 17,
    fontWeight: "800",
    color: NOTICE_COLORS.deepNavy,
  },
  editBadge: {
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "rgba(37, 99, 235, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  editBadgeText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: "#2563eb",
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "800",
    color: NOTICE_COLORS.deepNavy,
    letterSpacing: 0.6,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  fieldRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },
  fieldHalf: {
    flex: 1,
  },
  label: {
    fontFamily,
    fontSize: 12.5,
    fontWeight: "700",
    color: NOTICE_COLORS.deepNavy,
    marginBottom: 6,
  },
  required: {
    color: "#dc2626",
  },
  input: {
    backgroundColor: NOTICE_COLORS.white,
    borderWidth: 1,
    borderColor: NOTICE_COLORS.mutedBorder,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontFamily,
    fontSize: 13.5,
    color: NOTICE_COLORS.deepNavy,
    ...NOTICE_COLORS.shadow,
  },
  textArea: {
    minHeight: 110,
    paddingTop: 12,
  },
  ccInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  addCcBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: NOTICE_COLORS.deepNavy,
    alignItems: "center",
    justifyContent: "center",
  },
  ccChipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },
  ccChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: NOTICE_COLORS.white,
    borderWidth: 1,
    borderColor: NOTICE_COLORS.mutedBorder,
    paddingVertical: 6,
    paddingLeft: 10,
    paddingRight: 6,
    borderRadius: 10,
  },
  ccChipText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: NOTICE_COLORS.deepNavy,
    marginRight: 6,
  },
  ccRemoveBtn: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#fee2e2",
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    backgroundColor: NOTICE_COLORS.white,
    borderTopWidth: 1,
    borderTopColor: NOTICE_COLORS.divider,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: NOTICE_COLORS.deepNavy,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: NOTICE_COLORS.deepNavy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontFamily,
    fontSize: 15,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.2,
  },
});
