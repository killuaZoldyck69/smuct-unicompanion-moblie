import { useState, useEffect, useCallback } from "react";
import { TeacherProfileData, UpdateTeacherProfileInput } from "@/services/teacher-service";
import { BLOOD_GROUP_TO_UI, BLOOD_GROUP_TO_DB } from "../constants";

export interface TeacherFormData {
  designation: string;
  department: string;
  faculty: string;
  officeRoom: string;
  consultationHours: string;
  phoneNumber: string;
  bloodGroup: string;
  expertiseFields: string[];
  academicQualifications: Record<string, string>;
  linkedInUrl: string;
  personalWebsiteUrl: string;
}

export function useTeacherProfileForm(
  profile: TeacherProfileData | null | undefined,
  onSave: (payload: UpdateTeacherProfileInput, onSuccess: () => void) => void
) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<TeacherFormData>({
    designation: "",
    department: "",
    faculty: "",
    officeRoom: "",
    consultationHours: "",
    phoneNumber: "",
    bloodGroup: "",
    expertiseFields: [],
    academicQualifications: {},
    linkedInUrl: "",
    personalWebsiteUrl: "",
  });

  const resetForm = useCallback(() => {
    if (!profile) return;

    let parsedQuals: Record<string, string> = {};
    if (
      typeof (profile as any).academicQualifications === "object" &&
      (profile as any).academicQualifications !== null &&
      !Array.isArray((profile as any).academicQualifications)
    ) {
      parsedQuals = (profile as any).academicQualifications as Record<string, string>;
    } else if (Array.isArray(profile.education)) {
      profile.education.forEach((item) => {
        if (typeof item === "string") {
          const parts = item.split(" - ");
          if (parts.length >= 2) {
            parsedQuals[parts[0].trim()] = parts.slice(1).join(" - ").trim();
          } else {
            parsedQuals[item.trim()] = "Completed";
          }
        }
      });
    }

    setFormData({
      designation: profile.designation || "",
      department: profile.department || "",
      faculty: profile.faculty || "",
      officeRoom: profile.roomNumber || (profile as any).officeRoom || (profile as any).roomNo || "",
      consultationHours: (profile as any).consultationHours || (profile as any).officeHours || "",
      phoneNumber: profile.phoneNumber || profile.phone || "",
      bloodGroup: profile.bloodGroup ? BLOOD_GROUP_TO_UI[profile.bloodGroup] || "" : "",
      expertiseFields: (profile as any).expertiseFields || profile.researchInterests || [],
      academicQualifications: parsedQuals,
      linkedInUrl: profile.linkedInUrl || profile.linkedinUrl || "",
      personalWebsiteUrl: profile.personalWebsiteUrl || profile.websiteUrl || "",
    });
  }, [profile]);

  useEffect(() => {
    resetForm();
  }, [resetForm, isEditing]);

  const updateField = useCallback(
    <K extends keyof TeacherFormData>(key: K, value: TeacherFormData[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const addExpertise = useCallback(
    (field: string) => {
      const clean = field.trim().slice(0, 35);
      if (!clean || formData.expertiseFields.length >= 25) return;
      if (!formData.expertiseFields.some((f) => f.toLowerCase() === clean.toLowerCase())) {
        setFormData((prev) => ({
          ...prev,
          expertiseFields: [...prev.expertiseFields, clean],
        }));
      }
    },
    [formData.expertiseFields]
  );

  const removeExpertise = useCallback((field: string) => {
    setFormData((prev) => ({
      ...prev,
      expertiseFields: prev.expertiseFields.filter((f) => f !== field),
    }));
  }, []);

  const addQualification = useCallback((degree: string, inst: string) => {
    const cleanDegree = degree.trim().slice(0, 40);
    const cleanInst = inst.trim().slice(0, 60);
    if (!cleanDegree || !cleanInst) return;

    setFormData((prev) => ({
      ...prev,
      academicQualifications: {
        ...prev.academicQualifications,
        [cleanDegree]: cleanInst,
      },
    }));
  }, []);

  const removeQualification = useCallback((degree: string) => {
    setFormData((prev) => {
      const next = { ...prev.academicQualifications };
      delete next[degree];
      return { ...prev, academicQualifications: next };
    });
  }, []);

  const handleCancel = useCallback(() => {
    resetForm();
    setIsEditing(false);
  }, [resetForm]);

  const handleSave = useCallback(() => {
    if (!profile) return;
    const payload: UpdateTeacherProfileInput = {};

    const cleanDesignation = formData.designation.trim();
    if (cleanDesignation !== (profile.designation || "")) {
      payload.designation = cleanDesignation;
    }

    const cleanDept = formData.department.trim();
    if (cleanDept !== (profile.department || "")) {
      payload.department = cleanDept;
    }

    const cleanFaculty = formData.faculty.trim();
    if (cleanFaculty && cleanFaculty !== (profile.faculty || "")) {
      payload.faculty = cleanFaculty;
    }

    const cleanRoom = formData.officeRoom.trim();
    const currentRoom = profile.roomNumber || (profile as any)?.officeRoom || "";
    if (cleanRoom !== currentRoom) {
      payload.roomNumber = cleanRoom;
      payload.roomNo = cleanRoom;
    }

    const cleanHours = formData.consultationHours.trim();
    const currentHours = (profile as any)?.consultationHours || (profile as any)?.officeHours || "";
    if (cleanHours !== currentHours) {
      payload.consultationHours = cleanHours;
    }

    const cleanPhone = formData.phoneNumber.trim();
    if (cleanPhone !== (profile.phoneNumber || profile.phone || "")) {
      payload.phoneNumber = cleanPhone;
      payload.phone = cleanPhone;
    }

    if (formData.bloodGroup) {
      const dbBlood = BLOOD_GROUP_TO_DB[formData.bloodGroup];
      if (dbBlood && dbBlood !== profile.bloodGroup) {
        payload.bloodGroup = dbBlood;
      }
    }

    const currentExpertise = (profile as any)?.expertiseFields || profile.researchInterests || [];
    const isExpertiseChanged =
      formData.expertiseFields.length !== currentExpertise.length ||
      formData.expertiseFields.some((f, i) => f !== currentExpertise[i]);
    if (isExpertiseChanged) {
      payload.researchInterests = formData.expertiseFields;
    }

    // Qualifications mapping
    const qualEntries = Object.entries(formData.academicQualifications);
    const educationArray = qualEntries.map(([d, i]) => `${d} - ${i}`);
    payload.education = educationArray;

    const cleanLinkedIn = formData.linkedInUrl.trim();
    if (cleanLinkedIn !== (profile.linkedInUrl || profile.linkedinUrl || "")) {
      payload.linkedInUrl = cleanLinkedIn;
      payload.linkedinUrl = cleanLinkedIn;
    }

    const cleanWebsite = formData.personalWebsiteUrl.trim();
    if (cleanWebsite !== (profile.personalWebsiteUrl || profile.websiteUrl || "")) {
      payload.personalWebsiteUrl = cleanWebsite;
      payload.websiteUrl = cleanWebsite;
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
    addExpertise,
    removeExpertise,
    addQualification,
    removeQualification,
    handleCancel,
    handleSave,
  };
}
