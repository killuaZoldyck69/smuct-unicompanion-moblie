import { useState, useCallback, useEffect } from "react";
import { BackHandler } from "react-native";
import Toast from "react-native-toast-message";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { useCreateForumPost } from "@/features/forum/useForum";
import { extractApiErrorInfo, sanitizeForumPost } from "@/features/forum/forum-logic";
import {
  useAcceptUgcTerms,
  useUgcTermsStatus,
} from "@/features/ugc/useUgcModeration";

interface UseComposePostFormOptions {
  onSuccess?: () => void;
}

export function useComposePostForm(options?: UseComposePostFormOptions) {
  const { user } = useCurrentUser();
  const { isOffline } = useNetworkStatus();
  const [isComposeVisible, setIsComposeVisible] = useState(false);
  const [isGuidelinesModalVisible, setIsGuidelinesModalVisible] =
    useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [plainText, setPlainText] = useState("");

  const createPostMutation = useCreateForumPost();
  const { data: ugcTermsStatus } = useUgcTermsStatus(user?.id, Boolean(user?.id));
  const acceptTermsMutation = useAcceptUgcTerms(user?.id);

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

  const executePublish = useCallback(
    (payload: { title: string; description: string }) => {
      createPostMutation.mutate(payload, {
        onSuccess: () => {
          setIsComposeVisible(false);
          resetForm();
          options?.onSuccess?.();

          setTimeout(() => {
            Toast.show({
              type: "success",
              text1: "Question Published!",
              text2: "Your question has been posted to the campus forum.",
              visibilityTime: 4000,
            });
          }, 350);
        },
        onError: (err: unknown) => {
          const info = extractApiErrorInfo(
            err,
            "Failed to publish question. Please check your connection and try again.",
          );
          if (info.code === "UGC_TERMS_REQUIRED") {
            setIsGuidelinesModalVisible(true);
            return;
          }

          Toast.show({
            type: "error",
            text1: "Failed to Post",
            text2: info.message,
            visibilityTime: 4000,
          });
        },
      });
    },
    [createPostMutation, resetForm, options],
  );

  const handleSubmit = useCallback(() => {
    if (isOffline) {
      Toast.show({
        type: "error",
        text1: "You're Offline",
        text2: "Connect to the internet before publishing your question.",
        visibilityTime: 4000,
      });
      return;
    }

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

    if (ugcTermsStatus && !ugcTermsStatus.accepted) {
      setIsGuidelinesModalVisible(true);
      return;
    }

    executePublish({
      title: validated.title,
      description: validated.description,
    });
  }, [isOffline, title, description, ugcTermsStatus, executePublish]);

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
        const validated = sanitizeForumPost({ title, description });
        if (!validated.error) {
          executePublish({
            title: validated.title,
            description: validated.description,
          });
        }
      },
      onError: (err: unknown) => {
        const info = extractApiErrorInfo(
          err,
          "Could not save your consent. Please try again.",
        );
        Toast.show({
          type: "error",
          text1: "Consent Failed",
          text2: info.message,
        });
      },
    });
  }, [isOffline, acceptTermsMutation, title, description, executePublish]);

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
    isOffline,
    isSubmitting: createPostMutation.isPending,
    isGuidelinesModalVisible,
    setIsGuidelinesModalVisible,
    isAcceptingGuidelines: acceptTermsMutation.isPending,
    handleAcceptGuidelines,
    handleSubmit,
    resetForm,
  };
}
