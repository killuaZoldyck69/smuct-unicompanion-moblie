import React from "react";
import { View, Text, StyleSheet, Platform, Image, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { AssessmentData, AssessmentTypeConfig } from "./types";
import { formatDueDate, formatFileSize, openSafeUrl } from "./utils";
import { formatDateTime12h } from "@/utils/date-formatter";

const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

interface AssessmentHeroCardProps {
  assessment: AssessmentData;
  typeConfig: AssessmentTypeConfig;
  statusLabel?: string;
  isOverdue?: boolean;
}

export const AssessmentHeroCard: React.FC<AssessmentHeroCardProps> = React.memo(
  ({ assessment, typeConfig }) => {
    const isHand =
      assessment.submissionType === "HAND" ||
      assessment.submissionType === "OFFLINE";

    const hasAttachments =
      Array.isArray(assessment.attachments) && assessment.attachments.length > 0;
    const hasLinks = Array.isArray(assessment.links) && assessment.links.length > 0;
    const hasResources = hasAttachments || hasLinks;

    const isEdited = Boolean(
      assessment.updatedAt &&
        assessment.createdAt &&
        new Date(assessment.updatedAt).getTime() -
          new Date(assessment.createdAt).getTime() >
          2000,
    );
    const publishedDate = assessment.createdAt || assessment.startDate;

    return (
      <View style={styles.cardContainer}>
        {/* Top Icon, Type Pill, and Submission Method Pill */}
        <View style={styles.topRow}>
          <View
            style={[
              styles.typeIconContainer,
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
          <View style={styles.topContentCol}>
            <View style={styles.badgesCluster}>
              <View style={[styles.typeBadgePill, { backgroundColor: typeConfig.badgeBg }]}>
                <Text style={[styles.typeBadgeText, { color: typeConfig.badgeText }]}>
                  {typeConfig.label}
                </Text>
              </View>

              {/* Submission Method Badge */}
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

              {/* Late Submission Policy Badge */}
              <View
                style={[
                  styles.policyBadgePill,
                  assessment.allowLateSubmission
                    ? styles.policyBadgePillLate
                    : styles.policyBadgePillStrict,
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
                    styles.policyBadgeText,
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
        <Text style={styles.titleText}>{assessment.title}</Text>

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

        {/* Instructions Section */}
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

        {/* Resources & References Section */}
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

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.06)",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 20,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 12,
  },
  topContentCol: {
    flex: 1,
    justifyContent: "center",
  },
  badgesCluster: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  publishedDateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  publishedDateText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "500",
    color: "#64748b",
  },
  editedLabelText: {
    fontFamily,
    fontSize: 10.5,
    color: "#94a3b8",
    fontStyle: "italic",
    fontWeight: "500",
  },
  typeIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  typeBadgePill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  typeBadgeText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
  },
  methodBadgePill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  methodBadgePillOnline: {
    backgroundColor: "#f0f9ff",
  },
  methodBadgePillHand: {
    backgroundColor: "#fef3c7",
  },
  methodBadgeText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
  },
  policyBadgePill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 9999,
  },
  policyBadgePillStrict: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  policyBadgePillLate: {
    backgroundColor: "#f0fdfa",
    borderWidth: 1,
    borderColor: "#99f6e4",
  },
  policyBadgeText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "700",
  },
  titleText: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  heroMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  metaLabelText: {
    fontFamily,
    fontSize: 12.5,
    fontWeight: "600",
    color: "#64748b",
  },
  metaValueText: {
    fontFamily,
    fontSize: 12.5,
    fontWeight: "700",
    color: "#0f172a",
  },
  metaDivider: {
    fontFamily,
    fontSize: 12.5,
    fontWeight: "600",
    color: "#cbd5e1",
  },
  instructionsContainer: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.04)",
    marginBottom: 10,
  },
  instructionsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  instructionsHeading: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
  },
  instructionsBody: {
    fontFamily,
    fontSize: 12.5,
    color: "#475569",
    lineHeight: 18,
  },
  resourcesBox: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.04)",
  },
  resourcesHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  resourcesHeadingText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
  },
  resourceItemPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.06)",
    marginBottom: 6,
  },
  resourceItemIcon: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  resourceItemDetails: {
    flex: 1,
  },
  resourceItemName: {
    fontFamily,
    fontSize: 12.5,
    fontWeight: "600",
    color: "#0f172a",
  },
  resourceItemMeta: {
    fontFamily,
    fontSize: 10.5,
    color: "#64748b",
  },
});
