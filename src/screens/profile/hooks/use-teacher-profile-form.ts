import { Alert } from "react-native";
import { useState, useEffect, useCallback } from "react";
import {
  TeacherProfileData,
  UpdateTeacherProfileInput,
  ConsultationSlot,
} from "@/services/teacher-service";
import { BLOOD_GROUP_TO_UI, BLOOD_GROUP_TO_DB } from "../constants";
import { SMUCT_PROGRAM_DEPARTMENTS } from "@/data/programs";
import {
  areConsultationSlotsEqual,
  areQualificationRecordsEqual,
  areStringListsEqual,
  findIncompleteConsultationSlotIndex,
  normalizeBangladeshPhone,
  normalizeSafeHttpUrl,
  resolveBdPhoneUpdate,
  serializeQualificationRecord,
  toQualificationRecord,
} from "../profile-form-logic";

export interface TeacherFormData {
  department: string;
  faculty: string;
  officeRoom: string;
  advisoryBatch: string;
  dayOff: string;
  consultationSlots: ConsultationSlot[];
  phoneNumber: string;
  bloodGroup: string;
  expertiseFields: string[];
  academicQualifications: Record<string, string>;
  linkedInUrl: string;
  personalWebsiteUrl: string;
}

const VALID_DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export function useTeacherProfileForm(
  profile: TeacherProfileData | null | undefined,
  onSave: (payload: UpdateTeacherProfileInput, onSuccess: () => void) => void
) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<TeacherFormData>({
    department: "",
    faculty: "",
    officeRoom: "",
    advisoryBatch: "",
    dayOff: "",
    consultationSlots: [],
    phoneNumber: "",
    bloodGroup: "",
    expertiseFields: [],
    academicQualifications: {},
    linkedInUrl: "",
    personalWebsiteUrl: "",
  });

  const resetForm = useCallback(() => {
    if (!profile) return;

    const rawQuals = toQualificationRecord(
      profile.academicQualifications ?? (profile.education as unknown as Record<string, string>)
    );

    const slots: ConsultationSlot[] = Array.isArray(profile.consultationSlots)
      ? profile.consultationSlots.map((s) => ({
          day: s.day || "Sunday",
          startTime: s.startTime || "",
          endTime: s.endTime || "",
        }))
      : [];

    setFormData({
      department: profile.department || "",
      faculty: profile.faculty || "",
      officeRoom: profile.officeRoom || profile.roomNumber || profile.roomNo || "",
      advisoryBatch:
        profile.advisoryBatch !== null && profile.advisoryBatch !== undefined
          ? String(profile.advisoryBatch)
          : "",
      dayOff: profile.dayOff || "",
      consultationSlots: slots,
      phoneNumber: normalizeBangladeshPhone(profile.phoneNumber || profile.phone),
      bloodGroup: profile.bloodGroup ? BLOOD_GROUP_TO_UI[profile.bloodGroup] || "" : "",
      expertiseFields: [
        ...(profile.expertiseFields ?? profile.researchInterests ?? []),
      ],
      academicQualifications: rawQuals,
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

  const addConsultationSlot = useCallback((slot: ConsultationSlot) => {
    setFormData((prev) => ({
      ...prev,
      consultationSlots: [...prev.consultationSlots, slot],
    }));
  }, []);

  const updateConsultationSlot = useCallback(
    (index: number, slotUpdates: Partial<ConsultationSlot>) => {
      setFormData((prev) => {
        const next = [...prev.consultationSlots];
        if (next[index]) {
          next[index] = { ...next[index], ...slotUpdates };
        }
        return { ...prev, consultationSlots: next };
      });
    },
    []
  );

  const removeConsultationSlot = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      consultationSlots: prev.consultationSlots.filter((_, i) => i !== index),
    }));
  }, []);

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

    const cleanDept = formData.department.trim();
    if (cleanDept !== (profile.department || "")) {
      const isAllowedDepartment = SMUCT_PROGRAM_DEPARTMENTS.some(
        (option) => option.name === cleanDept
      );
      if (!isAllowedDepartment) {
        Alert.alert(
          "Invalid department",
          "Choose a department from the university department list."
        );
        return;
      }
      payload.department = cleanDept;
    }

    const cleanFaculty = formData.faculty.trim();
    if (cleanFaculty && cleanFaculty !== (profile.faculty || "")) {
      payload.faculty = cleanFaculty;
    }

    const cleanRoom = formData.officeRoom.trim().replace(/\D/g, "");
    const currentRoom = profile.officeRoom || profile.roomNumber || profile.roomNo || "";
    if (cleanRoom !== currentRoom) {
      payload.officeRoom = cleanRoom;
    }

    const cleanBatch = formData.advisoryBatch.trim();
    const batchNum = cleanBatch ? parseInt(cleanBatch, 10) : null;
    const currentBatch = profile.advisoryBatch ?? null;
    if (batchNum !== null && (isNaN(batchNum) || batchNum <= 0)) {
      Alert.alert("Invalid advisory batch", "Advisory batch must be a positive number.");
      return;
    }
    if (batchNum !== currentBatch) {
      payload.advisoryBatch = batchNum;
    }

    const cleanDayOff = formData.dayOff.trim();
    if (cleanDayOff !== (profile.dayOff || "")) {
      if (
        cleanDayOff !== "" &&
        !VALID_DAYS.includes(cleanDayOff as (typeof VALID_DAYS)[number])
      ) {
        Alert.alert("Invalid day off", "Choose one of the seven days or leave blank.");
        return;
      }
      payload.dayOff = cleanDayOff;
    }

    const incompleteSlotIndex = findIncompleteConsultationSlotIndex(
      formData.consultationSlots
    );
    if (incompleteSlotIndex !== -1) {
      Alert.alert(
        "Incomplete consultation slot",
        `Select both a start time and end time for Slot ${incompleteSlotIndex + 1}, or remove it before saving.`
      );
      return;
    }

    if (!areConsultationSlotsEqual(formData.consultationSlots, profile.consultationSlots)) {
      payload.consultationSlots = formData.consultationSlots;
    }

    const phoneResolution = resolveBdPhoneUpdate(
      formData.phoneNumber,
      profile.phoneNumber || profile.phone
    );
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

    if (formData.bloodGroup) {
      const dbBlood = BLOOD_GROUP_TO_DB[formData.bloodGroup];
      if (dbBlood && dbBlood !== profile.bloodGroup) {
        payload.bloodGroup = dbBlood;
      }
    }

    const originalExpertise = profile.expertiseFields ?? profile.researchInterests ?? [];
    if (!areStringListsEqual(formData.expertiseFields, originalExpertise)) {
      payload.expertiseFields = formData.expertiseFields.map((f) => f.trim()).filter(Boolean);
    }

    const originalQualRecord = toQualificationRecord(
      profile.academicQualifications ?? (profile.education as unknown as Record<string, string>)
    );
    if (!areQualificationRecordsEqual(formData.academicQualifications, originalQualRecord)) {
      payload.academicQualifications = serializeQualificationRecord(
        formData.academicQualifications,
        profile.academicQualifications
      );
    }

    const currentLinkedIn = profile.linkedInUrl || profile.linkedinUrl || "";
    if (formData.linkedInUrl.trim() !== currentLinkedIn) {
      const normalizedLinkedIn = normalizeSafeHttpUrl(formData.linkedInUrl);
      if (normalizedLinkedIn === null) {
        Alert.alert("Invalid LinkedIn URL", "Enter a valid http:// or https:// web address.");
        return;
      }
      payload.linkedInUrl = normalizedLinkedIn;
    }

    const currentWebsite = profile.personalWebsiteUrl || profile.websiteUrl || "";
    if (formData.personalWebsiteUrl.trim() !== currentWebsite) {
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
    addConsultationSlot,
    updateConsultationSlot,
    removeConsultationSlot,
    addExpertise,
    removeExpertise,
    addQualification,
    removeQualification,
    handleCancel,
    handleSave,
  };
}
