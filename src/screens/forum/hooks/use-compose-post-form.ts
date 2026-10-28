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
  const [plainText, setPlainText] = useState("");

  const createPostMutation = useCreateForumPost();

  const handleSetDescription = useCallback((html: string, plain?: string) => {
    setDescription(html);
    if (plain !== undefined) {
      setPlainText(plain);
    } else {
      const extracted = html
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/\s+/g, " ")
        .trim();
      setPlainText(extracted);
    }
  }, []);

  const resetForm = useCallback(() => {
    setTitle("");
    setDescription("");
    setPlainText("");
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
        visibilityTime: 4000,
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
          setIsComposeVisible(false);
          resetForm();
          options?.onSuccess?.();

          // Show success toast on root screen after modal dismissal transition
          setTimeout(() => {
            Toast.show({
              type: "success",
              text1: "Question Published!",
              text2: "Your question has been posted to the campus forum.",
              visibilityTime: 4000,
            });
          }, 350);
        },
        onError: (err: any) => {
          const errorMessage =
            err.response?.data?.message ||
            err.response?.data?.error ||
            err.message ||
            "Failed to publish question. Please check your connection and try again.";

          Toast.show({
            type: "error",
            text1: "Failed to Post",
            text2: errorMessage,
            visibilityTime: 4000,
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
    setDescription: handleSetDescription,
    plainText,
    isSubmitting: createPostMutation.isPending,
    handleSubmit,
    resetForm,
  };
}
