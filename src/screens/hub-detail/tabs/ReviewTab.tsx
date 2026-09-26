import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
  ScrollView,
  Modal,
  TextInput,
  Switch,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

import { useReviews, useSubmitReview, useUpdateReviewSettings } from "@/features/hubs/useHubs";

const BENTO = {
  canvas: "#f8fafc",
  card: "#ffffff",
  navy: "#0f172a",
  slate: "#64748b",
  border: "rgba(15, 23, 42, 0.08)",
  shadow: {
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
};

const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

interface ReviewTabProps {
  hubId: string;
  canManage: boolean;
  canSubmit: boolean;
  currentUserId?: string;
}

export default function ReviewTab({
  hubId,
  canManage,
  canSubmit,
  currentUserId,
}: ReviewTabProps) {
  const queryClient = useQueryClient();

  const { data: reviewsData, isLoading, isRefetching } = useReviews(hubId);
  const submitMutation = useSubmitReview(hubId);
  const settingsMutation = useUpdateReviewSettings(hubId);

  // Student submission modal
  const [isSubmitModalVisible, setIsSubmitModalVisible] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Teacher settings modal
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [customQuestions, setCustomQuestions] = useState<string[]>([]);
  const [newQuestionText, setNewQuestionText] = useState("");

  const reviews = Array.isArray(reviewsData?.reviews) ? reviewsData.reviews : [];
  const averageRating = reviewsData?.averageRating || 0;
  const totalReviews = reviewsData?.totalReviews || 0;
  const ratingDistribution = reviewsData?.ratingDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const isReviewOpen = !!reviewsData?.isReviewOpen;
  const reviewQuestions: string[] = Array.isArray(reviewsData?.reviewQuestions)
    ? reviewsData.reviewQuestions
    : [];
  const hasSubmitted = !!reviewsData?.hasSubmitted;
  const myReview = reviewsData?.myReview;

  const handleOpenSettingsModal = () => {
    setSettingsOpen(isReviewOpen);
    setCustomQuestions([...reviewQuestions]);
    setIsSettingsModalVisible(true);
  };

  const handleSaveSettings = () => {
    settingsMutation.mutate(
      {
        isReviewOpen: settingsOpen,
        reviewQuestions: customQuestions.filter((q) => q.trim().length > 0),
      },
      {
        onSuccess: () => {
          setIsSettingsModalVisible(false);
          Toast.show({ type: "success", text1: "Review Settings Updated" });
        },
        onError: (err: any) => {
          Toast.show({
            type: "error",
            text1: "Failed to update settings",
            text2: err.response?.data?.message || err.message,
          });
        },
      },
    );
  };

  const handleAddQuestion = () => {
    if (!newQuestionText.trim()) return;
    setCustomQuestions((prev) => [...prev, newQuestionText.trim()]);
    setNewQuestionText("");
  };

  const handleRemoveQuestion = (idx: number) => {
    setCustomQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmitReview = () => {
    if (rating < 1 || rating > 5) {
      Toast.show({ type: "error", text1: "Please select a star rating (1 to 5)" });
      return;
    }

    submitMutation.mutate(
      {
        rating,
        comment: comment.trim() || undefined,
        isAnonymous: true,
        answers: Object.keys(answers).length > 0 ? answers : undefined,
      },
      {
        onSuccess: () => {
          setIsSubmitModalVisible(false);
          setComment("");
          setAnswers({});
          Toast.show({
            type: "success",
            text1: "Review Submitted Anonymously",
            text2: "Thank you for your academic feedback!",
          });
        },
        onError: (err: any) => {
          Toast.show({
            type: "error",
            text1: "Submission Failed",
            text2: err.response?.data?.message || err.message,
          });
        },
      },
    );
  };

  return (
    <View style={styles.container}>
      {/* 1. Review Workspace Summary Bento Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryTopRow}>
          <View>
            <Text style={styles.summaryTitle}>Course Reviews & Evaluation</Text>
            <View style={styles.statusPillRow}>
              <View style={[styles.statusDot, { backgroundColor: isReviewOpen ? "#16a34a" : "#94a3b8" }]} />
              <Text style={styles.statusPillText}>
                {isReviewOpen ? "Reviews Active" : "Reviews Closed"}
              </Text>
            </View>
          </View>

          {canManage && (
            <TouchableOpacity
              style={styles.settingsBtn}
              onPress={handleOpenSettingsModal}
            >
              <Feather name="settings" size={14} color="#0f172a" style={{ marginRight: 6 }} />
              <Text style={styles.settingsBtnText}>Configure</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Rating Metrics & Star Distribution */}
        <View style={styles.metricsContainer}>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreText}>{averageRating > 0 ? averageRating : "—"}</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Feather
                  key={star}
                  name="star"
                  size={14}
                  color={star <= Math.round(Number(averageRating)) ? "#f59e0b" : "#cbd5e1"}
                />
              ))}
            </View>
            <Text style={styles.totalReviewsText}>{totalReviews} Ratings</Text>
          </View>

          {/* Distribution Bars */}
          <View style={styles.distributionBox}>
            {[5, 4, 3, 2, 1].map((s) => {
              const count = (ratingDistribution as any)[s] || 0;
              const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
              return (
                <View key={s} style={styles.distRow}>
                  <Text style={styles.distLabel}>{s} ★</Text>
                  <View style={styles.distBarBg}>
                    <View style={[styles.distBarFill, { width: `${pct}%` }]} />
                  </View>
                  <Text style={styles.distCount}>{count}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Student Action: Submit or View Submitted */}
        {canSubmit && (
          <View style={styles.studentActionArea}>
            {hasSubmitted ? (
              <View style={styles.submittedBanner}>
                <Feather name="check-circle" size={16} color="#15803d" style={{ marginRight: 8 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.submittedBannerTitle}>Anonymous Review Submitted</Text>
                  <Text style={styles.submittedBannerSubtitle}>
                    Your feedback is completely confidential and contributes to academic quality.
                  </Text>
                </View>
              </View>
            ) : isReviewOpen ? (
              <TouchableOpacity
                style={styles.submitReviewBtn}
                onPress={() => setIsSubmitModalVisible(true)}
              >
                <Feather name="edit" size={16} color="#ffffff" style={{ marginRight: 8 }} />
                <Text style={styles.submitReviewBtnText}>Submit Anonymous Review</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.closedBanner}>
                <Feather name="lock" size={15} color="#64748b" style={{ marginRight: 8 }} />
                <Text style={styles.closedBannerText}>
                  Course reviews are not currently open for this semester.
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* 2. Reviews Feed */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0f172a" />
        </View>
      ) : reviews.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBox}>
            <Feather name="message-square" size={32} color="#94a3b8" />
          </View>
          <Text style={styles.emptyTitle}>No Reviews Yet</Text>
          <Text style={styles.emptySubtitle}>
            When students complete the course evaluation, aggregated anonymous feedback will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.anonAvatar}>
                  <Feather name="shield" size={16} color="#0f172a" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.anonName}>Anonymous Student</Text>
                  <Text style={styles.reviewDate}>
                    {new Date(item.createdAt).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </Text>
                </View>

                {/* Rating Stars */}
                <View style={styles.cardStarsRow}>
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

              {item.comment ? (
                <Text style={styles.reviewComment}>{item.comment}</Text>
              ) : null}

              {/* Custom Question Answers */}
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
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => {
                queryClient.invalidateQueries({ queryKey: ["reviews", hubId] });
              }}
              tintColor="#0f172a"
            />
          }
        />
      )}

      {/* 3. Student Submit Anonymous Review Modal */}
      {isSubmitModalVisible && (
        <Modal visible={isSubmitModalVisible} animationType="slide" transparent>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Course Evaluation</Text>
                <TouchableOpacity onPress={() => setIsSubmitModalVisible(false)}>
                  <Feather name="x" size={20} color="#0f172a" />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ marginTop: 12 }}>
                {/* Privacy Guarantee Banner */}
                <View style={styles.privacyBanner}>
                  <Feather name="shield" size={16} color="#0284c7" style={{ marginRight: 8 }} />
                  <Text style={styles.privacyBannerText}>
                    100% Anonymous. Your student ID, name, and profile will never be linked to this review.
                  </Text>
                </View>

                {/* Rating Stars Picker */}
                <Text style={styles.inputLabel}>Overall Rating</Text>
                <View style={styles.starPickerRow}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <TouchableOpacity
                      key={s}
                      onPress={() => setRating(s)}
                      style={styles.starTouch}
                    >
                      <Feather
                        name="star"
                        size={32}
                        color={s <= rating ? "#f59e0b" : "#cbd5e1"}
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Comment Input */}
                <Text style={styles.inputLabel}>Detailed Feedback</Text>
                <TextInput
                  style={[styles.input, { height: 90 }]}
                  placeholder="Share your thoughts about teaching methodology, course clarity, or grading..."
                  value={comment}
                  onChangeText={setComment}
                  multiline
                />

                {/* Custom Review Questions */}
                {reviewQuestions.map((q, idx) => (
                  <View key={idx} style={{ marginTop: 10 }}>
                    <Text style={styles.inputLabel}>{q}</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Your answer..."
                      value={answers[q] || ""}
                      onChangeText={(val) => setAnswers((prev) => ({ ...prev, [q]: val }))}
                    />
                  </View>
                ))}

                <TouchableOpacity
                  style={styles.submitConfirmBtn}
                  onPress={handleSubmitReview}
                  disabled={submitMutation.isPending}
                >
                  {submitMutation.isPending ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.submitConfirmBtnText}>Submit Anonymous Review</Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* 4. Teacher Configure Reviews Modal */}
      {isSettingsModalVisible && (
        <Modal visible={isSettingsModalVisible} animationType="slide" transparent>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Configure Course Reviews</Text>
                <TouchableOpacity onPress={() => setIsSettingsModalVisible(false)}>
                  <Feather name="x" size={20} color="#0f172a" />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ marginTop: 14 }}>
                {/* Review Open/Close Toggle */}
                <View style={styles.switchRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.switchTitle}>Allow Student Reviews</Text>
                    <Text style={styles.switchSubtitle}>
                      When active, enrolled students can submit anonymous course evaluations.
                    </Text>
                  </View>
                  <Switch
                    value={settingsOpen}
                    onValueChange={setSettingsOpen}
                    trackColor={{ false: "#cbd5e1", true: "#16a34a" }}
                  />
                </View>

                {/* Custom Review Questions */}
                <Text style={[styles.inputLabel, { marginTop: 16 }]}>Custom Evaluation Questions</Text>
                {customQuestions.map((q, idx) => (
                  <View key={idx} style={styles.questionItemRow}>
                    <Text style={styles.questionItemText} numberOfLines={2}>
                      {idx + 1}. {q}
                    </Text>
                    <TouchableOpacity onPress={() => handleRemoveQuestion(idx)}>
                      <Feather name="trash-2" size={14} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))}

                {/* Add Question Input */}
                <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Add a custom question..."
                    value={newQuestionText}
                    onChangeText={setNewQuestionText}
                  />
                  <TouchableOpacity style={styles.addQuestionBtn} onPress={handleAddQuestion}>
                    <Feather name="plus" size={16} color="#ffffff" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.saveSettingsBtn}
                  onPress={handleSaveSettings}
                  disabled={settingsMutation.isPending}
                >
                  {settingsMutation.isPending ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.saveSettingsBtnText}>Save Settings</Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 8,
  },
  summaryCard: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 18,
    marginHorizontal: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.06)",
    ...BENTO.shadow,
  },
  summaryTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  summaryTitle: {
    fontFamily,
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
  },
  statusPillRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 6,
  },
  statusPillText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: "#64748b",
  },
  settingsBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  settingsBtnText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: "#0f172a",
  },
  metricsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 14,
    borderRadius: 16,
  },
  scoreBox: {
    alignItems: "center",
    paddingRight: 20,
    borderRightWidth: 1,
    borderRightColor: "#e2e8f0",
  },
  scoreText: {
    fontFamily,
    fontSize: 32,
    fontWeight: "900",
    color: "#0f172a",
    lineHeight: 38,
  },
  starsRow: {
    flexDirection: "row",
    gap: 2,
    marginTop: 2,
  },
  totalReviewsText: {
    fontFamily,
    fontSize: 11,
    color: "#64748b",
    marginTop: 4,
    fontWeight: "600",
  },
  distributionBox: {
    flex: 1,
    paddingLeft: 16,
    gap: 4,
  },
  distRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  distLabel: {
    fontFamily,
    fontSize: 10,
    fontWeight: "700",
    color: "#64748b",
    width: 22,
  },
  distBarBg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#e2e8f0",
    overflow: "hidden",
  },
  distBarFill: {
    height: "100%",
    backgroundColor: "#f59e0b",
    borderRadius: 3,
  },
  distCount: {
    fontFamily,
    fontSize: 10,
    color: "#64748b",
    fontWeight: "600",
    width: 18,
    textAlign: "right",
  },
  studentActionArea: {
    marginTop: 14,
  },
  submittedBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    padding: 12,
    borderRadius: 14,
  },
  submittedBannerTitle: {
    fontFamily,
    fontSize: 12,
    fontWeight: "800",
    color: "#15803d",
  },
  submittedBannerSubtitle: {
    fontFamily,
    fontSize: 11,
    color: "#166534",
    marginTop: 2,
  },
  submitReviewBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f172a",
    paddingVertical: 12,
    borderRadius: 9999,
  },
  submitReviewBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "800",
    color: "#ffffff",
  },
  closedBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    padding: 10,
    borderRadius: 12,
  },
  closedBannerText: {
    fontFamily,
    fontSize: 12,
    color: "#64748b",
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 40,
  },
  emptyIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  emptyTitle: {
    fontFamily,
    fontSize: 17,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontFamily,
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 19,
  },
  reviewCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.06)",
    ...BENTO.shadow,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  anonAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  anonName: {
    fontFamily,
    fontSize: 13,
    fontWeight: "800",
    color: "#0f172a",
  },
  reviewDate: {
    fontFamily,
    fontSize: 10,
    color: "#94a3b8",
  },
  cardStarsRow: {
    flexDirection: "row",
    gap: 2,
  },
  reviewComment: {
    fontFamily,
    fontSize: 13,
    color: "#334155",
    lineHeight: 19,
  },
  answersContainer: {
    backgroundColor: "#f8fafc",
    padding: 10,
    borderRadius: 12,
    marginTop: 8,
    gap: 6,
  },
  answerItem: {},
  answerQuestion: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: "#64748b",
  },
  answerText: {
    fontFamily,
    fontSize: 12,
    color: "#0f172a",
    fontWeight: "600",
    marginTop: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },
  privacyBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f9ff",
    borderWidth: 1,
    borderColor: "#bae6fd",
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
  },
  privacyBannerText: {
    flex: 1,
    fontFamily,
    fontSize: 11,
    color: "#0369a1",
    fontWeight: "600",
    lineHeight: 16,
  },
  inputLabel: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 6,
    marginTop: 8,
  },
  starPickerRow: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    paddingVertical: 10,
  },
  starTouch: {
    padding: 4,
  },
  input: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: "#0f172a",
  },
  submitConfirmBtn: {
    backgroundColor: "#0f172a",
    paddingVertical: 14,
    borderRadius: 9999,
    alignItems: "center",
    marginTop: 18,
    marginBottom: 20,
  },
  submitConfirmBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "800",
    color: "#ffffff",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  switchTitle: {
    fontFamily,
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
  },
  switchSubtitle: {
    fontFamily,
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
    paddingRight: 10,
  },
  questionItemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    padding: 10,
    borderRadius: 10,
    marginBottom: 6,
  },
  questionItemText: {
    flex: 1,
    fontFamily,
    fontSize: 12,
    color: "#0f172a",
    fontWeight: "600",
  },
  addQuestionBtn: {
    backgroundColor: "#0f172a",
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  saveSettingsBtn: {
    backgroundColor: "#0f172a",
    paddingVertical: 14,
    borderRadius: 9999,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  saveSettingsBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "800",
    color: "#ffffff",
  },
});
