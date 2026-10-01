import React from "react";
import { View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";

import { AssessmentData, AssessmentTypeConfig } from "../types";
import { formatDueDate } from "../utils";
import { styles } from "./styles";

interface StudentHeroSummaryProps {
  assessment: AssessmentData;
  typeConfig: AssessmentTypeConfig;
}

export const StudentHeroSummary: React.FC<StudentHeroSummaryProps> = React.memo(
  ({ assessment, typeConfig }) => {
    const isHand =
      assessment.submissionType === "HAND" ||
      assessment.submissionType === "OFFLINE";

    return (
      <View style={styles.topHeroCard}>
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
            <Feather name={typeConfig.icon} size={20} color={typeConfig.iconColor} />
          </View>

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
        </View>

        <Text style={styles.heroTitleText}>{assessment.title}</Text>

        <View style={styles.heroMetaRow}>
          <Text style={styles.metaLabelText}>Max Marks: </Text>
          <Text style={styles.metaValueText}>{assessment.totalMarks}</Text>
          <Text style={styles.metaDivider}>{"   |   "}</Text>
          <Text style={styles.metaLabelText}>Due: </Text>
          <Text style={styles.metaValueText}>
            {formatDueDate(assessment.deadline)}
          </Text>
        </View>

        {assessment.description ? (
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsHeading}>Instructions:</Text>
            <Text style={styles.instructionsBody}>{assessment.description}</Text>
          </View>
        ) : null}
      </View>
    );
  }
);
