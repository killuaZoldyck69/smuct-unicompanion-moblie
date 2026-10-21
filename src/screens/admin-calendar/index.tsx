import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert,
  Platform,
  TextInput,
  BackHandler,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter, useNavigation } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import Toast from "react-native-toast-message";

import { useCurrentUser } from "@/hooks/use-current-user";
import {
  AcademicEventItem,
  CalendarStatus,
  CreateAcademicCalendarInput,
  CreateEventInput,
  EventCategory,
  UpdateEventInput,
  exportCalendarCsvAPI,
} from "@/services/calendar-service";
import {
  useAdminCalendars,
  useCalendarDetails,
  useCreateCalendar,
  useUpdateCalendar,
  useUpdateCalendarStatus,
  useDuplicateCalendar,
  useDeleteCalendar,
  useCreateCalendarEvent,
  useUpdateCalendarEvent,
  useDeleteCalendarEvent,
  useImportCalendarCsv,
} from "@/features/schedule/useSchedule";
import { AcademicCalendarScreen } from "../academic-calendar";

import { BENTO_COLORS } from "./constants";
import { groupEventsChronologically } from "./utils/grouping";
import { CalendarListCard } from "./components/CalendarListCard";
import { CalendarHeroBentoGrid } from "./components/CalendarHeroBentoGrid";
import { ActionTilesRow } from "./components/ActionTilesRow";
import { WeekBentoContainer } from "./components/WeekBentoContainer";
import { NodeInspectorModal } from "./components/NodeInspectorModal";
import { EditAudienceModal } from "./components/EditAudienceModal";
import { CreateCalendarModal } from "./components/CreateCalendarModal";
import { CsvImportModal } from "./components/CsvImportModal";
import {
  AdminConfirmModal,
  ConfirmModalVariant,
} from "./components/AdminConfirmModal";

export function AdminCalendarScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { role, isPending, user } = useCurrentUser();

  // Navigation State: 'LIST' or 'DETAIL' (defaults to LIST overview)
  const [currentView, setCurrentView] = useState<"LIST" | "DETAIL">("LIST");
  const [selectedCalendarId, setSelectedCalendarId] = useState<string | null>(
    null,
  );
  const [selectedStatusTab, setSelectedStatusTab] = useState<
    "ALL" | CalendarStatus
  >("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Stream Filters
  const [selectedCategoryFilter, setSelectedCategoryFilter] =
    useState<string>("ALL");

  // Modals State
  const [isMethodChoiceOpen, setIsMethodChoiceOpen] = useState(false);
  const [isManualCreateOpen, setIsManualCreateOpen] = useState(false);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isEditAudienceOpen, setIsEditAudienceOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    visible: boolean;
    variant: ConfirmModalVariant;
    title: string;
    message: string;
    targetBadge?: string;
    targetBadgeIcon?: React.ComponentProps<typeof Feather>["name"];
    confirmLabel?: string;
    onConfirm: () => void | Promise<void>;
  } | null>(null);

  // Node Inspector Modal
  const [isNodeInspectorOpen, setIsNodeInspectorOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AcademicEventItem | null>(
    null,
  );
  const [defaultWeekNumber, setDefaultWeekNumber] = useState<
    number | null | undefined
  >(null);

  // Student Preview Modal
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Queries & Mutations
  const {
    data: calendars = [],
    isLoading: isLoadingCalendars,
    refetch: refetchCalendars,
  } = useAdminCalendars();

  // Dynamic status tab counts matching image
  const allTermsCount = calendars.length;
  const activeTermsCount = useMemo(
    () => calendars.filter((c) => c.status === "PUBLISHED").length,
    [calendars],
  );
  const draftTermsCount = useMemo(
    () => calendars.filter((c) => c.status === "DRAFT").length,
    [calendars],
  );
  const archivedTermsCount = useMemo(
    () => calendars.filter((c) => c.status === "ARCHIVED").length,
    [calendars],
  );

  // Status Filter options: ALL, Active, Draft, Archived with numbers
  const statusTabs: Array<{ key: "ALL" | CalendarStatus; label: string }> = [
    { key: "ALL", label: `ALL (${allTermsCount})` },
    { key: "PUBLISHED", label: `Active (${activeTermsCount})` },
    { key: "DRAFT", label: `Draft (${draftTermsCount})` },
    { key: "ARCHIVED", label: `Archived (${archivedTermsCount})` },
  ];

  // Filtered calendars by status and search query
  const filteredCalendars = useMemo(() => {
    let list = calendars;
    if (selectedStatusTab !== "ALL") {
      list = list.filter((c) => c.status === selectedStatusTab);
    }
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.title?.toLowerCase().includes(q) ||
          c.semester?.toLowerCase().includes(q) ||
          c.academicYear?.toString().includes(q) ||
          c.targetPrograms?.some((p) => p.toLowerCase().includes(q)) ||
          c.targetFaculties?.some((f) => f.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [calendars, selectedStatusTab, searchQuery]);

  // Hardware Back Button Handler on Android: return to LIST from DETAIL
  React.useEffect(() => {
    const onHardwareBackPress = () => {
      if (currentView === "DETAIL") {
        setCurrentView("LIST");
        return true;
      }
      return false;
    };

    const backSub = BackHandler.addEventListener(
      "hardwareBackPress",
      onHardwareBackPress,
    );
    return () => backSub.remove();
  }, [currentView]);

  // Default floating tab bar style to restore on LIST view
  const defaultTabBarStyle = useMemo(
    () => ({
      position: "absolute" as const,
      bottom: insets.bottom > 0 ? insets.bottom + 16 : 24,
      marginHorizontal: 20,
      height: 72,
      backgroundColor: "#131b2e",
      borderRadius: 20,
      borderTopWidth: 0,
      elevation: 8,
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.25,
      shadowRadius: 18,
      paddingBottom: 0,
      paddingTop: 0,
    }),
    [insets.bottom],
  );

  // Dynamically hide tab bar on DETAIL view and show on LIST view
  React.useEffect(() => {
    if (!navigation || typeof navigation.setOptions !== "function") return;

    if (currentView === "DETAIL") {
      navigation.setOptions({
        tabBarStyle: { display: "none" },
      });
    } else {
      navigation.setOptions({
        tabBarStyle: defaultTabBarStyle,
      });
    }

    return () => {
      navigation.setOptions({
        tabBarStyle: defaultTabBarStyle,
      });
    };
  }, [currentView, navigation, defaultTabBarStyle]);

  // Fallback to active calendar ONLY IF currently on DETAIL view and none is selected
  React.useEffect(() => {
    if (
      currentView === "DETAIL" &&
      !selectedCalendarId &&
      calendars.length > 0
    ) {
      const active =
        calendars.find((c) => c.status === "PUBLISHED") || calendars[0];
      setSelectedCalendarId(active.id);
    }
  }, [currentView, calendars, selectedCalendarId]);

  const {
    data: selectedCalendar,
    isLoading: isLoadingCalendarDetail,
    refetch: refetchCalendarDetail,
  } = useCalendarDetails(selectedCalendarId || undefined);

  const createCalendarMutation = useCreateCalendar();
  const updateCalendarMutation = useUpdateCalendar();
  const updateStatusMutation = useUpdateCalendarStatus();
  const duplicateCalendarMutation = useDuplicateCalendar();
  const deleteCalendarMutation = useDeleteCalendar();
  const createEventMutation = useCreateCalendarEvent();
  const updateEventMutation = useUpdateCalendarEvent();
  const deleteEventMutation = useDeleteCalendarEvent();
  const importCsvMutation = useImportCalendarCsv();

  // Category counts and filtered events
  const allEvents = selectedCalendar?.events || [];

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: allEvents.length,
      CLASS: 0,
      EXAM: 0,
      HOLIDAY: 0,
      DEADLINE: 0,
      REGISTRATION: 0,
      MAKEUP_CLASS: 0,
      RESULT: 0,
      ACADEMIC: 0,
    };
    allEvents.forEach((ev) => {
      if (counts[ev.category] !== undefined) {
        counts[ev.category]++;
      } else {
        counts[ev.category] = 1;
      }
    });
    return counts;
  }, [allEvents]);

  // Filtered events
  const filteredEvents = useMemo(() => {
    if (selectedCategoryFilter !== "ALL") {
      return allEvents.filter((ev) => ev.category === selectedCategoryFilter);
    }
    return allEvents;
  }, [allEvents, selectedCategoryFilter]);

  // Group events into chronological week / phase bento containers
  const weekGroups = useMemo(() => {
    return groupEventsChronologically(filteredEvents);
  }, [filteredEvents]);

  // Calculate total weeks & active week progress
  const totalWeeksCount = useMemo(() => {
    let maxWk = 15;
    allEvents.forEach((e) => {
      if (e.weekNumber && e.weekNumber > maxWk) maxWk = e.weekNumber;
    });
    return maxWk;
  }, [allEvents]);

  // Open Details Screen
  const handleOpenDetail = (id: string) => {
    setSelectedCalendarId(id);
    setCurrentView("DETAIL");
  };

  // Status Change Handler
  const handleStatusChange = async (
    targetCalendarId: string,
    status: CalendarStatus,
  ) => {
    try {
      await updateStatusMutation.mutateAsync({
        id: targetCalendarId,
        status,
      });
      Toast.show({
        type: "success",
        text1: "Status Updated",
        text2: `Academic calendar is now ${status}.`,
      });
      refetchCalendars();
      if (selectedCalendarId === targetCalendarId) {
        refetchCalendarDetail();
      }
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Status Update Failed",
        text2: err.message || "Could not update calendar status.",
      });
    }
  };

  // Archive / Restore with explanation
  const handleArchiveCalendar = () => {
    if (!selectedCalendar) return;
    const isArchived = selectedCalendar.status === "ARCHIVED";
    const badgeText =
      `${selectedCalendar.semester} ${selectedCalendar.academicYear || ""}`.trim() ||
      selectedCalendar.title;

    if (isArchived) {
      setConfirmModal({
        visible: true,
        variant: "revert",
        title: "Restore Academic Calendar",
        targetBadge: badgeText,
        targetBadgeIcon: "rotate-ccw",
        message: `Restoring "${selectedCalendar.title}" will move it back to Draft status so it can be managed and published.`,
        confirmLabel: "Restore to Draft",
        onConfirm: async () => {
          setConfirmModal(null);
          await handleStatusChange(selectedCalendar.id, "DRAFT");
        },
      });
      return;
    }

    setConfirmModal({
      visible: true,
      variant: "archive",
      title: "Archive Academic Calendar",
      targetBadge: badgeText,
      targetBadgeIcon: "archive",
      message: `Archiving "${selectedCalendar.title}" will hide it from active student and faculty dashboards while keeping historical archives. You can unarchive it anytime.`,
      confirmLabel: "Archive Calendar",
      onConfirm: async () => {
        setConfirmModal(null);
        await handleStatusChange(selectedCalendar.id, "ARCHIVED");
      },
    });
  };

  // Duplicate / Clone Handler
  const handleDuplicateCalendar = async (id: string) => {
    try {
      const cloned = await duplicateCalendarMutation.mutateAsync(id);
      Toast.show({
        type: "success",
        text1: "Calendar Cloned",
        text2: "Duplicated into a fresh Draft.",
      });
      setIsDuplicateModalOpen(false);
      refetchCalendars();
      if (cloned?.id) {
        handleOpenDetail(cloned.id);
      }
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Clone Failed",
        text2: err.message || "Failed to clone academic calendar.",
      });
    }
  };

  // Delete Calendar Handler
  const handleDeleteCalendar = async (
    id: string,
    title?: string,
    requireConfirm = false,
  ) => {
    const doDelete = async () => {
      try {
        await deleteCalendarMutation.mutateAsync(id);
        Toast.show({
          type: "info",
          text1: "Calendar Deleted",
          text2: "Academic calendar removed.",
        });
        refetchCalendars();
        if (selectedCalendarId === id) {
          setCurrentView("LIST");
          setSelectedCalendarId(null);
        }
      } catch (err: any) {
        Toast.show({
          type: "error",
          text1: "Delete Failed",
          text2: err.message || "Failed to delete calendar.",
        });
      }
    };

    if (requireConfirm) {
      setConfirmModal({
        visible: true,
        variant: "delete",
        title: "Delete Academic Calendar",
        targetBadge: title || "Academic Calendar",
        targetBadgeIcon: "calendar",
        message: `Are you sure you want to permanently delete "${title || "this calendar"}"? This action cannot be undone and will permanently remove all associated calendar dates and event nodes.`,
        confirmLabel: "Delete Calendar",
        onConfirm: async () => {
          setConfirmModal(null);
          await doDelete();
        },
      });
    } else {
      await doDelete();
    }
  };

  // Export CSV Handler
  const handleExportCsv = async () => {
    if (!selectedCalendarId) return;

    try {
      const csvData = await exportCalendarCsvAPI(selectedCalendarId);
      const safeName = (
        selectedCalendar?.semester || "academic_calendar"
      ).replace(/\s+/g, "_");

      if (Platform.OS === "web") {
        const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${safeName}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        Toast.show({ type: "success", text1: "CSV Export Downloaded" });
      } else {
        const baseDir =
          FileSystem.documentDirectory || FileSystem.cacheDirectory || "";
        const fileUri = `${baseDir}${safeName}.csv`;
        await FileSystem.writeAsStringAsync(fileUri, csvData, {
          encoding: FileSystem.EncodingType.UTF8,
        });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: "text/csv",
            dialogTitle: `Export ${selectedCalendar?.semester || "Calendar"}`,
          });
        } else {
          Toast.show({ type: "success", text1: "CSV Saved Locally" });
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

  // Save Event via Node Inspector
  const handleSaveEvent = async (
    payload: CreateEventInput | UpdateEventInput,
  ) => {
    if (!selectedCalendarId) return;

    if (editingEvent) {
      await updateEventMutation.mutateAsync({
        calendarId: selectedCalendarId,
        eventId: editingEvent.id,
        data: payload,
      });
      Toast.show({ type: "success", text1: "Node Updated Successfully" });
    } else {
      await createEventMutation.mutateAsync({
        calendarId: selectedCalendarId,
        data: payload as CreateEventInput,
      });
      Toast.show({ type: "success", text1: "Node Added to Timeline" });
    }
    refetchCalendarDetail();
  };

  // Delete Single Event
  const handleDeleteEvent = async (eventId: string, title: string) => {
    if (!selectedCalendarId) return;
    try {
      await deleteEventMutation.mutateAsync({
        calendarId: selectedCalendarId,
        eventId,
      });
      Toast.show({ type: "info", text1: `"${title}" removed` });
      refetchCalendarDetail();
    } catch (err: any) {
      Toast.show({ type: "error", text1: "Delete Failed", text2: err.message });
    }
  };

  // Prompt confirmation before deleting an event node
  const promptDeleteEvent = (eventId: string, title: string) => {
    setConfirmModal({
      visible: true,
      variant: "delete",
      title: "Delete Event Node",
      targetBadge: title,
      targetBadgeIcon: "calendar",
      message: `Are you sure you want to permanently remove "${title}" from the academic schedule?`,
      confirmLabel: "Delete Event",
      onConfirm: async () => {
        setConfirmModal(null);
        await handleDeleteEvent(eventId, title);
      },
    });
  };

  // Open Node Inspector for Add
  const handleOpenAddEvent = (weekNum?: number | null) => {
    setEditingEvent(null);
    setDefaultWeekNumber(weekNum);
    setIsNodeInspectorOpen(true);
  };

  // Open Node Inspector for Edit
  const handleOpenEditEvent = (event: AcademicEventItem) => {
    setEditingEvent(event);
    setDefaultWeekNumber(event.weekNumber);
    setIsNodeInspectorOpen(true);
  };

  // Update Scope & Cohorts & Title
  const handleSaveAudience = async (payload: {
    title?: string;
    semester?: string;
    academicYear?: number;
    targetFaculties: string[];
    targetPrograms: string[];
    semesterDuration: string;
    targetBatch: string;
  }) => {
    if (!selectedCalendarId) return;
    await updateCalendarMutation.mutateAsync({
      id: selectedCalendarId,
      data: payload,
    });
    Toast.show({ type: "success", text1: "Calendar Settings Updated" });
    refetchCalendarDetail();
    refetchCalendars();
  };

  // Commit CSV Import
  const handleCommitCsvImport = async (
    csvContent: string,
    meta?: {
      title?: string;
      semester?: string;
      academicYear?: number;
      semesterDuration?: string;
      targetFaculties?: string[];
      targetPrograms?: string[];
      targetBatch?: string;
    },
  ) => {
    if (selectedCalendarId) {
      await importCsvMutation.mutateAsync({
        calendarId: selectedCalendarId,
        csvContent,
      });
      Toast.show({ type: "success", text1: "Schedule Imported Successfully" });
      refetchCalendarDetail();
      refetchCalendars();
    } else {
      const currentYear = new Date().getFullYear();
      const sem = meta?.semester || "Summer";
      const year = meta?.academicYear || currentYear;
      const duration = meta?.semesterDuration || "6 Months";
      const defaultTitle = `${sem} Semester ${year}${duration === "4 Months" ? " (4-Month)" : ""}`;
      const title = meta?.title?.trim() || defaultTitle;

      const newCal = await createCalendarMutation.mutateAsync({
        title,
        semester: sem,
        academicYear: year,
        semesterDuration: duration,
        targetFaculties: meta?.targetFaculties || [],
        targetPrograms: meta?.targetPrograms || [],
        targetBatch: meta?.targetBatch || undefined,
        status: "DRAFT",
      });
      await importCsvMutation.mutateAsync({
        calendarId: newCal.id,
        csvContent,
      });
      Toast.show({
        type: "success",
        text1: "Calendar Created",
        text2: `"${title}" draft schedule populated from CSV.`,
      });
      refetchCalendars();
      handleOpenDetail(newCal.id);
    }
  };

  // Auth Guard
  if (isPending || role !== "ADMIN") {
    return (
      <View style={styles.centerBox}>
        <ActivityIndicator size="large" color={BENTO_COLORS.deepNavy} />
      </View>
    );
  }

  // ==========================================
  // VIEW: CALENDARS LIST SCREEN
  // ==========================================
  if (currentView === "LIST") {
    return (
      <View style={styles.container}>
        {/* FIXED TOP HEADER SECTION (Pinned at top) */}
        <View
          style={[
            styles.fixedHeaderContainer,
            { paddingTop: Math.max(insets.top + 8, 44) },
          ]}
        >
          {/* 1. PAGE TITLE & SUBTITLE */}
          <View style={styles.pageHeader}>
            <Text style={styles.pageTitle}>Academic Calendars & Terms</Text>
            <Text style={styles.pageSubtitle}>
              Manage institutional timelines, exam periods, and semester
              schedules.
            </Text>
          </View>

          {/* 2. SEARCH & ACTION ROW (Search Box + Create Calendar Button beside it) */}
          <View style={styles.actionSearchRow}>
            {/* Search Box */}
            <View style={styles.searchBox}>
              <Feather name="search" size={15} color="#94a3b8" />
              <TextInput
                style={styles.searchBoxInput}
                placeholder="Search calendars, terms..."
                placeholderTextColor="#94a3b8"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCorrect={false}
                clearButtonMode="while-editing"
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery("")}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Feather name="x" size={14} color="#94a3b8" />
                </TouchableOpacity>
              )}
            </View>

            {/* Create Calendar Button */}
            <TouchableOpacity
              style={styles.createBtn}
              onPress={() => setIsMethodChoiceOpen(true)}
              activeOpacity={0.85}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Create Calendar"
            >
              <Feather name="plus" size={15} color="#ffffff" />
              <Text style={styles.createBtnText}>Create</Text>
            </TouchableOpacity>
          </View>

          {/* 3. FILTER TABS STRIP (ALL, Active, Draft, Archived with numbers) */}
          <View style={styles.filterTabsContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterTabsScroll}
            >
              {statusTabs.map((tab) => {
                const isSelected = selectedStatusTab === tab.key;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    style={[
                      styles.filterTabPill,
                      isSelected && styles.filterTabPillActive,
                    ]}
                    onPress={() => setSelectedStatusTab(tab.key)}
                    activeOpacity={0.75}
                  >
                    <Text
                      style={[
                        styles.filterTabPillText,
                        isSelected && styles.filterTabPillActiveText,
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>

        {/* SCROLLABLE CALENDAR CARDS LIST */}
        <ScrollView
          style={styles.cardsScrollView}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 4. CALENDAR CARDS LIST */}
          {isLoadingCalendars ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color={BENTO_COLORS.deepNavy} />
              <Text style={styles.loadingText}>Loading Calendars...</Text>
            </View>
          ) : filteredCalendars.length === 0 ? (
            <View style={styles.emptyCard}>
              <Feather
                name="calendar"
                size={40}
                color="#94a3b8"
                style={{ marginBottom: 12 }}
              />
              <Text style={styles.emptyTitle}>
                {searchQuery.trim()
                  ? "No Matching Calendars"
                  : "No Calendars Found"}
              </Text>
              <Text style={styles.emptyDesc}>
                {searchQuery.trim()
                  ? `No academic calendars match "${searchQuery.trim()}".`
                  : `No ${selectedStatusTab.toLowerCase()} academic calendars found.`}
              </Text>
              {searchQuery.trim().length > 0 ? (
                <TouchableOpacity
                  style={styles.emptyCreateBtn}
                  onPress={() => setSearchQuery("")}
                >
                  <Feather name="x" size={15} color="#ffffff" />
                  <Text style={styles.emptyCreateBtnText}>Clear Search</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.emptyCreateBtn}
                  onPress={() => setIsMethodChoiceOpen(true)}
                >
                  <Feather name="plus" size={15} color="#ffffff" />
                  <Text style={styles.emptyCreateBtnText}>Create Calendar</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            filteredCalendars.map((cal) => (
              <CalendarListCard
                key={cal.id}
                calendar={cal}
                onOpenDetail={handleOpenDetail}
                onStatusChange={(id, status) => handleStatusChange(id, status)}
                onDuplicate={handleDuplicateCalendar}
                onDelete={(id, title) => handleDeleteCalendar(id, title)}
              />
            ))
          )}
        </ScrollView>

        {/* Creation Method Choice Modal */}
        <Modal
          visible={isMethodChoiceOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setIsMethodChoiceOpen(false)}
          statusBarTranslucent={true}
        >
          <View
            style={[
              styles.modalOverlay,
              { paddingTop: Math.max(insets.top, 24) },
            ]}
          >
            {/* Backdrop tap to dismiss */}
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={() => setIsMethodChoiceOpen(false)}
            />

            <View
              style={[
                styles.choiceSheet,
                { paddingBottom: Math.max(insets.bottom + 20, 28) },
              ]}
            >
              <View style={styles.sheetHeader}>
                <View>
                  <Text style={styles.sheetTitle}>
                    Create Academic Calendar
                  </Text>
                  <Text style={styles.sheetSubtitle}>
                    Choose how you want to build this semester.
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setIsMethodChoiceOpen(false)}
                  style={styles.closeBtn}
                >
                  <Feather name="x" size={18} color="#0f172a" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.methodOption}
                onPress={() => {
                  setIsMethodChoiceOpen(false);
                  setIsManualCreateOpen(true);
                }}
                activeOpacity={0.8}
              >
                <View
                  style={[styles.methodIconBox, { backgroundColor: "#e0f2fe" }]}
                >
                  <Feather name="edit-3" size={20} color="#0284c7" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.methodTitle}>Create Manually</Text>
                  <Text style={styles.methodDesc}>
                    Build calendar from scratch and add individual events.
                  </Text>
                </View>
                <Feather name="chevron-right" size={16} color="#94a3b8" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.methodOption}
                onPress={() => {
                  setIsMethodChoiceOpen(false);
                  setSelectedCalendarId(null);
                  setIsCsvModalOpen(true);
                }}
                activeOpacity={0.8}
              >
                <View
                  style={[styles.methodIconBox, { backgroundColor: "#d1fae5" }]}
                >
                  <Feather name="upload-cloud" size={20} color="#047857" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.methodTitle}>Import CSV</Text>
                  <Text style={styles.methodDesc}>
                    Bulk upload your complete semester schedule from CSV.
                  </Text>
                </View>
                <Feather name="chevron-right" size={16} color="#94a3b8" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.methodOption}
                onPress={() => {
                  setIsMethodChoiceOpen(false);
                  setIsDuplicateModalOpen(true);
                }}
                activeOpacity={0.8}
              >
                <View
                  style={[styles.methodIconBox, { backgroundColor: "#fef3c7" }]}
                >
                  <Feather name="copy" size={20} color="#b45309" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.methodTitle}>Duplicate Existing</Text>
                  <Text style={styles.methodDesc}>
                    Clone an existing semester's calendar into a fresh Draft.
                  </Text>
                </View>
                <Feather name="chevron-right" size={16} color="#94a3b8" />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal: Clone Existing Calendar Picker */}
        <Modal
          visible={isDuplicateModalOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setIsDuplicateModalOpen(false)}
          statusBarTranslucent={true}
        >
          <View
            style={[
              styles.modalOverlay,
              { paddingTop: Math.max(insets.top, 24) },
            ]}
          >
            {/* Backdrop tap to dismiss */}
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={() => setIsDuplicateModalOpen(false)}
            />

            <View
              style={[
                styles.choiceSheet,
                { paddingBottom: Math.max(insets.bottom + 20, 28) },
              ]}
            >
              <View style={styles.sheetHeader}>
                <View>
                  <Text style={styles.sheetTitle}>Clone Calendar</Text>
                  <Text style={styles.sheetSubtitle}>
                    Select a semester to duplicate as a new draft
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setIsDuplicateModalOpen(false)}
                  style={styles.closeBtn}
                >
                  <Feather name="x" size={18} color="#0f172a" />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ maxHeight: 340 }}>
                {calendars.map((cal) => (
                  <TouchableOpacity
                    key={cal.id}
                    style={styles.cloneRow}
                    onPress={() => handleDuplicateCalendar(cal.id)}
                    activeOpacity={0.8}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cloneTitle}>{cal.title}</Text>
                      <Text style={styles.cloneSub}>
                        {cal.semester}{" "}
                        {cal.academicYear ? `• AY ${cal.academicYear}` : ""} •{" "}
                        {cal.events?.length || 0} events
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

        {/* Modal: Create Calendar Manually */}
        <CreateCalendarModal
          visible={isManualCreateOpen}
          onClose={() => setIsManualCreateOpen(false)}
          onCreate={async (payload: CreateAcademicCalendarInput) => {
            const created = await createCalendarMutation.mutateAsync(payload);
            Toast.show({
              type: "success",
              text1: "Draft Calendar Created",
            });
            refetchCalendars();
            if (created?.id) {
              handleOpenDetail(created.id);
            }
            return created?.id;
          }}
        />

        {/* Modal: CSV Upload Modal (for new calendar) */}
        <CsvImportModal
          visible={isCsvModalOpen}
          calendarId={null}
          onClose={() => setIsCsvModalOpen(false)}
          onImportSuccess={handleCommitCsvImport}
        />

        {/* Confirmation Modal */}
        {confirmModal && (
          <AdminConfirmModal
            visible={confirmModal.visible}
            onClose={() => setConfirmModal(null)}
            onConfirm={confirmModal.onConfirm}
            variant={confirmModal.variant}
            title={confirmModal.title}
            targetBadge={confirmModal.targetBadge}
            targetBadgeIcon={confirmModal.targetBadgeIcon}
            message={confirmModal.message}
            confirmLabel={confirmModal.confirmLabel}
          />
        )}
      </View>
    );
  }

  // ==========================================
  // VIEW: CALENDAR DETAILS SCREEN (MATCHING SCREENSHOT)
  // ==========================================
  const isPub = selectedCalendar?.status === "PUBLISHED";
  const isDraft = selectedCalendar?.status === "DRAFT";

  return (
    <View style={styles.container}>
      {/* 1. TOP HEADER MATCHING SCREENSHOT */}
      <View
        style={[styles.topHeader, { paddingTop: Math.max(insets.top + 8, 48) }]}
      >
        <TouchableOpacity
          onPress={() => setCurrentView("LIST")}
          style={styles.headerIconBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Back to calendar list"
        >
          <Feather name="arrow-left" size={18} color="#0f172a" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerSemesterText} numberOfLines={1}>
            {selectedCalendar
              ? `${selectedCalendar.semester} ${selectedCalendar.academicYear || ""}`.trim()
              : "Summer 2026"}
          </Text>
          <Text style={styles.headerSubtitleText}>
            Academic Cohort Calendar
          </Text>
        </View>
      </View>

      {/* Main Content Scroll */}
      <ScrollView
        contentContainerStyle={[
          styles.detailsScrollContent,
          { paddingBottom: Math.max(insets.bottom + 24, 36) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {isLoadingCalendarDetail ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={BENTO_COLORS.deepNavy} />
            <Text style={styles.loadingText}>Loading Cohort Stream...</Text>
          </View>
        ) : !selectedCalendar ? (
          <View style={styles.centerBox}>
            <Text style={styles.emptyTitle}>Academic Calendar Not Found</Text>
          </View>
        ) : (
          <>
            {/* 2. TOP OVERVIEW BENTO CARD (FULL WIDTH) */}
            <CalendarHeroBentoGrid
              calendar={selectedCalendar}
              onManageCohorts={() => setIsEditAudienceOpen(true)}
            />

            {/* 3. ACTION TILES ROW (4 SOFT BENTO TILES) */}
            <ActionTilesRow
              onAddEvent={() => handleOpenAddEvent()}
              onImport={() => setIsCsvModalOpen(true)}
              onPreview={() => setIsPreviewOpen(true)}
              onArchive={handleArchiveCalendar}
              isArchived={selectedCalendar.status === "ARCHIVED"}
            />

            {/* 4. TIMELINE STREAM HEADER */}
            <View style={styles.streamHeaderRow}>
              <View style={styles.streamTitleLeft}>
                <View style={styles.streamDot} />
                <Text style={styles.streamHeading}>Timeline Stream</Text>
                <View style={styles.nodesBadge}>
                  <Text style={styles.nodesBadgeText}>
                    {filteredEvents.length} Nodes
                  </Text>
                </View>
              </View>
            </View>

            {/* 5. HORIZONTAL CATEGORY FILTER STRIP */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryFilterScroll}
            >
              {/* All */}
              <TouchableOpacity
                style={[
                  styles.catFilterPill,
                  selectedCategoryFilter === "ALL" &&
                    styles.catFilterPillActive,
                ]}
                onPress={() => setSelectedCategoryFilter("ALL")}
              >
                <Text
                  style={[
                    styles.catFilterPillText,
                    selectedCategoryFilter === "ALL" &&
                      styles.catFilterPillTextActive,
                  ]}
                >
                  All ({categoryCounts.ALL || 0})
                </Text>
              </TouchableOpacity>

              {/* Classes */}
              <TouchableOpacity
                style={[
                  styles.catFilterPill,
                  selectedCategoryFilter === "CLASS" &&
                    styles.catFilterPillActive,
                ]}
                onPress={() => setSelectedCategoryFilter("CLASS")}
              >
                <View
                  style={[styles.filterDot, { backgroundColor: "#0284c7" }]}
                />
                <Text
                  style={[
                    styles.catFilterPillText,
                    selectedCategoryFilter === "CLASS" &&
                      styles.catFilterPillTextActive,
                  ]}
                >
                  Classes ({categoryCounts.CLASS || 0})
                </Text>
              </TouchableOpacity>

              {/* Exams */}
              <TouchableOpacity
                style={[
                  styles.catFilterPill,
                  selectedCategoryFilter === "EXAM" &&
                    styles.catFilterPillActive,
                ]}
                onPress={() => setSelectedCategoryFilter("EXAM")}
              >
                <View
                  style={[styles.filterDot, { backgroundColor: "#d97706" }]}
                />
                <Text
                  style={[
                    styles.catFilterPillText,
                    selectedCategoryFilter === "EXAM" &&
                      styles.catFilterPillTextActive,
                  ]}
                >
                  Exams ({categoryCounts.EXAM || 0})
                </Text>
              </TouchableOpacity>

              {/* Holidays */}
              <TouchableOpacity
                style={[
                  styles.catFilterPill,
                  selectedCategoryFilter === "HOLIDAY" &&
                    styles.catFilterPillActive,
                ]}
                onPress={() => setSelectedCategoryFilter("HOLIDAY")}
              >
                <View
                  style={[styles.filterDot, { backgroundColor: "#059669" }]}
                />
                <Text
                  style={[
                    styles.catFilterPillText,
                    selectedCategoryFilter === "HOLIDAY" &&
                      styles.catFilterPillTextActive,
                  ]}
                >
                  Holidays ({categoryCounts.HOLIDAY || 0})
                </Text>
              </TouchableOpacity>

              {/* Deadlines */}
              <TouchableOpacity
                style={[
                  styles.catFilterPill,
                  selectedCategoryFilter === "DEADLINE" &&
                    styles.catFilterPillActive,
                ]}
                onPress={() => setSelectedCategoryFilter("DEADLINE")}
              >
                <View
                  style={[styles.filterDot, { backgroundColor: "#dc2626" }]}
                />
                <Text
                  style={[
                    styles.catFilterPillText,
                    selectedCategoryFilter === "DEADLINE" &&
                      styles.catFilterPillTextActive,
                  ]}
                >
                  Deadlines ({categoryCounts.DEADLINE || 0})
                </Text>
              </TouchableOpacity>

              {/* Registration */}
              <TouchableOpacity
                style={[
                  styles.catFilterPill,
                  selectedCategoryFilter === "REGISTRATION" &&
                    styles.catFilterPillActive,
                ]}
                onPress={() => setSelectedCategoryFilter("REGISTRATION")}
              >
                <View
                  style={[styles.filterDot, { backgroundColor: "#7e22ce" }]}
                />
                <Text
                  style={[
                    styles.catFilterPillText,
                    selectedCategoryFilter === "REGISTRATION" &&
                      styles.catFilterPillTextActive,
                  ]}
                >
                  Registration ({categoryCounts.REGISTRATION || 0})
                </Text>
              </TouchableOpacity>

              {/* Makeup */}
              <TouchableOpacity
                style={[
                  styles.catFilterPill,
                  selectedCategoryFilter === "MAKEUP_CLASS" &&
                    styles.catFilterPillActive,
                ]}
                onPress={() => setSelectedCategoryFilter("MAKEUP_CLASS")}
              >
                <View
                  style={[styles.filterDot, { backgroundColor: "#0891b2" }]}
                />
                <Text
                  style={[
                    styles.catFilterPillText,
                    selectedCategoryFilter === "MAKEUP_CLASS" &&
                      styles.catFilterPillTextActive,
                  ]}
                >
                  Makeup ({categoryCounts.MAKEUP_CLASS || 0})
                </Text>
              </TouchableOpacity>
            </ScrollView>

            {/* 6. WEEK & PHASE BENTO CONTAINERS LIST */}
            <View style={styles.weekContainersList}>
              {weekGroups.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Feather name="calendar" size={36} color="#94a3b8" />
                  <Text style={styles.emptyTitle}>No Nodes Match Filter</Text>
                  <Text style={styles.emptyDesc}>
                    Try selecting a different category filter or choose "All".
                  </Text>
                  <TouchableOpacity
                    style={styles.emptyCreateBtn}
                    onPress={() => {
                      setSelectedCategoryFilter("ALL");
                    }}
                  >
                    <Text style={styles.emptyCreateBtnText}>Reset Filters</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                weekGroups.map((group) => (
                  <WeekBentoContainer
                    key={group.id}
                    group={group}
                    onAddEventToWeek={handleOpenAddEvent}
                    onEditEvent={handleOpenEditEvent}
                    onDeleteEvent={(ev) => promptDeleteEvent(ev.id, ev.title)}
                  />
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* 7. NODE INSPECTOR BOTTOM SHEET (ADD & EDIT EVENT) */}
      <NodeInspectorModal
        visible={isNodeInspectorOpen}
        editingEvent={editingEvent}
        defaultWeekNumber={defaultWeekNumber}
        onClose={() => setIsNodeInspectorOpen(false)}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
      />

      {/* EDIT AUDIENCE / COHORTS MODAL */}
      {selectedCalendar && (
        <EditAudienceModal
          visible={isEditAudienceOpen}
          calendar={selectedCalendar}
          onClose={() => setIsEditAudienceOpen(false)}
          onSave={handleSaveAudience}
        />
      )}

      {/* CSV IMPORT MODAL */}
      <CsvImportModal
        visible={isCsvModalOpen}
        calendarId={selectedCalendarId}
        calendarSemester={selectedCalendar?.semester}
        onClose={() => setIsCsvModalOpen(false)}
        onImportSuccess={handleCommitCsvImport}
      />

      {/* STUDENT PREVIEW MODAL */}
      <Modal
        visible={isPreviewOpen}
        animationType="slide"
        onRequestClose={() => setIsPreviewOpen(false)}
        statusBarTranslucent={true}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: BENTO_COLORS.background,
            paddingBottom: insets.bottom,
          }}
        >
          <View
            style={[
              styles.previewBanner,
              { paddingTop: Math.max(insets.top + 8, 44) },
            ]}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <Feather name="eye" size={15} color="#0369a1" />
              <Text style={styles.previewBannerText}>Student View Preview</Text>
            </View>
            <TouchableOpacity
              style={styles.closePreviewBtn}
              onPress={() => setIsPreviewOpen(false)}
            >
              <Text style={styles.closePreviewBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
          <AcademicCalendarScreen />
        </View>
      </Modal>

      {/* Confirmation Modal */}
      {confirmModal && (
        <AdminConfirmModal
          visible={confirmModal.visible}
          onClose={() => setConfirmModal(null)}
          onConfirm={confirmModal.onConfirm}
          variant={confirmModal.variant}
          title={confirmModal.title}
          targetBadge={confirmModal.targetBadge}
          targetBadgeIcon={confirmModal.targetBadgeIcon}
          message={confirmModal.message}
          confirmLabel={confirmModal.confirmLabel}
        />
      )}
    </View>
  );
}

export default AdminCalendarScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  centerBox: {
    paddingVertical: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 54,
    paddingBottom: 14,
    paddingHorizontal: 20,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 52,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
    ...BENTO_COLORS.shadow,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  headerSemesterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerSemesterText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: -0.3,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  liveBadgeGreen: {
    backgroundColor: "#ecfdf5",
  },
  liveBadgeAmber: {
    backgroundColor: "#fffbeb",
  },
  liveBadgeSlate: {
    backgroundColor: "#f1f5f9",
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  liveBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  headerSubtitleText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#64748b",
    marginTop: 1,
  },
  headerRightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchBarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: "#0f172a",
    paddingVertical: 4,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  // Fixed Top Section
  fixedHeaderContainer: {
    backgroundColor: "#f8fafc",
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  // Page Header
  pageHeader: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 12.5,
    fontWeight: "500",
    color: "#64748b",
    lineHeight: 18,
  },

  // Search & Action Row
  actionSearchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    height: 38,
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 8,
  },
  searchBoxInput: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: "500",
    color: "#0f172a",
    padding: 0,
  },
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#047857",
    paddingHorizontal: 11,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
  },
  createBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
  },

  // Filter Tabs Strip
  filterTabsContainer: {
    paddingBottom: 14,
  },
  filterTabsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterTabPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  filterTabPillActive: {
    backgroundColor: "#0f172a",
    borderColor: "#0f172a",
  },
  filterTabPillText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
  },
  filterTabPillActiveText: {
    color: "#ffffff",
    fontWeight: "700",
  },

  headerTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748b",
    marginTop: 1,
  },
  createMainPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: BENTO_COLORS.deepNavy,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  createMainPillText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
  filterBar: {
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingVertical: 10,
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: BENTO_COLORS.pillRadius,
    backgroundColor: "#f1f5f9",
  },
  filterPillActive: {
    backgroundColor: BENTO_COLORS.deepNavy,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
  },
  filterPillTextActive: {
    color: "#ffffff",
  },
  cardsScrollView: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 130,
  },
  detailsScrollContent: {
    padding: 16,
    paddingBottom: 130,
  },
  streamHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    marginTop: 4,
  },
  streamTitleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  streamDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#6366f1",
  },
  streamHeading: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: -0.2,
  },
  nodesBadge: {
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  nodesBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748b",
  },
  compactToggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  compactToggleText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
  },
  categoryFilterScroll: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 14,
    paddingVertical: 2,
  },
  catFilterPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  catFilterPillActive: {
    backgroundColor: "#0b1329",
    borderColor: "#0b1329",
  },
  catFilterPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
  },
  catFilterPillTextActive: {
    color: "#ffffff",
  },
  filterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  weekContainersList: {
    marginTop: 2,
  },
  emptyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 16,
    maxWidth: 280,
  },
  emptyCreateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: BENTO_COLORS.deepNavy,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  emptyCreateBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    justifyContent: "flex-end",
  },
  choiceSheet: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 30,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    marginBottom: 10,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },
  sheetSubtitle: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  methodOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 10,
  },
  methodIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  methodTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 2,
  },
  methodDesc: {
    fontSize: 11,
    color: "#64748b",
    lineHeight: 15,
  },
  cloneRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  cloneTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
  },
  cloneSub: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
  },
  clonePill: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  clonePillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#b45309",
  },
  previewBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#e0f2fe",
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#bae6fd",
  },
  previewBannerText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0369a1",
  },
  closePreviewBtn: {
    backgroundColor: "#0369a1",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  closePreviewBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#ffffff",
  },
});
