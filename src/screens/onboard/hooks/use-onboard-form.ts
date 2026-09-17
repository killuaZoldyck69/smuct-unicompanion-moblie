import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";

import {
  onboardStudentAPI,
  updateInitialProfileImageAPI,
} from "@/services/auth-service";
import { updateStudentProfile } from "@/services/student-service";
import type { AcademicProgram, OnboardFormData } from "../types";
import { sanitizeOnboardForm, uploadAvatarToSupabase } from "../utils";

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

  const [bloodGroup, setBloodGroup] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>("image/jpeg");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProgramModalVisible, setProgramModalVisible] = useState(false);
  const [isBloodGroupModalVisible, setBloodGroupModalVisible] = useState(false);

  const pickImage = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0]?.base64) {
      setImageUri(result.assets[0].uri);
      setImageBase64(result.assets[0].base64);
      setImageMimeType(result.assets[0].mimeType || "image/jpeg");
    }
  }, []);

  const handleSelectProgram = useCallback((selected: AcademicProgram) => {
    setProgram(selected.name);
    setFaculty(selected.faculty);
    setDepartment(selected.department);
    setProgramModalVisible(false);
  }, []);

  const handleSelectBloodGroup = useCallback((value: string) => {
    setBloodGroup(value);
    setBloodGroupModalVisible(false);
  }, []);

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
      imageUri,
      imageBase64,
      imageMimeType,
    };

    const validated = sanitizeOnboardForm(formData);
    if (validated.error) {
      Toast.show({
        type: "error",
        text1: "Incomplete Setup",
        text2: validated.error,
      });
      return;
    }

    try {
      setIsSubmitting(true);
      let finalImageUrl: string | undefined;

      if (imageUri && imageBase64) {
        try {
          finalImageUrl = await uploadAvatarToSupabase(
            validated.payload.studentId,
            imageBase64,
            imageMimeType,
          );
        } catch (uploadErr: any) {
          Toast.show({
            type: "error",
            text1: "Avatar Upload Issue",
            text2: uploadErr.message || "Continuing with profile setup...",
          });
        }
      }

      await onboardStudentAPI(validated.payload);

      if (validated.bloodGroup) {
        try {
          await updateStudentProfile({ bloodGroup: validated.bloodGroup });
        } catch {
          // Non-blocking secondary profile update
        }
      }

      if (finalImageUrl) {
        try {
          await updateInitialProfileImageAPI(finalImageUrl);
        } catch {
          // Non-blocking secondary profile image update
        }
      }

      Toast.show({ type: "success", text1: "Profile Completed!" });
      router.replace("/(tabs)");
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Setup Failed",
        text2:
          error.response?.data?.message ||
          error.message ||
          "Please check your inputs and try again.",
      });
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
    imageUri,
    imageBase64,
    imageMimeType,
    router,
  ]);

  return {
    studentId,
    setStudentId,
    faculty,
    department,
    program,
    batch,
    setBatch,
    currentSemester,
    setCurrentSemester,
    section,
    setSection,
    bloodGroup,
    imageUri,
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
