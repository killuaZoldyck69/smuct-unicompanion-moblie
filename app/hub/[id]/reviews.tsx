import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

import api from "../../../src/services/api";
import { colors } from "../../../src/theme/colors";
import { typography } from "../../../src/theme/typography";
import { spacing, rounded, shadows } from "../../../src/theme/layout";

export default function HubReviewsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Modals
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);

  // Forms
  const [settingsForm, setSettingsForm] = useState({
    isReviewOpen: false,
    reviewQuestions: [""],
  });
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    comment: "",
    isAnonymous: true,
    answers: {} as Record<number, string>,
  });

  // --- Fetch Data ---
  const { data: hubDetails, isLoading: isLoadingHub } = useQuery({
    queryKey: ["hub", id],
    queryFn: async () => {
      const res = await api.get(`/hubs/${id}`);
      return res.data?.data;
    },
  });

  const { data: reviews, isLoading: isLoadingReviews } = useQuery({
    queryKey: ["hubReviews", id],
    queryFn: async () => {
      const res = await api.get(`/hubs/${id}/reviews`);
      return res.data?.data || [];
    },
  });

  // --- Identify User Role ---
  const { data: myHubs } = useQuery({
    queryKey: ["myHubs"],
    queryFn: async () => {
      const response = await api.get("/hubs/my");
      return response.data?.data || [];
    },
  });

  const myHubMembership = myHubs?.find(
    (m: any) => m.hubId === id || m.hub?.id === id,
  );
  const myRole = myHubMembership?.role;
  const canManage = ["TEACHER", "CR", "TA"].includes(myRole);

  // Sync settings form when hub details load
  useEffect(() => {
    if (hubDetails) {
      setSettingsForm({
        isReviewOpen: hubDetails.isReviewOpen || false,
        reviewQuestions:
          hubDetails.reviewQuestions && hubDetails.reviewQuestions.length > 0
            ? hubDetails.reviewQuestions
            : [""],
      });
    }
  }, [hubDetails]);

  // --- Mutations ---
  const updateSettingsMutation = useMutation({
    mutationFn: async (payload: any) =>
      await api.patch(`/hubs/${id}/review-settings`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hub", id] });
      Toast.show({ type: "success", text1: "Settings Updated!" });
      setIsSettingsModalVisible(false);
    },
    onError: (err: any) =>
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: err.response?.data?.message || err.message,
      }),
  });

  const submitReviewMutation = useMutation({
    mutationFn: async (payload: any) =>
      await api.post(`/hubs/${id}/reviews`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hubReviews", id] });
      Toast.show({ type: "success", text1: "Review Submitted!" });
      setIsReviewModalVisible(false);
      setReviewForm({ rating: 0, comment: "", isAnonymous: true, answers: {} });
    },
    onError: (err: any) =>
      Toast.show({
        type: "error",
        text1: "Submission Failed",
        text2: err.response?.data?.message || err.message,
      }),
  });

  // --- Handlers ---
  const handleSaveSettings = () => {
    // Filter out empty questions
    const cleanQuestions = settingsForm.reviewQuestions
      .map((q) => q.trim())
      .filter((q) => q.length > 0);
    updateSettingsMutation.mutate({
      isReviewOpen: settingsForm.isReviewOpen,
      reviewQuestions: cleanQuestions,
    });
  };

  const handleSubmitReview = () => {
    if (reviewForm.rating === 0)
      return Toast.show({
        type: "error",
        text1: "Rating is required",
        text2: "Please select a star rating.",
      });
    submitReviewMutation.mutate(reviewForm);
  };

  const addQuestionField = () =>
    setSettingsForm((prev) => ({
      ...prev,
      reviewQuestions: [...prev.reviewQuestions, ""],
    }));

  const updateQuestionField = (index: number, text: string) => {
    const updated = [...settingsForm.reviewQuestions];
    updated[index] = text;
    setSettingsForm((prev) => ({ ...prev, reviewQuestions: updated }));
  };

  const removeQuestionField = (index: number) => {
    const updated = settingsForm.reviewQuestions.filter((_, i) => i !== index);
    setSettingsForm((prev) => ({
      ...prev,
      reviewQuestions: updated.length > 0 ? updated : [""],
    }));
  };

  // --- Render Components ---
  const StarRating = ({
    rating,
    setRating,
    interactive = false,
  }: {
    rating: number;
    setRating?: (val: number) => void;
    interactive?: boolean;
  }) => (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          disabled={!interactive}
          onPress={() => setRating && setRating(star)}
        >
          <Feather
            name="star"
            size={interactive ? 32 : 16}
            color={star <= rating ? "#FFD700" : colors.surfaceContainerHighest}
            style={[
              interactive && { marginRight: 8 },
              !interactive && { marginRight: 2 },
            ]}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderReviewCard = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.userInfoRow}>
          <View
            style={[
              styles.avatarFallbackSmall,
              item.isAnonymous && {
                backgroundColor: colors.surfaceContainerHighest,
              },
            ]}
          >
            <Feather
              name={item.isAnonymous ? "user-x" : "user"}
              size={16}
              color={item.isAnonymous ? colors.outline : colors.onPrimary}
            />
          </View>
          <View>
            <Text
              style={[
                styles.userName,
                item.isAnonymous && { color: colors.outline },
              ]}
            >
              {item.isAnonymous ? "Anonymous Student" : item.student?.name}
            </Text>
            <Text style={styles.dateText}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <StarRating rating={item.rating} />
      </View>

      {item.comment ? (
        <Text style={styles.contentBody}>{item.comment}</Text>
      ) : null}

      {/* Render answers to custom questions if they exist */}
      {item.answers && Object.keys(item.answers).length > 0 && (
        <View style={styles.answersBox}>
          {Object.entries(item.answers).map(([questionIndex, answer]: any) => (
            <View key={questionIndex} style={styles.answerItem}>
              <Text style={styles.questionText}>
                Q: {hubDetails?.reviewQuestions?.[questionIndex] || "Question"}
              </Text>
              <Text style={styles.answerText}>{answer}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  if (isLoadingHub || isLoadingReviews)
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primaryContainer} />
      </View>
    );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Course Reviews</Text>
          <Text style={styles.headerSubtitle}>Student feedback & ratings</Text>
        </View>
        {canManage && (
          <TouchableOpacity
            onPress={() => setIsSettingsModalVisible(true)}
            style={styles.settingsBtn}
          >
            <Feather name="settings" size={20} color={colors.onSurface} />
            {!hubDetails?.isReviewOpen && (
              <View style={styles.settingsBadgeDot} />
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Notice Banners */}
      {!hubDetails?.isReviewOpen && (
        <View style={styles.warningBanner}>
          <Feather
            name="lock"
            size={16}
            color={colors.error}
            style={{ marginRight: 8 }}
          />
          <Text style={styles.warningText}>
            Reviews are currently closed by the instructor.
          </Text>
        </View>
      )}

      {/* Write Review Button for Students */}
      {hubDetails?.isReviewOpen && !canManage && (
        <View style={{ padding: spacing.marginMobile }}>
          <TouchableOpacity
            style={styles.submitReviewBtn}
            onPress={() => setIsReviewModalVisible(true)}
          >
            <Feather
              name="edit-2"
              size={18}
              color="#FFF"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.submitReviewText}>Write a Review</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* List */}
      {reviews.length === 0 ? (
        <View style={styles.centerContainer}>
          <Feather
            name="message-square"
            size={48}
            color={colors.surfaceContainerHighest}
            style={{ marginBottom: 16 }}
          />
          <Text style={styles.emptyTitle}>No Reviews Yet</Text>
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.id}
          renderItem={renderReviewCard}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* --- ADMIN SETTINGS MODAL --- */}
      <Modal
        visible={isSettingsModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setIsSettingsModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Review Settings</Text>
              <TouchableOpacity
                onPress={handleSaveSettings}
                disabled={updateSettingsMutation.isPending}
              >
                {updateSettingsMutation.isPending ? (
                  <ActivityIndicator size="small" />
                ) : (
                  <Text style={styles.postTextBtn}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.modalContent}>
              <View style={styles.switchRow}>
                <View style={{ flex: 1, paddingRight: 16 }}>
                  <Text style={styles.switchLabel}>Accept Reviews</Text>
                  <Text style={styles.switchDesc}>
                    Allow students to submit feedback for this course.
                  </Text>
                </View>
                <Switch
                  value={settingsForm.isReviewOpen}
                  onValueChange={(val) =>
                    setSettingsForm({ ...settingsForm, isReviewOpen: val })
                  }
                  trackColor={{
                    false: colors.outline,
                    true: colors.primaryContainer,
                  }}
                  thumbColor="#FFF"
                />
              </View>

              <Text style={styles.sectionHeader}>
                Custom Feedback Questions
              </Text>
              <Text style={styles.helperText}>
                Add specific questions for students to answer in their review.
              </Text>

              {settingsForm.reviewQuestions.map((q, index) => (
                <View key={index} style={styles.questionInputRow}>
                  <Text style={styles.questionNumber}>{index + 1}.</Text>
                  <TextInput
                    style={[styles.input, { flex: 1, marginBottom: 0 }]}
                    value={q}
                    onChangeText={(text) => updateQuestionField(index, text)}
                    placeholder="e.g. How was the pace of the lectures?"
                  />
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => removeQuestionField(index)}
                  >
                    <Feather name="trash-2" size={18} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity
                style={styles.addQuestionBtn}
                onPress={addQuestionField}
              >
                <Feather
                  name="plus"
                  size={16}
                  color={colors.primary}
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.addQuestionText}>Add Question</Text>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      {/* --- SUBMIT REVIEW MODAL (Students) --- */}
      <Modal
        visible={isReviewModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setIsReviewModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Write Review</Text>
              <TouchableOpacity
                onPress={handleSubmitReview}
                disabled={submitReviewMutation.isPending}
              >
                {submitReviewMutation.isPending ? (
                  <ActivityIndicator size="small" />
                ) : (
                  <Text style={styles.postTextBtn}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.modalContent}>
              <View style={styles.ratingBox}>
                <Text style={styles.ratingLabel}>Overall Course Rating</Text>
                <StarRating
                  rating={reviewForm.rating}
                  setRating={(val) =>
                    setReviewForm({ ...reviewForm, rating: val })
                  }
                  interactive
                />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Submit Anonymously</Text>
                <Switch
                  value={reviewForm.isAnonymous}
                  onValueChange={(val) =>
                    setReviewForm({ ...reviewForm, isAnonymous: val })
                  }
                  trackColor={{
                    false: colors.outline,
                    true: colors.primaryContainer,
                  }}
                />
              </View>
              <Text style={styles.helperText}>
                If enabled, your name will be hidden from everyone, including
                the instructor.
              </Text>

              {/* Dynamic Questions Rendering */}
              {hubDetails?.reviewQuestions &&
                hubDetails.reviewQuestions.length > 0 && (
                  <View style={{ marginTop: spacing.stackLg }}>
                    <Text style={styles.sectionHeader}>
                      Instructor Questions
                    </Text>
                    {hubDetails.reviewQuestions.map((q: string, i: number) => (
                      <View key={i} style={{ marginBottom: spacing.stackMd }}>
                        <Text style={styles.label}>{q}</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="Your answer..."
                          value={reviewForm.answers[i] || ""}
                          onChangeText={(text) =>
                            setReviewForm({
                              ...reviewForm,
                              answers: { ...reviewForm.answers, [i]: text },
                            })
                          }
                        />
                      </View>
                    ))}
                  </View>
                )}

              <Text style={styles.sectionHeader}>Additional Comments</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Share your overall experience with this course..."
                value={reviewForm.comment}
                onChangeText={(text) =>
                  setReviewForm({ ...reviewForm, comment: text })
                }
                multiline
              />
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: spacing.stackLg,
    paddingHorizontal: spacing.marginMobile,
    backgroundColor: colors.surfaceContainerLowest,
  },
  backButton: { marginRight: spacing.stackMd, padding: spacing.stackSm },
  headerTitle: { ...typography.headlineMd, color: colors.onSurface },
  headerSubtitle: { ...typography.bodyMd, color: colors.outline, marginTop: 2 },
  settingsBtn: {
    padding: 8,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: rounded.full,
    position: "relative",
  },
  settingsBadgeDot: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.error,
    borderWidth: 2,
    borderColor: colors.surfaceContainerLowest,
  },

  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.errorContainer,
    paddingVertical: spacing.stackSm,
    borderBottomWidth: 1,
    borderBottomColor: colors.error + "30",
  },
  warningText: {
    ...typography.labelMd,
    color: colors.error,
    fontWeight: "700",
  },

  submitReviewBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryContainer,
    paddingVertical: 14,
    borderRadius: rounded.md,
  },
  submitReviewText: { ...typography.labelMd, color: "#FFF", fontWeight: "700" },

  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyTitle: { ...typography.titleLg, color: colors.outline },

  listContent: { padding: spacing.marginMobile, paddingBottom: 100 },
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: rounded.xl,
    padding: spacing.stackLg,
    marginBottom: spacing.stackMd,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    ...shadows.level1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.stackMd,
  },
  userInfoRow: { flexDirection: "row", alignItems: "center" },
  avatarFallbackSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryContainer,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.stackSm,
  },
  userName: {
    ...typography.labelMd,
    color: colors.onSurface,
    fontWeight: "700",
  },
  dateText: { ...typography.labelSm, color: colors.outline, fontSize: 10 },
  starRow: { flexDirection: "row" },
  contentBody: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    lineHeight: 22,
  },

  answersBox: {
    marginTop: spacing.stackLg,
    paddingTop: spacing.stackSm,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainerHighest,
  },
  answerItem: {
    marginTop: spacing.stackSm,
    backgroundColor: colors.surfaceContainerHigh,
    padding: spacing.stackMd,
    borderRadius: rounded.md,
  },
  questionText: {
    ...typography.labelSm,
    color: colors.primary,
    fontWeight: "700",
    marginBottom: 4,
  },
  answerText: { ...typography.bodyMd, color: colors.onSurfaceVariant },

  // Modals
  modalContainer: { flex: 1, backgroundColor: colors.surfaceContainerLowest },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.marginMobile,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHighest,
  },
  cancelText: { ...typography.bodyLg, fontSize: 16, color: colors.outline },
  modalTitle: {
    ...typography.bodyLg,
    fontSize: 16,
    color: colors.onSurface,
    fontWeight: "700",
  },
  postTextBtn: {
    ...typography.bodyLg,
    fontSize: 16,
    color: colors.primaryContainer,
    fontWeight: "700",
  },
  modalContent: { padding: spacing.marginMobile, paddingBottom: 80 },

  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerHigh,
    padding: spacing.stackLg,
    borderRadius: rounded.lg,
  },
  switchLabel: {
    ...typography.bodyLg,
    color: colors.onSurface,
    fontWeight: "700",
    marginBottom: 4,
  },
  switchDesc: { ...typography.bodyMd, color: colors.onSurfaceVariant },

  sectionHeader: {
    ...typography.labelMd,
    color: colors.primary,
    fontWeight: "800",
    textTransform: "uppercase",
    marginTop: spacing.stackLg,
    marginBottom: 4,
  },
  helperText: {
    ...typography.labelSm,
    color: colors.outline,
    marginBottom: spacing.stackLg,
  },
  label: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    marginBottom: 6,
  },

  input: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: rounded.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...typography.bodyMd,
    color: colors.onSurface,
    marginBottom: spacing.stackMd,
  },
  textArea: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: rounded.md,
    padding: 16,
    minHeight: 120,
    ...typography.bodyMd,
    color: colors.onSurface,
    textAlignVertical: "top",
  },

  questionInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.stackMd,
  },
  questionNumber: {
    ...typography.bodyLg,
    fontWeight: "700",
    color: colors.outline,
    width: 24,
  },
  deleteBtn: { padding: 12, marginLeft: 8 },
  addQuestionBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: 8,
  },
  addQuestionText: {
    ...typography.labelMd,
    color: colors.primary,
    fontWeight: "700",
  },

  ratingBox: {
    alignItems: "center",
    paddingVertical: spacing.stackLg,
    marginBottom: spacing.stackMd,
  },
  ratingLabel: {
    ...typography.titleLg,
    color: colors.onSurface,
    fontWeight: "800",
    marginBottom: spacing.stackLg,
  },
});
