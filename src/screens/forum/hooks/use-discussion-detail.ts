import { useState, useCallback, useRef } from "react";
import { Share, Keyboard, TextInput } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Toast from "react-native-toast-message";

import { useCurrentUser } from "@/hooks/use-current-user";
import {
  useSingleForumPost,
  useResolveForumPost,
  useDeleteForumPost,
  useUpdateForumPost,
  useCreateForumResponse,
  useUpdateForumResponse,
  useDeleteForumResponse,
} from "@/features/forum/useForum";
import type { ForumAuthor, ForumResponseItem } from "@/features/forum/types";
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

export function useDiscussionDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const postId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();

  const { user: currentUser, role: currentUserRole } = useCurrentUser();
  const currentUserId = currentUser?.id;
  const isAdmin = currentUserRole === "ADMIN";

  // Composer state — shared between new reply and edit mode
  const [composerText, setComposerText] = useState("");
  const [editingResponse, setEditingResponse] = useState<ForumResponseItem | null>(null);
  const isEditMode = editingResponse !== null;
  const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null);
  const composerInputRef = useRef<TextInput>(null);

  const [isOptionsModalVisible, setIsOptionsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editForm, setEditForm] = useState({ title: "", description: "" });
  const [selectedProfile, setSelectedProfile] = useState<ForumAuthor | null>(null);
  const [confirmModal, setConfirmModal] = useState<ConfirmModalConfig | null>(null);

  const {
    data: thread,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useSingleForumPost(postId);

  const isAuthor = Boolean(currentUserId && currentUserId === thread?.authorId);
  const canManage = isAuthor || isAdmin;

  const resolveMutation = useResolveForumPost();
  const deleteMutation = useDeleteForumPost();
  const editMutation = useUpdateForumPost(postId);
  const replyMutation = useCreateForumResponse(postId);
  const updateResponseMutation = useUpdateForumResponse(postId);
  const deleteResponseMutation = useDeleteForumResponse(postId);

  const handleShare = useCallback(async () => {
    if (!thread) return;
    try {
      await Share.share({
        message: `💬 SMUCT Campus Forum: "${thread.title}"\n\n${thread.description}\n\nJoin the discussion on SMUCT UniCompanion!`,
      });
    } catch {}
  }, [thread]);

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
            onError: (err: any) => {
              setConfirmModal(null);
              Toast.show({
                type: "error",
                text1: isReopening ? "Failed to reopen" : "Failed to resolve",
                text2: err.message || "Please try again.",
              });
            },
          },
        );
      },
    });
  }, [postId, thread?.isResolved, resolveMutation]);

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
        deleteMutation.mutate(postId, {
          onSuccess: () => {
            setConfirmModal(null);
            Toast.show({
              type: "info",
              text1: "Discussion Deleted",
            });
            router.push("/(tabs)/forum");
          },
          onError: (err: any) => {
            setConfirmModal(null);
            Toast.show({
              type: "error",
              text1: "Failed to delete",
              text2: err.message || "Please try again.",
            });
          },
        });
      },
    });
  }, [postId, deleteMutation, router]);

  const handleOpenEdit = useCallback(() => {
    if (!thread) return;
    setEditForm({
      title: thread.title,
      description: thread.description,
    });
    setIsEditModalVisible(true);
  }, [thread]);

  const handleSaveEdit = useCallback(() => {
    const trimmedTitle = editForm.title.trim();
    const trimmedDesc = editForm.description.trim();
    const plainDesc = trimmedDesc
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!trimmedTitle) {
      Toast.show({
        type: "error",
        text1: "Title Required",
        text2: "Please enter a question title.",
        visibilityTime: 4000,
      });
      return;
    }

    if (trimmedTitle.length < 5) {
      Toast.show({
        type: "error",
        text1: "Title Too Short",
        text2: "Question title must be at least 5 characters.",
        visibilityTime: 4000,
      });
      return;
    }

    if (!trimmedDesc || !plainDesc) {
      Toast.show({
        type: "error",
        text1: "Details Required",
        text2: "Please provide details and context for your question.",
        visibilityTime: 4000,
      });
      return;
    }

    if (plainDesc.length < 10) {
      Toast.show({
        type: "error",
        text1: "More Context Needed",
        text2: "Please provide at least 10 characters of details.",
        visibilityTime: 4000,
      });
      return;
    }

    editMutation.mutate(
      { title: trimmedTitle, description: trimmedDesc },
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
        onError: (err: any) => {
          const errorMessage =
            err.response?.data?.message ||
            err.response?.data?.error ||
            err.message ||
            "Failed to save changes. Please try again.";
          Toast.show({
            type: "error",
            text1: "Update Failed",
            text2: errorMessage,
            visibilityTime: 4000,
          });
        },
      },
    );
  }, [editForm, editMutation]);

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

  // Submit handler — routes to new reply or response update based on edit mode
  const handleComposerSubmit = useCallback(() => {
    const cleanContent = composerText.trim();
    if (!cleanContent) return;

    if (isEditMode && editingResponse) {
      updateResponseMutation.mutate(
        { responseId: editingResponse.id, content: cleanContent },
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
          onError: (err: any) => {
            Toast.show({
              type: "error",
              text1: "Failed to update",
              text2: err.message || "Please try again.",
            });
          },
        },
      );
    } else {
      replyMutation.mutate(
        { content: cleanContent, parentId: replyTarget?.id },
        {
          onSuccess: () => {
            setComposerText("");
            setReplyTarget(null);
            Keyboard.dismiss();
            Toast.show({
              type: "success",
              text1: replyTarget ? "Reply Posted" : "Reply Posted",
            });
          },
          onError: (err: any) => {
            Toast.show({
              type: "error",
              text1: "Failed to send",
              text2: err.message || "Please try again.",
            });
          },
        },
      );
    }
  }, [
    composerText,
    isEditMode,
    editingResponse,
    replyTarget,
    updateResponseMutation,
    replyMutation,
  ]);

  // Enter inline edit mode for a response
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

  // Cancel inline edit mode
  const handleCancelEdit = useCallback(() => {
    setEditingResponse(null);
    setComposerText("");
    setReplyTarget(null);
    Keyboard.dismiss();
  }, []);

  // Prompt for response deletion via confirm modal
  const handleDeleteResponsePrompt = useCallback((response: ForumResponseItem) => {
    setConfirmModal({
      type: "danger",
      iconName: "trash-2",
      title: "Delete Response?",
      message:
        "Are you sure you want to permanently delete this response? This action cannot be undone.",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      action: () => {
        deleteResponseMutation.mutate(response.id, {
          onSuccess: () => {
            setConfirmModal(null);
            Toast.show({
              type: "info",
              text1: "Response Deleted",
            });
          },
          onError: (err: any) => {
            setConfirmModal(null);
            Toast.show({
              type: "error",
              text1: "Failed to delete",
              text2: err.message || "Please try again.",
            });
          },
        });
      },
    });
  }, [deleteResponseMutation]);

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
    handleShare,
    handleResolvePrompt,
    handleDeletePrompt,
    isDeleting: deleteMutation.isPending,
    isResolving: resolveMutation.isPending,
    isDeletingResponse: deleteResponseMutation.isPending,
  };
}
