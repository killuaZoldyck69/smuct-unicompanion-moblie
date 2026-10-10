import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { BENTO, fontFamily, RATING_LABELS, ReviewItem } from "./types";

interface MyReviewCardProps {
  myReview: ReviewItem;
  reviewQuestions?: string[];
  onEdit: () => void;
  onDelete: () => void;
}

const getQuestionLabel = (key: string, index: number, questions?: string[]): string => {
  const trimmed = String(key).trim();
  let num = index + 1;
  let text = "";

  if (/^\d+$/.test(trimmed)) {
    const idx = parseInt(trimmed, 10);
    num = idx + 1;
    if (questions && questions[idx]) {
      text = questions[idx].trim();
    }
  } else {
    text = trimmed;
  }

  if (/^q\d+[:.\s-]/i.test(text)) {
    return text;
  }

  if (text && !/^question\s*\d+$/i.test(text)) {
    return `Q${num}: ${text}`;
  }

  return `Q${num}`;
};

export const MyReviewCard: React.FC<MyReviewCardProps> = React.memo(
  ({ myReview, reviewQuestions, onEdit, onDelete }) => {
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Feather name="user-check" size={12} color="#4338ca" style={{ marginRight: 4 }} />
              <Text style={styles.badgeText}>Your Review</Text>
            </View>
            <View style={styles.privacyPill}>
              <Feather name="lock" size={10} color="#64748b" style={{ marginRight: 4 }} />
              <Text style={styles.privacyText}>
                Visible to you • Anonymous to teacher & peers
              </Text>
            </View>
          </View>

          {/* Delete Action Button */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionIconButton, styles.deleteIconButton]}
              onPress={onDelete}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Delete Review"
            >
              <Feather name="trash-2" size={14} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Rating Stars & Title */}
        <View style={styles.ratingRow}>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Ionicons
                key={s}
                name="star"
                size={16}
                color={s <= myReview.rating ? "#f59e0b" : "#e2e8f0"}
              />
            ))}
          </View>
          <Text style={styles.ratingLabel}>
            {RATING_LABELS[myReview.rating] || `${myReview.rating} Stars`}
          </Text>
        </View>

        {/* Review Feedback Comment */}
        {myReview.comment ? (
          <Text style={styles.comment}>{myReview.comment}</Text>
        ) : null}

        {/* Answers to Teacher Questions */}
        {myReview.answers && typeof myReview.answers === "object" && (
          <View style={styles.answersBox}>
            {Object.entries(myReview.answers).map(([key, a], idx) => {
              if (a === null || a === undefined || String(a).trim() === "") return null;
              const questionText = getQuestionLabel(key, idx, reviewQuestions);
              return (
                <View key={key || idx} style={styles.answerItem}>
                  <Text style={styles.answerQuestion}>{questionText}</Text>
                  <Text style={styles.answerText}>{String(a)}</Text>
                </View>
              );
            })}
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.timestamp}>
            {myReview.updatedAt
              ? `Updated ${new Date(myReview.updatedAt).toLocaleDateString([], {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}`
              : `Submitted ${new Date(myReview.createdAt).toLocaleDateString([], {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}`}
          </Text>
          <TouchableOpacity onPress={onEdit}>
            <Text style={styles.editLinkText}>Edit feedback</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 18,
    borderWidth: 1.5,
    borderColor: "#c7d2fe",
    ...BENTO.shadow,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  badgeRow: {
    flex: 1,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e0e7ff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: "#4338ca",
  },
  privacyPill: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  privacyText: {
    fontFamily,
    fontSize: 10,
    color: "#64748b",
    fontWeight: "500",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    marginLeft: 8,
  },
  actionIconButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteIconButton: {
    backgroundColor: "#fee2e2",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  starsRow: {
    flexDirection: "row",
    gap: 2,
  },
  ratingLabel: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
  },
  comment: {
    fontFamily,
    fontSize: 13,
    color: "#334155",
    lineHeight: 20,
    marginBottom: 12,
  },
  answersBox: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginBottom: 12,
  },
  answerItem: {},
  answerQuestion: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 2,
  },
  answerText: {
    fontFamily,
    fontSize: 12,
    color: "#0f172a",
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 10,
  },
  timestamp: {
    fontFamily,
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: "500",
  },
  editLinkText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: "#4f46e5",
  },
});
