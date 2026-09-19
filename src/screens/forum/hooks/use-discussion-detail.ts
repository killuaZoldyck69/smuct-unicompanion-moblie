import { useState, useCallback } from "react";
import { Share, Keyboard } from "react-native";
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
    setConfirmModal({
      type: "success",
      iconName: "check-circle",
      title: "Mark as Resolved?",
      message:
        "Has this question or inquiry been satisfactorily resolved? Marking it as resolved indicates to the community that an answer has been found.",
      confirmLabel: "Mark Resolved",
      cancelLabel: "Keep Open",
      action: () => {
        resolveMutation.mutate(postId, {
          onSuccess: () => {
            setConfirmModal(null);
            Toast.show({
              type: "success",
              text1: "Question Resolved",
              text2: "This discussion has been closed with answers.",
            });
          },
          onError: (err: any) => {
            setConfirmModal(null);
            Toast.show({
              type: "error",
              text1: "Failed to resolve",
              text2: err.message || "Please try again.",
            });
          },
        });
      },
    });
  }, [postId, resolveMutation]);

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

    if (!trimmedTitle || !trimmedDesc) {
      Toast.show({
        type: "error",
        text1: "Required fields",
        text2: "Please provide both title and details.",
      });
      return;
    }

    editMutation.mutate(
      { title: trimmedTitle, description: trimmedDesc },
      {
        onSuccess: () => {
          setIsEditModalVisible(false);
          Toast.show({
            type: "success",
            text1: "Discussion Updated",
          });
        },
        onError: (err: any) => {
          Toast.show({
            type: "error",
            text1: "Update failed",
            text2: err.message || "Please try again.",
          });
        },
      },
    );
  }, [editForm, editMutation]);

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
        { content: cleanContent },
        {
          onSuccess: () => {
            setComposerText("");
            Keyboard.dismiss();
            Toast.show({
              type: "success",
              text1: "Reply Posted",
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
  }, [composerText, isEditMode, editingResponse, updateResponseMutation, replyMutation]);

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
      setEditingResponse(response);
      setComposerText(response.content);
    },
    [thread?.isResolved],
  );

  // Cancel inline edit mode
  const handleCancelEdit = useCallback(() => {
    setEditingResponse(null);
    setComposerText("");
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
