import React from "react";
import { View, ScrollView } from "react-native";

import {
  AssessmentData,
  AssessmentTypeConfig,
  AssessmentSubmission,
  AssessmentAttachment,
} from "./types";
import {
  SubmissionLink,
  useStudentSubmissionForm,
  StudentHeroSummary,
  SubmissionStatusBanner,
  SubmissionClosedCard,
  SubmissionMethodRadio,
  SubmissionOnlineContent,
  SubmissionOfflineCard,
  SubmissionBottomBar,
  styles,
} from "./student-submission";

interface StudentSubmissionViewProps {
  assessment: AssessmentData;
  typeConfig: AssessmentTypeConfig;
  mySub?: AssessmentSubmission;
  isSubmitting: boolean;
  isUnsubmitting?: boolean;
  onUnsubmit?: () => void;
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
  ({ assessment, typeConfig, mySub, isSubmitting, isUnsubmitting = false, onSubmit, onUnsubmit }) => {
    const {
      allowOnline,
      allowOffline,
      submissionMethod,
      setSubmissionMethod,
      files,
      links,
      noteContent,
      activeDrawer,
      setActiveDrawer,
      tempLinkUrl,
      setTempLinkUrl,
      tempLinkTitle,
      setTempLinkTitle,
      tempNoteText,
      setTempNoteText,
      isUploadingFiles,
      isOverdue,
      isClosed,
      isLateActive,
      isSubmitDisabled,
      hasResources,
      handlePickFiles,
      handleRemoveFile,
      handleRemoveLink,
      handleRemoveNote,
      handleSaveLink,
      handleSaveNote,
      handleOpenTextDrawer,
      handleFormSubmit,
    } = useStudentSubmissionForm({
      assessment,
      mySub,
      isSubmitting,
      onSubmit,
    });
    const isUnsubmitted = mySub?.status === "UNSUBMITTED";
    const isGraded = mySub?.marks !== null && mySub?.marks !== undefined;
    const canUnsubmit = Boolean(
      mySub &&
      !isUnsubmitted &&
      !isGraded &&
      (!isOverdue || assessment.allowLateSubmission) &&
      assessment.submissionType !== "HAND" &&
      assessment.submissionType !== "OFFLINE" &&
      ["SUBMITTED", "LATE"].includes(mySub.status || ""),
    );

    return (
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollBody}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* 1. TOP UNIFIED SUMMARY CARD (Classwork Detail: Hero, Grade & Feedback, Instructions, Resources) */}
          <StudentHeroSummary
            assessment={assessment}
            typeConfig={typeConfig}
            mySub={mySub}
          />

          {/* 3. PREVIOUS SUBMISSION STATUS & POLICY NOTICES */}
          <SubmissionStatusBanner
            assessment={assessment}
            mySub={mySub}
            isClosed={isClosed}
            isLateActive={isLateActive}
          />

          {/* 4. SUBMISSION METHOD SELECTOR OR CLOSED PLACEHOLDER */}
          {isClosed && !mySub ? (
            <SubmissionClosedCard deadline={assessment.deadline} />
          ) : (
            <>
              <View pointerEvents={mySub && (!isUnsubmitted || isClosed) ? "none" : "auto"}>
              <SubmissionMethodRadio
                method={submissionMethod}
                disabled={isClosed}
                allowOnline={allowOnline}
                allowOffline={allowOffline}
                onSelect={setSubmissionMethod}
              />

              {/* 5. ONLINE UPLOAD/LINKS/TEXT VS OFFLINE IN-CLASS CARD */}
              {submissionMethod === "ONLINE" ? (
                <SubmissionOnlineContent
                  files={files}
                  links={links}
                  noteContent={noteContent}
                  activeDrawer={activeDrawer}
                  tempLinkUrl={tempLinkUrl}
                  tempLinkTitle={tempLinkTitle}
                  tempNoteText={tempNoteText}
                  isUploadingFiles={isUploadingFiles}
                  onPickFiles={handlePickFiles}
                  onOpenDrawer={setActiveDrawer}
                  onOpenTextDrawer={handleOpenTextDrawer}
                  onChangeTempLinkUrl={setTempLinkUrl}
                  onChangeTempLinkTitle={setTempLinkTitle}
                  onChangeTempNoteText={setTempNoteText}
                  onSaveLink={handleSaveLink}
                  onSaveNote={handleSaveNote}
                  onRemoveFile={handleRemoveFile}
                  onRemoveLink={handleRemoveLink}
                  onRemoveNote={handleRemoveNote}
                />
              ) : (
                <SubmissionOfflineCard />
              )}
              </View>
            </>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* 6. FIXED BOTTOM SUBMIT BAR */}
        <SubmissionBottomBar
          isClosed={isClosed}
          isLateActive={isLateActive}
          isSubmitDisabled={isSubmitDisabled}
          isSubmitting={isSubmitting}
          hasPreviousSubmission={Boolean(mySub)}
          canUnsubmit={canUnsubmit}
          isUnsubmitting={isUnsubmitting}
          onSubmit={handleFormSubmit}
          onUnsubmit={onUnsubmit}
        />
      </View>
    );
  }
);

export default StudentSubmissionView;
