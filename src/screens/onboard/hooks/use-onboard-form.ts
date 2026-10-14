import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import Toast from "react-native-toast-message";

import {
  onboardStudentAPI,
  updateInitialProfileImageAPI,
} from "@/services/auth-service";
import { updateStudentProfile } from "@/services/student-service";
import type {
  AcademicProgram,
  OnboardFormData,
  OnboardFormField,
} from "../types";
import { sanitizeOnboardForm, parseOnboardApiError } from "../utils";

export function useOnboardForm() {
  const router = useRouter();
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
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>("image/jpeg");

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
        quality: 0.7,
        base64: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];

      // Strict size limit: must be lower than 3 MB (3 * 1024 * 1024 = 3,145,728 bytes)
      const MAX_BYTES = 3 * 1024 * 1024;
      let fileSize = asset.fileSize;

      if (fileSize === undefined || fileSize === null) {
        try {
          const fileInfo = await FileSystem.getInfoAsync(asset.uri);
          if (fileInfo.exists && typeof fileInfo.size === "number") {
            fileSize = fileInfo.size;
          }
        } catch {
          if (asset.base64) {
            fileSize = Math.ceil((asset.base64.length * 3) / 4);
          }
        }
      }

      if (fileSize && fileSize >= MAX_BYTES) {
        const sizeMb = (fileSize / (1024 * 1024)).toFixed(1);
        Toast.show({
          type: "error",
          text1: "Image Too Large",
          text2: `Selected photo is ${sizeMb} MB. Profile picture must be smaller than 3 MB.`,
          visibilityTime: 4500,
        });
        return;
      }

      setImageUri(asset.uri);
      setImageBase64(asset.base64 || null);
      setImageMimeType(asset.mimeType || "image/jpeg");
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
      imageBase64,
      imageMimeType,
    };

    // 1. Mandatory Fields Validation (No optional fields allowed)
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

      // 2. Onboard primary student record
      await onboardStudentAPI(validated.payload);

      // 3. Update secondary attributes (phone number is mandatory, blood group is optional)
      const secondaryUpdates: Record<string, any> = {
        phoneNumber: validated.phoneNumber,
      };
      if (validated.bloodGroup) {
        secondaryUpdates.bloodGroup = validated.bloodGroup;
      }

      try {
        await updateStudentProfile(secondaryUpdates);
      } catch (secErr: any) {
        console.warn("[Onboard] Secondary student profile update notice:", secErr);
      }

      // 4. Upload initial profile photo to Cloudinary
      if (imageUri) {
        try {
          await updateInitialProfileImageAPI(imageUri, imageBase64);
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
    imageBase64,
    imageMimeType,
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
