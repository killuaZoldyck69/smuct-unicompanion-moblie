import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

import {
  AssessmentData,
  AssessmentTypeConfig,
  AssessmentSubmission,
} from "../types";
import { formatDueDate, formatFileSize, openSafeUrl } from "../utils";
import { formatDateTime12h } from "@/utils/date-formatter";
import { styles } from "./styles";

interface StudentHeroSummaryProps {
  assessment: AssessmentData;
  typeConfig: AssessmentTypeConfig;
  mySub?: AssessmentSubmission | null;
}

export const StudentHeroSummary: React.FC<StudentHeroSummaryProps> = React.memo(
  ({ assessment, typeConfig, mySub }) => {
    const isHand =
      assessment.submissionType === "HAND" ||
      assessment.submissionType === "OFFLINE";

    const hasAttachments =
      Array.isArray(assessment.attachments) && assessment.attachments.length > 0;
    const hasLinks = Array.isArray(assessment.links) && assessment.links.length > 0;
    const hasResources = hasAttachments || hasLinks;

    const isGraded = mySub?.marks !== null && mySub?.marks !== undefined;
    const hasFeedback = Boolean(mySub?.feedback && mySub.feedback.trim().length > 0);

    const isEdited = Boolean(
      assessment.updatedAt &&
        assessment.createdAt &&
        new Date(assessment.updatedAt).getTime() -
          new Date(assessment.createdAt).getTime() >
          2000,
    );
    const publishedDate = assessment.createdAt || assessment.startDate;

    return (
      <View style={styles.topHeroCard}>
        {/* Top Badges Row */}
        <View style={styles.heroTopRow}>
          <View
            style={[
              styles.typeIconBox,
              {
                backgroundColor: typeConfig.iconBg,
                borderColor: typeConfig.iconBorder,
              },
            ]}
          >
            {typeConfig.assetIcon ? (
              <Image
                source={typeConfig.assetIcon}
                style={{ width: 24, height: 24 }}
                resizeMode="contain"
              />
            ) : (
              <Feather
                name={typeConfig.icon}
                size={20}
                color={typeConfig.iconColor}
              />
            )}
          </View>

          {/* Right Column: Badges & Published Meta */}
          <View style={styles.heroTopContent}>
            <View style={styles.badgesCluster}>
              <View
                style={[
                  styles.typeBadgePill,
                  { backgroundColor: typeConfig.badgeBg },
                ]}
              >
                <Text style={[styles.typeBadgeText, { color: typeConfig.badgeText }]}>
                  {typeConfig.label}
                </Text>
              </View>

              {/* Submission Method Tag */}
              <View
                style={[
                  styles.methodBadgePill,
                  isHand ? styles.methodBadgePillHand : styles.methodBadgePillOnline,
                ]}
              >
                <Feather
                  name={isHand ? "clipboard" : "globe"}
                  size={12}
                  color={isHand ? "#b45309" : "#0284c7"}
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={[
                    styles.methodBadgeText,
                    { color: isHand ? "#b45309" : "#0284c7" },
                  ]}
                >
                  {isHand ? "In-Hand" : "Online"}
                </Text>
              </View>

              {/* Late Submission Policy Tag */}
              <View
                style={[
                  styles.policyBadgePillSmall,
                  assessment.allowLateSubmission
                    ? styles.policyBadgePillLateSmall
                    : styles.policyBadgePillStrictSmall,
                ]}
              >
                <Feather
                  name={assessment.allowLateSubmission ? "clock" : "lock"}
                  size={10}
                  color={assessment.allowLateSubmission ? "#0d9488" : "#64748b"}
                  style={{ marginRight: 3 }}
                />
                <Text
                  style={[
                    styles.policyBadgeTextSmall,
                    { color: assessment.allowLateSubmission ? "#0d9488" : "#64748b" },
                  ]}
                >
                  {assessment.allowLateSubmission ? "Late OK" : "Strict"}
                </Text>
              </View>
            </View>

            {/* Coursework Published Date & Edited Status (Exact under the tags, not under the icon) */}
            {publishedDate ? (
              <View style={styles.publishedDateRow}>
                <Feather
                  name="clock"
                  size={11}
                  color="#64748b"
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.publishedDateText}>
                  Published {formatDateTime12h(publishedDate)}
                  {isEdited && (
                    <Text style={styles.editedLabelText}> (Edited)</Text>
                  )}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Title */}
        <Text style={styles.heroTitleText}>{assessment.title}</Text>

        {/* Meta Row: Marks and Due Date */}
        <View style={styles.heroMetaRow}>
          <Text style={styles.metaLabelText}>Max Marks: </Text>
          <Text style={styles.metaValueText}>{assessment.totalMarks}</Text>
          <Text style={styles.metaDivider}>{"   |   "}</Text>
          <Text style={styles.metaLabelText}>Due: </Text>
          <Text style={styles.metaValueText}>
            {formatDueDate(assessment.deadline)}
          </Text>
        </View>

        {/* 1. Grade & Teacher Feedback Section */}
        {(isGraded || hasFeedback) && (
          <View style={styles.gradeFeedbackBox}>
            {isGraded && (
              <View style={styles.gradeHeaderRow}>
                <View style={styles.gradeIconCircle}>
                  <Feather name="award" size={16} color="#7c3aed" />
                </View>
                <View style={styles.gradeScoreCol}>
                  <Text style={styles.gradeScoreLabel}>GRADE & MARKS</Text>
                  <Text style={styles.gradeScoreValue}>
                    {mySub!.marks}{" "}
                    <Text style={styles.gradeTotalText}>
                      / {assessment.totalMarks} Marks
                    </Text>
                    {mySub?.isLate ? (
                      <Text style={styles.gradeLateText}> • Submitted Late</Text>
                    ) : null}
                  </Text>
                </View>
              </View>
            )}

            {hasFeedback && (
              <View
                style={[
                  styles.feedbackContainer,
                  isGraded && { marginTop: 10 },
                ]}
              >
                <View style={styles.feedbackHeader}>
                  <Feather
                    name="message-square"
                    size={12}
                    color="#7c3aed"
                    style={{ marginRight: 5 }}
                  />
                  <Text style={styles.feedbackLabel}>Teacher's Feedback</Text>
                </View>
                <Text style={styles.feedbackBody}>{mySub!.feedback}</Text>
              </View>
            )}
          </View>
        )}

        {/* 2. Instructions Section */}
        {assessment.description ? (
          <View style={styles.instructionsContainer}>
            <View style={styles.instructionsHeader}>
              <Feather
                name="file-text"
                size={12}
                color="#475569"
                style={{ marginRight: 5 }}
              />
              <Text style={styles.instructionsHeading}>Instructions</Text>
            </View>
            <Text style={styles.instructionsBody}>{assessment.description}</Text>
          </View>
        ) : null}

        {/* 3. Resources & Attachments Section */}
        {hasResources && (
          <View style={styles.resourcesBox}>
            <View style={styles.resourcesHeadingRow}>
              <Feather
                name="paperclip"
                size={12}
                color="#475569"
                style={{ marginRight: 5 }}
              />
              <Text style={styles.resourcesHeadingText}>
                Resources & References
              </Text>
            </View>

            {/* Attached Files */}
            {hasAttachments &&
              assessment.attachments!.map((att, idx) => (
                <TouchableOpacity
                  key={`att-${idx}`}
                  style={styles.resourceItemPill}
                  activeOpacity={0.7}
                  onPress={() => openSafeUrl(att.url)}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Download ${att.name}`}
                >
                  <View style={styles.resourceItemIcon}>
                    <Feather name="file-text" size={15} color="#2563eb" />
                  </View>
                  <View style={styles.resourceItemDetails}>
                    <Text style={styles.resourceItemName} numberOfLines={1}>
                      {att.name || `Attachment ${idx + 1}`}
                    </Text>
                    {att.size ? (
                      <Text style={styles.resourceItemMeta}>
                        {formatFileSize(att.size)}
                      </Text>
                    ) : null}
                  </View>
                  <Feather name="download" size={14} color="#64748b" />
                </TouchableOpacity>
              ))}

            {/* Links */}
            {hasLinks &&
              assessment.links!.map((lnk, idx) => (
                <TouchableOpacity
                  key={`lnk-${idx}`}
                  style={styles.resourceItemPill}
                  activeOpacity={0.7}
                  onPress={() => openSafeUrl(lnk.url)}
                  accessible={true}
                  accessibilityRole="link"
                  accessibilityLabel={`Open link ${lnk.title || lnk.url}`}
                >
                  <View style={styles.resourceItemIcon}>
                    <Feather name="link-2" size={15} color="#2563eb" />
                  </View>
                  <View style={styles.resourceItemDetails}>
                    <Text style={styles.resourceItemName} numberOfLines={1}>
                      {lnk.title || lnk.url}
                    </Text>
                    <Text style={styles.resourceItemMeta} numberOfLines={1}>
                      {lnk.url}
                    </Text>
                  </View>
                  <Feather name="external-link" size={14} color="#64748b" />
                </TouchableOpacity>
              ))}
          </View>
        )}
      </View>
    );
  }
);
