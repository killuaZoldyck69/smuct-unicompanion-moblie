import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  Switch,
  Alert,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import Toast from "react-native-toast-message";

import { useCurrentUser } from "@/hooks/use-current-user";
import {
  AcademicEventItem,
  CalendarStatus,
  EventCategory,
  CsvValidationResult,
  getCalendarTemplateCsvAPI,
  exportCalendarCsvAPI,
  validateCalendarCsvAPI,
} from "@/services/calendar-service";
import {
  useAdminCalendars,
  useCalendarDetails,
  useCreateCalendar,
  useUpdateCalendarStatus,
  useDuplicateCalendar,
  useDeleteCalendar,
  useCreateCalendarEvent,
  useUpdateCalendarEvent,
  useDeleteCalendarEvent,
  useImportCalendarCsv,
} from "@/features/schedule/useSchedule";
import AcademicCalendarScreen, {
  BENTO_COLORS,
  CATEGORY_CONFIG,
  formatEventDate,
  BentoEventCard,
} from "../academic_calendar";

const FACULTIES_LIST = [
  "Science and Information Technology",
  "Engineering and Applied Sciences",
  "Business Administration",
  "Design and Visual Communication",
  "Apparel and Textile Studies",
];

const DEPARTMENTS_LIST = [
  "Computer Science and Engineering",
  "Software Engineering",
  "Information Technology",
  "Electrical and Electronic Engineering",
  "Textile Engineering",
  "Fashion Design and Technology",
  "Graphic Design and Multimedia",
  "Bachelor of Business Administration",
];

const EVENT_CATEGORIES: EventCategory[] = [
  "CLASS",
  "REGISTRATION",
  "DEADLINE",
  "EXAM",
  "HOLIDAY",
  "MAKEUP_CLASS",
  "RESULT",
  "ACADEMIC",
  "OTHER",
];

export default function AdminCalendarManagementScreen() {
  const router = useRouter();
  const { role, isPending } = useCurrentUser();

  // Navigation State: 'LIST' or 'DETAIL'
  const [currentView, setCurrentView] = useState<"LIST" | "DETAIL">("LIST");
  const [selectedCalendarId, setSelectedCalendarId] = useState<string | null>(null);
  const [selectedStatusTab, setSelectedStatusTab] = useState<
    "ALL" | CalendarStatus
  >("ALL");

  // Creation Method Choice Modal ('NONE' | 'METHOD_CHOICE' | 'MANUAL' | 'CSV_MODAL' | 'DUPLICATE_CHOICE')
  const [creationModalMode, setCreationModalMode] = useState<
    "NONE" | "METHOD_CHOICE" | "MANUAL" | "CSV_MODAL" | "DUPLICATE_CHOICE"
  >("NONE");

  // Event Edit/Create Modal
  const [isEventModalVisible, setIsEventModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AcademicEventItem | null>(null);

  // Student Preview Modal
  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);

  // Form State: Manual Calendar Creation
  const [calendarTitle, setCalendarTitle] = useState("");
  const [calendarSemester, setCalendarSemester] = useState("");
  const [calendarAcademicYear, setCalendarAcademicYear] = useState(
    String(new Date().getFullYear()),
  );
  const [isGlobalAudience, setIsGlobalAudience] = useState(true);
  const [selectedFaculties, setSelectedFaculties] = useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);

  // Form State: Single Event Add/Edit
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventCategory, setEventCategory] = useState<EventCategory>("CLASS");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventWeekNumber, setEventWeekNumber] = useState("");
  const [eventIsHoliday, setEventIsHoliday] = useState(false);
  const [eventIsAllDay, setEventIsAllDay] = useState(true);
  const [eventRemarks, setEventRemarks] = useState("");

  // CSV Import State
  const [pickedCsvFile, setPickedCsvFile] = useState<{
    name: string;
    content: string;
  } | null>(null);
  const [csvValidationResult, setCsvValidationResult] =
    useState<CsvValidationResult | null>(null);
  const [isValidatingCsv, setIsValidatingCsv] = useState(false);

  // Queries & Mutations
  const {
    data: calendars = [],
    isLoading: isLoadingCalendars,
    refetch: refetchCalendars,
  } = useAdminCalendars(
    selectedStatusTab === "ALL"
      ? undefined
      : (selectedStatusTab as CalendarStatus),
  );

  const {
    data: selectedCalendar,
    isLoading: isLoadingCalendarDetail,
    refetch: refetchCalendarDetail,
  } = useCalendarDetails(selectedCalendarId || undefined);

  const createCalendarMutation = useCreateCalendar();
  const updateStatusMutation = useUpdateCalendarStatus();
  const duplicateCalendarMutation = useDuplicateCalendar();
  const deleteCalendarMutation = useDeleteCalendar();
  const createEventMutation = useCreateCalendarEvent();
  const updateEventMutation = useUpdateCalendarEvent();
  const deleteEventMutation = useDeleteCalendarEvent();
  const importCsvMutation = useImportCalendarCsv();

  // Status Filter options
  const statusTabs: Array<{ key: "ALL" | CalendarStatus; label: string }> = [
    { key: "ALL", label: "All" },
    { key: "PUBLISHED", label: "Published" },
    { key: "DRAFT", label: "Draft" },
    { key: "ARCHIVED", label: "Archived" },
  ];

  // Helper to open detail
  const handleOpenDetail = (id: string) => {
    setSelectedCalendarId(id);
    setCurrentView("DETAIL");
  };

  // Helper: Open Event Modal for Add
  const handleOpenAddEvent = () => {
    setEditingEvent(null);
    setEventTitle("");
    setEventDescription("");
    setEventCategory("CLASS");
    setEventStartDate(new Date().toISOString().split("T")[0]);
    setEventEndDate("");
    setEventWeekNumber("1");
    setEventIsHoliday(false);
    setEventIsAllDay(true);
    setEventRemarks("");
    setIsEventModalVisible(true);
  };

  // Helper: Open Event Modal for Edit
  const handleOpenEditEvent = (ev: AcademicEventItem) => {
    setEditingEvent(ev);
    setEventTitle(ev.title);
    setEventDescription(ev.description || "");
    setEventCategory(ev.category);
    setEventStartDate(ev.startDate);
    setEventEndDate(ev.endDate || "");
    setEventWeekNumber(ev.weekNumber ? String(ev.weekNumber) : "");
    setEventIsHoliday(ev.isHoliday);
    setEventIsAllDay(ev.isAllDay);
    setEventRemarks(ev.remarks || "");
    setIsEventModalVisible(true);
  };

  // --- Handlers: Status Change ---
  const handleStatusChange = async (status: CalendarStatus) => {
    if (!selectedCalendarId) return;

    try {
      await updateStatusMutation.mutateAsync({
        id: selectedCalendarId,
        status,
      });
      Toast.show({
        type: "success",
        text1: "Status Updated",
        text2: `Academic calendar is now ${status}.`,
      });
      refetchCalendarDetail();
      refetchCalendars();
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Status Update Failed",
        text2: err.message || "Could not update calendar status.",
      });
    }
  };

  // --- Handlers: Delete Calendar ---
  const handleDeleteCalendar = () => {
    if (!selectedCalendarId) return;

    Alert.alert(
      "Delete Academic Calendar",
      "Are you sure you want to delete this academic calendar and all its events? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCalendarMutation.mutateAsync(selectedCalendarId);
              Toast.show({
                type: "info",
                text1: "Calendar Deleted",
                text2: "Academic calendar has been removed.",
              });
              setCurrentView("LIST");
              setSelectedCalendarId(null);
            } catch (err: any) {
              Toast.show({
                type: "error",
                text1: "Delete Failed",
                text2: err.message || "Failed to delete calendar.",
              });
            }
          },
        },
      ],
    );
  };

  // --- Handlers: Duplicate Calendar ---
  const handleDuplicateCalendar = async (calendarIdToClone: string) => {
    try {
      const cloned = await duplicateCalendarMutation.mutateAsync(
        calendarIdToClone,
      );
      Toast.show({
        type: "success",
        text1: "Calendar Duplicated",
        text2: "New Draft created successfully.",
      });
      setCreationModalMode("NONE");
      if (cloned?.id) {
        handleOpenDetail(cloned.id);
      }
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Duplication Failed",
        text2: err.message || "Could not duplicate calendar.",
      });
    }
  };

  // --- Handlers: CSV Template Download ---
  const handleDownloadTemplate = async () => {
    try {
      const csvTemplate = await getCalendarTemplateCsvAPI();

      if (Platform.OS === "web") {
        const blob = new Blob([csvTemplate], {
          type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "academic-calendar-template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        Toast.show({
          type: "success",
          text1: "Template Downloaded",
          text2: "academic-calendar-template.csv saved.",
        });
      } else {
        const baseDir =
          FileSystem.documentDirectory ||
          FileSystem.cacheDirectory ||
          "";
        const fileUri = `${baseDir}academic-calendar-template.csv`;

        await FileSystem.writeAsStringAsync(fileUri, csvTemplate, {
          encoding: FileSystem.EncodingType.UTF8,
        });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: "text/csv",
            dialogTitle: "Download Academic Calendar Template",
          });
        } else {
          Toast.show({
            type: "info",
            text1: "Template Generated",
            text2: "CSV template ready in application storage.",
          });
        }
      }
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Template Download Failed",
        text2: err.message,
      });
    }
  };

  // --- Handlers: CSV Export ---
  const handleExportCsv = async () => {
    if (!selectedCalendarId) return;

    try {
      const csvData = await exportCalendarCsvAPI(selectedCalendarId);
      const safeName = (
        selectedCalendar?.semester || "calendar"
      ).replace(/\s+/g, "_");

      if (Platform.OS === "web") {
        const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${safeName}_academic_calendar.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        Toast.show({
          type: "success",
          text1: "CSV Exported",
          text2: `${safeName}_academic_calendar.csv downloaded.`,
        });
      } else {
        const baseDir =
          FileSystem.documentDirectory ||
          FileSystem.cacheDirectory ||
          "";
        const fileUri = `${baseDir}${safeName}_academic_calendar.csv`;

        await FileSystem.writeAsStringAsync(fileUri, csvData, {
          encoding: FileSystem.EncodingType.UTF8,
        });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: "text/csv",
            dialogTitle: `Export ${selectedCalendar?.semester || "Calendar"}`,
          });
        } else {
          Toast.show({
            type: "success",
            text1: "CSV Export Ready",
            text2: "Saved to local files.",
          });
        }
      }
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Export Failed",
        text2: err.message,
      });
    }
  };

  // --- Handlers: CSV File Pick & Validate ---
  const handlePickCsvFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ["text/csv", "text/comma-separated-values", "text/plain", "*/*"],
        copyToCacheDirectory: true,
      });

      if (res.canceled || !res.assets || res.assets.length === 0) return;

      const file = res.assets[0];
      let content = "";

      if ((file as any).file && typeof (file as any).file.text === "function") {
        content = await (file as any).file.text();
      } else if (
        file.uri &&
        (file.uri.startsWith("blob:") ||
          file.uri.startsWith("http") ||
          file.uri.startsWith("data:"))
      ) {
        const response = await fetch(file.uri);
        content = await response.text();
      } else {
        content = await FileSystem.readAsStringAsync(file.uri, {
          encoding: FileSystem.EncodingType.UTF8,
        });
      }

      setPickedCsvFile({ name: file.name, content });
      setIsValidatingCsv(true);

      const validation = await validateCalendarCsvAPI(
        content,
        selectedCalendarId || undefined,
      );
      setCsvValidationResult(validation);
      setIsValidatingCsv(false);
    } catch (err: any) {
      setIsValidatingCsv(false);
      Toast.show({
        type: "error",
        text1: "CSV Read Failed",
        text2: err.message || "Failed to process CSV file.",
      });
    }
  };

  // --- Handlers: Commit CSV Import into Draft ---
  const handleCommitCsvImport = async () => {
    if (!pickedCsvFile) return;

    try {
      let targetId = selectedCalendarId;

      // If creating fresh from CSV without an open calendar
      if (!targetId) {
        const newCal = await createCalendarMutation.mutateAsync({
          title: calendarTitle.trim() || "Academic Calendar (CSV Import)",
          semester: calendarSemester.trim() || "Upcoming Semester",
          academicYear: parseInt(calendarAcademicYear, 10) || 2026,
          isGlobal: isGlobalAudience,
          targetFaculties: isGlobalAudience ? [] : selectedFaculties,
          targetDepartments: isGlobalAudience ? [] : selectedDepartments,
        });
        targetId = newCal.id;
      }

      await importCsvMutation.mutateAsync({
        calendarId: targetId,
        csvContent: pickedCsvFile.content,
      });

      Toast.show({
        type: "success",
        text1: "CSV Imported Successfully",
        text2: "Events loaded into Draft status.",
      });

      setCreationModalMode("NONE");
      setPickedCsvFile(null);
      setCsvValidationResult(null);
      handleOpenDetail(targetId);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Import Failed",
        text2: err.message || "Could not commit CSV import.",
      });
    }
  };

  // --- Handlers: Manual Calendar Create ---
  const handleManualCreateCalendar = async () => {
    if (!calendarTitle.trim() || !calendarSemester.trim()) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Title and Semester are required.",
      });
      return;
    }

    try {
      const created = await createCalendarMutation.mutateAsync({
        title: calendarTitle.trim(),
        semester: calendarSemester.trim(),
        academicYear: parseInt(calendarAcademicYear, 10) || 2026,
        isGlobal: isGlobalAudience,
        targetFaculties: isGlobalAudience ? [] : selectedFaculties,
        targetDepartments: isGlobalAudience ? [] : selectedDepartments,
      });

      Toast.show({
        type: "success",
        text1: "Calendar Created",
        text2: "Created as DRAFT. You can now add events.",
      });

      setCreationModalMode("NONE");
      setCalendarTitle("");
      setCalendarSemester("");
      handleOpenDetail(created.id);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Creation Failed",
        text2: err.message,
      });
    }
  };

  // --- Handlers: Event Submit (Create or Update) ---
  const handleSaveEvent = async () => {
    if (!selectedCalendarId) return;
    if (!eventTitle.trim() || !eventStartDate.trim()) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Event title and start date (YYYY-MM-DD) are required.",
      });
      return;
    }

    const payload = {
      title: eventTitle.trim(),
      description: eventDescription.trim() || undefined,
      category: eventCategory,
      startDate: eventStartDate.trim(),
      endDate: eventEndDate.trim() || undefined,
      weekNumber: eventWeekNumber ? parseInt(eventWeekNumber, 10) : undefined,
      isHoliday: eventIsHoliday,
      isAllDay: eventIsAllDay,
      remarks: eventRemarks.trim() || undefined,
    };

    try {
      if (editingEvent) {
        await updateEventMutation.mutateAsync({
          calendarId: selectedCalendarId,
          eventId: editingEvent.id,
          data: payload,
        });
        Toast.show({ type: "success", text1: "Event Updated" });
      } else {
        await createEventMutation.mutateAsync({
          calendarId: selectedCalendarId,
          data: payload,
        });
        Toast.show({ type: "success", text1: "Event Created" });
      }
      setIsEventModalVisible(false);
      refetchCalendarDetail();
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Save Failed",
        text2: err.message,
      });
    }
  };

  // --- Handlers: Event Delete ---
  const handleDeleteEvent = (eventId: string, title: string) => {
    if (!selectedCalendarId) return;

    Alert.alert(
      "Delete Event",
      `Are you sure you want to remove "${title}" from this academic calendar?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteEventMutation.mutateAsync({
                calendarId: selectedCalendarId,
                eventId,
              });
              Toast.show({ type: "info", text1: "Event Removed" });
              refetchCalendarDetail();
            } catch (err: any) {
              Toast.show({
                type: "error",
                text1: "Delete Failed",
                text2: err.message,
              });
            }
          },
        },
      ],
    );
  };

  // Guard
  if (isPending || role !== "ADMIN") {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={BENTO_COLORS.deepNavy} />
      </View>
    );
  }

  // ==========================================
  // VIEW: CALENDAR LIST SCREEN (Soft Campus Bento)
  // ==========================================
  if (currentView === "LIST") {
    return (
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.navHeader}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Feather name="arrow-left" size={22} color={BENTO_COLORS.deepNavy} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.navTitle}>Academic Calendars</Text>
            <Text style={styles.navSubtitle}>
              Manage semesters, timelines & imports
            </Text>
          </View>

          {/* Primary Action: + Create Calendar */}
          <TouchableOpacity
            style={styles.createMainPill}
            onPress={() => setCreationModalMode("METHOD_CHOICE")}
            activeOpacity={0.8}
          >
            <Feather name="plus" size={16} color="#ffffff" />
            <Text style={styles.createMainPillText}>Create</Text>
          </TouchableOpacity>
        </View>

        {/* Status Filter Tabs (Pill style) */}
        <View style={styles.filterBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {statusTabs.map((tab) => {
              const isSelected = selectedStatusTab === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={[
                    styles.statusFilterPill,
                    isSelected && styles.statusFilterPillActive,
                  ]}
                  onPress={() => setSelectedStatusTab(tab.key)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.statusFilterPillText,
                      isSelected && styles.statusFilterPillTextActive,
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Calendar List Content */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {isLoadingCalendars ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color={BENTO_COLORS.deepNavy} />
              <Text style={styles.loadingLabel}>Loading Calendars...</Text>
            </View>
          ) : calendars.length === 0 ? (
            <View style={styles.emptyCard}>
              <Feather
                name="calendar"
                size={44}
                color={BENTO_COLORS.subtleText}
                style={{ marginBottom: 12 }}
              />
              <Text style={styles.emptyCardTitle}>No Calendars Found</Text>
              <Text style={styles.emptyCardDesc}>
                {selectedStatusTab === "ALL"
                  ? "Get started by creating your university academic calendar."
                  : `No ${selectedStatusTab.toLowerCase()} calendars found.`}
              </Text>
              <TouchableOpacity
                style={styles.emptyActionPill}
                onPress={() => setCreationModalMode("METHOD_CHOICE")}
              >
                <Feather
                  name="plus"
                  size={14}
                  color="#ffffff"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.emptyActionPillText}>Create Calendar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            calendars.map((cal) => {
              const isPub = cal.status === "PUBLISHED";
              const isDraft = cal.status === "DRAFT";
              const eventCount = cal.events?.length || 0;

              return (
                <TouchableOpacity
                  key={cal.id}
                  style={styles.adminCalendarBentoCard}
                  onPress={() => handleOpenDetail(cal.id)}
                  activeOpacity={0.85}
                >
                  {/* Top Status & Count */}
                  <View style={styles.cardTopRow}>
                    <View
                      style={[
                        styles.statusPill,
                        isPub && styles.statusPillPublished,
                        isDraft && styles.statusPillDraft,
                      ]}
                    >
                      <View
                        style={[
                          styles.statusDot,
                          isPub && { backgroundColor: "#059669" },
                          isDraft && { backgroundColor: "#d97706" },
                        ]}
                      />
                      <Text
                        style={[
                          styles.statusPillText,
                          isPub && { color: "#047857" },
                          isDraft && { color: "#b45309" },
                        ]}
                      >
                        {cal.status}
                      </Text>
                    </View>

                    <View style={styles.eventCountBadge}>
                      <Text style={styles.eventCountText}>
                        {eventCount} {eventCount === 1 ? "Event" : "Events"}
                      </Text>
                    </View>
                  </View>

                  {/* Title & Semester */}
                  <Text style={styles.cardTitle}>{cal.title}</Text>
                  <Text style={styles.cardSemester}>
                    {cal.semester} • AY {cal.academicYear}
                  </Text>

                  {/* Audience & Date Range */}
                  <View style={styles.cardMetaRow}>
                    <View style={styles.audienceTag}>
                      <Feather
                        name={cal.isGlobal ? "globe" : "users"}
                        size={11}
                        color={BENTO_COLORS.subtleText}
                      />
                      <Text style={styles.audienceTagText}>
                        {cal.isGlobal ? "All Faculties" : "Targeted Audience"}
                      </Text>
                    </View>

                    <View style={styles.cardActionRow}>
                      <Text style={styles.viewDetailsText}>Manage</Text>
                      <Feather
                        name="chevron-right"
                        size={16}
                        color={BENTO_COLORS.deepNavy}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>

        {/* ========================================== */}
        {/* MODAL 1: CREATION METHOD CHOICE (Bento Cards) */}
        {/* ========================================== */}
        <Modal
          visible={creationModalMode === "METHOD_CHOICE"}
          transparent
          animationType="fade"
          onRequestClose={() => setCreationModalMode("NONE")}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.methodChoiceContainer}>
              <View style={styles.modalHeaderRow}>
                <View>
                  <Text style={styles.modalHeading}>Create Academic Calendar</Text>
                  <Text style={styles.modalSubheading}>
                    Choose how you want to build this semester.
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setCreationModalMode("NONE")}
                  style={styles.closeCircleBtn}
                >
                  <Feather name="x" size={18} color={BENTO_COLORS.deepNavy} />
                </TouchableOpacity>
              </View>

              {/* Method A: Create Manually */}
              <TouchableOpacity
                style={styles.methodCard}
                onPress={() => setCreationModalMode("MANUAL")}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.methodIconBox,
                    { backgroundColor: "#e0f2fe" },
                  ]}
                >
                  <Feather name="edit-3" size={22} color="#0369a1" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.methodTitle}>Create Manually</Text>
                  <Text style={styles.methodDesc}>
                    Build a calendar from scratch and add individual events.
                  </Text>
                </View>
                <Feather
                  name="chevron-right"
                  size={18}
                  color={BENTO_COLORS.subtleText}
                />
              </TouchableOpacity>

              {/* Method B: Import CSV */}
              <TouchableOpacity
                style={styles.methodCard}
                onPress={() => {
                  setPickedCsvFile(null);
                  setCsvValidationResult(null);
                  setCreationModalMode("CSV_MODAL");
                }}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.methodIconBox,
                    { backgroundColor: "#d1fae5" },
                  ]}
                >
                  <Feather name="upload-cloud" size={22} color="#047857" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.methodTitle}>Import CSV</Text>
                  <Text style={styles.methodDesc}>
                    Bulk upload your complete semester schedule from CSV.
                  </Text>
                </View>
                <Feather
                  name="chevron-right"
                  size={18}
                  color={BENTO_COLORS.subtleText}
                />
              </TouchableOpacity>

              {/* Method C: Duplicate Existing */}
              <TouchableOpacity
                style={styles.methodCard}
                onPress={() => setCreationModalMode("DUPLICATE_CHOICE")}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.methodIconBox,
                    { backgroundColor: "#fef3c7" },
                  ]}
                >
                  <Feather name="copy" size={22} color="#b45309" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.methodTitle}>Duplicate Existing</Text>
                  <Text style={styles.methodDesc}>
                    Clone an existing semester's calendar into a fresh Draft.
                  </Text>
                </View>
                <Feather
                  name="chevron-right"
                  size={18}
                  color={BENTO_COLORS.subtleText}
                />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* ========================================== */}
        {/* MODAL 2: DUPLICATE CALENDAR SELECTOR */}
        {/* ========================================== */}
        <Modal
          visible={creationModalMode === "DUPLICATE_CHOICE"}
          transparent
          animationType="slide"
          onRequestClose={() => setCreationModalMode("METHOD_CHOICE")}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheetContainer}>
              <View style={styles.modalHeaderRow}>
                <View>
                  <Text style={styles.modalHeading}>Clone Semester</Text>
                  <Text style={styles.modalSubheading}>
                    Select a calendar to duplicate as a new Draft.
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setCreationModalMode("METHOD_CHOICE")}
                  style={styles.closeCircleBtn}
                >
                  <Feather name="x" size={18} color={BENTO_COLORS.deepNavy} />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ maxHeight: 360 }}>
                {calendars.map((cal) => (
                  <TouchableOpacity
                    key={cal.id}
                    style={styles.duplicateItemCard}
                    onPress={() => handleDuplicateCalendar(cal.id)}
                    activeOpacity={0.8}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.duplicateItemTitle}>{cal.title}</Text>
                      <Text style={styles.duplicateItemSub}>
                        {cal.semester} • {cal.events?.length || 0} events
                      </Text>
                    </View>
                    <View style={styles.clonePill}>
                      <Text style={styles.clonePillText}>Clone</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* ========================================== */}
        {/* MODAL 3: MANUAL METADATA CREATION */}
        {/* ========================================== */}
        <Modal
          visible={creationModalMode === "MANUAL"}
          transparent
          animationType="slide"
          onRequestClose={() => setCreationModalMode("METHOD_CHOICE")}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheetContainer}>
              <View style={styles.modalHeaderRow}>
                <View>
                  <Text style={styles.modalHeading}>New Academic Calendar</Text>
                  <Text style={styles.modalSubheading}>
                    Create a new semester draft.
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setCreationModalMode("METHOD_CHOICE")}
                  style={styles.closeCircleBtn}
                >
                  <Feather name="x" size={18} color={BENTO_COLORS.deepNavy} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.formLabel}>Calendar Title *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. Academic Calendar - Summer 2026"
                  value={calendarTitle}
                  onChangeText={setCalendarTitle}
                />

                <Text style={styles.formLabel}>Semester *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. Summer Semester 2026"
                  value={calendarSemester}
                  onChangeText={setCalendarSemester}
                />

                <Text style={styles.formLabel}>Academic Year *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="2026"
                  value={calendarAcademicYear}
                  onChangeText={setCalendarAcademicYear}
                  keyboardType="numeric"
                />

                {/* Audience Switch */}
                <View style={styles.switchRow}>
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <Text style={styles.switchLabel}>All Faculties & Depts</Text>
                    <Text style={styles.switchDesc}>
                      Visible to all students across the university.
                    </Text>
                  </View>
                  <Switch
                    value={isGlobalAudience}
                    onValueChange={setIsGlobalAudience}
                    trackColor={{ false: "#e2e8f0", true: BENTO_COLORS.deepNavy }}
                  />
                </View>

                {!isGlobalAudience && (
                  <View style={styles.audienceSelectorBox}>
                    <Text style={styles.subLabel}>Target Faculties:</Text>
                    {FACULTIES_LIST.map((fac) => {
                      const isSel = selectedFaculties.includes(fac);
                      return (
                        <TouchableOpacity
                          key={fac}
                          style={styles.checkboxRow}
                          onPress={() => {
                            setSelectedFaculties((prev) =>
                              isSel
                                ? prev.filter((f) => f !== fac)
                                : [...prev, fac],
                            );
                          }}
                        >
                          <Feather
                            name={isSel ? "check-square" : "square"}
                            size={16}
                            color={
                              isSel ? BENTO_COLORS.deepNavy : BENTO_COLORS.subtleText
                            }
                          />
                          <Text style={styles.checkboxLabel}>{fac}</Text>
                        </TouchableOpacity>
                      );
                    })}

                    <Text style={[styles.subLabel, { marginTop: 10 }]}>Target Departments:</Text>
                    {DEPARTMENTS_LIST.map((dept) => {
                      const isSel = selectedDepartments.includes(dept);
                      return (
                        <TouchableOpacity
                          key={dept}
                          style={styles.checkboxRow}
                          onPress={() => {
                            setSelectedDepartments((prev) =>
                              isSel
                                ? prev.filter((d) => d !== dept)
                                : [...prev, dept],
                            );
                          }}
                        >
                          <Feather
                            name={isSel ? "check-square" : "square"}
                            size={16}
                            color={
                              isSel ? BENTO_COLORS.deepNavy : BENTO_COLORS.subtleText
                            }
                          />
                          <Text style={styles.checkboxLabel}>{dept}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                <TouchableOpacity
                  style={[
                    styles.primarySubmitPill,
                    createCalendarMutation.isPending && { opacity: 0.6 },
                  ]}
                  onPress={handleManualCreateCalendar}
                  disabled={createCalendarMutation.isPending}
                >
                  {createCalendarMutation.isPending ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.primarySubmitPillText}>
                      Create Draft Calendar
                    </Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* ========================================== */}
        {/* MODAL 4: CSV IMPORT & VALIDATION UX */}
        {/* ========================================== */}
        <Modal
          visible={creationModalMode === "CSV_MODAL"}
          transparent
          animationType="slide"
          onRequestClose={() => setCreationModalMode("METHOD_CHOICE")}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheetContainer}>
              <View style={styles.modalHeaderRow}>
                <View>
                  <Text style={styles.modalHeading}>Import Academic Calendar</Text>
                  <Text style={styles.modalSubheading}>
                    Upload your semester schedule in CSV format.
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setCreationModalMode("METHOD_CHOICE")}
                  style={styles.closeCircleBtn}
                >
                  <Feather name="x" size={18} color={BENTO_COLORS.deepNavy} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Download Template Link */}
                <TouchableOpacity
                  style={styles.templateDownloadCard}
                  onPress={handleDownloadTemplate}
                >
                  <Feather name="download" size={16} color="#0369a1" />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.templateDownloadTitle}>
                      Download CSV Template
                    </Text>
                    <Text style={styles.templateDownloadSub}>
                      Canonical columns: title, category, startDate, endDate, remarks...
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Upload File Zone */}
                <TouchableOpacity
                  style={styles.uploadDashedZone}
                  onPress={handlePickCsvFile}
                  activeOpacity={0.8}
                >
                  <Feather
                    name="file-text"
                    size={32}
                    color={BENTO_COLORS.deepNavy}
                  />
                  <Text style={styles.uploadZoneTitle}>
                    {pickedCsvFile
                      ? pickedCsvFile.name
                      : "Choose CSV File"}
                  </Text>
                  <Text style={styles.uploadZoneDesc}>
                    UTF-8 CSV formatted with strict YYYY-MM-DD dates
                  </Text>
                </TouchableOpacity>

                {isValidatingCsv && (
                  <View style={styles.validatingBox}>
                    <ActivityIndicator size="small" color={BENTO_COLORS.deepNavy} />
                    <Text style={styles.validatingText}>
                      Validating CSV structure and dates...
                    </Text>
                  </View>
                )}

                {/* Validation Results Display */}
                {csvValidationResult && (
                  <View style={styles.validationReportCard}>
                    <Text style={styles.validationReportHeading}>
                      CSV Validation Summary
                    </Text>

                    {/* Stats pills */}
                    <View style={styles.statPillsRow}>
                      <View style={styles.statPillItem}>
                        <Text style={styles.statPillNumber}>
                          {csvValidationResult.validRowsCount}
                        </Text>
                        <Text style={styles.statPillLabel}>Valid Rows</Text>
                      </View>
                      <View style={styles.statPillItem}>
                        <Text
                          style={[
                            styles.statPillNumber,
                            csvValidationResult.errors.length > 0 && {
                              color: "#ba1a1a",
                            },
                          ]}
                        >
                          {csvValidationResult.errors.length}
                        </Text>
                        <Text style={styles.statPillLabel}>Errors</Text>
                      </View>
                      <View style={styles.statPillItem}>
                        <Text style={styles.statPillNumber}>
                          {csvValidationResult.warnings.length}
                        </Text>
                        <Text style={styles.statPillLabel}>Warnings</Text>
                      </View>
                    </View>

                    {/* Error checklist */}
                    {csvValidationResult.errors.length > 0 ? (
                      <View style={styles.errorListContainer}>
                        <Text style={styles.errorListHeading}>
                          Required Fixes ({csvValidationResult.errors.length}):
                        </Text>
                        {csvValidationResult.errors.slice(0, 5).map((err, idx) => (
                          <View key={idx} style={styles.errorItemRow}>
                            <Feather name="alert-circle" size={13} color="#ba1a1a" />
                            <Text style={styles.errorItemText}>
                              Row {err.rowNumber}: {err.message}
                            </Text>
                          </View>
                        ))}
                      </View>
                    ) : (
                      <View style={styles.successCheckRow}>
                        <Feather name="check-circle" size={16} color="#047857" />
                        <Text style={styles.successCheckText}>
                          All {csvValidationResult.validRowsCount} events validated successfully!
                        </Text>
                      </View>
                    )}

                    {/* Preview Cards */}
                    <Text style={styles.previewListHeading}>
                      Event Preview (First 4):
                    </Text>
                    {csvValidationResult.parsedEvents
                      .slice(0, 4)
                      .map((ev, i) => (
                        <View key={i} style={styles.miniPreviewCard}>
                          <Text style={styles.miniPreviewDate}>
                            {formatEventDate(ev.startDate, ev.endDate)}
                          </Text>
                          <Text style={styles.miniPreviewTitle} numberOfLines={1}>
                            {ev.title}
                          </Text>
                          <View style={styles.miniCategoryTag}>
                            <Text style={styles.miniCategoryTagText}>
                              {ev.category}
                            </Text>
                          </View>
                        </View>
                      ))}
                  </View>
                )}

                {/* Import to Draft Commit Button */}
                <TouchableOpacity
                  style={[
                    styles.primarySubmitPill,
                    (!csvValidationResult?.isValid ||
                      importCsvMutation.isPending) && { opacity: 0.4 },
                  ]}
                  onPress={handleCommitCsvImport}
                  disabled={
                    !csvValidationResult?.isValid ||
                    importCsvMutation.isPending
                  }
                >
                  {importCsvMutation.isPending ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.primarySubmitPillText}>
                      Import as Draft
                    </Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // ==========================================
  // VIEW: CALENDAR DETAIL SCREEN (Soft Campus Bento)
  // ==========================================
  const activeDetailCalendar = selectedCalendar;
  const isPub = activeDetailCalendar?.status === "PUBLISHED";
  const isDraft = activeDetailCalendar?.status === "DRAFT";
  const isArchived = activeDetailCalendar?.status === "ARCHIVED";

  return (
    <View style={styles.container}>
      {/* Top Navigation Header */}
      <View style={styles.navHeader}>
        <TouchableOpacity
          onPress={() => {
            setCurrentView("LIST");
            refetchCalendars();
          }}
          style={styles.backButton}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Back to list"
        >
          <Feather name="arrow-left" size={22} color={BENTO_COLORS.deepNavy} />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={styles.navTitle} numberOfLines={1}>
            {activeDetailCalendar?.title || "Calendar Detail"}
          </Text>
          <Text style={styles.navSubtitle}>
            {activeDetailCalendar?.semester} • AY{" "}
            {activeDetailCalendar?.academicYear}
          </Text>
        </View>

        {/* Status badge */}
        <View
          style={[
            styles.statusPill,
            isPub && styles.statusPillPublished,
            isDraft && styles.statusPillDraft,
          ]}
        >
          <Text
            style={[
              styles.statusPillText,
              isPub && { color: "#047857" },
              isDraft && { color: "#b45309" },
            ]}
          >
            {activeDetailCalendar?.status}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoadingCalendarDetail ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={BENTO_COLORS.deepNavy} />
            <Text style={styles.loadingLabel}>Loading Details...</Text>
          </View>
        ) : !activeDetailCalendar ? (
          <View style={styles.centerBox}>
            <Text style={styles.emptyCardTitle}>Calendar Not Found</Text>
          </View>
        ) : (
          <>
            {/* ========================================== */}
            {/* 1. ADMIN ACTIONS BENTO TOOLBAR */}
            {/* ========================================== */}
            <View style={styles.adminActionBentoCard}>
              <Text style={styles.adminActionHeader}>Workflow Actions</Text>

              <View style={styles.actionGrid}>
                {/* Preview Student View */}
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: "#e0f2fe" }]}
                  onPress={() => setIsPreviewModalVisible(true)}
                >
                  <Feather name="eye" size={15} color="#0369a1" />
                  <Text style={[styles.actionBtnText, { color: "#0369a1" }]}>
                    Preview Student View
                  </Text>
                </TouchableOpacity>

                {/* Add Event */}
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: "#f3f4f6" }]}
                  onPress={handleOpenAddEvent}
                >
                  <Feather name="plus" size={15} color={BENTO_COLORS.deepNavy} />
                  <Text
                    style={[
                      styles.actionBtnText,
                      { color: BENTO_COLORS.deepNavy },
                    ]}
                  >
                    Add Event
                  </Text>
                </TouchableOpacity>

                {/* Import CSV into this calendar */}
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: "#f3f4f6" }]}
                  onPress={() => {
                    setPickedCsvFile(null);
                    setCsvValidationResult(null);
                    setCreationModalMode("CSV_MODAL");
                  }}
                >
                  <Feather name="upload" size={15} color={BENTO_COLORS.deepNavy} />
                  <Text
                    style={[
                      styles.actionBtnText,
                      { color: BENTO_COLORS.deepNavy },
                    ]}
                  >
                    Import CSV
                  </Text>
                </TouchableOpacity>

                {/* Export CSV */}
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: "#f3f4f6" }]}
                  onPress={handleExportCsv}
                >
                  <Feather name="download" size={15} color={BENTO_COLORS.deepNavy} />
                  <Text
                    style={[
                      styles.actionBtnText,
                      { color: BENTO_COLORS.deepNavy },
                    ]}
                  >
                    Export CSV
                  </Text>
                </TouchableOpacity>

                {/* Publish / Draft / Archive Lifecycle */}
                {isDraft && (
                  <TouchableOpacity
                    style={[
                      styles.actionBtn,
                      { backgroundColor: "#047857", minWidth: "100%" },
                    ]}
                    onPress={() => handleStatusChange("PUBLISHED")}
                  >
                    <Feather name="check" size={15} color="#ffffff" />
                    <Text style={[styles.actionBtnText, { color: "#ffffff" }]}>
                      Publish Calendar to Students
                    </Text>
                  </TouchableOpacity>
                )}

                {isPub && (
                  <TouchableOpacity
                    style={[
                      styles.actionBtn,
                      { backgroundColor: "#b45309", minWidth: "48%" },
                    ]}
                    onPress={() => handleStatusChange("DRAFT")}
                  >
                    <Feather name="corner-up-left" size={15} color="#ffffff" />
                    <Text style={[styles.actionBtnText, { color: "#ffffff" }]}>
                      Revert to Draft
                    </Text>
                  </TouchableOpacity>
                )}

                {!isArchived && (
                  <TouchableOpacity
                    style={[
                      styles.actionBtn,
                      { backgroundColor: "#4b5563", minWidth: "48%" },
                    ]}
                    onPress={() => handleStatusChange("ARCHIVED")}
                  >
                    <Feather name="archive" size={15} color="#ffffff" />
                    <Text style={[styles.actionBtnText, { color: "#ffffff" }]}>
                      Archive
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Delete */}
                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    { backgroundColor: "#fee2e2", minWidth: "100%" },
                  ]}
                  onPress={handleDeleteCalendar}
                >
                  <Feather name="trash-2" size={15} color="#ba1a1a" />
                  <Text style={[styles.actionBtnText, { color: "#ba1a1a" }]}>
                    Delete Calendar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* ========================================== */}
            {/* 2. SEMESTER HERO BENTO CARD */}
            {/* ========================================== */}
            <View style={styles.heroBentoCard}>
              <View style={styles.heroTopRow}>
                <View style={styles.heroWeekBadge}>
                  <Feather name="calendar" size={12} color="#ffffff" />
                  <Text style={styles.heroWeekBadgeText}>
                    {activeDetailCalendar.semester}
                  </Text>
                </View>
                <Text style={styles.heroTotalEventsText}>
                  {activeDetailCalendar.events?.length || 0} Total Events
                </Text>
              </View>

              <Text style={styles.heroTitle}>{activeDetailCalendar.title}</Text>
              <Text style={styles.heroSemester}>
                Academic Year {activeDetailCalendar.academicYear} •{" "}
                {activeDetailCalendar.isGlobal
                  ? "All Faculties"
                  : "Targeted Audience"}
              </Text>
            </View>

            {/* ========================================== */}
            {/* 3. EVENT LIST BENTO CARDS WITH ACTIONS */}
            {/* ========================================== */}
            <View style={styles.bentoSection}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeading}>
                  Calendar Events ({activeDetailCalendar.events?.length || 0})
                </Text>
                <TouchableOpacity
                  style={styles.addEventMiniPill}
                  onPress={handleOpenAddEvent}
                >
                  <Feather name="plus" size={12} color="#ffffff" />
                  <Text style={styles.addEventMiniPillText}>Add Event</Text>
                </TouchableOpacity>
              </View>

              {(!activeDetailCalendar.events ||
                activeDetailCalendar.events.length === 0) && (
                <View style={styles.emptyEventsBox}>
                  <Feather
                    name="calendar"
                    size={36}
                    color={BENTO_COLORS.subtleText}
                    style={{ marginBottom: 8 }}
                  />
                  <Text style={styles.emptyEventsTitle}>No Events Added</Text>
                  <Text style={styles.emptyEventsDesc}>
                    Import a CSV schedule or add individual events manually.
                  </Text>
                </View>
              )}

              {activeDetailCalendar.events?.map((ev) => (
                <BentoEventCard
                  key={ev.id}
                  event={ev}
                  onEdit={() => handleOpenEditEvent(ev)}
                  onDelete={() => handleDeleteEvent(ev.id, ev.title)}
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* ========================================== */}
      {/* MODAL: EVENT ADD / EDIT */}
      {/* ========================================== */}
      <Modal
        visible={isEventModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsEventModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheetContainer}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalHeading}>
                {editingEvent ? "Edit Event" : "Add Calendar Event"}
              </Text>
              <TouchableOpacity
                onPress={() => setIsEventModalVisible(false)}
                style={styles.closeCircleBtn}
              >
                <Feather name="x" size={18} color={BENTO_COLORS.deepNavy} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.formLabel}>Event Title *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. Mid-term Examination"
                value={eventTitle}
                onChangeText={setEventTitle}
              />

              <Text style={styles.formLabel}>Category</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 6, marginVertical: 6 }}
              >
                {EVENT_CATEGORIES.map((cat) => {
                  const cfg = CATEGORY_CONFIG[cat];
                  const isSel = eventCategory === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.catChoicePill,
                        { backgroundColor: isSel ? BENTO_COLORS.deepNavy : cfg.bg },
                      ]}
                      onPress={() => setEventCategory(cat)}
                    >
                      <Text
                        style={[
                          styles.catChoicePillText,
                          { color: isSel ? "#ffffff" : cfg.text },
                        ]}
                      >
                        {cfg.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Start Date & End Date */}
              <View style={styles.rowInputs}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.formLabel}>Start Date (YYYY-MM-DD) *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="2026-08-22"
                    value={eventStartDate}
                    onChangeText={setEventStartDate}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.formLabel}>End Date (Optional)</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="2026-08-27"
                    value={eventEndDate}
                    onChangeText={setEventEndDate}
                  />
                </View>
              </View>

              {/* Week Number & Remarks */}
              <View style={styles.rowInputs}>
                <View style={{ width: 100 }}>
                  <Text style={styles.formLabel}>Week #</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="1"
                    value={eventWeekNumber}
                    onChangeText={setEventWeekNumber}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.formLabel}>Official Remarks</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. Offline Mode"
                    value={eventRemarks}
                    onChangeText={setEventRemarks}
                  />
                </View>
              </View>

              <Text style={styles.formLabel}>Description (Optional)</Text>
              <TextInput
                style={[styles.formInput, { height: 70 }]}
                placeholder="Additional event details..."
                value={eventDescription}
                onChangeText={setEventDescription}
                multiline
              />

              {/* Switches */}
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Is Holiday / Recess</Text>
                <Switch
                  value={eventIsHoliday}
                  onValueChange={setEventIsHoliday}
                  trackColor={{ false: "#e2e8f0", true: "#059669" }}
                />
              </View>

              <TouchableOpacity
                style={styles.primarySubmitPill}
                onPress={handleSaveEvent}
              >
                <Text style={styles.primarySubmitPillText}>
                  {editingEvent ? "Save Changes" : "Add Event"}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ========================================== */}
      {/* MODAL: LIVE STUDENT VIEW PREVIEW */}
      {/* ========================================== */}
      <Modal
        visible={isPreviewModalVisible}
        animationType="slide"
        onRequestClose={() => setIsPreviewModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: BENTO_COLORS.background }}>
          <View style={styles.previewTopBanner}>
            <View style={styles.previewBannerLeft}>
              <Feather name="eye" size={16} color="#0369a1" />
              <Text style={styles.previewBannerText}>
                Student View Preview (Draft State)
              </Text>
            </View>
            <TouchableOpacity
              style={styles.exitPreviewBtn}
              onPress={() => setIsPreviewModalVisible(false)}
            >
              <Text style={styles.exitPreviewBtnText}>Close Preview</Text>
            </TouchableOpacity>
          </View>

          {/* Mount the actual Student Screen UI */}
          <AcademicCalendarScreen />
        </View>
      </Modal>
    </View>
  );
}

// ==========================================
// STYLES
// ==========================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BENTO_COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BENTO_COLORS.background,
  },
  navHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 56,
    paddingBottom: 14,
    paddingHorizontal: 20,
    backgroundColor: BENTO_COLORS.background,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BENTO_COLORS.pillRadius,
    backgroundColor: BENTO_COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    ...BENTO_COLORS.shadow,
  },
  navTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
  },
  navSubtitle: {
    fontSize: 13,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    marginTop: 1,
  },
  createMainPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: BENTO_COLORS.deepNavy,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  createMainPillText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 13,
  },
  filterBar: {
    marginBottom: 12,
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  statusFilterPill: {
    backgroundColor: BENTO_COLORS.white,
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: BENTO_COLORS.pillRadius,
    ...BENTO_COLORS.shadow,
  },
  statusFilterPillActive: {
    backgroundColor: BENTO_COLORS.deepNavy,
  },
  statusFilterPillText: {
    fontSize: 13,
    fontWeight: "600",
    color: BENTO_COLORS.deepNavy,
  },
  statusFilterPillTextActive: {
    color: "#ffffff",
    fontWeight: "700",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  centerBox: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingLabel: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "600",
    color: BENTO_COLORS.subtleText,
  },
  emptyCard: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: BENTO_COLORS.cardRadius,
    padding: 32,
    alignItems: "center",
    marginTop: 20,
    ...BENTO_COLORS.shadow,
  },
  emptyCardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    marginBottom: 4,
  },
  emptyCardDesc: {
    fontSize: 13,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    textAlign: "center",
    marginBottom: 16,
  },
  emptyActionPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO_COLORS.deepNavy,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  emptyActionPillText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },

  // Admin Calendar Card in List
  adminCalendarBentoCard: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: BENTO_COLORS.cardRadius,
    padding: 18,
    marginBottom: 12,
    ...BENTO_COLORS.shadow,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  statusPillPublished: {
    backgroundColor: "#ecfdf5",
  },
  statusPillDraft: {
    backgroundColor: "#fef3c7",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#6b7280",
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#4b5563",
    textTransform: "uppercase",
  },
  eventCountBadge: {
    backgroundColor: BENTO_COLORS.background,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  eventCountText: {
    fontSize: 11,
    fontWeight: "700",
    color: BENTO_COLORS.subtleText,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    marginBottom: 2,
  },
  cardSemester: {
    fontSize: 13,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    marginBottom: 12,
  },
  cardMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.04)",
  },
  audienceTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  audienceTagText: {
    fontSize: 11,
    fontWeight: "600",
    color: BENTO_COLORS.subtleText,
  },
  cardActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
  },

  // Hero Bento Card (Detail)
  heroBentoCard: {
    backgroundColor: BENTO_COLORS.deepNavy,
    borderRadius: BENTO_COLORS.cardRadius,
    padding: 22,
    marginBottom: 16,
    ...BENTO_COLORS.shadow,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  heroWeekBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  heroWeekBadgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "800",
  },
  heroTotalEventsText: {
    color: "#c1dcff",
    fontSize: 12,
    fontWeight: "600",
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 4,
  },
  heroSemester: {
    fontSize: 13,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.7)",
  },

  // Admin Action Bento Card
  adminActionBentoCard: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: BENTO_COLORS.cardRadius,
    padding: 16,
    marginBottom: 16,
    ...BENTO_COLORS.shadow,
  },
  adminActionHeader: {
    fontSize: 14,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    marginBottom: 10,
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: BENTO_COLORS.pillRadius,
    flexGrow: 1,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: "700",
  },

  // Bento Section
  bentoSection: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
  },
  addEventMiniPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: BENTO_COLORS.deepNavy,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  addEventMiniPillText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
  },
  emptyEventsBox: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: BENTO_COLORS.cardRadius,
    padding: 30,
    alignItems: "center",
    ...BENTO_COLORS.shadow,
  },
  emptyEventsTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    marginBottom: 2,
  },
  emptyEventsDesc: {
    fontSize: 12,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    textAlign: "center",
  },

  // Modals (Bento Sheets)
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  methodChoiceContainer: {
    backgroundColor: BENTO_COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
    paddingBottom: 40,
  },
  modalSheetContainer: {
    backgroundColor: BENTO_COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
    maxHeight: "85%",
    paddingBottom: 30,
  },
  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  modalHeading: {
    fontSize: 18,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
  },
  modalSubheading: {
    fontSize: 12,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    marginTop: 2,
  },
  closeCircleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BENTO_COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },

  // Method Cards
  methodCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: BENTO_COLORS.background,
    padding: 16,
    borderRadius: 20,
    marginBottom: 10,
  },
  methodIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  methodTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    marginBottom: 2,
  },
  methodDesc: {
    fontSize: 12,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    lineHeight: 16,
  },

  // Duplicate list item
  duplicateItemCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: BENTO_COLORS.background,
    padding: 14,
    borderRadius: 16,
    marginBottom: 8,
  },
  duplicateItemTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
  },
  duplicateItemSub: {
    fontSize: 12,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    marginTop: 2,
  },
  clonePill: {
    backgroundColor: BENTO_COLORS.deepNavy,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  clonePillText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 11,
  },

  // Forms
  formLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
    marginBottom: 4,
    marginTop: 10,
  },
  formInput: {
    backgroundColor: BENTO_COLORS.background,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: BENTO_COLORS.deepNavy,
    fontWeight: "500",
  },
  rowInputs: {
    flexDirection: "row",
    gap: 10,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    marginVertical: 4,
  },
  switchLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
  },
  switchDesc: {
    fontSize: 11,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
  },
  audienceSelectorBox: {
    backgroundColor: BENTO_COLORS.background,
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
  },
  subLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: BENTO_COLORS.subtleText,
    marginBottom: 6,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
  },
  checkboxLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: BENTO_COLORS.deepNavy,
  },
  primarySubmitPill: {
    backgroundColor: BENTO_COLORS.deepNavy,
    paddingVertical: 14,
    borderRadius: BENTO_COLORS.pillRadius,
    alignItems: "center",
    marginTop: 18,
    marginBottom: 10,
  },
  primarySubmitPillText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 14,
  },

  // Category choice pill in Event form
  catChoicePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  catChoicePillText: {
    fontSize: 11,
    fontWeight: "700",
  },

  // CSV Import Modal Styles
  templateDownloadCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e0f2fe",
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  templateDownloadTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0369a1",
  },
  templateDownloadSub: {
    fontSize: 11,
    fontWeight: "500",
    color: "#0284c7",
  },
  uploadDashedZone: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#cbd5e1",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BENTO_COLORS.background,
    marginBottom: 14,
  },
  uploadZoneTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
    marginTop: 8,
    marginBottom: 2,
  },
  uploadZoneDesc: {
    fontSize: 11,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    textAlign: "center",
  },
  validatingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    backgroundColor: BENTO_COLORS.background,
    borderRadius: 14,
    marginBottom: 10,
  },
  validatingText: {
    fontSize: 12,
    fontWeight: "600",
    color: BENTO_COLORS.deepNavy,
  },
  validationReportCard: {
    backgroundColor: BENTO_COLORS.background,
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
  },
  validationReportHeading: {
    fontSize: 13,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    marginBottom: 10,
  },
  statPillsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  statPillItem: {
    flex: 1,
    backgroundColor: BENTO_COLORS.white,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: "center",
  },
  statPillNumber: {
    fontSize: 16,
    fontWeight: "900",
    color: BENTO_COLORS.deepNavy,
  },
  statPillLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: BENTO_COLORS.subtleText,
  },
  errorListContainer: {
    backgroundColor: "#fff1f2",
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
  },
  errorListHeading: {
    fontSize: 11,
    fontWeight: "800",
    color: "#be123c",
    marginBottom: 4,
  },
  errorItemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 2,
  },
  errorItemText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#9f1239",
  },
  successCheckRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#ecfdf5",
    padding: 8,
    borderRadius: 10,
    marginBottom: 10,
  },
  successCheckText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#047857",
  },
  previewListHeading: {
    fontSize: 11,
    fontWeight: "700",
    color: BENTO_COLORS.subtleText,
    marginBottom: 6,
  },
  miniPreviewCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: BENTO_COLORS.white,
    padding: 8,
    borderRadius: 10,
    marginBottom: 4,
  },
  miniPreviewDate: {
    fontSize: 11,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
    width: 80,
  },
  miniPreviewTitle: {
    flex: 1,
    fontSize: 11,
    fontWeight: "500",
    color: BENTO_COLORS.deepNavy,
    marginHorizontal: 6,
  },
  miniCategoryTag: {
    backgroundColor: BENTO_COLORS.background,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  miniCategoryTagText: {
    fontSize: 9,
    fontWeight: "700",
    color: BENTO_COLORS.subtleText,
  },

  // Preview Modal Banner
  previewTopBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#e0f2fe",
    paddingTop: 50,
    paddingBottom: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#bae6fd",
  },
  previewBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  previewBannerText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0369a1",
  },
  exitPreviewBtn: {
    backgroundColor: BENTO_COLORS.deepNavy,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  exitPreviewBtnText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
  },
});
