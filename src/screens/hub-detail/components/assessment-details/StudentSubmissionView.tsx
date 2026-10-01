import React from "react";
import { View, ScrollView } from "react-native";

import {
  AssessmentData,
  AssessmentTypeConfig,
  AssessmentSubmission,
  AssessmentAttachment,
} from "./types";
import { AssessmentResourcesSection } from "./AssessmentResourcesSection";
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
    const {
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

    return (
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollBody}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* 1. TOP SUMMARY CARD */}
          <StudentHeroSummary
            assessment={assessment}
            typeConfig={typeConfig}
          />

          {/* 2. COURSEWORK RESOURCES & ATTACHMENTS (FROM TEACHER) */}
          {hasResources && (
            <View style={styles.resourcesWrapper}>
              <AssessmentResourcesSection
                attachments={assessment.attachments}
                links={assessment.links}
              />
            </View>
          )}

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
              <SubmissionMethodRadio
                method={submissionMethod}
                disabled={isClosed}
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
          onSubmit={handleFormSubmit}
        />
      </View>
    );
  }
);

export default StudentSubmissionView;
