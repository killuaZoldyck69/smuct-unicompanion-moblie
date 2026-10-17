import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";
import api from "@/services/api";
import { universityPrograms } from "@/data/programs";
import {
  AddFacultyFormData,
  AddFacultyFormHookReturn,
  ConsultationSlot,
  Qualification,
  SelectorType,
} from "../types";
import {
  DESIGNATIONS,
  COMMON_DAY_OFF_OPTIONS,
} from "../constants";
import {
  sanitizeTeacherId,
  capitalizeWords,
  sanitizeEmail,
  isValidEmail,
  generateDefaultPassword,
  validatePasswordComplexity,
  sanitizeDigitsOnly,
} from "../utils";

// Helper to extract unique faculties
const UNIQUE_FACULTIES = Array.from(
  new Set(universityPrograms.map((p) => p.faculty))
).sort();

// Helper to clean department names
const cleanDepartmentName = (name: string) => {
  return name
    .replace(
      /^(Bachelor|Masters|Master|B\.Sc|BSS|BA|MA|MSS|MBA)\s*(\(Hons\))?\s*(of|in)?\s*/i,
      ""
    )
    .replace(/\s*\(.*\)\s*$/, "")
    .trim();
};

export function useAddFacultyForm(): AddFacultyFormHookReturn {
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const [formData, setFormData] = useState<AddFacultyFormData>({
    teacherId: "",
    name: "",
    email: "",
    password: "",
    faculty: "",
    department: "",
    designation: "",
    officeRoom: "",
    dayOff: "",
    consultationSlots: [],
    advisoryBatch: "",
    expertiseFields: [],
    qualifications: [],
    linkedInUrl: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAvailabilityExpanded, setIsAvailabilityExpanded] = useState(false);
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);

  // Active selector state (for bottom sheet / dropdown modal)
  const [activeSelector, setActiveSelector] = useState<SelectorType>(null);

  // Sub-modals for adding custom slots, qualifications, tags, batch
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [isQualModalOpen, setIsQualModalOpen] = useState(false);
  const [isExpertiseModalOpen, setIsExpertiseModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);

  const isPasswordCustomized = useRef(false);

  // Sanitized field update with password auto-fill
  const updateField = useCallback(
    <K extends keyof AddFacultyFormData>(field: K, value: AddFacultyFormData[K]) => {
      if (field === "teacherId") {
        const sanitizedId = sanitizeTeacherId(value as string);
        setFormData((prev) => {
          const updated = { ...prev, teacherId: sanitizedId };
          if (!isPasswordCustomized.current) {
            const autoPass = generateDefaultPassword(sanitizedId, prev.name);
            if (autoPass) {
              updated.password = autoPass;
            }
          }
          return updated;
        });
        return;
      }

      if (field === "name") {
        const formattedName = capitalizeWords(value as string);
        setFormData((prev) => {
          const updated = { ...prev, name: formattedName };
          if (!isPasswordCustomized.current) {
            const autoPass = generateDefaultPassword(prev.teacherId, formattedName);
            if (autoPass) {
              updated.password = autoPass;
            }
          }
          return updated;
        });
        return;
      }

      if (field === "email") {
        const sanitizedEmailVal = (value as string).toLowerCase().trim();
        setFormData((prev) => ({ ...prev, email: sanitizedEmailVal }));
        return;
      }

      if (field === "password") {
        const passVal = value as string;
        isPasswordCustomized.current = passVal.length > 0;
        setFormData((prev) => ({ ...prev, password: passVal }));
        return;
      }

      if (field === "officeRoom" || field === "advisoryBatch") {
        const digitsOnly = sanitizeDigitsOnly(value as string);
        setFormData((prev) => ({ ...prev, [field]: digitsOnly }));
        return;
      }

      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // Manual trigger to re-auto-fill temporary password
  const regeneratePassword = useCallback(() => {
    const autoPass = generateDefaultPassword(formData.teacherId, formData.name);
    if (!autoPass) {
      Toast.show({
        type: "info",
        text1: "Auto-fill Password",
        text2: "Enter Teacher ID and Full Name to auto-generate password.",
      });
      return;
    }
    isPasswordCustomized.current = false;
    setFormData((prev) => ({ ...prev, password: autoPass }));
    Toast.show({
      type: "success",
      text1: "Password Auto-generated",
      text2: `Generated password: ${autoPass}`,
    });
  }, [formData.teacherId, formData.name]);

  // Filtered departments based on selected faculty
  const departmentOptions = useMemo(() => {
    if (!formData.faculty) {
      return [];
    }
    const progs = universityPrograms.filter((p) => p.faculty === formData.faculty);
    const deps = progs.map((p) => p.department || cleanDepartmentName(p.name));
    return Array.from(new Set(deps)).filter(Boolean).sort();
  }, [formData.faculty]);

  // Selector options routing
  const selectorOptions = useMemo(() => {
    switch (activeSelector) {
      case "faculty":
        return UNIQUE_FACULTIES;
      case "department":
        return departmentOptions;
      case "designation":
        return DESIGNATIONS;
      case "dayOff":
        return COMMON_DAY_OFF_OPTIONS;
      default:
        return [];
    }
  }, [activeSelector, departmentOptions]);

  const selectorTitle = useMemo(() => {
    switch (activeSelector) {
      case "faculty":
        return "Select Faculty";
      case "department":
        return "Select Department";
      case "designation":
        return "Select Designation";
      case "dayOff":
        return "Select Official Day Off";
      default:
        return "";
    }
  }, [activeSelector]);

  const handleSelectOption = useCallback(
    (value: string) => {
      if (!activeSelector) return;
      if (activeSelector === "faculty") {
        if (formData.faculty !== value) {
          setFormData((prev) => ({
            ...prev,
            faculty: value,
            department: "", // reset dependent department
          }));
        }
      } else if (activeSelector === "department") {
        updateField("department", value);
      } else if (activeSelector === "designation") {
        updateField("designation", value);
      } else if (activeSelector === "dayOff") {
        updateField("dayOff", formData.dayOff === value ? "" : value);
      }
      setActiveSelector(null);
    },
    [activeSelector, formData.faculty, formData.dayOff, updateField],
  );

  const openSelector = useCallback(
    (type: SelectorType) => {
      if (type === "department" && !formData.faculty) {
        Toast.show({
          type: "info",
          text1: "Faculty Required",
          text2: "Please select a faculty first to choose its department.",
        });
        return;
      }
      setActiveSelector(type);
    },
    [formData.faculty]
  );

  const closeSelectorModal = useCallback(() => {
    setActiveSelector(null);
  }, []);

  // Consultation slots management
  const addConsultationSlot = useCallback(
    (slot: Omit<ConsultationSlot, "id">) => {
      const newSlot: ConsultationSlot = {
        ...slot,
        id: `slot-${Date.now()}`,
      };
      setFormData((prev) => ({
        ...prev,
        consultationSlots: [...prev.consultationSlots, newSlot],
      }));
    },
    []
  );

  const removeConsultationSlot = useCallback((id: string) => {
    setFormData((prev) => ({
      ...prev,
      consultationSlots: prev.consultationSlots.filter((s) => s.id !== id),
    }));
  }, []);

  // Academic Profile actions
  const addExpertiseField = useCallback((field: string) => {
    const trimmed = field.trim();
    if (!trimmed) return;
    setFormData((prev) => {
      if (prev.expertiseFields.includes(trimmed)) return prev;
      return {
        ...prev,
        expertiseFields: [...prev.expertiseFields, trimmed],
      };
    });
  }, []);

  const removeExpertiseField = useCallback((field: string) => {
    setFormData((prev) => ({
      ...prev,
      expertiseFields: prev.expertiseFields.filter((f) => f !== field),
    }));
  }, []);

  const addQualification = useCallback(
    (qual: Omit<Qualification, "id">) => {
      const newQual: Qualification = {
        ...qual,
        id: `qual-${Date.now()}`,
      };
      setFormData((prev) => ({
        ...prev,
        qualifications: [...prev.qualifications, newQual],
      }));
    },
    []
  );

  const removeQualification = useCallback((id: string) => {
    setFormData((prev) => ({
      ...prev,
      qualifications: prev.qualifications.filter((q) => q.id !== id),
    }));
  }, []);

  // Form Submission
  const handleSubmit = useCallback(async () => {
    if (isLoading) return;

    const trimmedTeacherId = formData.teacherId.trim();
    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedPassword = formData.password;

    // 1. Required fields check
    if (
      !trimmedTeacherId ||
      !trimmedName ||
      !trimmedEmail ||
      !trimmedPassword ||
      !formData.faculty ||
      !formData.department ||
      !formData.designation
    ) {
      Toast.show({
        type: "error",
        text1: "Missing Required Fields",
        text2: "Please fill out all fields in Account Details and Academic Position.",
      });
      return;
    }

    // 2. Teacher ID validation (Long Integer - numeric digits only)
    if (!/^\d+$/.test(trimmedTeacherId)) {
      Toast.show({
        type: "error",
        text1: "Invalid Teacher ID",
        text2: "Teacher ID must be a numeric integer.",
      });
      return;
    }

    // 3. Email format validation
    if (!isValidEmail(trimmedEmail)) {
      Toast.show({
        type: "error",
        text1: "Invalid Email",
        text2: "Please enter a valid institutional email address (e.g., name@smuct.ac.bd).",
      });
      return;
    }

    // 4. Password complexity validation (Minimum 8 chars, 1 upper, 1 lower, 1 digit, 1 special char)
    const passwordValidation = validatePasswordComplexity(trimmedPassword);
    if (!passwordValidation.isValid) {
      Toast.show({
        type: "error",
        text1: "Password Requirement",
        text2:
          passwordValidation.message ||
          "Must be at least 8 characters with uppercase, lowercase, number, and special character.",
      });
      return;
    }

    // 5. Parse advisory batch if present
    let parsedBatch: number | undefined;
    const batchDigits = formData.advisoryBatch.replace(/\D/g, "");
    if (batchDigits) {
      parsedBatch = parseInt(batchDigits, 10);
    }

    // Format LinkedIn URL
    let formattedUrl = formData.linkedInUrl.trim();
    if (formattedUrl && !/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const payload = {
      teacherId: trimmedTeacherId,
      name: trimmedName,
      email: trimmedEmail.toLowerCase(),
      password: trimmedPassword,
      faculty: formData.faculty.trim(),
      department: formData.department.trim(),
      designation: formData.designation.trim(),
      officeRoom: formData.officeRoom.trim() || undefined,
      dayOff: formData.dayOff.trim() || undefined,
      advisoryBatch: parsedBatch,
      consultationSlots:
        formData.consultationSlots.length > 0
          ? formData.consultationSlots.map((s) => ({
              day: s.day,
              startTime: s.startTime,
              endTime: s.endTime,
            }))
          : undefined,
      expertiseFields:
        formData.expertiseFields.length > 0
          ? formData.expertiseFields
          : undefined,
      academicQualifications:
        formData.qualifications.length > 0 ? formData.qualifications : undefined,
      linkedInUrl: formattedUrl || undefined,
    };

    try {
      setIsLoading(true);
      await api.post("/teachers/register", payload);

      Toast.show({
        type: "success",
        text1: "Faculty Account Created!",
        text2: `${trimmedName} registered successfully.`,
      });

      // 1. Fully clear all form fields and section states upon successful creation
      isPasswordCustomized.current = false;
      setFormData({
        teacherId: "",
        name: "",
        email: "",
        password: "",
        faculty: "",
        department: "",
        designation: "",
        officeRoom: "",
        dayOff: "",
        consultationSlots: [],
        advisoryBatch: "",
        expertiseFields: [],
        qualifications: [],
        linkedInUrl: "",
      });
      setShowPassword(false);
      setIsAvailabilityExpanded(false);
      setIsProfileExpanded(false);
      setActiveSelector(null);
      setIsSlotModalOpen(false);
      setIsQualModalOpen(false);
      setIsExpertiseModalOpen(false);
      setIsBatchModalOpen(false);

      timerRef.current = setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error: any) {
      // NOTE: Form inputs and expanded section states are strictly preserved on error
      // so the administrator does NOT lose any data and can simply fix the error.
      const status = error.response?.status;
      const firstErrorSource = error.response?.data?.errorSources?.[0]?.message;
      const backendMessage =
        firstErrorSource ||
        error.response?.data?.message ||
        error.response?.data?.error;

      if (status === 409) {
        Toast.show({
          type: "error",
          text1: "Account Already Exists",
          text2:
            backendMessage || "This Email or Teacher ID is already registered.",
        });
      } else if (status === 401 || status === 403) {
        Toast.show({
          type: "error",
          text1: "Unauthorized Action",
          text2:
            backendMessage ||
            "You do not have administrative permission to create faculty accounts.",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Registration Failed",
          text2:
            backendMessage || error.message || "An unexpected error occurred.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [formData, router, isLoading]);

  return {
    formData,
    updateField,
    showPassword,
    setShowPassword,
    isLoading,
    activeSelector,
    setActiveSelector: openSelector,
    selectorModalVisible: activeSelector !== null,
    selectorOptions,
    selectorTitle,
    handleSelectOption,
    closeSelectorModal,
    regeneratePassword,

    isAvailabilityExpanded,
    setIsAvailabilityExpanded,
    addConsultationSlot,
    removeConsultationSlot,

    isProfileExpanded,
    setIsProfileExpanded,
    addExpertiseField,
    removeExpertiseField,
    addQualification,
    removeQualification,

    handleSubmit,

    isSlotModalOpen,
    setIsSlotModalOpen,
    isQualModalOpen,
    setIsQualModalOpen,
    isExpertiseModalOpen,
    setIsExpertiseModalOpen,
    isBatchModalOpen,
    setIsBatchModalOpen,
  };
}
