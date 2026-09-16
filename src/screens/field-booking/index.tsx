import React, { useState, useMemo, createElement } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

import {
  formatDateWithDay as formatDate,
  formatTime,
} from "@/utils/date-formatter";
import {
  useFieldSettings,
  useMyFieldBookings,
  useFieldSchedule,
  useCreateFieldBooking,
} from "@/features/field-booking/useFieldBooking";
import { FieldBookingItem } from "@/services/field-service";

// --- BENTO CAMPUS DESIGN SYSTEM TOKENS ---
const BENTO = {
  canvas: "#f8fafc",
  card: "#ffffff",
  navy: "#0f172a",
  navySecondary: "#1e293b",
  slate: "#64748b",
  slateLight: "#94a3b8",
  slateSubtle: "#f1f5f9",
  border: "rgba(15, 23, 42, 0.08)",
  borderFocus: "#3b82f6",
  primary: "#1e3a8a",
  primaryLight: "#eff6ff",
  emerald: "#059669",
  emeraldBg: "#ecfdf5",
  emeraldBorder: "#a7f3d0",
  amber: "#d97706",
  amberBg: "#fffbeb",
  amberBorder: "#fde68a",
  rose: "#dc2626",
  roseBg: "#fef2f2",
  roseBorder: "#fecaca",
  indigo: "#4338ca",
  indigoBg: "#eef2ff",
  indigoBorder: "#c7d2fe",
};

type TabType = "MY_BOOKINGS" | "SCHEDULE";

const PURPOSE_SUGGESTIONS = [
  "🏏 Cricket Match",
  "⚽ Football Match",
  "🏸 Badminton",
  "🎉 Cultural / Fest",
  "🏃 Sports Day",
  "📸 Photography",
];

const TIME_SLOT_PRESETS = [
  { label: "Morning", start: "08:00", end: "11:00", icon: "sun" as const },
  { label: "Afternoon", start: "14:00", end: "16:30", icon: "sunset" as const },
  { label: "Evening", start: "16:30", end: "19:00", icon: "cloud" as const },
  { label: "Night Lights", start: "19:00", end: "21:30", icon: "moon" as const },
];

function toISODateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTime12h(time24: string): string {
  if (!time24) return "";
  const [hStr, mStr] = time24.split(":");
  const h = parseInt(hStr, 10);
  const m = mStr || "00";
  if (isNaN(h)) return time24;
  const ampm = h >= 12 ? "PM" : "AM";
  const displayH = h % 12 || 12;
  return `${String(displayH).padStart(2, "0")}:${m} ${ampm}`;
}

function calculateDurationString(
  dateStr: string,
  startTime: string,
  endTime: string,
): { durationText: string; isValid: boolean; minutes: number } {
  if (!dateStr || !startTime || !endTime) {
    return { durationText: "", isValid: false, minutes: 0 };
  }
  const [sy, sm, sd] = dateStr.split("-").map(Number);
  const [sh, smin] = startTime.split(":").map(Number);
  const [eh, emin] = endTime.split(":").map(Number);

  const start = new Date(sy, sm - 1, sd, sh, smin, 0);
  const end = new Date(sy, sm - 1, sd, eh, emin, 0);

  const diffMs = end.getTime() - start.getTime();
  const diffMins = Math.round(diffMs / (1000 * 60));

  if (diffMins <= 0) {
    return {
      durationText: "End time must be after start time",
      isValid: false,
      minutes: diffMins,
    };
  }

  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  let text = "";
  if (hours > 0 && mins > 0) {
    text = `${hours} hr ${mins} mins`;
  } else if (hours > 0) {
    text = `${hours} ${hours === 1 ? "hour" : "hours"}`;
  } else {
    text = `${mins} mins`;
  }

  return { durationText: text, isValid: true, minutes: diffMins };
}

function getBookingDuration(item: FieldBookingItem): string {
  try {
    const s = new Date(item.startTime).getTime();
    const e = new Date(item.endTime).getTime();
    const diffMins = Math.round((e - s) / (1000 * 60));
    if (diffMins <= 0) return "";
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
    if (hours > 0) return `${hours} hr${hours > 1 ? "s" : ""}`;
    return `${mins}m`;
  } catch {
    return "";
  }
}

function getSportIcon(purpose: string): {
  name: "award" | "activity" | "target" | "music" | "zap" | "camera" | "flag";
  label: string;
} {
  const p = (purpose || "").toLowerCase();
  if (p.includes("cricket")) return { name: "award", label: "Cricket" };
  if (p.includes("football") || p.includes("soccer"))
    return { name: "activity", label: "Football" };
  if (p.includes("badminton") || p.includes("tennis"))
    return { name: "target", label: "Racket Sports" };
  if (
    p.includes("fest") ||
    p.includes("cultural") ||
    p.includes("event") ||
    p.includes("concert")
  )
    return { name: "music", label: "Campus Event" };
  if (
    p.includes("sports") ||
    p.includes("athletic") ||
    p.includes("race") ||
    p.includes("run")
  )
    return { name: "zap", label: "Athletics" };
  if (p.includes("photo") || p.includes("shoot") || p.includes("film"))
    return { name: "camera", label: "Media / Photo" };
  return { name: "flag", label: "Sports Field" };
}

export function FieldBooking() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabType>("MY_BOOKINGS");
  const [isComposeVisible, setIsComposeVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Form State
  const [purpose, setPurpose] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1); // default to tomorrow
    return d;
  });
  const [startTime, setStartTime] = useState("14:00");
  const [endTime, setEndTime] = useState("16:30");

  // Native Date/Time Pickers state
  const [nativePickerMode, setNativePickerMode] = useState<
    "date" | "start" | "end" | null
  >(null);

  const {
    data: settings,
    isLoading: isLoadingSettings,
    refetch: refetchSettings,
  } = useFieldSettings();
  const {
    data: myBookings,
    isLoading: isLoadingBookings,
    refetch: refetchBookings,
  } = useMyFieldBookings();
  const {
    data: publicSchedule,
    isLoading: isLoadingSchedule,
    refetch: refetchSchedule,
  } = useFieldSchedule();
  const createBookingMutation = useCreateFieldBooking();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      refetchBookings(),
      refetchSchedule(),
      refetchSettings(),
    ]);
    setIsRefreshing(false);
  };

  const selectedDateStr = useMemo(
    () => toISODateString(selectedDate),
    [selectedDate],
  );

  const durationInfo = useMemo(() => {
    return calculateDurationString(selectedDateStr, startTime, endTime);
  }, [selectedDateStr, startTime, endTime]);

  const handleSubmit = () => {
    if (!purpose.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing Purpose",
        text2: "Please specify the purpose or match name.",
      });
      return;
    }

    if (!durationInfo.isValid) {
      Toast.show({
        type: "error",
        text1: "Invalid Time Slot",
        text2: durationInfo.durationText || "End time must be after start time.",
      });
      return;
    }

    const [sy, sm, sd] = selectedDateStr.split("-").map(Number);
    const [sh, smin] = startTime.split(":").map(Number);
    const [eh, emin] = endTime.split(":").map(Number);

    const start = new Date(sy, sm - 1, sd, sh, smin, 0);
    const end = new Date(sy, sm - 1, sd, eh, emin, 0);

    createBookingMutation.mutate(
      {
        purpose: purpose.trim(),
        bookingDate: start.toISOString(),
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      },
      {
        onSuccess: () => {
          Toast.show({
            type: "success",
            text1: "Booking Request Submitted",
            text2: "Campus administration will review your slot.",
          });
          setIsComposeVisible(false);
          setPurpose("");
          setActiveTab("MY_BOOKINGS");
        },
        onError: (err: any) => {
          const errorMessage =
            err.response?.data?.message ||
            err.response?.data?.error ||
            "This time slot is already reserved or conflicts with another event.";

          Toast.show({
            type: "error",
            text1: "Booking Failed",
            text2: errorMessage,
          });
        },
      },
    );
  };

  const openComposeIfAllowed = () => {
    if (settings?.isBookingOpen === false) {
      Alert.alert(
        "Ground Reservations Closed",
        settings?.closureReason ||
          (settings as any)?.closedNotice ||
          "Field bookings are currently suspended by university administration.",
      );
      return;
    }
    setIsComposeVisible(true);
  };

  // Date Preset Handlers
  const applyDateOffset = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setSelectedDate(d);
  };

  const applyUpcomingWeekend = (dayOfWeek: number) => {
    // 6 = Sat, 0 = Sun
    const d = new Date();
    const current = d.getDay();
    let diff = dayOfWeek - current;
    if (diff <= 0) diff += 7;
    d.setDate(d.getDate() + diff);
    setSelectedDate(d);
  };

  // Native Picker onChange
  const handleNativePickerChange = (
    _event: DateTimePickerEvent,
    date?: Date,
  ) => {
    const mode = nativePickerMode;
    setNativePickerMode(null);
    if (!date) return;

    if (mode === "date") {
      setSelectedDate(date);
    } else if (mode === "start") {
      const h = String(date.getHours()).padStart(2, "0");
      const m = String(date.getMinutes()).padStart(2, "0");
      setStartTime(`${h}:${m}`);
    } else if (mode === "end") {
      const h = String(date.getHours()).padStart(2, "0");
      const m = String(date.getMinutes()).padStart(2, "0");
      setEndTime(`${h}:${m}`);
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <View style={[styles.statusBadge, styles.statusBadgeApproved]}>
            <Feather
              name="check-circle"
              size={12}
              color={BENTO.emerald}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.statusBadgeText, { color: BENTO.emerald }]}>
              Approved
            </Text>
          </View>
        );
      case "REJECTED":
        return (
          <View style={[styles.statusBadge, styles.statusBadgeRejected]}>
            <Feather
              name="x-circle"
              size={12}
              color={BENTO.rose}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.statusBadgeText, { color: BENTO.rose }]}>
              Rejected
            </Text>
          </View>
        );
      default:
        return (
          <View style={[styles.statusBadge, styles.statusBadgePending]}>
            <Feather
              name="clock"
              size={12}
              color={BENTO.amber}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.statusBadgeText, { color: BENTO.amber }]}>
              Pending Review
            </Text>
          </View>
        );
    }
  };

  const renderMyBookingCard = ({ item }: { item: FieldBookingItem }) => {
    const sport = getSportIcon(item.purpose);
    const duration = getBookingDuration(item);
    const dateDisplay = formatDate(item.bookingDate || item.startTime);

    return (
      <View style={styles.bentoCard}>
        {/* Card Header: Date & Status */}
        <View style={styles.cardHeader}>
          <View style={styles.dateChip}>
            <Feather
              name="calendar"
              size={14}
              color={BENTO.navy}
              style={{ marginRight: 6 }}
            />
            <Text style={styles.dateChipText}>{dateDisplay}</Text>
          </View>
          {renderStatusBadge(item.status)}
        </View>

        {/* Card Body */}
        <View style={styles.cardBody}>
          <View style={styles.purposeRow}>
            <View style={styles.sportIconWrap}>
              <Feather name={sport.name} size={16} color={BENTO.navy} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.purposeTitle}>{item.purpose}</Text>
              <Text style={styles.sportCategoryText}>{sport.label}</Text>
            </View>
          </View>

          {/* Time & Duration Row */}
          <View style={styles.timeInfoRow}>
            <View style={styles.timeChip}>
              <Feather
                name="clock"
                size={13}
                color={BENTO.indigo}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.timeChipText}>
                {formatTime(item.startTime)} – {formatTime(item.endTime)}
              </Text>
            </View>

            {duration ? (
              <View style={styles.durationChip}>
                <Text style={styles.durationChipText}>{duration}</Text>
              </View>
            ) : null}
          </View>

          {/* Admin Feedback note (if any) */}
          {item.adminFeedback ? (
            <View
              style={[
                styles.feedbackBox,
                item.status === "REJECTED"
                  ? styles.feedbackBoxRejected
                  : styles.feedbackBoxInfo,
              ]}
            >
              <Feather
                name="message-square"
                size={13}
                color={item.status === "REJECTED" ? BENTO.rose : BENTO.slate}
                style={{ marginRight: 6, marginTop: 1 }}
              />
              <Text
                style={[
                  styles.feedbackText,
                  item.status === "REJECTED" && { color: BENTO.rose },
                ]}
              >
                Admin Note: {item.adminFeedback}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Card Footer */}
        <View style={styles.cardFooter}>
          <Feather
            name="send"
            size={12}
            color={BENTO.slateLight}
            style={{ marginRight: 5 }}
          />
          <Text style={styles.footerText}>
            Requested on {formatDate(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  const renderScheduleCard = ({ item }: { item: FieldBookingItem }) => {
    const sport = getSportIcon(item.purpose);
    const duration = getBookingDuration(item);
    const dateDisplay = formatDate(item.bookingDate || item.startTime);

    return (
      <View style={styles.bentoCard}>
        {/* Card Header: Date & Reserved Badge */}
        <View style={styles.cardHeader}>
          <View style={styles.dateChip}>
            <Feather
              name="calendar"
              size={14}
              color={BENTO.navy}
              style={{ marginRight: 6 }}
            />
            <Text style={styles.dateChipText}>{dateDisplay}</Text>
          </View>
          <View style={[styles.statusBadge, styles.statusBadgeReserved]}>
            <Feather
              name="lock"
              size={11}
              color={BENTO.indigo}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.statusBadgeText, { color: BENTO.indigo }]}>
              Reserved Slot
            </Text>
          </View>
        </View>

        {/* Card Body */}
        <View style={styles.cardBody}>
          <View style={styles.purposeRow}>
            <View style={styles.sportIconWrap}>
              <Feather name={sport.name} size={16} color={BENTO.navy} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.purposeTitle}>{item.purpose}</Text>
              <Text style={styles.sportCategoryText}>{sport.label}</Text>
            </View>
          </View>

          {/* Time & Duration Row */}
          <View style={styles.timeInfoRow}>
            <View style={styles.timeChip}>
              <Feather
                name="clock"
                size={13}
                color={BENTO.indigo}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.timeChipText}>
                {formatTime(item.startTime)} – {formatTime(item.endTime)}
              </Text>
            </View>

            {duration ? (
              <View style={styles.durationChip}>
                <Text style={styles.durationChipText}>{duration}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Card Footer: Booked by info */}
        <View style={styles.cardFooter}>
          <View style={styles.bookedByPill}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitial}>
                {(item.user?.name || "U")[0].toUpperCase()}
              </Text>
            </View>
            <Text style={styles.footerText}>
              Reserved by{" "}
              <Text style={{ fontWeight: "700", color: BENTO.navy }}>
                {item.user?.name || "University Member"}
              </Text>
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.container}>
        {/* --- TOP BENTO HEADER --- */}
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              activeOpacity={0.7}
            >
              <Feather name="arrow-left" size={20} color={BENTO.navy} />
            </TouchableOpacity>

            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>Field Booking</Text>
              <Text style={styles.headerSubtitle}>
                Reserve university sports ground for matches & events
              </Text>
            </View>
          </View>

          {/* Campus Field Live Status Indicator */}
          {!isLoadingSettings && (
            <View style={styles.statusIndicatorRow}>
              {settings?.isBookingOpen !== false ? (
                <View style={styles.groundOpenChip}>
                  <View style={styles.liveDotOpen} />
                  <Text style={styles.groundOpenText}>
                    Ground Open for Reservations
                  </Text>
                </View>
              ) : (
                <View style={styles.groundClosedChip}>
                  <View style={styles.liveDotClosed} />
                  <Text style={styles.groundClosedText}>
                    Reservations Temporarily Paused
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Maintenance / Closure Alert Banner */}
        {!isLoadingSettings && settings?.isBookingOpen === false && (
          <View style={styles.noticeBanner}>
            <View style={styles.noticeHeaderRow}>
              <Feather name="alert-triangle" size={18} color={BENTO.rose} />
              <Text style={styles.noticeTitle}>Ground Currently Closed</Text>
            </View>
            <Text style={styles.noticeDesc}>
              {settings?.closureReason ||
                (settings as any)?.closedNotice ||
                "The administration has temporarily disabled ground bookings for maintenance or scheduled events."}
            </Text>
          </View>
        )}

        {/* --- SEGMENTED BENTO TABS --- */}
        <View style={styles.tabBarWrapper}>
          <View style={styles.segmentedContainer}>
            <TouchableOpacity
              style={[
                styles.segmentedTab,
                activeTab === "MY_BOOKINGS" && styles.segmentedTabActive,
              ]}
              onPress={() => setActiveTab("MY_BOOKINGS")}
              activeOpacity={0.75}
              accessible={true}
              accessibilityRole="tab"
              accessibilityLabel="My Bookings tab"
            >
              <Feather
                name="calendar"
                size={14}
                color={
                  activeTab === "MY_BOOKINGS" ? BENTO.navy : BENTO.slate
                }
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.segmentedTabText,
                  activeTab === "MY_BOOKINGS" && styles.segmentedTabTextActive,
                ]}
              >
                My Bookings
              </Text>
              {myBookings && myBookings.length > 0 && (
                <View
                  style={[
                    styles.countPill,
                    activeTab === "MY_BOOKINGS" && styles.countPillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.countPillText,
                      activeTab === "MY_BOOKINGS" && styles.countPillTextActive,
                    ]}
                  >
                    {myBookings.length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.segmentedTab,
                activeTab === "SCHEDULE" && styles.segmentedTabActive,
              ]}
              onPress={() => setActiveTab("SCHEDULE")}
              activeOpacity={0.75}
              accessible={true}
              accessibilityRole="tab"
              accessibilityLabel="Public Schedule tab"
            >
              <Feather
                name="globe"
                size={14}
                color={activeTab === "SCHEDULE" ? BENTO.navy : BENTO.slate}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.segmentedTabText,
                  activeTab === "SCHEDULE" && styles.segmentedTabTextActive,
                ]}
              >
                Public Schedule
              </Text>
              {publicSchedule && publicSchedule.length > 0 && (
                <View
                  style={[
                    styles.countPill,
                    activeTab === "SCHEDULE" && styles.countPillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.countPillText,
                      activeTab === "SCHEDULE" && styles.countPillTextActive,
                    ]}
                  >
                    {publicSchedule.length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* --- TAB CONTENT AREA --- */}
        {activeTab === "MY_BOOKINGS" ? (
          isLoadingBookings ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={BENTO.navy} />
              <Text style={styles.loadingText}>Loading bookings...</Text>
            </View>
          ) : !myBookings || myBookings.length === 0 ? (
            <ScrollView
              contentContainerStyle={styles.emptyContainer}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                  colors={[BENTO.navy]}
                />
              }
            >
              <View style={styles.emptyIconCircle}>
                <Feather name="calendar" size={32} color={BENTO.navy} />
              </View>
              <Text style={styles.emptyTitle}>No Field Bookings Yet</Text>
              <Text style={styles.emptySubtitle}>
                Reserve the university ground for your upcoming sports match,
                department tournament, or campus celebration.
              </Text>

              {settings?.isBookingOpen !== false && (
                <TouchableOpacity
                  style={styles.emptyActionButton}
                  onPress={openComposeIfAllowed}
                  activeOpacity={0.8}
                >
                  <Feather
                    name="plus"
                    size={16}
                    color="#ffffff"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.emptyActionText}>Request Ground Slot</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          ) : (
            <FlatList
              data={myBookings}
              keyExtractor={(item) => item.id}
              renderItem={renderMyBookingCard}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                  colors={[BENTO.navy]}
                />
              }
            />
          )
        ) : isLoadingSchedule ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={BENTO.navy} />
            <Text style={styles.loadingText}>Loading public schedule...</Text>
          </View>
        ) : !publicSchedule || publicSchedule.length === 0 ? (
          <ScrollView
            contentContainerStyle={styles.emptyContainer}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                colors={[BENTO.navy]}
              />
            }
          >
            <View style={styles.emptyIconCircle}>
              <Feather name="sun" size={32} color={BENTO.amber} />
            </View>
            <Text style={styles.emptyTitle}>Ground is Completely Free</Text>
            <Text style={styles.emptySubtitle}>
              No approved reservations currently scheduled. The field is clear
              and open for practice or new booking requests!
            </Text>

            {settings?.isBookingOpen !== false && (
              <TouchableOpacity
                style={styles.emptyActionButton}
                onPress={openComposeIfAllowed}
                activeOpacity={0.8}
              >
                <Feather
                  name="calendar"
                  size={16}
                  color="#ffffff"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.emptyActionText}>Book This Ground</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        ) : (
          <FlatList
            data={publicSchedule}
            keyExtractor={(item) => item.id}
            renderItem={renderScheduleCard}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                colors={[BENTO.navy]}
              />
            }
          />
        )}

        {/* --- FLOATING ACTION BUTTON (BENTO PILL) --- */}
        {settings?.isBookingOpen !== false && (
          <TouchableOpacity
            style={styles.fabPill}
            onPress={openComposeIfAllowed}
            activeOpacity={0.85}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Request field booking"
          >
            <Feather
              name="plus"
              size={18}
              color="#ffffff"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.fabPillText}>Book Field</Text>
          </TouchableOpacity>
        )}

        {/* ============================================================== */}
        {/* --- MODERN BENTO BOOKING MODAL --- */}
        {/* ============================================================== */}
        <Modal
          visible={isComposeVisible}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setIsComposeVisible(false)}
        >
          <SafeAreaView
            style={styles.modalSafeArea}
            accessibilityViewIsModal={true}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              style={{ flex: 1 }}
            >
              {/* Modal Top Nav */}
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  onPress={() => setIsComposeVisible(false)}
                  style={styles.modalCloseBtn}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel booking request"
                >
                  <Feather name="x" size={20} color={BENTO.navy} />
                </TouchableOpacity>

                <View style={{ alignItems: "center" }}>
                  <Text style={styles.modalTitle}>Request Sports Ground</Text>
                  <Text style={styles.modalSub}>SMUCT Main Campus Field</Text>
                </View>

                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={createBookingMutation.isPending}
                  style={[
                    styles.modalSubmitBtn,
                    createBookingMutation.isPending && { opacity: 0.7 },
                  ]}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Submit booking request"
                >
                  {createBookingMutation.isPending ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.modalSubmitBtnText}>Submit</Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Scrollable Form Body */}
              <ScrollView
                style={styles.modalScrollView}
                contentContainerStyle={styles.modalScrollContent}
                showsVerticalScrollIndicator={false}
              >
                {/* 1. Purpose Section */}
                <View style={styles.formSection}>
                  <Text style={styles.sectionLabel}>
                    EVENT PURPOSE / MATCH NAME
                  </Text>
                  <View style={styles.inputWrapper}>
                    <Feather
                      name="award"
                      size={18}
                      color={BENTO.slate}
                      style={{ marginRight: 10 }}
                    />
                    <TextInput
                      style={styles.textInput}
                      value={purpose}
                      onChangeText={setPurpose}
                      placeholder="e.g. CSE Dept Cricket Final"
                      placeholderTextColor={BENTO.slateLight}
                      accessible={true}
                      accessibilityLabel="Event Purpose or Match Name"
                    />
                  </View>

                  {/* 1-Tap Preset Suggestions */}
                  <View style={styles.presetChipsWrapper}>
                    <Text style={styles.presetHeading}>Quick Select:</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.presetScrollRow}
                    >
                      {PURPOSE_SUGGESTIONS.map((item) => (
                        <TouchableOpacity
                          key={item}
                          onPress={() => setPurpose(item)}
                          style={[
                            styles.presetTag,
                            purpose === item && styles.presetTagActive,
                          ]}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.presetTagText,
                              purpose === item && styles.presetTagTextActive,
                            ]}
                          >
                            {item}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>

                {/* 2. Date Selection Section */}
                <View style={styles.formSection}>
                  <Text style={styles.sectionLabel}>MATCH / EVENT DATE</Text>

                  {/* Interactive Date Card */}
                  <TouchableOpacity
                    style={styles.dateSelectorCard}
                    activeOpacity={Platform.OS === "web" ? 1 : 0.7}
                    onPress={() => {
                      if (Platform.OS !== "web") {
                        setNativePickerMode("date");
                      }
                    }}
                  >
                    <View style={styles.selectorCardIcon}>
                      <Feather name="calendar" size={18} color={BENTO.navy} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.selectorCardValue}>
                        {selectedDate.toLocaleDateString("en-GB", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </Text>
                      <Text style={styles.selectorCardHelper}>
                        Tap to choose another date
                      </Text>
                    </View>
                    <Feather name="edit-2" size={15} color={BENTO.slate} />

                    {/* Invisible HTML5 date picker overlay for Web */}
                    {Platform.OS === "web" &&
                      createElement("input", {
                        type: "date",
                        value: selectedDateStr,
                        min: toISODateString(new Date()),
                        onChange: (e: any) => {
                          if (e?.target?.value) {
                            const [y, m, d] = e.target.value
                              .split("-")
                              .map(Number);
                            setSelectedDate(new Date(y, m - 1, d));
                          }
                        },
                        style: {
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          opacity: 0,
                          cursor: "pointer",
                          zIndex: 10,
                        },
                      })}
                  </TouchableOpacity>

                  {/* Quick Date Shortcuts */}
                  <View style={styles.dateShortcutsRow}>
                    <TouchableOpacity
                      style={styles.dateShortcutPill}
                      onPress={() => applyDateOffset(0)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.dateShortcutText}>Today</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.dateShortcutPill}
                      onPress={() => applyDateOffset(1)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.dateShortcutText}>Tomorrow</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.dateShortcutPill}
                      onPress={() => applyUpcomingWeekend(6)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.dateShortcutText}>This Saturday</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.dateShortcutPill}
                      onPress={() => applyUpcomingWeekend(0)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.dateShortcutText}>This Sunday</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* 3. Time Slots Section */}
                <View style={styles.formSection}>
                  <Text style={styles.sectionLabel}>TIME SLOT (12-HR)</Text>

                  {/* Quick Campus Time Slots */}
                  <View style={styles.timeSlotPresetsGrid}>
                    {TIME_SLOT_PRESETS.map((slot) => {
                      const isSelected =
                        startTime === slot.start && endTime === slot.end;
                      return (
                        <TouchableOpacity
                          key={slot.label}
                          style={[
                            styles.timeSlotPresetCard,
                            isSelected && styles.timeSlotPresetCardActive,
                          ]}
                          onPress={() => {
                            setStartTime(slot.start);
                            setEndTime(slot.end);
                          }}
                          activeOpacity={0.7}
                        >
                          <View style={styles.timePresetIconWrap}>
                            <Feather
                              name={slot.icon}
                              size={14}
                              color={isSelected ? BENTO.navy : BENTO.slate}
                            />
                          </View>
                          <Text
                            style={[
                              styles.timePresetLabel,
                              isSelected && styles.timePresetLabelActive,
                            ]}
                          >
                            {slot.label}
                          </Text>
                          <Text
                            style={[
                              styles.timePresetSub,
                              isSelected && styles.timePresetSubActive,
                            ]}
                          >
                            {formatTime12h(slot.start)} -{" "}
                            {formatTime12h(slot.end)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Custom Start & End Time Pickers */}
                  <View style={styles.customTimeRow}>
                    {/* Start Time Card */}
                    <TouchableOpacity
                      style={styles.timeCardHalf}
                      activeOpacity={Platform.OS === "web" ? 1 : 0.7}
                      onPress={() => {
                        if (Platform.OS !== "web") {
                          setNativePickerMode("start");
                        }
                      }}
                    >
                      <Text style={styles.timeCardSubLabel}>START TIME</Text>
                      <View style={styles.timeCardValRow}>
                        <Feather
                          name="clock"
                          size={15}
                          color={BENTO.indigo}
                          style={{ marginRight: 6 }}
                        />
                        <Text style={styles.timeCardValText}>
                          {formatTime12h(startTime)}
                        </Text>
                      </View>

                      {Platform.OS === "web" &&
                        createElement("input", {
                          type: "time",
                          value: startTime,
                          onChange: (e: any) => {
                            if (e?.target?.value) {
                              setStartTime(e.target.value);
                            }
                          },
                          style: {
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            opacity: 0,
                            cursor: "pointer",
                            zIndex: 10,
                          },
                        })}
                    </TouchableOpacity>

                    {/* End Time Card */}
                    <TouchableOpacity
                      style={styles.timeCardHalf}
                      activeOpacity={Platform.OS === "web" ? 1 : 0.7}
                      onPress={() => {
                        if (Platform.OS !== "web") {
                          setNativePickerMode("end");
                        }
                      }}
                    >
                      <Text style={styles.timeCardSubLabel}>END TIME</Text>
                      <View style={styles.timeCardValRow}>
                        <Feather
                          name="clock"
                          size={15}
                          color={BENTO.indigo}
                          style={{ marginRight: 6 }}
                        />
                        <Text style={styles.timeCardValText}>
                          {formatTime12h(endTime)}
                        </Text>
                      </View>

                      {Platform.OS === "web" &&
                        createElement("input", {
                          type: "time",
                          value: endTime,
                          onChange: (e: any) => {
                            if (e?.target?.value) {
                              setEndTime(e.target.value);
                            }
                          },
                          style: {
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            opacity: 0,
                            cursor: "pointer",
                            zIndex: 10,
                          },
                        })}
                    </TouchableOpacity>
                  </View>

                  {/* Calculated Duration or Warning Pill */}
                  <View
                    style={[
                      styles.durationPillContainer,
                      !durationInfo.isValid && styles.durationPillError,
                    ]}
                  >
                    <Feather
                      name={durationInfo.isValid ? "check" : "alert-triangle"}
                      size={14}
                      color={durationInfo.isValid ? BENTO.emerald : BENTO.rose}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[
                        styles.durationPillText,
                        !durationInfo.isValid && { color: BENTO.rose },
                      ]}
                    >
                      {durationInfo.isValid
                        ? `Calculated Duration: ${durationInfo.durationText}`
                        : durationInfo.durationText}
                    </Text>
                  </View>
                </View>

                {/* 4. Ground Guidelines Bento Card */}
                <View style={styles.guidelinesCard}>
                  <View style={styles.guidelinesHeader}>
                    <Feather
                      name="info"
                      size={15}
                      color={BENTO.navy}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.guidelinesTitle}>
                      Campus Ground Guidelines
                    </Text>
                  </View>
                  <Text style={styles.guidelinesItem}>
                    • Ground lights shut down at 10:00 PM sharp.
                  </Text>
                  <Text style={styles.guidelinesItem}>
                    • Reservations require sports committee or admin approval.
                  </Text>
                  <Text style={styles.guidelinesItem}>
                    • Please keep the ground clean and bring your student ID.
                  </Text>
                </View>
              </ScrollView>

              {/* Native iOS / Android DateTimePicker */}
              {nativePickerMode && Platform.OS !== "web" && (
                <DateTimePicker
                  value={
                    nativePickerMode === "date"
                      ? selectedDate
                      : new Date(
                          2026,
                          0,
                          1,
                          nativePickerMode === "start"
                            ? parseInt(startTime.split(":")[0], 10)
                            : parseInt(endTime.split(":")[0], 10),
                          nativePickerMode === "start"
                            ? parseInt(startTime.split(":")[1] || "0", 10)
                            : parseInt(endTime.split(":")[1] || "0", 10),
                        )
                  }
                  mode={nativePickerMode === "date" ? "date" : "time"}
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  minimumDate={
                    nativePickerMode === "date" ? new Date() : undefined
                  }
                  onChange={handleNativePickerChange}
                />
              )}
            </KeyboardAvoidingView>
          </SafeAreaView>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BENTO.canvas,
  },
  container: {
    flex: 1,
    backgroundColor: BENTO.canvas,
  },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: BENTO.card,
    borderBottomWidth: 1,
    borderBottomColor: BENTO.border,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: BENTO.slateSubtle,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    borderWidth: 1,
    borderColor: BENTO.border,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: BENTO.navy,
    letterSpacing: -0.5,
    fontFamily:
      Platform.OS === "web"
        ? "var(--font-heading), 'Plus Jakarta Sans', system-ui, sans-serif"
        : undefined,
  },
  headerSubtitle: {
    fontSize: 13,
    color: BENTO.slate,
    marginTop: 2,
    fontFamily:
      Platform.OS === "web"
        ? "var(--font-body), 'Plus Jakarta Sans', system-ui, sans-serif"
        : undefined,
  },
  statusIndicatorRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  groundOpenChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.emeraldBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BENTO.emeraldBorder,
  },
  liveDotOpen: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: BENTO.emerald,
    marginRight: 6,
  },
  groundOpenText: {
    fontSize: 11,
    fontWeight: "700",
    color: BENTO.emerald,
  },
  groundClosedChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.roseBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BENTO.roseBorder,
  },
  liveDotClosed: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: BENTO.rose,
    marginRight: 6,
  },
  groundClosedText: {
    fontSize: 11,
    fontWeight: "700",
    color: BENTO.rose,
  },

  // Notice Banner
  noticeBanner: {
    backgroundColor: BENTO.roseBg,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BENTO.roseBorder,
  },
  noticeHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: BENTO.rose,
    marginLeft: 8,
  },
  noticeDesc: {
    fontSize: 12,
    color: "#991b1b",
    lineHeight: 18,
  },

  // Segmented Bento Tab Switcher
  tabBarWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  segmentedContainer: {
    flexDirection: "row",
    backgroundColor: BENTO.slateSubtle,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: BENTO.border,
  },
  segmentedTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
  },
  segmentedTabActive: {
    backgroundColor: BENTO.card,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentedTabText: {
    fontSize: 13,
    fontWeight: "600",
    color: BENTO.slate,
  },
  segmentedTabTextActive: {
    fontWeight: "800",
    color: BENTO.navy,
  },
  countPill: {
    backgroundColor: BENTO.slateSubtle,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 6,
  },
  countPillActive: {
    backgroundColor: BENTO.navy,
  },
  countPillText: {
    fontSize: 10,
    fontWeight: "700",
    color: BENTO.slate,
  },
  countPillTextActive: {
    color: "#ffffff",
  },

  // List & Cards
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 110,
  },
  bentoCard: {
    backgroundColor: BENTO.card,
    borderRadius: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: BENTO.border,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(15, 23, 42, 0.04)",
  },
  dateChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.slateSubtle,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  dateChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: BENTO.navy,
  },

  // Status Badges
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusBadgeApproved: {
    backgroundColor: BENTO.emeraldBg,
    borderColor: BENTO.emeraldBorder,
  },
  statusBadgePending: {
    backgroundColor: BENTO.amberBg,
    borderColor: BENTO.amberBorder,
  },
  statusBadgeRejected: {
    backgroundColor: BENTO.roseBg,
    borderColor: BENTO.roseBorder,
  },
  statusBadgeReserved: {
    backgroundColor: BENTO.indigoBg,
    borderColor: BENTO.indigoBorder,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.2,
  },

  // Card Body
  cardBody: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  purposeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sportIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: BENTO.slateSubtle,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  purposeTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: BENTO.navy,
    letterSpacing: -0.2,
  },
  sportCategoryText: {
    fontSize: 11,
    color: BENTO.slate,
    marginTop: 2,
    fontWeight: "500",
  },
  timeInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  timeChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.indigoBg,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BENTO.indigoBorder,
  },
  timeChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: BENTO.indigo,
  },
  durationChip: {
    backgroundColor: BENTO.slateSubtle,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  durationChipText: {
    fontSize: 11,
    fontWeight: "600",
    color: BENTO.slate,
  },
  feedbackBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  feedbackBoxInfo: {
    backgroundColor: BENTO.slateSubtle,
    borderColor: BENTO.border,
  },
  feedbackBoxRejected: {
    backgroundColor: BENTO.roseBg,
    borderColor: BENTO.roseBorder,
  },
  feedbackText: {
    fontSize: 12,
    color: BENTO.navySecondary,
    flex: 1,
    lineHeight: 16,
  },

  // Card Footer
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fafbfc",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(15, 23, 42, 0.04)",
  },
  footerText: {
    fontSize: 11,
    color: BENTO.slate,
  },
  bookedByPill: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: BENTO.indigoBg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
    borderWidth: 1,
    borderColor: BENTO.indigoBorder,
  },
  avatarInitial: {
    fontSize: 9,
    fontWeight: "800",
    color: BENTO.indigo,
  },

  // Empty & Loading States
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    fontSize: 13,
    color: BENTO.slate,
    marginTop: 10,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingBottom: 60,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: BENTO.card,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BENTO.border,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: BENTO.navy,
    marginBottom: 6,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 13,
    color: BENTO.slate,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  emptyActionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.navy,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: BENTO.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  emptyActionText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },

  // FAB (Floating Bento Pill)
  fabPill: {
    position: "absolute",
    bottom: 24,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.navy,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: BENTO.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  fabPillText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.2,
  },

  // Modal Styles
  modalSafeArea: {
    flex: 1,
    backgroundColor: BENTO.canvas,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: BENTO.card,
    borderBottomWidth: 1,
    borderBottomColor: BENTO.border,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: BENTO.slateSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: BENTO.navy,
  },
  modalSub: {
    fontSize: 11,
    color: BENTO.slate,
    marginTop: 1,
  },
  modalSubmitBtn: {
    backgroundColor: BENTO.navy,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  modalSubmitBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#ffffff",
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    padding: 18,
    paddingBottom: 40,
  },

  // Form Sections
  formSection: {
    marginBottom: 22,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: BENTO.slate,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.card,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: BENTO.border,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: BENTO.navy,
    padding: 0,
  },

  // Preset Chips
  presetChipsWrapper: {
    marginTop: 10,
  },
  presetHeading: {
    fontSize: 11,
    color: BENTO.slateLight,
    marginBottom: 6,
    fontWeight: "600",
  },
  presetScrollRow: {
    flexDirection: "row",
    gap: 6,
  },
  presetTag: {
    backgroundColor: BENTO.slateSubtle,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BENTO.border,
  },
  presetTagActive: {
    backgroundColor: BENTO.navy,
    borderColor: BENTO.navy,
  },
  presetTagText: {
    fontSize: 11,
    fontWeight: "600",
    color: BENTO.navySecondary,
  },
  presetTagTextActive: {
    color: "#ffffff",
  },

  // Date Selector Card
  dateSelectorCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: BENTO.border,
    position: "relative",
  },
  selectorCardIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: BENTO.slateSubtle,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  selectorCardValue: {
    fontSize: 14,
    fontWeight: "800",
    color: BENTO.navy,
  },
  selectorCardHelper: {
    fontSize: 11,
    color: BENTO.slateLight,
    marginTop: 2,
  },
  dateShortcutsRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 8,
  },
  dateShortcutPill: {
    flex: 1,
    backgroundColor: BENTO.slateSubtle,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: BENTO.border,
  },
  dateShortcutText: {
    fontSize: 11,
    fontWeight: "700",
    color: BENTO.slate,
  },

  // Time Slot Presets
  timeSlotPresetsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  timeSlotPresetCard: {
    width: "48%",
    backgroundColor: BENTO.card,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: BENTO.border,
  },
  timeSlotPresetCardActive: {
    borderColor: BENTO.navy,
    backgroundColor: "#f8fafc",
  },
  timePresetIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: BENTO.slateSubtle,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  timePresetLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: BENTO.navy,
  },
  timePresetLabelActive: {
    color: BENTO.navy,
  },
  timePresetSub: {
    fontSize: 10,
    color: BENTO.slate,
    marginTop: 2,
  },
  timePresetSubActive: {
    color: BENTO.indigo,
    fontWeight: "600",
  },

  // Custom Time Row
  customTimeRow: {
    flexDirection: "row",
    gap: 10,
  },
  timeCardHalf: {
    flex: 1,
    backgroundColor: BENTO.card,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: BENTO.border,
    position: "relative",
  },
  timeCardSubLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: BENTO.slate,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  timeCardValRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeCardValText: {
    fontSize: 14,
    fontWeight: "800",
    color: BENTO.navy,
  },

  // Duration Info Pill
  durationPillContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.emeraldBg,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BENTO.emeraldBorder,
  },
  durationPillError: {
    backgroundColor: BENTO.roseBg,
    borderColor: BENTO.roseBorder,
  },
  durationPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: BENTO.emerald,
  },

  // Ground Guidelines Card
  guidelinesCard: {
    backgroundColor: BENTO.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: BENTO.border,
    marginTop: 6,
  },
  guidelinesHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  guidelinesTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: BENTO.navy,
  },
  guidelinesItem: {
    fontSize: 11,
    color: BENTO.slate,
    lineHeight: 18,
  },
});
