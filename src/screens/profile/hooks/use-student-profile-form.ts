import { useState, useEffect, useCallback } from "react";
import { StudentProfileData, UpdateStudentProfileInput } from "@/services/student-service";
import { BLOOD_GROUP_TO_UI, BLOOD_GROUP_TO_DB } from "../constants";

export interface StudentFormData {
  phoneNumber: string;
  bloodGroup: string;
  currentSemester: string;
  section: string;
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
    skills: [],
    linkedInUrl: "",
    personalWebsiteUrl: "",
  });

  const resetForm = useCallback(() => {
    if (!profile) return;
    setFormData({
      phoneNumber: profile.phoneNumber || "",
      bloodGroup: profile.bloodGroup ? BLOOD_GROUP_TO_UI[profile.bloodGroup] || "" : "",
      currentSemester: profile.currentSemester ? String(profile.currentSemester) : "",
      section: profile.section || "",
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

    const cleanPhone = formData.phoneNumber.trim();
    if (cleanPhone !== (profile.phoneNumber || "")) {
      payload.phoneNumber = cleanPhone;
    }

    const cleanSection = formData.section.trim().toUpperCase().slice(0, 4);
    if (cleanSection !== (profile.section || "")) {
      payload.section = cleanSection;
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

    const originalSkills = profile.skills || [];
    const isSkillsChanged =
      formData.skills.length !== originalSkills.length ||
      formData.skills.some((s, i) => s !== originalSkills[i]);
    if (isSkillsChanged) {
      payload.skills = formData.skills;
    }

    const cleanLinkedIn = formData.linkedInUrl.trim();
    if (cleanLinkedIn !== (profile.linkedInUrl || "")) {
      payload.linkedInUrl = cleanLinkedIn;
    }

    const cleanWebsite = formData.personalWebsiteUrl.trim();
    if (cleanWebsite !== (profile.personalWebsiteUrl || "")) {
      payload.personalWebsiteUrl = cleanWebsite;
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
