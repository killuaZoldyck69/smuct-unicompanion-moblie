import { useState, useCallback, useEffect } from "react";
import { BackHandler } from "react-native";
import Toast from "react-native-toast-message";
import { useCreateForumPost } from "@/features/forum/useForum";
import { sanitizeForumPost } from "../utils";

interface UseComposePostFormOptions {
  onSuccess?: () => void;
}

export function useComposePostForm(options?: UseComposePostFormOptions) {
  const [isComposeVisible, setIsComposeVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const createPostMutation = useCreateForumPost();

  const resetForm = useCallback(() => {
    setTitle("");
    setDescription("");
  }, []);

  const openCompose = useCallback(() => {
    setIsComposeVisible(true);
  }, []);

  const closeCompose = useCallback(() => {
    setIsComposeVisible(false);
  }, []);

  useEffect(() => {
    if (!isComposeVisible) return;
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        setIsComposeVisible(false);
        return true;
      },
    );
    return () => backHandler.remove();
  }, [isComposeVisible]);

  const handleSubmit = useCallback(() => {
    const validated = sanitizeForumPost({ title, description });
    if (validated.error) {
      Toast.show({
        type: "error",
        text1: "Missing Information",
        text2: validated.error,
      });
      return;
    }

    createPostMutation.mutate(
      {
        title: validated.title,
        description: validated.description,
      },
      {
        onSuccess: () => {
          Toast.show({ type: "success", text1: "Question Published!" });
          setIsComposeVisible(false);
          resetForm();
          options?.onSuccess?.();
        },
        onError: (err: any) => {
          const errorMessage =
            err.response?.data?.message ||
            err.message ||
            "Failed to publish question. Please try again.";

          Toast.show({
            type: "error",
            text1: "Failed to post",
            text2: errorMessage,
          });
        },
      },
    );
  }, [title, description, createPostMutation, resetForm, options]);

  return {
    isComposeVisible,
    setIsComposeVisible,
    openCompose,
    closeCompose,
    title,
    setTitle,
    description,
    setDescription,
    isSubmitting: createPostMutation.isPending,
    handleSubmit,
    resetForm,
  };
}
