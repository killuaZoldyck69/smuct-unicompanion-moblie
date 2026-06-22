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
  KeyboardAvoidingView,
  Platform,
  Image,
  Switch,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);

  // Forms State
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    comment: "",
    isAnonymous: true,
    answers: {} as Record<number, string>,
  });

  const [settingsForm, setSettingsForm] = useState({
    isReviewOpen: false,
    reviewQuestions: [""],
  });

  // --- Data Fetching ---
  const { data: myHubs } = useQuery({
    queryKey: ["myHubs"],
    queryFn: async () => (await api.get("/hubs/my")).data?.data || [],
  });

  const { data: hubDetails } = useQuery({
    queryKey: ["hub", id],
    queryFn: async () => (await api.get(`/hubs/${id}`)).data?.data || {},
  });

  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ["hubReviews", id],
    queryFn: async () =>
      (await api.get(`/hubs/${id}/reviews`)).data?.data || {},
  });

  const myHubMembership = myHubs?.find(
    (m: any) => m.hubId === id || m.hub?.id === id,
  );
  const myRole = myHubMembership?.role;

  const canReview = ["STUDENT", "CR", "TA"].includes(myRole);
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
      Toast.show({ type: "error", text1: "Update Failed", text2: err.message }),
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
    onError: (err: any) => {
      const errorMsg = err.response?.data?.message || err.message;
      Toast.show({
        type: "error",
        text1: "Submission Failed",
        text2: errorMsg,
      });

      // Gracefully close the modal if they hit the 409 Duplicate Review restriction
      if (
        err.response?.status === 409 ||
        errorMsg.includes("already submitted")
      ) {
        setIsReviewModalVisible(false);
      }
    },
  });

  // --- Handlers ---
  const handleSaveSettings = () => {
    const cleanQuestions = settingsForm.reviewQuestions
      .map((q) => q.trim())
      .filter((q) => q.length > 0);
    updateSettingsMutation.mutate({
      isReviewOpen: settingsForm.isReviewOpen,
      reviewQuestions: cleanQuestions,
    });
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
  const StarRatingInput = () => {
    return (
      <View style={styles.starRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setReviewForm({ ...reviewForm, rating: star })}
          >
            <Feather
              name="star"
              size={36}
              color={
                star <= reviewForm.rating
                  ? "#FFB300"
                  : colors.surfaceContainerHighest
              }
              style={{ marginRight: 8 }}
              fill={star <= reviewForm.rating ? "#FFB300" : "transparent"}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderReviewCard = ({ item }: { item: any }) => {
    const isExpanded = expandedId === item.id;
    const isAnon = item.isAnonymous;

    const reviewerName = isAnon
      ? "Anonymous Student"
      : item.student?.name || "Student";
    const avatarUrl = isAnon ? null : item.student?.image;
    const studentEmail = item.student?.email;
    const studentIdStr = item.student?.studentProfile?.studentId;

    return (
      <TouchableOpacity
        style={[styles.card, isExpanded && styles.cardExpanded]}
        activeOpacity={0.9}
        onPress={() => setExpandedId(isExpanded ? null : item.id)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.userInfo}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarFallback}>
                <Feather
                  name={isAnon ? "user-x" : "user"}
                  size={18}
                  color={colors.secondary}
                />
              </View>
            )}
            <View style={styles.userTextCol}>
              <Text style={styles.userName} numberOfLines={1}>
                {reviewerName}
              </Text>
              <Text style={styles.dateText}>
                {new Date(item.createdAt).toLocaleDateString([], {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
            </View>
          </View>

          <View style={styles.starsWrapper}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Feather
                key={star}
                name="star"
                size={14}
                color={
                  star <= item.rating
                    ? "#FFB300"
                    : colors.surfaceContainerHighest
                }
                fill={star <= item.rating ? "#FFB300" : "transparent"}
              />
            ))}
            <Feather
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={18}
              color={colors.outline}
              style={{ marginLeft: 12 }}
            />
          </View>
        </View>

        {isExpanded && (
          <View style={styles.expandedContent}>
            {/* Display Contact Info if not Anonymous */}
            {!isAnon && (studentIdStr || studentEmail) && (
              <View style={styles.reviewerContactBox}>
                {studentIdStr && (
                  <Text style={styles.contactText}>ID: {studentIdStr}</Text>
                )}
                {studentEmail && (
                  <Text style={styles.contactText}>{studentEmail}</Text>
                )}
              </View>
            )}

            {/* General Comment */}
            {item.comment ? (
              <Text style={styles.commentBody}>{item.comment}</Text>
            ) : null}

            {/* Custom Q&A Answers */}
            {item.answers && Object.keys(item.answers).length > 0 && (
              <View style={styles.answersBox}>
                {Object.entries(item.answers).map(
                  ([questionIndex, answer]: any) => (
                    <View key={questionIndex} style={styles.answerItem}>
                      <Text style={styles.questionText}>
                        Q:{" "}
                        {hubDetails?.reviewQuestions?.[questionIndex] ||
                          "Question"}
                      </Text>
                      <Text style={styles.answerText}>{answer}</Text>
                    </View>
                  ),
                )}
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Course Reviews</Text>
        </View>

        {/* Settings Gear for Teachers/TAs/CRs */}
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

      <View style={styles.metricsBox}>
        <View style={styles.averageBox}>
          <Text style={styles.averageNumber}>
            {reviewsData?.averageRating || "N/A"}
          </Text>
          <Text style={styles.averageLabel}>Average Rating</Text>
        </View>
        <View style={styles.totalBox}>
          <Text style={styles.totalNumber}>
            {reviewsData?.totalReviews || 0}
          </Text>
          <Text style={styles.averageLabel}>Total Reviews</Text>
        </View>
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

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={reviewsData?.reviews || []}
          keyExtractor={(item) => item.id}
          renderItem={renderReviewCard}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No reviews yet. Be the first!</Text>
          }
        />
      )}

      {/* FAB - Only visible to students/CRs/TAs if reviews are open */}
      {canReview && hubDetails?.isReviewOpen && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setIsReviewModalVisible(true)}
        >
          <Feather name="edit-3" size={24} color="#FFF" />
        </TouchableOpacity>
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
                  <ActivityIndicator
                    size="small"
                    color={colors.primaryContainer}
                  />
                ) : (
                  <Text style={styles.postTextBtn}>Save</Text>
                )}
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={{
                padding: spacing.marginMobile,
                paddingBottom: 80,
              }}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.switchContainer}>
                <View style={{ flex: 1, paddingRight: 16 }}>
                  <Text style={styles.switchLabel}>Accept Reviews</Text>
                  <Text style={styles.switchSubLabel}>
                    Allow students to submit feedback for this course.
                  </Text>
                </View>
                <Switch
                  value={settingsForm.isReviewOpen}
                  onValueChange={(val) =>
                    setSettingsForm({ ...settingsForm, isReviewOpen: val })
                  }
                  trackColor={{
                    false: colors.surfaceContainerHighest,
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

      {/* --- SUBMIT REVIEW MODAL --- */}
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
                onPress={() => submitReviewMutation.mutate(reviewForm)}
                disabled={!reviewForm.rating || submitReviewMutation.isPending}
              >
                {submitReviewMutation.isPending ? (
                  <ActivityIndicator
                    size="small"
                    color={colors.primaryContainer}
                  />
                ) : (
                  <Text
                    style={[
                      styles.postTextBtn,
                      !reviewForm.rating && { opacity: 0.5 },
                    ]}
                  >
                    Submit
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={{
                padding: spacing.marginMobile,
                paddingBottom: 80,
              }}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.label}>Tap to Rate</Text>
              <StarRatingInput />

              {/* Dynamic Custom Questions */}
              {hubDetails?.reviewQuestions &&
                hubDetails.reviewQuestions.length > 0 && (
                  <View style={{ marginBottom: spacing.stackLg }}>
                    <Text style={styles.sectionHeader}>
                      Instructor Questions
                    </Text>
                    {hubDetails.reviewQuestions.map((q: string, i: number) => (
                      <View key={i} style={{ marginBottom: spacing.stackMd }}>
                        <Text style={styles.label}>{q}</Text>
                        <TextInput
                          style={[styles.input, { marginBottom: 0 }]}
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

              <Text style={styles.label}>General Feedback</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Share your overall experience with this course..."
                value={reviewForm.comment}
                onChangeText={(t) =>
                  setReviewForm({ ...reviewForm, comment: t })
                }
                multiline
              />

              {/* Anonymous Toggle */}
              <View style={styles.switchContainer}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.switchLabel}>Submit Anonymously</Text>
                  <Text style={styles.switchSubLabel}>
                    Your name and photo will be hidden
                  </Text>
                </View>
                <Switch
                  value={reviewForm.isAnonymous}
                  onValueChange={(val) =>
                    setReviewForm({ ...reviewForm, isAnonymous: val })
                  }
                  trackColor={{
                    false: colors.surfaceContainerHighest,
                    true: colors.primaryContainer,
                  }}
                  thumbColor={reviewForm.isAnonymous ? "#FFF" : colors.outline}
                />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.marginMobile,
    backgroundColor: colors.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHighest,
  },
  backButton: { marginRight: 16 },
  headerTitle: {
    ...typography.titleLg,
    fontWeight: "700",
    color: colors.onSurface,
  },

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

  metricsBox: {
    flexDirection: "row",
    padding: spacing.marginMobile,
    backgroundColor: colors.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHighest,
  },
  averageBox: {
    flex: 1,
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: colors.surfaceContainerHighest,
  },
  totalBox: { flex: 1, alignItems: "center" },
  averageNumber: {
    ...typography.headlineMd,
    fontWeight: "800",
    color: colors.primary,
  },
  totalNumber: {
    ...typography.headlineMd,
    fontWeight: "800",
    color: colors.onSurface,
  },
  averageLabel: { ...typography.labelSm, color: colors.outline, marginTop: 4 },

  listContent: { padding: spacing.marginMobile, paddingBottom: 100 },
  emptyText: {
    ...typography.bodyMd,
    color: colors.outline,
    textAlign: "center",
    marginTop: 40,
  },

  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: rounded.xl,
    padding: spacing.stackLg,
    marginBottom: spacing.stackMd,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    ...shadows.level1,
  },
  cardExpanded: { borderColor: colors.primaryContainer },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userInfo: { flexDirection: "row", alignItems: "center", flex: 1 },
  userTextCol: { flex: 1, paddingRight: 8 },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    backgroundColor: colors.surfaceContainerHigh,
  },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.secondaryContainer,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  userName: {
    ...typography.labelMd,
    color: colors.onSurface,
    fontWeight: "800",
    fontSize: 15,
  },
  dateText: {
    ...typography.labelSm,
    color: colors.outline,
    fontSize: 11,
    marginTop: 2,
  },

  starsWrapper: { flexDirection: "row", alignItems: "center" },

  expandedContent: { marginTop: spacing.stackLg, paddingTop: spacing.stackSm },
  reviewerContactBox: { marginBottom: spacing.stackMd },
  contactText: {
    ...typography.labelSm,
    color: colors.primary,
    fontWeight: "600",
    marginBottom: 2,
  },
  commentBody: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    lineHeight: 22,
  },

  answersBox: { marginTop: spacing.stackLg },
  answerItem: {
    marginTop: spacing.stackSm,
    backgroundColor: colors.surfaceContainerHigh,
    padding: spacing.stackMd,
    borderRadius: rounded.md,
  },
  questionText: {
    ...typography.labelSm,
    color: colors.primary,
    fontWeight: "800",
    marginBottom: 4,
  },
  answerText: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    lineHeight: 20,
  },

  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primaryContainer,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.level1,
  },

  // Modals
  modalContainer: { flex: 1, backgroundColor: colors.surfaceContainerLowest },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.marginMobile,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHighest,
    backgroundColor: colors.surfaceContainerLowest,
  },
  cancelText: { ...typography.bodyLg, fontSize: 16, color: colors.outline },
  modalTitle: {
    ...typography.bodyLg,
    fontSize: 16,
    color: colors.onSurface,
    fontWeight: "800",
  },
  postTextBtn: {
    ...typography.bodyLg,
    fontSize: 16,
    color: colors.primaryContainer,
    fontWeight: "800",
  },

  label: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    marginBottom: 8,
    marginTop: 12,
  },
  starRow: { flexDirection: "row", marginBottom: spacing.stackLg },
  input: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: rounded.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...typography.bodyMd,
    color: colors.onSurface,
    marginBottom: spacing.stackLg,
  },
  textArea: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: rounded.md,
    padding: 16,
    height: 120,
    ...typography.bodyMd,
    color: colors.onSurface,
    textAlignVertical: "top",
    marginBottom: spacing.stackLg,
  },

  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.stackLg,
    padding: 16,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: rounded.md,
  },
  switchLabel: {
    ...typography.labelMd,
    color: colors.onSurface,
    fontWeight: "700",
  },
  switchSubLabel: {
    ...typography.labelSm,
    color: colors.outline,
    marginTop: 2,
  },

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
    marginTop: 8,
  },
  addQuestionText: {
    ...typography.labelMd,
    color: colors.primary,
    fontWeight: "700",
  },
});
