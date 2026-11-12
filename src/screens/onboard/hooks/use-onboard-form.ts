import { useState, useRef, useEffect, useCallback } from "react";
import { Platform } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import Toast from "react-native-toast-message";

import { useNetworkStatus } from "@/hooks/use-network-status";
import {
  useOnboardStudent,
  useUpdateInitialProfileImage,
} from "@/features/auth/useAuth";
import { setStoredOnboardingState } from "@/services/session-storage";
import type {
  AcademicProgram,
  OnboardFormData,
  OnboardFormField,
} from "../types";
import { sanitizeOnboardForm, parseOnboardApiError } from "../utils";

const MAX_AVATAR_BYTES = 3 * 1024 * 1024; // 3 MB
const COMPRESS_QUALITY = 0.65;

export function useOnboardForm() {
  const router = useRouter();
  const { isOnline } = useNetworkStatus();
  const onboardMutation = useOnboardStudent();
  const updateImageMutation = useUpdateInitialProfileImage();
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const [studentId, setStudentId] = useState("");
  const [faculty, setFaculty] = useState("");
  const [department, setDepartment] = useState("");
  const [program, setProgram] = useState("");
  const [batch, setBatch] = useState("");
  const [currentSemester, setCurrentSemester] = useState("");
  const [section, setSection] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [bloodGroup, setBloodGroup] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);

  const [errorField, setErrorField] = useState<OnboardFormField | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProgramModalVisible, setProgramModalVisible] = useState(false);
  const [isBloodGroupModalVisible, setBloodGroupModalVisible] = useState(false);

  // Wrapped field setters that auto-clear error highlight upon modification
  const handleStudentIdChange = useCallback(
    (text: string) => {
      setStudentId(text);
      if (errorField === "studentId") setErrorField(null);
    },
    [errorField]
  );

  const handleBatchChange = useCallback(
    (text: string) => {
      setBatch(text);
      if (errorField === "batch") setErrorField(null);
    },
    [errorField]
  );

  const handleSemesterChange = useCallback(
    (text: string) => {
      setCurrentSemester(text);
      if (errorField === "currentSemester") setErrorField(null);
    },
    [errorField]
  );

  const handleSectionChange = useCallback(
    (text: string) => {
      setSection(text);
      if (errorField === "section") setErrorField(null);
    },
    [errorField]
  );

  const handlePhoneNumberChange = useCallback(
    (text: string) => {
      setPhoneNumber(text);
      if (errorField === "phoneNumber") setErrorField(null);
    },
    [errorField]
  );

  const pickImage = useCallback(async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Toast.show({
          type: "error",
          text1: "Permission Denied",
          text2:
            "Photo library access is required to select a profile picture. Please enable it in device settings.",
          visibilityTime: 4000,
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: COMPRESS_QUALITY,
        base64: false,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const rawAsset = result.assets[0];

      let fileSize: number | undefined =
        typeof rawAsset.fileSize === "number" && rawAsset.fileSize > 0
          ? rawAsset.fileSize
          : undefined;

      if (!fileSize && Platform.OS !== "web") {
        try {
          const fileInfo = await FileSystem.getInfoAsync(rawAsset.uri);
          if (fileInfo.exists && typeof fileInfo.size === "number") {
            fileSize = fileInfo.size;
          }
        } catch {
          // Non-fatal fallback
        }
      } else if (!fileSize && Platform.OS === "web" && typeof fetch === "function") {
        try {
          const blob = await fetch(rawAsset.uri).then((res) => res.blob());
          if (typeof blob.size === "number") {
            fileSize = blob.size;
          }
        } catch {
          // Non-fatal fallback
        }
      }

      if (fileSize && fileSize >= MAX_AVATAR_BYTES) {
        const sizeMb = (fileSize / (1024 * 1024)).toFixed(1);
        Toast.show({
          type: "error",
          text1: "Image Too Large",
          text2: `Selected photo is ${sizeMb} MB after compression. Profile picture must be smaller than 3 MB.`,
          visibilityTime: 4500,
        });
        return;
      }

      setImageUri(rawAsset.uri);
      if (errorField === "image") {
        setErrorField(null);
      }
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Image Selection Error",
        text2: err?.message || "Could not select photo. Please try again.",
        visibilityTime: 4000,
      });
    }
  }, [errorField]);

  const handleSelectProgram = useCallback(
    (selected: AcademicProgram) => {
      setProgram(selected.name);
      setFaculty(selected.faculty);
      setDepartment(selected.department);
      setProgramModalVisible(false);
      if (errorField === "program") {
        setErrorField(null);
      }
    },
    [errorField]
  );

  const handleSelectBloodGroup = useCallback(
    (value: string) => {
      setBloodGroup(value);
      setBloodGroupModalVisible(false);
      if (errorField === "bloodGroup") {
        setErrorField(null);
      }
    },
    [errorField]
  );

  const handleCompleteProfile = useCallback(async () => {
    if (!isOnline) {
      Toast.show({
        type: "error",
        text1: "No Internet Connection",
        text2: "Please connect to the internet before completing your profile.",
      });
      return;
    }

    const formData: OnboardFormData = {
      studentId,
      faculty,
      department,
      program,
      batch,
      currentSemester,
      section,
      bloodGroup,
      phoneNumber,
      imageUri,
    };

    // 1. Mandatory Fields Validation
    const validated = sanitizeOnboardForm(formData);
    if (validated.error) {
      setErrorField(validated.error.field);
      Toast.show({
        type: "error",
        text1: validated.error.title,
        text2: validated.error.message,
        visibilityTime: 4000,
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorField(null);

      // 2. Atomically onboard student academic profile + phoneNumber + bloodGroup
      await onboardMutation.mutateAsync(validated.payload);
      await setStoredOnboardingState(true);

      // 3. Upload compressed initial profile photo to Cloudinary via multipart FormData
      if (imageUri) {
        try {
          await updateImageMutation.mutateAsync(imageUri);
        } catch (uploadErr: any) {
          console.warn("[Onboard] Profile image upload issue:", uploadErr);
          const parsedImgErr = parseOnboardApiError(uploadErr);
          Toast.show({
            type: "info",
            text1: "Profile Created (Photo Pending)",
            text2:
              parsedImgErr.message ||
              "Your profile setup completed! Your photo could not be uploaded right now, but you can add it anytime in profile settings.",
            visibilityTime: 5000,
          });
          if (isMounted.current) {
            router.replace("/(tabs)");
          }
          return;
        }
      }

      Toast.show({
        type: "success",
        text1: "Profile Completed!",
        text2: "Welcome to SMUCT UniCompanion!",
        visibilityTime: 3000,
      });
      if (isMounted.current) {
        router.replace("/(tabs)");
      }
    } catch (error: any) {
      const parsed = parseOnboardApiError(error);
      Toast.show({
        type: "error",
        text1: parsed.title,
        text2: parsed.message,
        visibilityTime: 4500,
      });

      // Smart redirection for edge cases
      if (parsed.isAlreadyOnboarded) {
        await setStoredOnboardingState(true);
        setTimeout(() => {
          if (isMounted.current) router.replace("/(tabs)");
        }, 1500);
      } else if (parsed.isSessionExpired) {
        setTimeout(() => {
          if (isMounted.current) router.replace("/(auth)/login");
        }, 1500);
      }
    } finally {
      if (isMounted.current) {
        setIsSubmitting(false);
      }
    }
  }, [
    isOnline,
    studentId,
    faculty,
    department,
    program,
    batch,
    currentSemester,
    section,
    bloodGroup,
    phoneNumber,
    imageUri,
    onboardMutation,
    updateImageMutation,
    router,
  ]);

  return {
    studentId,
    setStudentId,
    handleStudentIdChange,
    faculty,
    department,
    program,
    batch,
    setBatch,
    handleBatchChange,
    currentSemester,
    setCurrentSemester,
    handleSemesterChange,
    section,
    setSection,
    handleSectionChange,
    phoneNumber,
    setPhoneNumber,
    handlePhoneNumberChange,
    bloodGroup,
    imageUri,
    errorField,
    isSubmitting,
    isProgramModalVisible,
    setProgramModalVisible,
    isBloodGroupModalVisible,
    setBloodGroupModalVisible,
    pickImage,
    handleSelectProgram,
    handleSelectBloodGroup,
    handleCompleteProfile,
  };
}
