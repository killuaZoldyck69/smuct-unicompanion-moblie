import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO, fontFamily, ReviewItem } from "./types";

interface ReviewCardProps {
  item: ReviewItem;
}

export const ReviewCard: React.FC<ReviewCardProps> = React.memo(({ item }) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.anonAvatar}>
          <Feather name="shield" size={15} color="#0f172a" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.anonName}>Anonymous Student</Text>
          <Text style={styles.date}>
            {new Date(item.createdAt).toLocaleDateString([], {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </Text>
        </View>

        {/* Star Rating Badge */}
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((s) => (
            <Feather
              key={s}
              name="star"
              size={13}
              color={s <= item.rating ? "#f59e0b" : "#e2e8f0"}
            />
          ))}
        </View>
      </View>

      {item.comment ? <Text style={styles.comment}>{item.comment}</Text> : null}

      {/* Answers to Custom Questions */}
      {item.answers && typeof item.answers === "object" && (
        <View style={styles.answersContainer}>
          {Object.entries(item.answers).map(([q, a], idx) => (
            <View key={idx} style={styles.answerItem}>
              <Text style={styles.answerQuestion}>{q}</Text>
              <Text style={styles.answerText}>{String(a)}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.06)",
    ...BENTO.shadow,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  anonAvatar: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  anonName: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
  },
  date: {
    fontFamily,
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: "500",
    marginTop: 1,
  },
  starsRow: {
    flexDirection: "row",
    gap: 2,
  },
  comment: {
    fontFamily,
    fontSize: 13,
    color: "#334155",
    lineHeight: 19,
    marginBottom: 8,
  },
  answersContainer: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 10,
    gap: 6,
    marginTop: 4,
  },
  answerItem: {},
  answerQuestion: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 1,
  },
  answerText: {
    fontFamily,
    fontSize: 12,
    color: "#0f172a",
    fontWeight: "500",
  },
});
