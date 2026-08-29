import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";
import { spacing, rounded, shadows } from "@/theme/layout";
import { useCountdown } from "@/hooks/use-countdown";

interface AssessmentCardProps {
  item: any;
  hubId: string;
  canManage: boolean;
  myUserId?: string;
}

export const AssessmentCard: React.FC<AssessmentCardProps> = ({
  item,
  hubId,
  canManage,
  myUserId,
}) => {
  const router = useRouter();
  const { timeLeft, isOverdue } = useCountdown(item.deadline);
  const mySub = item.submissions?.find((s: any) => s.studentId === myUserId);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() =>
        router.push({
          pathname: `/hub/${hubId}/assessments`,
          params: { assessmentId: item.id },
        })
      }
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Coursework: ${item.title}, ${item.type}, Total Marks: ${item.totalMarks}, Deadline: ${timeLeft}`}
    >
      <View style={styles.cardHeaderRow}>
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>{item.type}</Text>
        </View>
        <View
          style={[
            styles.timerBadge,
            isOverdue && { backgroundColor: colors.errorContainer },
          ]}
        >
          <Feather
            name="clock"
            size={12}
            color={isOverdue ? colors.error : colors.primary}
            style={{ marginRight: 4 }}
          />
          <Text
            style={[styles.timerText, isOverdue && { color: colors.error }]}
          >
            {timeLeft}
          </Text>
        </View>
      </View>

      <Text style={styles.discussionTitle}>{item.title}</Text>
      {item.description ? (
        <Text style={styles.contentBody} numberOfLines={2}>
          {item.description}
        </Text>
      ) : null}

      <View style={styles.cardFooter}>
        <Text style={styles.metaText}>Total Marks: {item.totalMarks}</Text>
        {canManage ? (
          <Text style={styles.metaText}>
            {item.submissions?.length || 0} Submissions
          </Text>
        ) : mySub ? (
          <Text
            style={[
              styles.metaText,
              { color: colors.primary, fontWeight: "700" },
            ]}
          >
            Submitted
          </Text>
        ) : (
          <Text
            style={[
              styles.metaText,
              isOverdue && { color: colors.error, fontWeight: "700" },
            ]}
          >
            {isOverdue ? "Overdue" : "Pending"}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: rounded.xl,
    padding: spacing.stackLg,
    marginBottom: spacing.stackMd,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    ...shadows.level1,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.stackMd,
  },
  typeBadge: {
    backgroundColor: colors.surfaceContainerHigh,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: rounded.sm,
  },
  typeText: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    fontWeight: "700",
  },
  timerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryContainer + "20",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: rounded.sm,
  },
  timerText: {
    ...typography.labelSm,
    color: colors.primary,
    fontWeight: "700",
  },
  discussionTitle: {
    ...typography.titleLg,
    fontSize: 16,
    color: colors.onSurface,
    fontWeight: "800",
    marginBottom: 4,
  },
  contentBody: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    lineHeight: 22,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.stackLg,
    paddingTop: spacing.stackSm,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainerHighest,
  },
  metaText: { ...typography.labelSm, color: colors.outline },
});
