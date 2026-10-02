import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { BENTO, fontFamily } from "./types";

interface ReviewPromptCardProps {
  isReviewOpen: boolean;
  onOpenCreate: () => void;
}

export const ReviewPromptCard: React.FC<ReviewPromptCardProps> = React.memo(
  ({ isReviewOpen, onOpenCreate }) => {
    if (isReviewOpen) {
      return (
        <View style={styles.promptCard}>
          <View style={styles.promptIconBox}>
            <Ionicons name="star" size={20} color="#f59e0b" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.promptTitle}>Share Your Course Evaluation</Text>
            <Text style={styles.promptSubtitle}>
              Your anonymous evaluation directly supports faculty improvement and course quality.
            </Text>
            <TouchableOpacity
              style={styles.submitReviewBtn}
              onPress={onOpenCreate}
              activeOpacity={0.8}
            >
              <Feather name="edit-3" size={15} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={styles.submitReviewBtnText}>Write Anonymous Review</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.closedCard}>
        <Feather name="lock" size={16} color="#64748b" style={{ marginRight: 10 }} />
        <Text style={styles.closedCardText}>
          Course evaluations are currently closed by the course instructor.
        </Text>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  promptCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#fde68a",
    ...BENTO.shadow,
  },
  promptIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#fef3c7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  promptTitle: {
    fontFamily,
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 4,
  },
  promptSubtitle: {
    fontFamily,
    fontSize: 12,
    color: "#64748b",
    lineHeight: 17,
    marginBottom: 12,
  },
  submitReviewBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f172a",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  submitReviewBtnText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
  },
  closedCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 16,
    padding: 14,
  },
  closedCardText: {
    flex: 1,
    fontFamily,
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
});
