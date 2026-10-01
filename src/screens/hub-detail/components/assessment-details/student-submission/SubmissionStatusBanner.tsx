import React from "react";
import { View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";

import { AssessmentData, AssessmentSubmission } from "../types";
import { formatDueDate } from "../utils";
import { styles } from "./styles";

interface SubmissionStatusBannerProps {
  assessment: AssessmentData;
  mySub?: AssessmentSubmission;
  isClosed: boolean;
  isLateActive: boolean;
}

export const SubmissionStatusBanner: React.FC<SubmissionStatusBannerProps> = React.memo(
  ({ assessment, mySub, isClosed, isLateActive }) => {
    return (
      <>
        {/* PREVIOUS SUBMISSION STATUS (IF ANY) */}
        {mySub && (
          <View style={styles.mySubmissionCard}>
            <View style={styles.subStatusBadge}>
              <Feather
                name={mySub.isLate ? "clock" : "check-circle"}
                size={14}
                color={mySub.isLate ? "#d97706" : "#15803d"}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.subStatusBadgeText,
                  mySub.isLate && { color: "#b45309" },
                ]}
              >
                {mySub.marks !== null && mySub.marks !== undefined
                  ? `Graded: ${mySub.marks} / ${assessment.totalMarks} Marks${mySub.isLate ? " (Late)" : ""}`
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
            {isClosed && (
              <View style={styles.closedSubmissionLockNotice}>
                <Feather name="lock" size={13} color="#b91c1c" style={{ marginRight: 6 }} />
                <Text style={styles.closedSubmissionLockText}>
                  Submissions are closed. Your submitted work is locked.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* LATE SUBMISSION OR CLOSED BANNER */}
        {isClosed ? (
          <View style={styles.closedNoticeBanner}>
            <View style={styles.closedIconBox}>
              <Feather name="lock" size={17} color="#dc2626" />
            </View>
            <View style={styles.bannerTextCol}>
              <Text style={styles.closedBannerTitle}>Submissions Closed</Text>
              <Text style={styles.closedBannerDesc}>
                The submission window for this coursework closed on {formatDueDate(assessment.deadline)}. Late submissions are not accepted.
              </Text>
            </View>
          </View>
        ) : isLateActive ? (
          <View style={styles.lateNoticeBanner}>
            <View style={styles.lateIconBox}>
              <Feather name="clock" size={17} color="#d97706" />
            </View>
            <View style={styles.bannerTextCol}>
              <Text style={styles.lateBannerTitle}>Late Submissions Allowed</Text>
              <Text style={styles.lateBannerDesc}>
                The deadline has passed ({formatDueDate(assessment.deadline)}). Late submissions are accepted, but your submission will be marked as "Late".
              </Text>
            </View>
          </View>
        ) : null}
      </>
    );
  }
);
