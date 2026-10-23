// src/screens/notices/components/create-notice-modal.tsx
import React, { useState, useEffect, useCallback, useRef } from "react";
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
  Keyboard,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import Toast from "react-native-toast-message";
import { toastConfig } from "@/components/ui/toast-config";

import {
  useCreateNotice,
  useUpdateNotice,
} from "@/features/notices/useNotices";
import { NormalizedNotice } from "../types";
import { NOTICE_COLORS, fontFamily } from "../constants";
import { OfficialIdentityBlock } from "./official-identity-block";
import { CampusWatermarkSvg } from "./illustrations/campus-watermark-svg";
import { RichNoticeText } from "./rich-notice-text";
import { OfficialWysiwygEditor } from "./official-wysiwyg-editor";
import { detectNoticeCategory } from "../utils";
import { resolveNoticeVisualTheme } from "../theme/notice-visual-theme-resolver";
import { formatDate } from "@/utils/date-formatter";

const DRAFT_STORAGE_KEY = "smuct_admin_notice_draft_v2";

export interface CreateNoticeModalProps {
  visible: boolean;
  onClose: () => void;
  noticeToEdit?: NormalizedNotice | null;
}

interface SavedDraftData {
  title: string;
  referenceNo: string;
  body: string;
  isJustified?: boolean;
  issuerName: string;
  issuerDesignation: string;
  copyTo: string[];
  savedAt: string;
}

/**
 * Prepares raw body content (legacy Markdown, [justify] tags, or HTML) for the WYSIWYG editor.
 */
function convertToEditorHtml(raw: string): string {
  if (!raw) return "";

  let formatted = raw.replace(/\\r\\n|\\n|\\r/g, "\n");

  // Convert legacy [justify]...[/justify] tags to justified div blocks
  formatted = formatted.replace(
    /\[justify\]([\s\S]*?)\[\/justify\]/gi,
    '<div style="text-align: justify;">$1</div>',
  );

  // Check if it's already HTML (e.g. contains <p>, <div>, <br>, <strong>, <b>, <i>, <u>, <ul>, <li>)
  const hasHtml = /<\/?(?:p|div|b|i|u|strong|em|ul|li|br)[^>]*>/i.test(formatted);

  if (!hasHtml) {
    // If it was stored as markdown/plain text:
    // Convert bold: **text** -> <strong>text</strong>
    formatted = formatted.replace(/\*\*([\s\S]+?)\*\*/g, "<strong>$1</strong>");
    // Convert italic: *text* -> <em>text</em>
    formatted = formatted.replace(/(^|[^\*])\*([^\*]+?)\*([^\*]|$)/g, "$1<em>$2</em>$3");
    // Convert newlines to paragraphs
    formatted = formatted
      .split(/\n\s*\n/)
      .map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`)
      .join("");
  }

  return formatted.trim();
}

export const CreateNoticeModal = React.memo(function CreateNoticeModal({
  visible,
  onClose,
  noticeToEdit,
}: CreateNoticeModalProps) {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const isEditing = !!noticeToEdit;

  // Step state: "compose" (Draft form) -> "preview" (Actual Student & Teacher view)
  const [step, setStep] = useState<"compose" | "preview">("compose");

  // Form states - initialized with noticeToEdit data on first render if editing
  const [title, setTitle] = useState(() => noticeToEdit?.title || "");
  const [referenceNo, setReferenceNo] = useState(() => noticeToEdit?.referenceNo || "");
  const [body, setBody] = useState(() => {
    if (noticeToEdit?.body) {
      return convertToEditorHtml(noticeToEdit.body);
    }
    return "";
  });
  const [isJustified, setIsJustified] = useState(() => {
    if (noticeToEdit?.body) {
      return /text-align:\s*justify|align=["']justify/i.test(noticeToEdit.body);
    }
    return false;
  });
  const [issuerName, setIssuerName] = useState(() => noticeToEdit?.issuerName || "");
  const [issuerDesignation, setIssuerDesignation] = useState(() => noticeToEdit?.issuerDesignation || "");
  const [copyTo, setCopyTo] = useState<string[]>(() =>
    noticeToEdit?.copyTo ? [...noticeToEdit.copyTo] : [],
  );
  const [ccInput, setCcInput] = useState("");

  // Draft restored status
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);
  const [draftSavedTime, setDraftSavedTime] = useState<string | null>(null);

  const createNoticeMutation = useCreateNotice();
  const updateNoticeMutation = useUpdateNotice();
  const isPending =
    createNoticeMutation.isPending || updateNoticeMutation.isPending;

  // Sync noticeToEdit or load saved draft from SecureStore
  useEffect(() => {
    if (!visible) return;

    if (noticeToEdit) {
      // Editing existing notice
      const formattedBody = convertToEditorHtml(noticeToEdit.body || "");
      setTitle(noticeToEdit.title || "");
      setReferenceNo(noticeToEdit.referenceNo || "");
      setBody(formattedBody);
      setIsJustified(/text-align:\s*justify|align=["']justify/i.test(formattedBody));
      setIssuerName(noticeToEdit.issuerName || "");
      setIssuerDesignation(noticeToEdit.issuerDesignation || "");
      setCopyTo(noticeToEdit.copyTo ? [...noticeToEdit.copyTo] : []);
      setStep("compose");
      setHasRestoredDraft(false);
      setDraftSavedTime(null);
    } else {
      // New notice creation: check if draft exists
      (async () => {
        try {
          if (Platform.OS !== "web") {
            const raw = await SecureStore.getItemAsync(DRAFT_STORAGE_KEY);
            if (raw) {
              const parsed: SavedDraftData = JSON.parse(raw);
              if (
                parsed.title ||
                parsed.body ||
                parsed.issuerName ||
                parsed.referenceNo
              ) {
                const formattedBody = convertToEditorHtml(parsed.body || "");
                setTitle(parsed.title || "");
                setReferenceNo(parsed.referenceNo || "");
                setBody(formattedBody);
                setIsJustified(
                  parsed.isJustified ??
                    /text-align:\s*justify|align=["']justify/i.test(
                      formattedBody,
                    ),
                );
                setIssuerName(parsed.issuerName || "");
                setIssuerDesignation(parsed.issuerDesignation || "");
                setCopyTo(parsed.copyTo || []);
                setHasRestoredDraft(true);
                setDraftSavedTime(
                  new Date(parsed.savedAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                );
                return;
              }
            }
          }
        } catch {
          // ignore error reading draft
        }

        // Default empty form
        setTitle("");
        setReferenceNo("");
        setBody("");
        setIsJustified(false);
        setIssuerName("");
        setIssuerDesignation("");
        setCopyTo([]);
        setHasRestoredDraft(false);
        setDraftSavedTime(null);
      })();
      setStep("compose");
    }
    setCcInput("");
  }, [noticeToEdit, visible]);

  // Save current form as draft to SecureStore
  const handleSaveDraft = useCallback(async () => {
    try {
      const data: SavedDraftData = {
        title,
        referenceNo,
        body,
        isJustified,
        issuerName,
        issuerDesignation,
        copyTo,
        savedAt: new Date().toISOString(),
      };
      if (Platform.OS !== "web") {
        await SecureStore.setItemAsync(DRAFT_STORAGE_KEY, JSON.stringify(data));
      }
      setDraftSavedTime(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
      setHasRestoredDraft(true);
      Toast.show({
        type: "success",
        text1: "Draft Saved",
        text2: "Notice draft has been securely saved locally.",
      });
    } catch {
      Toast.show({
        type: "error",
        text1: "Save Failed",
        text2: "Unable to save draft. Please try again.",
      });
    }
  }, [
    title,
    referenceNo,
    body,
    isJustified,
    issuerName,
    issuerDesignation,
    copyTo,
  ]);

  // Discard saved draft
  const handleDiscardDraft = useCallback(async () => {
    try {
      if (Platform.OS !== "web") {
        await SecureStore.deleteItemAsync(DRAFT_STORAGE_KEY);
      }
      setTitle("");
      setReferenceNo("");
      setBody("");
      setIsJustified(false);
      setIssuerName("");
      setIssuerDesignation("");
      setCopyTo([]);
      setHasRestoredDraft(false);
      setDraftSavedTime(null);
      Toast.show({
        type: "info",
        text1: "Draft Cleared",
        text2: "All draft content has been reset.",
      });
    } catch {
      // ignore
    }
  }, []);

  // CC Handlers
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

  // Step 1 Validation & Transition to Preview Step
  const handleProceedToPreview = () => {
    Keyboard.dismiss();
    const trimmedTitle = title.trim();
    const trimmedReferenceNo = referenceNo.trim();
    const trimmedBody = body.trim();
    const plainBody = trimmedBody.replace(/<[^>]+>/g, "").trim();
    const trimmedIssuerName = issuerName.trim();
    const trimmedIssuerDesignation = issuerDesignation.trim();

    if (!trimmedTitle) {
      Toast.show({
        type: "error",
        text1: "Title Required",
        text2: "Please enter a subject or title for the official notice.",
      });
      return;
    }

    if (!trimmedReferenceNo) {
      Toast.show({
        type: "error",
        text1: "Reference Number Required",
        text2: "Please enter the reference / memo number (e.g. SMUCT/REG/GEN/2026/042).",
      });
      return;
    }

    if (!trimmedBody || !plainBody) {
      Toast.show({
        type: "error",
        text1: "Body Text Required",
        text2: "Please enter the main official announcement body text.",
      });
      return;
    }

    if (!trimmedIssuerName) {
      Toast.show({
        type: "error",
        text1: "Issuer Name Required",
        text2: "Please enter the signatory authority issuer name.",
      });
      return;
    }

    if (!trimmedIssuerDesignation) {
      Toast.show({
        type: "error",
        text1: "Designation Required",
        text2: "Please enter the signatory designation (e.g. Registrar).",
      });
      return;
    }

    // Auto-save draft when proceeding to preview
    if (!isEditing && Platform.OS !== "web") {
      SecureStore.setItemAsync(
        DRAFT_STORAGE_KEY,
        JSON.stringify({
          title,
          referenceNo,
          body,
          isJustified,
          issuerName,
          issuerDesignation,
          copyTo,
          savedAt: new Date().toISOString(),
        }),
      ).catch(() => {});
    }

    setStep("preview");
  };

  // Step 2 Final Submission: Publish Notice
  const handlePublish = async () => {
    const trimmedTitle = title.trim();
    const trimmedReferenceNo = referenceNo.trim();
    const finalBody = body.trim();
    const plainBody = finalBody.replace(/<[^>]+>/g, "").trim();
    const trimmedIssuerName = issuerName.trim();
    const trimmedIssuerDesignation = issuerDesignation.trim();

    if (!trimmedTitle) {
      Toast.show({
        type: "error",
        text1: "Title Required",
        text2: "Please enter a subject or title for the official notice.",
      });
      return;
    }

    if (!trimmedReferenceNo) {
      Toast.show({
        type: "error",
        text1: "Reference Number Required",
        text2: "Please enter the official reference / memo number.",
      });
      return;
    }

    if (!finalBody || !plainBody) {
      Toast.show({
        type: "error",
        text1: "Body Text Required",
        text2: "Please enter the main official announcement body text.",
      });
      return;
    }

    if (!trimmedIssuerName) {
      Toast.show({
        type: "error",
        text1: "Issuer Name Required",
        text2: "Please enter the signatory authority issuer name.",
      });
      return;
    }

    if (!trimmedIssuerDesignation) {
      Toast.show({
        type: "error",
        text1: "Designation Required",
        text2: "Please enter the signatory designation.",
      });
      return;
    }

    try {
      if (isEditing && noticeToEdit) {
        await updateNoticeMutation.mutateAsync({
          id: noticeToEdit.id,
          data: {
            title: trimmedTitle,
            referenceNo: trimmedReferenceNo,
            body: finalBody,
            issuerName: trimmedIssuerName,
            issuerDesignation: trimmedIssuerDesignation,
            copyTo,
          },
        });
      } else {
        await createNoticeMutation.mutateAsync({
          title: trimmedTitle,
          referenceNo: trimmedReferenceNo,
          body: finalBody,
          issuerName: trimmedIssuerName,
          issuerDesignation: trimmedIssuerDesignation,
          copyTo,
        });

        // Clear local draft upon successful publication
        if (Platform.OS !== "web") {
          await SecureStore.deleteItemAsync(DRAFT_STORAGE_KEY).catch(() => {});
        }
      }

      onClose();

      setTimeout(() => {
        Toast.show({
          type: "success",
          text1: isEditing ? "Notice Updated" : "Notice Published",
          text2: isEditing
            ? "Official notice changes have been saved successfully."
            : "Official announcement published to the campus noticeboard.",
          visibilityTime: 4000,
        });
      }, 350);
    } catch {
      Toast.show({
        type: "error",
        text1: isEditing ? "Update Failed" : "Publish Failed",
        text2: "An error occurred while saving the notice. Please try again.",
      });
    }
  };

  // Category theme resolution for preview view
  const previewCategory = detectNoticeCategory({
    id: "preview",
    title,
    referenceNo,
    body,
    issuerName,
    issuerDesignation,
    copyTo,
    createdAt: new Date().toISOString(),
  });
  const previewTheme = resolveNoticeVisualTheme(previewCategory);
  const formattedToday = formatDate(new Date().toISOString());

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent={true}
      onRequestClose={step === "preview" ? () => setStep("compose") : onClose}
    >
      <SafeAreaView
        style={styles.fullScreenContainer}
        edges={["top", "bottom"]}
      >
        {/* ── Top Header Navigation Bar ── */}
        <View style={styles.topHeader}>
          {step === "preview" ? (
            <TouchableOpacity
              onPress={() => setStep("compose")}
              style={styles.circleBtn}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Back to compose draft"
              activeOpacity={0.7}
            >
              <Feather
                name="arrow-left"
                size={19}
                color={NOTICE_COLORS.deepNavy}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => {
                Keyboard.dismiss();
                onClose();
              }}
              style={styles.circleBtn}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close notice modal"
              activeOpacity={0.7}
            >
              <Feather name="x" size={19} color={NOTICE_COLORS.deepNavy} />
            </TouchableOpacity>
          )}

          <View style={styles.headerTitleGroup}>
            <Text style={styles.headerTitle}>
              {step === "preview"
                ? "Official Notice Preview"
                : isEditing
                  ? "Edit Official Notice"
                  : "Draft Official Notice"}
            </Text>
            <View
              style={[
                styles.stepBadge,
                step === "preview" ? styles.previewBadge : styles.draftBadge,
              ]}
            >
              <Text
                style={[
                  styles.stepBadgeText,
                  step === "preview"
                    ? styles.previewBadgeText
                    : styles.draftBadgeText,
                ]}
              >
                {step === "preview"
                  ? "STUDENT & TEACHER VIEW"
                  : isEditing
                    ? "EDITING DRAFT"
                    : "DRAFT COMPOSITION"}
              </Text>
            </View>
          </View>

          {/* Right step pill indicator */}
          <View style={styles.stepPill}>
            <Text style={styles.stepPillText}>
              {step === "compose" ? "1 / 2" : "2 / 2"}
            </Text>
          </View>
        </View>

        {/* ══════════════════════════════════════════════════════ */}
        {/* STEP 1: COMPOSE DRAFT FORM                           */}
        {/* ══════════════════════════════════════════════════════ */}
        {step === "compose" ? (
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{ flex: 1 }}
          >
            <ScrollView
              ref={scrollViewRef}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Draft Status Banner (if restored) */}
              {hasRestoredDraft && (
                <View style={styles.draftStatusBanner}>
                  <View style={styles.draftBannerLeft}>
                    <Feather name="file-text" size={15} color="#b45309" />
                    <Text style={styles.draftBannerText}>
                      Draft restored
                      {draftSavedTime ? ` (${draftSavedTime})` : ""}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={handleDiscardDraft}
                    style={styles.discardDraftBtn}
                    activeOpacity={0.7}
                  >
                    <Feather name="trash-2" size={13} color="#dc2626" />
                    <Text style={styles.discardDraftText}>Discard</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* 1. Document Metadata Section */}
              <View style={styles.sectionHeader}>
                <Feather
                  name="file-text"
                  size={14}
                  color={NOTICE_COLORS.deepNavy}
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.sectionTitle}>DOCUMENT METADATA</Text>
              </View>

              {/* Notice Title */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>
                  Notice Title <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Vacation for Eid-Ul-Adha 2026"
                  placeholderTextColor={NOTICE_COLORS.subtleText}
                  value={title}
                  onChangeText={setTitle}
                  accessible={true}
                  accessibilityLabel="Notice Title"
                />
              </View>

              {/* Reference / Memo */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>
                  Reference / Memo Number <Text style={styles.required}>*</Text>
                </Text>
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

              {/* 2. Main Announcement Body (ONLY location with rich text format tools) */}
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
                <View style={styles.labelRow}>
                  <Text style={styles.label}>
                    Official Text <Text style={styles.required}>*</Text>
                  </Text>
                </View>

                {/* ── Genuine WYSIWYG In-Field Rich Text Editor ── */}
                <OfficialWysiwygEditor
                  initialValue={body}
                  onChange={setBody}
                  minHeight={250}
                  placeholder="Enter the official announcement body text... Select any text to apply Bold, Italic, Underline, Bullet Lists, and Justify alignment."
                />
              </View>

              {/* 3. Signatory Details Section (Standard inputs without toolbar) */}
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
                    placeholder="e.g. Dr. Par Mosiur"
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

              {/* 4. Copy To (CC Recipients) Section */}
              <View style={styles.sectionHeader}>
                <Feather
                  name="users"
                  size={14}
                  color={NOTICE_COLORS.deepNavy}
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.sectionTitle}>COPY TO (CC RECIPIENTS)</Text>
                {copyTo.length > 0 && (
                  <View style={styles.ccCountBadge}>
                    <Text style={styles.ccCountText}>{copyTo.length}</Text>
                  </View>
                )}
              </View>

              <View style={styles.ccInputRow}>
                <TextInput
                  style={[styles.input, styles.ccInput]}
                  placeholder="e.g. Deans of all Faculties"
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
                <View style={styles.ccListContainer}>
                  {copyTo.map((recipient, idx) => (
                    <View key={idx} style={styles.ccItemRow}>
                      <View style={styles.ccIndexBadge}>
                        <Text style={styles.ccIndexText}>{idx + 1}</Text>
                      </View>
                      <Text style={styles.ccItemText}>{recipient}</Text>
                      <TouchableOpacity
                        onPress={() => handleRemoveCc(idx)}
                        style={styles.ccDeleteBtn}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        activeOpacity={0.7}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel={`Remove recipient ${idx + 1}`}
                      >
                        <Feather name="x" size={14} color="#dc2626" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>

            {/* ── Clean Action Footer (Matched Borders & Heights) ── */}
            <View
              style={[
                styles.footerContainer,
                { paddingBottom: Math.max(insets.bottom, 14) },
              ]}
            >
              <View style={styles.footerButtonsRow}>
                <TouchableOpacity
                  style={styles.saveDraftBtn}
                  onPress={handleSaveDraft}
                  activeOpacity={0.8}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Save Notice as Draft"
                >
                  <Feather
                    name="bookmark"
                    size={16}
                    color={NOTICE_COLORS.deepNavy}
                    style={{ marginRight: 7 }}
                  />
                  <Text style={styles.saveDraftBtnText}>Save Draft</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.proceedBtn}
                  onPress={handleProceedToPreview}
                  activeOpacity={0.85}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Review notice as students and teachers see it"
                >
                  <Text style={styles.proceedBtnText}>Review & Preview</Text>
                  <Feather
                    name="arrow-right"
                    size={16}
                    color="#ffffff"
                    style={{ marginLeft: 7 }}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        ) : (
          /* ══════════════════════════════════════════════════════ */
          /* STEP 2: ACTUAL STUDENT & TEACHER VIEW PREVIEW        */
          /* ══════════════════════════════════════════════════════ */
          <View style={{ flex: 1 }}>
            {/* Informative Preview Banner */}
            <View style={styles.previewModeBanner}>
              <Feather
                name="eye"
                size={16}
                color="#0369a1"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.previewModeBannerText}>
                Previewing actual view for students and teachers
              </Text>
            </View>

            <ScrollView
              contentContainerStyle={styles.previewScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Top Meta Strip: Category + Issue Date */}
              <View style={styles.previewMetaStrip}>
                <View
                  style={[
                    styles.previewCategoryBadge,
                    {
                      backgroundColor: previewTheme.badgeBg,
                      borderColor: previewTheme.badgeBorder,
                    },
                  ]}
                >
                  <Feather
                    name={previewTheme.icon}
                    size={11}
                    color={previewTheme.badgeText}
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    style={[
                      styles.previewCategoryText,
                      { color: previewTheme.badgeText },
                    ]}
                  >
                    {previewTheme.label.toUpperCase()}
                  </Text>
                </View>

                <View style={styles.previewDateGroup}>
                  <Feather
                    name="calendar"
                    size={12}
                    color={NOTICE_COLORS.subtleText}
                    style={{ marginRight: 5 }}
                  />
                  <Text style={styles.previewDateText}>
                    Date: {formattedToday}
                  </Text>
                </View>
              </View>

              {/* Institutional Letterhead */}
              <OfficialIdentityBlock />

              {/* Notice Title */}
              <Text style={styles.previewTitle}>{title}</Text>

              {/* Reference / Memo */}
              {referenceNo.trim() ? (
                <View style={styles.previewRefBox}>
                  <Text style={styles.previewRefText}>
                    Memo / Ref: {referenceNo.trim()}
                  </Text>
                </View>
              ) : null}

              {/* Official Notice Body with Rich Formatting */}
              <View style={styles.previewBodyWrapper}>
                <RichNoticeText content={body} defaultJustified={false} />
              </View>

              {/* Signatory Authority Card */}
              <View style={styles.signatoryCard}>
                <View style={styles.signatoryAvatar}>
                  <Feather
                    name="user"
                    size={16}
                    color={NOTICE_COLORS.deepNavy}
                  />
                </View>
                <View style={styles.signatoryTextCol}>
                  <Text style={styles.signatoryName}>{issuerName}</Text>
                  <Text style={styles.signatoryDesignation}>
                    {issuerDesignation}
                  </Text>
                </View>
              </View>

              {/* Copy-To (CC) Forwarding Section */}
              {copyTo.length > 0 && (
                <View style={styles.ccBox}>
                  <Text style={styles.ccHeader}>
                    Copy forwarded for information to:
                  </Text>
                  {copyTo.map((recipient, i) => (
                    <View key={i} style={styles.ccRow}>
                      <Text style={styles.ccBullet}>{i + 1}.</Text>
                      <Text style={styles.ccText}>{recipient}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Campus Watermark */}
              <View style={styles.watermarkWrap} pointerEvents="none">
                <CampusWatermarkSvg width="100%" height={80} />
              </View>
            </ScrollView>

            {/* ── Preview Action Footer (Matched Borders & Heights) ── */}
            <View
              style={[
                styles.footerContainer,
                { paddingBottom: Math.max(insets.bottom, 14) },
              ]}
            >
              <View style={styles.footerButtonsRow}>
                <TouchableOpacity
                  style={styles.saveDraftBtn}
                  onPress={() => setStep("compose")}
                  disabled={isPending}
                  activeOpacity={0.8}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Back to edit draft"
                >
                  <Feather
                    name="edit-3"
                    size={16}
                    color={NOTICE_COLORS.deepNavy}
                    style={{ marginRight: 7 }}
                  />
                  <Text style={styles.saveDraftBtnText}>Back to Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.proceedBtn,
                    isPending && styles.submitButtonDisabled,
                  ]}
                  onPress={handlePublish}
                  disabled={isPending}
                  activeOpacity={0.85}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={
                    isEditing
                      ? "Save Notice Changes"
                      : "Publish Official Notice"
                  }
                >
                  {isPending ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <>
                      <Feather
                        name={isEditing ? "check-circle" : "send"}
                        size={16}
                        color="#ffffff"
                        style={{ marginRight: 7 }}
                      />
                      <Text style={styles.proceedBtnText}>
                        {isEditing ? "Save Changes" : "Publish Official Notice"}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </SafeAreaView>
      <Toast config={toastConfig} topOffset={Math.max(insets.top + 8, 44)} />
    </Modal>
  );
});

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: NOTICE_COLORS.background,
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: NOTICE_COLORS.divider,
    backgroundColor: NOTICE_COLORS.background,
  },
  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: NOTICE_COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    ...NOTICE_COLORS.shadow,
  },
  headerTitleGroup: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 12,
  },
  headerTitle: {
    fontFamily,
    fontSize: 16.5,
    fontWeight: "800",
    color: NOTICE_COLORS.deepNavy,
    letterSpacing: -0.3,
  },
  stepBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 3,
  },
  draftBadge: {
    backgroundColor: "#fef3c7",
    borderWidth: 1,
    borderColor: "rgba(217, 119, 6, 0.25)",
  },
  previewBadge: {
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "rgba(37, 99, 235, 0.25)",
  },
  stepBadgeText: {
    fontFamily,
    fontSize: 9.5,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  draftBadgeText: {
    color: "#b45309",
  },
  previewBadgeText: {
    color: "#2563eb",
  },
  stepPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "rgba(19, 27, 46, 0.06)",
  },
  stepPillText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: NOTICE_COLORS.deepNavy,
  },

  // Draft Banner
  draftStatusBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fde68a",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 16,
  },
  draftBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  draftBannerText: {
    fontFamily,
    fontSize: 12.5,
    fontWeight: "600",
    color: "#b45309",
    marginLeft: 8,
  },
  discardDraftBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "#fee2e2",
  },
  discardDraftText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: "#dc2626",
    marginLeft: 4,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "800",
    color: NOTICE_COLORS.deepNavy,
    letterSpacing: 0.8,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  label: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: NOTICE_COLORS.deepNavy,
    marginBottom: 6,
  },
  required: {
    color: "#ef4444",
  },
  formatHint: {
    fontFamily,
    fontSize: 11,
    color: NOTICE_COLORS.subtleText,
    fontWeight: "600",
  },
  input: {
    fontFamily,
    fontSize: 14,
    color: NOTICE_COLORS.deepNavy,
    backgroundColor: NOTICE_COLORS.white,
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  fieldRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  fieldHalf: {
    flex: 1,
  },
  ccCountBadge: {
    marginLeft: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: "rgba(19, 27, 46, 0.08)",
  },
  ccCountText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: NOTICE_COLORS.deepNavy,
  },
  ccInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  ccInput: {
    flex: 1,
    height: 48,
  },
  addCcBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: NOTICE_COLORS.deepNavy,
    alignItems: "center",
    justifyContent: "center",
  },
  ccListContainer: {
    gap: 8,
    marginBottom: 8,
  },
  ccItemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 10,
  },
  ccIndexBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "rgba(37, 99, 235, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  ccIndexText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: "#2563eb",
  },
  ccItemText: {
    flex: 1,
    fontFamily,
    fontSize: 13,
    fontWeight: "600",
    color: NOTICE_COLORS.deepNavy,
    lineHeight: 19,
  },
  ccDeleteBtn: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: "#fee2e2",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 0,
  },

  // ── Footer Container & Matched Action Buttons ──
  footerContainer: {
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  footerButtonsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  saveDraftBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
  },
  saveDraftBtnText: {
    fontFamily,
    fontSize: 14.5,
    fontWeight: "700",
    color: NOTICE_COLORS.deepNavy,
  },
  proceedBtn: {
    flex: 1.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    borderRadius: 14,
    backgroundColor: NOTICE_COLORS.deepNavy,
    borderWidth: 1.5,
    borderColor: NOTICE_COLORS.deepNavy,
    shadowColor: NOTICE_COLORS.deepNavy,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  proceedBtnText: {
    fontFamily,
    fontSize: 14.5,
    fontWeight: "700",
    color: "#ffffff",
  },

  // ── Preview Screen Styles ──
  previewModeBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e0f2fe",
    borderBottomWidth: 1,
    borderBottomColor: "#bae6fd",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  previewModeBannerText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: "#0369a1",
  },
  previewScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  previewMetaStrip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  previewCategoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 8,
    borderWidth: 1,
  },
  previewCategoryText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  previewDateGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  previewDateText: {
    fontFamily,
    fontSize: 12.5,
    fontWeight: "600",
    color: NOTICE_COLORS.subtleText,
  },
  previewTitle: {
    fontFamily,
    fontSize: 20,
    fontWeight: "800",
    color: NOTICE_COLORS.deepNavy,
    lineHeight: 28,
    letterSpacing: -0.4,
    marginBottom: 12,
  },
  previewRefBox: {
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 12,
    marginBottom: 18,
    borderLeftWidth: 3,
    borderLeftColor: NOTICE_COLORS.deepNavy,
  },
  previewRefText: {
    fontFamily,
    fontSize: 12.5,
    fontWeight: "600",
    color: NOTICE_COLORS.subtleText,
  },
  previewBodyWrapper: {
    marginBottom: 20,
  },
  signatoryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: NOTICE_COLORS.white,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: NOTICE_COLORS.mutedBorder,
    marginBottom: 18,
    ...NOTICE_COLORS.shadow,
  },
  signatoryAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  signatoryTextCol: {
    flex: 1,
  },
  signatoryName: {
    fontFamily,
    fontSize: 14.5,
    fontWeight: "800",
    color: NOTICE_COLORS.deepNavy,
  },
  signatoryDesignation: {
    fontFamily,
    fontSize: 12,
    color: NOTICE_COLORS.subtleText,
    marginTop: 2,
  },
  ccBox: {
    backgroundColor: "#f8fafc",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: NOTICE_COLORS.mutedBorder,
    marginBottom: 18,
  },
  ccHeader: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: NOTICE_COLORS.deepNavy,
    marginBottom: 8,
  },
  ccRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  ccBullet: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: NOTICE_COLORS.subtleText,
    width: 20,
  },
  ccText: {
    flex: 1,
    fontFamily,
    fontSize: 12,
    color: NOTICE_COLORS.bodyText,
    lineHeight: 18,
  },
  watermarkWrap: {
    alignItems: "center",
    marginVertical: 12,
    opacity: 0.6,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
});
