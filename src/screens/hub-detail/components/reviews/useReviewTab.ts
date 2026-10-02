import { useState, useMemo, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

import {
  useReviews,
  useSubmitReview,
  useEditReview,
  useDeleteReview,
  useUpdateReviewSettings,
} from "@/features/hubs/useHubs";
import { ReviewItem, ReviewsDataResponse } from "./types";

interface UseReviewTabProps {
  hubId: string;
  isTeacher?: boolean;
}

export function useReviewTab({ hubId, isTeacher = false }: UseReviewTabProps) {
  const queryClient = useQueryClient();

  const { data: rawReviewsData, isLoading, isRefetching } = useReviews(hubId);
  const reviewsData = rawReviewsData as ReviewsDataResponse | undefined;

  const submitMutation = useSubmitReview(hubId);
  const editMutation = useEditReview(hubId);
  const deleteMutation = useDeleteReview(hubId);
  const settingsMutation = useUpdateReviewSettings(hubId);

  // Student Review Form Modal (Create & Edit)
  const [isSubmitModalVisible, setIsSubmitModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Teacher Settings Modal
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [customQuestions, setCustomQuestions] = useState<string[]>([]);
  const [newQuestionText, setNewQuestionText] = useState("");

  // Delete Confirmation Modal
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const allReviews: ReviewItem[] = Array.isArray(reviewsData?.reviews)
    ? reviewsData.reviews
    : [];
  const averageRating = reviewsData?.averageRating || 0;
  const totalReviews = reviewsData?.totalReviews || 0;
  const ratingDistribution = reviewsData?.ratingDistribution || {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };
  const isReviewOpen = !!reviewsData?.isReviewOpen;
  const reviewQuestions: string[] = Array.isArray(reviewsData?.reviewQuestions)
    ? reviewsData.reviewQuestions
    : [];
  const hasSubmitted = !!reviewsData?.hasSubmitted;
  const myReview = reviewsData?.myReview || null;

  // Filter out the student's own review so the peer feed shows other feedback without duplication
  const otherReviews = useMemo(() => {
    if (!myReview) return allReviews;
    return allReviews.filter((r) => r.id !== myReview.id);
  }, [allReviews, myReview]);

  // Pull to refresh
  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["reviews", hubId] });
  }, [queryClient, hubId]);

  // Teacher settings handlers
  const handleOpenSettingsModal = useCallback(() => {
    setSettingsOpen(isReviewOpen);
    setCustomQuestions([...reviewQuestions]);
    setIsSettingsModalVisible(true);
  }, [isReviewOpen, reviewQuestions]);

  const handleCloseSettingsModal = useCallback(() => {
    if (!settingsMutation.isPending) {
      setIsSettingsModalVisible(false);
    }
  }, [settingsMutation.isPending]);

  const handleSaveSettings = useCallback(() => {
    settingsMutation.mutate(
      {
        isReviewOpen: settingsOpen,
        reviewQuestions: customQuestions
          .map((q) => q.trim())
          .filter((q) => q.length > 0),
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
      }
    );
  }, [settingsMutation, settingsOpen, customQuestions]);

  const handleAddQuestion = useCallback(() => {
    const trimmed = newQuestionText.trim();
    if (!trimmed) return;
    setCustomQuestions((prev) => [...prev, trimmed]);
    setNewQuestionText("");
  }, [newQuestionText]);

  const handleRemoveQuestion = useCallback((idx: number) => {
    setCustomQuestions((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  // Student review submission & edit handlers
  const handleOpenCreateModal = useCallback(() => {
    if (hasSubmitted || myReview) {
      Toast.show({
        type: "info",
        text1: "Review already submitted",
        text2: "You can only submit one review per course. You can edit your existing review.",
      });
      return;
    }
    setIsEditMode(false);
    setRating(5);
    setComment("");
    setAnswers({});
    setIsSubmitModalVisible(true);
  }, [hasSubmitted, myReview]);

  const handleOpenEditModal = useCallback(() => {
    if (!myReview) return;
    setIsEditMode(true);
    setRating(myReview.rating || 5);
    setComment(myReview.comment || "");
    setAnswers(
      myReview.answers && typeof myReview.answers === "object"
        ? { ...myReview.answers }
        : {}
    );
    setIsSubmitModalVisible(true);
  }, [myReview]);

  const handleCloseSubmitModal = useCallback(() => {
    if (!submitMutation.isPending && !editMutation.isPending) {
      setIsSubmitModalVisible(false);
    }
  }, [submitMutation.isPending, editMutation.isPending]);

  const handleSubmitOrEditReview = useCallback(() => {
    if (rating < 1 || rating > 5) {
      Toast.show({ type: "error", text1: "Please select a star rating (1 to 5)" });
      return;
    }

    const sanitizedComment = comment.trim() || undefined;
    const cleanAnswers: Record<string, string> = {};
    if (answers && typeof answers === "object") {
      Object.entries(answers).forEach(([k, v]) => {
        const valStr = String(v ?? "").trim();
        if (valStr.length > 0) {
          cleanAnswers[k] = valStr;
        }
      });
    }
    const sanitizedAnswers = Object.keys(cleanAnswers).length > 0 ? cleanAnswers : undefined;

    if (isEditMode) {
      editMutation.mutate(
        {
          rating,
          comment: sanitizedComment,
          answers: sanitizedAnswers,
        },
        {
          onSuccess: () => {
            setIsSubmitModalVisible(false);
            Toast.show({
              type: "success",
              text1: "Review Updated",
              text2: "Your evaluation has been updated successfully.",
            });
          },
          onError: (err: any) => {
            Toast.show({
              type: "error",
              text1: "Update Failed",
              text2: err.response?.data?.message || err.message,
            });
          },
        }
      );
    } else {
      if (hasSubmitted || myReview) {
        Toast.show({
          type: "error",
          text1: "Already Submitted",
          text2: "You can only submit one evaluation per course. You can edit your existing evaluation.",
        });
        setIsSubmitModalVisible(false);
        return;
      }
      submitMutation.mutate(
        {
          rating,
          comment: sanitizedComment,
          isAnonymous: true,
          answers: sanitizedAnswers,
        },
        {
          onSuccess: () => {
            setIsSubmitModalVisible(false);
            Toast.show({
              type: "success",
              text1: "Review Submitted Anonymously",
              text2: "Thank you for your academic evaluation!",
            });
          },
          onError: (err: any) => {
            Toast.show({
              type: "error",
              text1: "Submission Failed",
              text2: err.response?.data?.message || err.message,
            });
          },
        }
      );
    }
  }, [rating, comment, answers, isEditMode, editMutation, submitMutation, hasSubmitted, myReview]);

  const handleDeleteReview = useCallback(() => {
    deleteMutation.mutate(undefined, {
      onSuccess: () => {
        setIsDeleteModalVisible(false);
        Toast.show({
          type: "success",
          text1: "Review Deleted",
          text2: "Your evaluation has been removed.",
        });
      },
      onError: (err: any) => {
        Toast.show({
          type: "error",
          text1: "Deletion Failed",
          text2: err.response?.data?.message || err.message,
        });
      },
    });
  }, [deleteMutation]);

  const isFormSubmitting = submitMutation.isPending || editMutation.isPending;

  return {
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

    // Student Modal State & Handlers
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

    // Teacher Settings State & Handlers
    isSettingsModalVisible,
    settingsOpen,
    setSettingsOpen,
    customQuestions,
    newQuestionText,
    setNewQuestionText,
    isSavingSettings: settingsMutation.isPending,
    handleOpenSettingsModal,
    handleCloseSettingsModal,
    handleSaveSettings,
    handleAddQuestion,
    handleRemoveQuestion,

    // Delete Modal State & Handlers
    isDeleteModalVisible,
    setIsDeleteModalVisible,
    isDeletingReview: deleteMutation.isPending,
    handleDeleteReview,
  };
}
