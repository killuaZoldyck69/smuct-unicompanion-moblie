import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  CourseworkFormData,
  AttachmentItem,
  LinkItem,
  AssessmentType,
  SubmissionType,
  BENTO,
  getInitialDeadline,
  CourseworkHeader,
  CourseworkHeroBanner,
  CourseworkTitleInput,
  CourseworkTypeSelector,
  CourseworkSubmissionMethod,
  CourseworkMarksInput,
  CourseworkDeadlineSection,
  CourseworkAttachmentsSection,
  CourseworkInstructionsInput,
  CourseworkSubmitBar,
} from "./create-coursework";

interface Props {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (payload: any) => void;
  isPending: boolean;
  assessment: any | null;
}

export default function EditCourseworkModal({
  isVisible,
  onClose,
  onSubmit,
  isPending,
  assessment,
}: Props) {
  const insets = useSafeAreaInsets();

  const [form, setForm] = useState<CourseworkFormData>({
    title: "",
    description: "",
    type: "ASSIGNMENT",
    submissionType: "ONLINE",
    totalMarks: "100",
  });

  const [deadline, setDeadline] = useState<Date>(getInitialDeadline);
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Synchronize form when assessment changes
  useEffect(() => {
    if (assessment && isVisible) {
      setForm({
        title: assessment.title || "",
        description: assessment.description || "",
        type: (assessment.type || "ASSIGNMENT").toUpperCase() as AssessmentType,
        submissionType: (
          assessment.submissionType || "ONLINE"
        ).toUpperCase() as SubmissionType,
        totalMarks:
          assessment.totalMarks != null ? String(assessment.totalMarks) : "100",
      });

      if (assessment.deadline) {
        setDeadline(new Date(assessment.deadline));
      } else {
        setDeadline(getInitialDeadline());
      }

      setAttachments(
        Array.isArray(assessment.attachments) ? [...assessment.attachments] : []
      );
      setLinks(
        Array.isArray(assessment.links) ? [...assessment.links] : []
      );
    }
  }, [assessment, isVisible]);

  const handleClose = useCallback(() => {
    if (isPending || isUploading) return;
    onClose();
  }, [isPending, isUploading, onClose]);

  const handleSubmit = useCallback(() => {
    if (!form.title.trim() || !form.totalMarks.trim() || isPending || isUploading) {
      return;
    }

    onSubmit({
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      type: form.type,
      submissionType: form.submissionType,
      totalMarks: parseFloat(form.totalMarks) || 100,
      deadline: deadline.toISOString(),
      attachments: attachments.length > 0 ? attachments : undefined,
      links: links.length > 0 ? links : undefined,
    });
  }, [form, deadline, attachments, links, isPending, isUploading, onSubmit]);

  const handleAddAttachments = useCallback((newItems: AttachmentItem[]) => {
    setAttachments((prev) => [...prev, ...newItems]);
  }, []);

  const handleRemoveAttachment = useCallback((idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const handleAddLink = useCallback((link: LinkItem) => {
    setLinks((prev) => [...prev, link]);
  }, []);

  const handleRemoveLink = useCallback((idx: number) => {
    setLinks((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const isFormValid =
    form.title.trim().length > 0 &&
    form.totalMarks.trim().length > 0 &&
    !isUploading;

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
          },
        ]}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardContainer}
        >
          {/* Bento Header */}
          <CourseworkHeader
            title="Edit Coursework"
            onClose={handleClose}
            isPending={isPending}
            isUploading={isUploading}
          />

          {/* Form Scroll Body */}
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <CourseworkHeroBanner
              title="Modify Assessment"
              subtitle="Update coursework criteria, deadlines, and attached materials"
            />

            <CourseworkTitleInput
              value={form.title}
              onChangeText={(t) => setForm((prev) => ({ ...prev, title: t }))}
            />

            <CourseworkTypeSelector
              selectedType={form.type}
              onSelectType={(t) => setForm((prev) => ({ ...prev, type: t }))}
            />

            <CourseworkSubmissionMethod
              selectedMethod={form.submissionType}
              onSelectMethod={(m) => setForm((prev) => ({ ...prev, submissionType: m }))}
            />

            <CourseworkMarksInput
              value={form.totalMarks}
              onChangeText={(m) => setForm((prev) => ({ ...prev, totalMarks: m }))}
            />

            <CourseworkDeadlineSection
              deadline={deadline}
              onChangeDeadline={setDeadline}
            />

            <CourseworkAttachmentsSection
              attachments={attachments}
              onAddAttachments={handleAddAttachments}
              onRemoveAttachment={handleRemoveAttachment}
              links={links}
              onAddLink={handleAddLink}
              onRemoveLink={handleRemoveLink}
              isUploading={isUploading}
              setIsUploading={setIsUploading}
            />

            <CourseworkInstructionsInput
              value={form.description}
              onChangeText={(d) => setForm((prev) => ({ ...prev, description: d }))}
            />
          </ScrollView>

          {/* Sticky Docked Bottom Action Bar */}
          <CourseworkSubmitBar
            onSubmit={handleSubmit}
            isFormValid={isFormValid}
            isPending={isPending}
            isUploading={isUploading}
            bottomInset={insets.bottom}
            label="Save Changes"
          />
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BENTO.canvas,
  },
  keyboardContainer: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 30,
  },
});
