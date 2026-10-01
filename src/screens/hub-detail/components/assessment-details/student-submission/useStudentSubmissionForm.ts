import { useState, useEffect, useCallback, useMemo } from "react";
import Toast from "react-native-toast-message";
import * as DocumentPicker from "expo-document-picker";

import {
  AssessmentData,
  AssessmentSubmission,
  AssessmentAttachment,
} from "../types";
import {
  ALLOWED_FILE_EXTENSIONS,
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_COUNT,
} from "../utils";
import { uploadMultipleFilesToCloudinary } from "@/services/cloudinary-service";
import {
  SubmissionLink,
  SubmissionMethod,
  ActiveDrawerType,
  StudentSubmissionPayload,
} from "./types";

interface UseStudentSubmissionFormProps {
  assessment: AssessmentData;
  mySub?: AssessmentSubmission;
  isSubmitting: boolean;
  onSubmit: (payload: StudentSubmissionPayload) => void;
}

/**
 * Sanitizes and validates a user-provided URL.
 * Rejects malicious schemes (javascript:, data:, vbscript:) and ensures http(s) protocol.
 */
function sanitizeAndValidateUrl(inputUrl: string): { isValid: boolean; url: string; error?: string } {
  const trimmed = inputUrl.trim();
  if (!trimmed) {
    return { isValid: false, url: "", error: "URL cannot be empty." };
  }

  // Prevent XSS schemes
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("file:")
  ) {
    return { isValid: false, url: "", error: "Invalid or unsafe URL scheme." };
  }

  // Prepend https:// if no scheme provided
  const formatted =
    lower.startsWith("http://") || lower.startsWith("https://")
      ? trimmed
      : `https://${trimmed}`;

  // Basic structure check
  try {
    const parsed = new URL(formatted);
    if (!parsed.hostname || !parsed.hostname.includes(".")) {
      return { isValid: false, url: "", error: "Please enter a valid web domain." };
    }
    return { isValid: true, url: formatted };
  } catch {
    return { isValid: false, url: "", error: "Invalid URL format." };
  }
}

export function useStudentSubmissionForm({
  assessment,
  mySub,
  isSubmitting,
  onSubmit,
}: UseStudentSubmissionFormProps) {
  // Method State: ONLINE vs OFFLINE
  const [submissionMethod, setSubmissionMethod] = useState<SubmissionMethod>("ONLINE");

  // Submission Data State
  const [files, setFiles] = useState<AssessmentAttachment[]>([]);
  const [links, setLinks] = useState<SubmissionLink[]>([]);
  const [noteContent, setNoteContent] = useState("");

  // Drawers State
  const [activeDrawer, setActiveDrawer] = useState<ActiveDrawerType>(null);
  const [tempLinkUrl, setTempLinkUrl] = useState("");
  const [tempLinkTitle, setTempLinkTitle] = useState("");
  const [tempNoteText, setTempNoteText] = useState("");
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);

  // Synchronize initial data from existing submission or assessment defaults
  useEffect(() => {
    if (mySub) {
      if (mySub.status === "HAND_SUBMISSION") {
        setSubmissionMethod("OFFLINE");
      } else {
        setSubmissionMethod("ONLINE");
      }

      if (Array.isArray(mySub.attachments) && mySub.attachments.length > 0) {
        setFiles(mySub.attachments);
      }

      if (mySub.submittedUrl) {
        setLinks([{ title: "Submitted Link", url: mySub.submittedUrl }]);
      }

      if (mySub.content) {
        setNoteContent(mySub.content);
      }
    } else if (assessment.submissionType === "HAND" || assessment.submissionType === "OFFLINE") {
      setSubmissionMethod("OFFLINE");
    }
  }, [mySub, assessment.submissionType]);

  // Pick & Upload Files with Security & Size Validation
  const handlePickFiles = useCallback(async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (res.canceled || !res.assets || res.assets.length === 0) return;

      // 1. Check total file count limit
      if (files.length + res.assets.length > MAX_FILE_COUNT) {
        Toast.show({
          type: "error",
          text1: "File Limit Reached",
          text2: `You can upload up to ${MAX_FILE_COUNT} files total.`,
        });
        return;
      }

      // 2. Validate individual files (size + extension whitelist)
      const validAssets: DocumentPicker.DocumentPickerAsset[] = [];
      for (const asset of res.assets) {
        if (asset.size && asset.size > MAX_FILE_SIZE_BYTES) {
          Toast.show({
            type: "error",
            text1: "File Too Large",
            text2: `"${asset.name}" exceeds the 10MB limit.`,
          });
          return;
        }

        const ext = asset.name.split(".").pop()?.toLowerCase();
        if (!ext || !ALLOWED_FILE_EXTENSIONS.includes(ext)) {
          Toast.show({
            type: "error",
            text1: "Unsupported File Format",
            text2: `"${asset.name}" is not an allowed type.`,
          });
          return;
        }

        validAssets.push(asset);
      }

      if (validAssets.length === 0) return;

      setIsUploadingFiles(true);
      const uploaded = await uploadMultipleFilesToCloudinary(
        validAssets.map((asset) => ({
          uri: asset.uri,
          name: asset.name,
          mimeType: asset.mimeType || undefined,
          size: asset.size || undefined,
        }))
      );

      setFiles((prev) => [
        ...prev,
        ...uploaded.map((u) => ({
          name: u.name,
          url: u.secureUrl,
          size: u.size,
          type: u.type,
        })),
      ]);

      Toast.show({ type: "success", text1: "Files Attached Successfully!" });
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Upload Failed",
        text2: err.message || "Failed to upload file",
      });
    } finally {
      setIsUploadingFiles(false);
    }
  }, [files.length]);

  // Remove handlers
  const handleRemoveFile = useCallback((idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const handleRemoveLink = useCallback((idx: number) => {
    setLinks((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const handleRemoveNote = useCallback(() => {
    setNoteContent("");
  }, []);

  // Add Link with sanitized validation
  const handleSaveLink = useCallback(() => {
    const { isValid, url, error } = sanitizeAndValidateUrl(tempLinkUrl);
    if (!isValid) {
      Toast.show({
        type: "error",
        text1: "Invalid Link",
        text2: error || "Please enter a valid URL.",
      });
      return;
    }

    setLinks((prev) => [
      ...prev,
      {
        title: tempLinkTitle.trim() || url,
        url,
      },
    ]);
    setTempLinkUrl("");
    setTempLinkTitle("");
    setActiveDrawer(null);
  }, [tempLinkUrl, tempLinkTitle]);

  // Save Text Note
  const handleSaveNote = useCallback(() => {
    setNoteContent(tempNoteText.trim());
    setActiveDrawer(null);
  }, [tempNoteText]);

  // Open text drawer
  const handleOpenTextDrawer = useCallback(() => {
    setTempNoteText(noteContent);
    setActiveDrawer((prev) => (prev === "TEXT" ? null : "TEXT"));
  }, [noteContent]);

  // Deadline & policy status computations
  const isOverdue = useMemo(() => {
    return Boolean(
      assessment.deadline &&
        new Date().getTime() > new Date(assessment.deadline).getTime()
    );
  }, [assessment.deadline]);

  const allowLate = Boolean(assessment.allowLateSubmission);
  const isClosed = isOverdue && !allowLate;
  const isLateActive = isOverdue && allowLate;

  // Submit Action with security guard
  const handleFormSubmit = useCallback(() => {
    if (isClosed) {
      Toast.show({
        type: "error",
        text1: "Submissions Closed",
        text2: "The deadline for this coursework has passed and late submissions are not allowed.",
      });
      return;
    }

    const isLate = isOverdue;

    if (submissionMethod === "OFFLINE") {
      onSubmit({
        status: "HAND_SUBMISSION",
        isLate,
      });
      return;
    }

    onSubmit({
      submittedUrl: links.length > 0 ? links[0].url : undefined,
      content: noteContent || undefined,
      attachments: files.length > 0 ? files : undefined,
      links: links.length > 0 ? links : undefined,
      status: "SUBMITTED",
      isLate,
    });
  }, [isClosed, isOverdue, submissionMethod, links, noteContent, files, onSubmit]);

  const isOnlineEmpty = useMemo(() => {
    return (
      submissionMethod === "ONLINE" &&
      files.length === 0 &&
      links.length === 0 &&
      !noteContent.trim()
    );
  }, [submissionMethod, files.length, links.length, noteContent]);

  const isSubmitDisabled =
    isClosed || isSubmitting || isUploadingFiles || isOnlineEmpty;

  const hasResources = useMemo(() => {
    return Boolean(
      (Array.isArray(assessment.attachments) && assessment.attachments.length > 0) ||
      (Array.isArray(assessment.links) && assessment.links.length > 0)
    );
  }, [assessment.attachments, assessment.links]);

  return {
    submissionMethod,
    setSubmissionMethod,
    files,
    links,
    noteContent,
    activeDrawer,
    setActiveDrawer,
    tempLinkUrl,
    setTempLinkUrl,
    tempLinkTitle,
    setTempLinkTitle,
    tempNoteText,
    setTempNoteText,
    isUploadingFiles,
    isOverdue,
    allowLate,
    isClosed,
    isLateActive,
    isSubmitDisabled,
    hasResources,
    handlePickFiles,
    handleRemoveFile,
    handleRemoveLink,
    handleRemoveNote,
    handleSaveLink,
    handleSaveNote,
    handleOpenTextDrawer,
    handleFormSubmit,
  };
}
