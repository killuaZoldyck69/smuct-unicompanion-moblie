import { useState, useCallback, useRef } from "react";
import { Share, Keyboard, TextInput } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Toast from "react-native-toast-message";

import { useCurrentUser } from "@/hooks/use-current-user";
import { useNetworkStatus } from "@/hooks/use-network-status";
import {
  useSingleForumPost,
  useResolveForumPost,
  useDeleteForumPost,
  useUpdateForumPost,
  useCreateForumResponse,
  useUpdateForumResponse,
  useDeleteForumResponse,
  useReactForumResponse,
} from "@/features/forum/useForum";
import {
  useUgcTermsStatus,
  useAcceptUgcTerms,
  useCreateForumReport,
} from "@/features/ugc/useUgcModeration";
import {
  extractApiErrorInfo,
  formatShareMessage,
  sanitizeForumPost,
} from "@/features/forum/forum-logic";
import type {
  ForumAuthor,
  ForumResponseItem,
  ForumResponseReactionType,
} from "@/features/forum/types";
import type {
  UgcReportReason,
  UgcReportTargetType,
} from "@/services/ugc-service";
import type { ReplyTarget } from "../types";

export interface ConfirmModalConfig {
  type: "danger" | "success";
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  iconName: "trash-2" | "check-circle";
  action: () => void;
}

export interface ReportModalTarget {
  targetType: UgcReportTargetType;
  targetId: string;
  targetTitle?: string;
}

export function useDiscussionDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const postId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();

  const { user: currentUser, role: currentUserRole } = useCurrentUser();
  const { isOffline } = useNetworkStatus();
  const currentUserId = currentUser?.id;
  const isAdmin = currentUserRole === "ADMIN";

  const [composerText, setComposerText] = useState("");
  const [editingResponse, setEditingResponse] =
    useState<ForumResponseItem | null>(null);
  const isEditMode = editingResponse !== null;
  const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null);
  const composerInputRef = useRef<TextInput>(null);

  const [isOptionsModalVisible, setIsOptionsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editForm, setEditForm] = useState({ title: "", description: "" });
  const [selectedProfile, setSelectedProfile] = useState<ForumAuthor | null>(
    null,
  );
  const [confirmModal, setConfirmModal] = useState<ConfirmModalConfig | null>(
    null,
  );
  const [isGuidelinesModalVisible, setIsGuidelinesModalVisible] =
    useState(false);
  const [reportTarget, setReportTarget] = useState<ReportModalTarget | null>(
    null,
  );

  const {
    data: thread,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useSingleForumPost(postId);

  const { data: ugcTermsStatus } = useUgcTermsStatus(
    currentUserId,
    Boolean(currentUserId),
  );
  const acceptTermsMutation = useAcceptUgcTerms(currentUserId);
  const reportMutation = useCreateForumReport();

  const isAuthor = Boolean(currentUserId && currentUserId === thread?.authorId);
  const canManage = isAuthor || isAdmin;

  const resolveMutation = useResolveForumPost();
  const deleteMutation = useDeleteForumPost();
  const editMutation = useUpdateForumPost(postId);
  const replyMutation = useCreateForumResponse(postId);
  const updateResponseMutation = useUpdateForumResponse(postId);
  const deleteResponseMutation = useDeleteForumResponse(postId);
  const reactMutation = useReactForumResponse(postId);

  const handleShare = useCallback(async () => {
    if (!thread) return;
    try {
      await Share.share({
        message: formatShareMessage(thread.title, thread.description),
      });
    } catch {}
  }, [thread]);

  const navigateBackAfterRemoval = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/forum");
    }
  }, [router]);

  const handleResolvePrompt = useCallback(() => {
    const isReopening = Boolean(thread?.isResolved);
    setConfirmModal({
      type: "success",
      iconName: "check-circle",
      title: isReopening ? "Reopen Discussion?" : "Mark as Resolved?",
      message: isReopening
        ? "Reopening this discussion will allow community members to submit new answers and replies."
        : "Has this question or inquiry been satisfactorily resolved? Marking it as resolved indicates to the community that an answer has been found.",
      confirmLabel: isReopening ? "Reopen Discussion" : "Mark Resolved",
      cancelLabel: isReopening ? "Keep Closed" : "Keep Open",
      action: () => {
        if (isOffline) {
          setConfirmModal(null);
          Toast.show({
            type: "error",
            text1: "You're Offline",
            text2: "Connect to the internet to update discussion status.",
          });
          return;
        }
        resolveMutation.mutate(
          { id: postId, isResolved: !isReopening },
          {
            onSuccess: () => {
              setConfirmModal(null);
              Toast.show({
                type: "success",
                text1: isReopening ? "Discussion Reopened" : "Question Resolved",
                text2: isReopening
                  ? "This discussion is open for new replies."
                  : "This discussion has been closed with answers.",
              });
            },
            onError: (err: unknown) => {
              setConfirmModal(null);
              const info = extractApiErrorInfo(err, "Please try again.");
              Toast.show({
                type: "error",
                text1: isReopening ? "Failed to reopen" : "Failed to resolve",
                text2: info.message,
              });
            },
          },
        );
      },
    });
  }, [isOffline, postId, thread?.isResolved, resolveMutation]);

  const handleDeletePrompt = useCallback(() => {
    setConfirmModal({
      type: "danger",
      iconName: "trash-2",
      title: "Delete Discussion?",
      message:
        "Are you sure you want to permanently delete this discussion? All community answers and insights will be removed. This action cannot be undone.",
      confirmLabel: "Delete Discussion",
      cancelLabel: "Cancel",
      action: () => {
        if (isOffline) {
          setConfirmModal(null);
          Toast.show({
            type: "error",
            text1: "You're Offline",
            text2: "Connect to the internet to delete this discussion.",
          });
          return;
        }
        deleteMutation.mutate(postId, {
          onSuccess: () => {
            setConfirmModal(null);
            Toast.show({
              type: "info",
              text1: "Discussion Deleted",
            });
            navigateBackAfterRemoval();
          },
          onError: (err: unknown) => {
            setConfirmModal(null);
            const info = extractApiErrorInfo(err, "Please try again.");
            Toast.show({
              type: "error",
              text1: "Failed to delete",
              text2: info.message,
            });
          },
        });
      },
    });
  }, [isOffline, postId, deleteMutation, navigateBackAfterRemoval]);

  const handleOpenEdit = useCallback(() => {
    if (!thread) return;
    setEditForm({
      title: thread.title,
      description: thread.description,
    });
    setIsEditModalVisible(true);
  }, [thread]);

  const handleSaveEdit = useCallback(() => {
    if (isOffline) {
      Toast.show({
        type: "error",
        text1: "You're Offline",
        text2: "Connect to the internet before saving changes.",
      });
      return;
    }

    const validated = sanitizeForumPost(editForm);
    if (validated.error) {
      Toast.show({
        type: "error",
        text1: "Check Question Details",
        text2: validated.error,
        visibilityTime: 4000,
      });
      return;
    }

    editMutation.mutate(
      { title: validated.title, description: validated.description },
      {
        onSuccess: () => {
          setIsEditModalVisible(false);
          setTimeout(() => {
            Toast.show({
              type: "success",
              text1: "Question Updated",
              text2: "Your question changes have been saved.",
              visibilityTime: 4000,
            });
          }, 350);
        },
        onError: (err: unknown) => {
          const info = extractApiErrorInfo(
            err,
            "Failed to save changes. Please try again.",
          );
          if (info.code === "UGC_TERMS_REQUIRED") {
            setIsEditModalVisible(false);
            setIsGuidelinesModalVisible(true);
            return;
          }
          Toast.show({
            type: "error",
            text1: "Update Failed",
            text2: info.message,
            visibilityTime: 4000,
          });
        },
      },
    );
  }, [isOffline, editForm, editMutation]);

  const handleStartReply = useCallback(
    (targetId: string, authorName: string) => {
      if (thread?.isResolved) return;
      if (isEditMode) {
        setEditingResponse(null);
        setComposerText("");
      }
      setReplyTarget({ id: targetId, authorName });
      setTimeout(() => {
        composerInputRef.current?.focus();
      }, 100);
    },
    [thread?.isResolved, isEditMode],
  );

  const handleCancelReply = useCallback(() => {
    setReplyTarget(null);
  }, []);

  const submitReply = useCallback(
    (cleanContent: string) => {
      replyMutation.mutate(
        { content: cleanContent, parentId: replyTarget?.id },
        {
          onSuccess: () => {
            setComposerText("");
            setReplyTarget(null);
            Keyboard.dismiss();
            Toast.show({
              type: "success",
              text1: "Reply Posted",
            });
          },
          onError: (err: unknown) => {
            const info = extractApiErrorInfo(err, "Please try again.");
            if (info.code === "UGC_TERMS_REQUIRED") {
              setIsGuidelinesModalVisible(true);
              return;
            }
            Toast.show({
              type: "error",
              text1: "Failed to send",
              text2: info.message,
            });
          },
        },
      );
    },
    [replyMutation, replyTarget],
  );

  const submitResponseUpdate = useCallback(
    (responseId: string, cleanContent: string) => {
      updateResponseMutation.mutate(
        { responseId, content: cleanContent },
        {
          onSuccess: () => {
            setComposerText("");
            setEditingResponse(null);
            Keyboard.dismiss();
            Toast.show({
              type: "success",
              text1: "Response Updated",
            });
          },
          onError: (err: unknown) => {
            const info = extractApiErrorInfo(err, "Please try again.");
            if (info.code === "UGC_TERMS_REQUIRED") {
              setIsGuidelinesModalVisible(true);
              return;
            }
            Toast.show({
              type: "error",
              text1: "Failed to update",
              text2: info.message,
            });
          },
        },
      );
    },
    [updateResponseMutation],
  );

  const handleComposerSubmit = useCallback(() => {
    const cleanContent = composerText.trim();
    if (!cleanContent) return;

    if (isOffline) {
      Toast.show({
        type: "error",
        text1: "You're Offline",
        text2: "Connect to the internet to submit your response.",
      });
      return;
    }

    if (ugcTermsStatus && !ugcTermsStatus.accepted) {
      setIsGuidelinesModalVisible(true);
      return;
    }

    if (isEditMode && editingResponse) {
      submitResponseUpdate(editingResponse.id, cleanContent);
      return;
    }

    submitReply(cleanContent);
  }, [
    composerText,
    isOffline,
    isEditMode,
    editingResponse,
    submitResponseUpdate,
    ugcTermsStatus,
    submitReply,
  ]);

  const handleAcceptGuidelines = useCallback(() => {
    if (isOffline) {
      Toast.show({
        type: "error",
        text1: "You're Offline",
        text2: "Connect to the internet to accept guidelines.",
      });
      return;
    }
    acceptTermsMutation.mutate(undefined, {
      onSuccess: () => {
        setIsGuidelinesModalVisible(false);
        const cleanContent = composerText.trim();
        if (cleanContent && isEditMode && editingResponse) {
          submitResponseUpdate(editingResponse.id, cleanContent);
          return;
        }
        if (cleanContent && !isEditMode) {
          submitReply(cleanContent);
        }
      },
      onError: (err: unknown) => {
        const info = extractApiErrorInfo(
          err,
          "Could not save guidelines agreement.",
        );
        Toast.show({
          type: "error",
          text1: "Agreement Failed",
          text2: info.message,
        });
      },
    });
  }, [
    isOffline,
    acceptTermsMutation,
    composerText,
    isEditMode,
    editingResponse,
    submitResponseUpdate,
    submitReply,
  ]);

  const handleReactResponse = useCallback(
    (response: ForumResponseItem, type: ForumResponseReactionType) => {
      if (isOffline) {
        Toast.show({
          type: "error",
          text1: "You're Offline",
          text2: "Connect to the internet to react to comments.",
        });
        return;
      }
      reactMutation.mutate(
        { responseId: response.id, type },
        {
          onError: (err: unknown) => {
            const info = extractApiErrorInfo(
              err,
              "Could not update reaction.",
            );
            Toast.show({
              type: "error",
              text1: "Reaction Failed",
              text2: info.message,
            });
          },
        },
      );
    },
    [isOffline, reactMutation],
  );

  const handleOpenReportPost = useCallback(() => {
    if (!thread) return;
    setReportTarget({
      targetType: "FORUM_POST",
      targetId: thread.id,
      targetTitle: thread.title,
    });
  }, [thread]);

  const handleOpenReportResponse = useCallback((item: ForumResponseItem) => {
    setReportTarget({
      targetType: "FORUM_RESPONSE",
      targetId: item.id,
      targetTitle: item.content.slice(0, 60),
    });
  }, []);

  const handleSubmitReport = useCallback(
    ({ reason, details }: { reason: UgcReportReason; details?: string }) => {
      if (!reportTarget) return;
      if (isOffline) {
        Toast.show({
          type: "error",
          text1: "You're Offline",
          text2: "Connect to the internet to submit a report.",
        });
        return;
      }

      const currentTarget = reportTarget;
      reportMutation.mutate(
        {
          targetType: currentTarget.targetType,
          targetId: currentTarget.targetId,
          reason,
          ...(details ? { details } : {}),
        },
        {
          onSuccess: () => {
            setReportTarget(null);
            Toast.show({
              type: "success",
              text1: "Report Submitted",
              text2: "This content is now hidden from your view for review.",
            });
            if (currentTarget.targetType === "FORUM_POST") {
              navigateBackAfterRemoval();
            }
          },
          onError: (err: unknown) => {
            const info = extractApiErrorInfo(
              err,
              "Could not submit your report.",
            );
            Toast.show({
              type: "error",
              text1: "Report Failed",
              text2: info.message,
            });
          },
        },
      );
    },
    [reportTarget, isOffline, reportMutation, navigateBackAfterRemoval],
  );

  const handleEditResponseInline = useCallback(
    (response: ForumResponseItem) => {
      if (thread?.isResolved) {
        Toast.show({
          type: "info",
          text1: "Discussion Resolved",
          text2: "Responses cannot be edited on a resolved discussion.",
        });
        return;
      }
      setReplyTarget(null);
      setEditingResponse(response);
      setComposerText(response.content);
    },
    [thread?.isResolved],
  );

  const handleCancelEdit = useCallback(() => {
    setEditingResponse(null);
    setComposerText("");
    setReplyTarget(null);
    Keyboard.dismiss();
  }, []);

  const handleDeleteResponsePrompt = useCallback(
    (response: ForumResponseItem) => {
      setConfirmModal({
        type: "danger",
        iconName: "trash-2",
        title: "Delete Response?",
        message:
          "Are you sure you want to permanently delete this response? This action cannot be undone.",
        confirmLabel: "Delete",
        cancelLabel: "Cancel",
        action: () => {
          if (isOffline) {
            setConfirmModal(null);
            Toast.show({
              type: "error",
              text1: "You're Offline",
              text2: "Connect to the internet to delete responses.",
            });
            return;
          }
          deleteResponseMutation.mutate(response.id, {
            onSuccess: () => {
              setConfirmModal(null);
              Toast.show({
                type: "info",
                text1: "Response Deleted",
              });
            },
            onError: (err: unknown) => {
              setConfirmModal(null);
              Toast.show({
                type: "error",
                text1: "Failed to delete",
                text2: extractApiErrorInfo(err, "Please try again.").message,
              });
            },
          });
        },
      });
    },
    [isOffline, deleteResponseMutation],
  );

  const handleOverflowPress = useCallback(() => {
    setIsOptionsModalVisible(true);
  }, []);

  const isSubmittingComposer = isEditMode
    ? updateResponseMutation.isPending
    : replyMutation.isPending;

  return {
    postId,
    thread,
    isLoading,
    isError,
    isOffline,
    refetch,
    isRefetching,
    isAuthor,
    canManage,
    currentUserId,
    isAdmin,
    composerText,
    setComposerText,
    isEditMode,
    replyTarget,
    handleStartReply,
    handleCancelReply,
    composerInputRef,
    isSubmittingComposer,
    handleComposerSubmit,
    handleEditResponseInline,
    handleCancelEdit,
    handleDeleteResponsePrompt,
    handleReactResponse,
    isOptionsModalVisible,
    setIsOptionsModalVisible,
    handleOverflowPress,
    isEditModalVisible,
    setIsEditModalVisible,
    editForm,
    setEditForm,
    handleOpenEdit,
    handleSaveEdit,
    isSavingEdit: editMutation.isPending,
    selectedProfile,
    setSelectedProfile,
    confirmModal,
    setConfirmModal,
    isGuidelinesModalVisible,
    setIsGuidelinesModalVisible,
    isAcceptingGuidelines: acceptTermsMutation.isPending,
    handleAcceptGuidelines,
    reportTarget,
    setReportTarget,
    handleOpenReportPost,
    handleOpenReportResponse,
    handleSubmitReport,
    isSubmittingReport: reportMutation.isPending,
    handleShare,
    handleResolvePrompt,
    handleDeletePrompt,
    isDeleting: deleteMutation.isPending,
    isResolving: resolveMutation.isPending,
    isDeletingResponse: deleteResponseMutation.isPending,
  };
}
