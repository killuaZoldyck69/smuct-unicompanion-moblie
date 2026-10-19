export interface ConsultationSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
}

export interface Qualification {
  id: string;
  degree?: string;
  field: string;
  institution: string;
  passingYear?: string | number;
}

export type SelectorType =
  | "faculty"
  | "department"
  | "designation"
  | "dayOff"
  | null;

export interface AddFacultyFormData {
  // Required: Account Details
  teacherId: string;
  name: string;
  email: string;
  password: string;

  // Required: Academic Position
  faculty: string;
  department: string;
  designation: string;

  // Optional: Office & Availability
  officeRoom: string;
  dayOff: string;
  consultationSlots: ConsultationSlot[];
  advisoryBatch: string;

  // Optional: Academic Profile
  expertiseFields: string[];
  qualifications: Qualification[];
  linkedInUrl: string;
}

export interface AddFacultyFormHookReturn {
  formData: AddFacultyFormData;
  updateField: <K extends keyof AddFacultyFormData>(
    field: K,
    value: AddFacultyFormData[K]
  ) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean | ((prev: boolean) => boolean)) => void;
  isLoading: boolean;
  activeSelector: SelectorType;
  setActiveSelector: (type: SelectorType) => void;
  selectorModalVisible: boolean;
  selectorOptions: string[];
  selectorTitle: string;
  handleSelectOption: (value: string) => void;
  closeSelectorModal: () => void;
  regeneratePassword: () => void;

  // Office & Availability state/actions
  isAvailabilityExpanded: boolean;
  setIsAvailabilityExpanded: (
    expanded: boolean | ((prev: boolean) => boolean)
  ) => void;
  addConsultationSlot: (slot: Omit<ConsultationSlot, "id">) => void;
  removeConsultationSlot: (id: string) => void;

  // Academic Profile actions & state
  isProfileExpanded: boolean;
  setIsProfileExpanded: (
    expanded: boolean | ((prev: boolean) => boolean)
  ) => void;
  addExpertiseField: (field: string) => void;
  removeExpertiseField: (field: string) => void;
  addQualification: (qual: Omit<Qualification, "id">) => void;
  removeQualification: (id: string) => void;

  // Submit
  handleSubmit: () => Promise<void>;

  // Sub-modals
  isSlotModalOpen: boolean;
  setIsSlotModalOpen: (open: boolean) => void;
  isQualModalOpen: boolean;
  setIsQualModalOpen: (open: boolean) => void;
  isExpertiseModalOpen: boolean;
  setIsExpertiseModalOpen: (open: boolean) => void;
  isBatchModalOpen: boolean;
  setIsBatchModalOpen: (open: boolean) => void;
}
