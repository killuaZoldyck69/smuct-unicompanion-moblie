import { Alert } from "react-native";
import { useState, useEffect, useCallback } from "react";
import { StudentProfileData, UpdateStudentProfileInput } from "@/services/student-service";
import { BLOOD_GROUP_TO_UI, BLOOD_GROUP_TO_DB } from "../constants";
import {
  areStringListsEqual,
  normalizeBangladeshPhone,
  normalizeSafeHttpUrl,
  resolveBdPhoneUpdate,
} from "../profile-form-logic";

export interface StudentFormData {
  phoneNumber: string;
  bloodGroup: string;
  currentSemester: string;
  section: string;
  currentTerm: string;
  skills: string[];
  linkedInUrl: string;
  personalWebsiteUrl: string;
}

export function useStudentProfileForm(
  profile: StudentProfileData | null | undefined,
  onSave: (payload: UpdateStudentProfileInput, onSuccess: () => void) => void
) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<StudentFormData>({
    phoneNumber: "",
    bloodGroup: "",
    currentSemester: "",
    section: "",
    currentTerm: "",
    skills: [],
    linkedInUrl: "",
    personalWebsiteUrl: "",
  });

  const resetForm = useCallback(() => {
    if (!profile) return;
    setFormData({
      phoneNumber: normalizeBangladeshPhone(profile.phoneNumber),
      bloodGroup: profile.bloodGroup ? BLOOD_GROUP_TO_UI[profile.bloodGroup] || "" : "",
      currentSemester: profile.currentSemester ? String(profile.currentSemester) : "",
      section: profile.section || "",
      currentTerm: profile.currentTerm || "",
      skills: profile.skills ? [...profile.skills] : [],
      linkedInUrl: profile.linkedInUrl || "",
      personalWebsiteUrl: profile.personalWebsiteUrl || "",
    });
  }, [profile]);

  useEffect(() => {
    resetForm();
  }, [resetForm, isEditing]);

  const updateField = useCallback(
    <K extends keyof StudentFormData>(key: K, value: StudentFormData[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const addSkill = useCallback(
    (rawSkill: string) => {
      const clean = rawSkill.trim().slice(0, 30);
      if (!clean || formData.skills.length >= 25) return;
      if (!formData.skills.some((s) => s.toLowerCase() === clean.toLowerCase())) {
        setFormData((prev) => ({ ...prev, skills: [...prev.skills, clean] }));
      }
    },
    [formData.skills]
  );

  const removeSkill = useCallback((skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  }, []);

  const handleCancel = useCallback(() => {
    resetForm();
    setIsEditing(false);
  }, [resetForm]);

  const handleSave = useCallback(() => {
    if (!profile) return;
    const payload: UpdateStudentProfileInput = {};

    const phoneResolution = resolveBdPhoneUpdate(formData.phoneNumber, profile.phoneNumber);
    if (phoneResolution.changed) {
      if (!phoneResolution.valid) {
        Alert.alert(
          "Invalid phone number",
          "Enter all 10 digits after the +880 country code, or leave blank to clear."
        );
        return;
      }
      payload.phoneNumber = phoneResolution.value;
    }

    const cleanSection = formData.section.trim().toUpperCase().slice(0, 4);
    if (cleanSection !== (profile.section || "")) {
      payload.section = cleanSection;
    }

    const cleanTerm = formData.currentTerm.trim();
    if (cleanTerm !== (profile.currentTerm || "")) {
      payload.currentTerm = cleanTerm;
    }

    const digitsOnly = formData.currentSemester.replace(/\D/g, "");
    if (digitsOnly) {
      const parsedSemester = Math.min(12, Math.max(1, parseInt(digitsOnly, 10)));
      if (parsedSemester !== profile.currentSemester) {
        payload.currentSemester = parsedSemester;
      }
    }

    if (formData.bloodGroup) {
      const dbBlood = BLOOD_GROUP_TO_DB[formData.bloodGroup];
      if (dbBlood && dbBlood !== profile.bloodGroup) {
        payload.bloodGroup = dbBlood;
      }
    }

    if (!areStringListsEqual(formData.skills, profile.skills)) {
      payload.skills = formData.skills.map((s) => s.trim()).filter(Boolean);
    }

    if (formData.linkedInUrl.trim() !== (profile.linkedInUrl || "")) {
      const normalizedLinkedIn = normalizeSafeHttpUrl(formData.linkedInUrl);
      if (normalizedLinkedIn === null) {
        Alert.alert("Invalid LinkedIn URL", "Enter a valid http:// or https:// web address.");
        return;
      }
      payload.linkedInUrl = normalizedLinkedIn;
    }

    if (formData.personalWebsiteUrl.trim() !== (profile.personalWebsiteUrl || "")) {
      const normalizedWebsite = normalizeSafeHttpUrl(formData.personalWebsiteUrl);
      if (normalizedWebsite === null) {
        Alert.alert("Invalid Website URL", "Enter a valid http:// or https:// web address.");
        return;
      }
      payload.personalWebsiteUrl = normalizedWebsite;
    }

    if (Object.keys(payload).length === 0) {
      setIsEditing(false);
      return;
    }

    onSave(payload, () => setIsEditing(false));
  }, [formData, profile, onSave]);

  return {
    isEditing,
    setIsEditing,
    formData,
    updateField,
    addSkill,
    removeSkill,
    handleCancel,
    handleSave,
  };
}
