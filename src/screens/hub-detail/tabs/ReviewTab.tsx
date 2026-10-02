import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  ReviewTabProps,
  BENTO,
  fontFamily,
  useReviewTab,
  ReviewMetricsCard,
  MyReviewCard,
  ReviewPromptCard,
  ReviewCard,
  ReviewFormModal,
  ConfigureReviewModal,
  DeleteReviewModal,
} from "../components/reviews";

export default function ReviewTab({
  hubId,
  isTeacher = false,
  canManage,
  canSubmit,
  currentUserId,
}: ReviewTabProps) {
  const insets = useSafeAreaInsets();
  const {
    allReviews,
    otherReviews,
    averageRating,
    totalReviews,
    ratingDistribution,
    isReviewOpen,
    reviewQuestions,
    hasSubmitted,
    myReview,
    isLoading,
    isRefetching,
    handleRefresh,

    // Student Review Form Modal
    isSubmitModalVisible,
    isEditMode,
    rating,
    setRating,
    comment,
    setComment,
    answers,
    setAnswers,
    isFormSubmitting,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleCloseSubmitModal,
    handleSubmitOrEditReview,

    // Teacher Settings Modal
    isSettingsModalVisible,
    settingsOpen,
    setSettingsOpen,
    customQuestions,
    newQuestionText,
    setNewQuestionText,
    isSavingSettings,
    handleOpenSettingsModal,
    handleCloseSettingsModal,
    handleSaveSettings,
    handleAddQuestion,
    handleRemoveQuestion,

    // Delete Modal
    isDeleteModalVisible,
    setIsDeleteModalVisible,
    isDeletingReview,
    handleDeleteReview,
  } = useReviewTab({ hubId, isTeacher });

  const displayedReviews = isTeacher ? allReviews : otherReviews;

  return (
    <View style={styles.container}>
      <FlatList
        data={displayedReviews}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Math.max(insets.bottom + 32, 56) },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor="#0f172a"
          />
        }
        ListHeaderComponent={
          <>
            {/* 1. TOP METRICS & EVALUATION STATUS BENTO */}
            <ReviewMetricsCard
              isTeacher={isTeacher}
              isReviewOpen={isReviewOpen}
              averageRating={averageRating}
              totalReviews={totalReviews}
              ratingDistribution={ratingDistribution}
              onOpenSettings={handleOpenSettingsModal}
            />

            {/* 2. STUDENT ACTIONS & PINNED "YOUR REVIEW" CARD */}
            {!isTeacher && (
              <View style={styles.studentSection}>
                {hasSubmitted || myReview ? (
                  myReview ? (
                    <MyReviewCard
                      myReview={myReview}
                      reviewQuestions={reviewQuestions}
                      onEdit={handleOpenEditModal}
                      onDelete={() => setIsDeleteModalVisible(true)}
                    />
                  ) : null
                ) : (
                  <ReviewPromptCard
                    isReviewOpen={isReviewOpen}
                    onOpenCreate={handleOpenCreateModal}
                  />
                )}
              </View>
            )}

            {/* 3. PEER REVIEWS SECTION HEADER */}
            <View style={styles.feedHeaderRow}>
              <Text style={styles.feedHeading}>
                {isTeacher
                  ? `Student Feedback (${allReviews.length})`
                  : `Peer Feedback (${otherReviews.length})`}
              </Text>
              <Text style={styles.feedSubheading}>Anonymous & randomized</Text>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <ReviewCard item={item} reviewQuestions={reviewQuestions} />
        )}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="small" color="#0f172a" />
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBox}>
                <Feather name="message-square" size={28} color="#94a3b8" />
              </View>
              <Text style={styles.emptyTitle}>No Reviews Yet</Text>
              <Text style={styles.emptySubtitle}>
                {isTeacher
                  ? "When students complete course evaluation, aggregated anonymous feedback will appear here in random order."
                  : "No other student reviews have been shared yet. Your feedback helps build the community!"}
              </Text>
            </View>
          )
        }
      />

      {/* 4. STUDENT SUBMIT / EDIT MODAL */}
      <ReviewFormModal
        isVisible={isSubmitModalVisible}
        isEditMode={isEditMode}
        rating={rating}
        setRating={setRating}
        comment={comment}
        setComment={setComment}
        answers={answers}
        setAnswers={setAnswers}
        reviewQuestions={reviewQuestions}
        isSubmitting={isFormSubmitting}
        onClose={handleCloseSubmitModal}
        onSubmit={handleSubmitOrEditReview}
      />

      {/* 5. TEACHER CONFIGURE MODAL (TEACHER ONLY) */}
      {isTeacher && (
        <ConfigureReviewModal
          isVisible={isSettingsModalVisible}
          settingsOpen={settingsOpen}
          setSettingsOpen={setSettingsOpen}
          customQuestions={customQuestions}
          newQuestionText={newQuestionText}
          setNewQuestionText={setNewQuestionText}
          isSaving={isSavingSettings}
          onAddQuestion={handleAddQuestion}
          onRemoveQuestion={handleRemoveQuestion}
          onClose={handleCloseSettingsModal}
          onSave={handleSaveSettings}
        />
      )}

      {/* 6. DELETE REVIEW CONFIRMATION MODAL */}
      <DeleteReviewModal
        isVisible={isDeleteModalVisible}
        isDeleting={isDeletingReview}
        onClose={() => {
          if (!isDeletingReview) setIsDeleteModalVisible(false);
        }}
        onDelete={handleDeleteReview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BENTO.canvas,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
  studentSection: {
    marginBottom: 16,
  },
  feedHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    marginTop: 4,
    paddingHorizontal: 4,
  },
  feedHeading: {
    fontFamily,
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
  },
  feedSubheading: {
    fontFamily,
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: "600",
  },
  centerContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.06)",
    marginTop: 8,
    ...BENTO.shadow,
  },
  emptyIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  emptyTitle: {
    fontFamily,
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 4,
  },
  emptySubtitle: {
    fontFamily,
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 16,
  },
});
