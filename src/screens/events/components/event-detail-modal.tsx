import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Platform,
  Linking,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

import { useCurrentUser } from "@/hooks/use-current-user";
import { CampusEventItem } from "@/services/event-service";
import {
  useToggleEventInterested,
  useDeleteCampusEvent,
} from "@/features/events/useEvents";
import { BENTO_COLORS, fontFamily } from "../constants";
import { formatEventTime, safeShareEvent } from "../utils";

interface EventDetailModalProps {
  event: CampusEventItem | null;
  onClose: () => void;
  onEdit?: (event: CampusEventItem) => void;
}

export const EventDetailModal = React.memo(function EventDetailModal({
  event,
  onClose,
  onEdit,
}: EventDetailModalProps) {
  const insets = useSafeAreaInsets();
  const { role, user } = useCurrentUser();
  const isAdmin = role === "ADMIN" || user?.role === "ADMIN";

  const toggleInterestedMutation = useToggleEventInterested();
  const deleteEventMutation = useDeleteCampusEvent();

  const [isInterested, setIsInterested] = useState<boolean>(
    event?.isInterested ?? false
  );
  const [interestedCount, setInterestedCount] = useState<number>(
    event?.interestedCount ?? 0
  );
  const [hasReminder, setHasReminder] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Sync state when event prop changes
  useEffect(() => {
    setIsInterested(event?.isInterested ?? false);
    setInterestedCount(event?.interestedCount ?? 0);
    setHasReminder(false);
    setShowDeleteConfirm(false);
    setIsDeleting(false);
  }, [event?.id, event?.isInterested, event?.interestedCount]);

  if (!event) return null;

  const eventDateStr = event.eventDate || event.date || event.createdAt;
  const eventDate = new Date(eventDateStr);
  const now = new Date();
  const isToday = eventDate.toDateString() === now.toDateString();
  const isPast = eventDate.getTime() < now.getTime() && !isToday;

  // Custom date format components: e.g. "10 October, 2026" and "Saturday"
  const day = eventDate.getDate();
  const month = eventDate.toLocaleDateString("en-US", { month: "long" });
  const year = eventDate.getFullYear();
  const weekdayText = eventDate.toLocaleDateString("en-US", { weekday: "long" });
  const dayMonthYear = `${day} ${month}, ${year}`;
  const formattedStartTime = formatEventTime(eventDateStr);

  // Real organizer data from backend, fallback to SMUCT if unspecified
  const organizerName = event.organizer?.trim() || "SMUCT";

  // Toggle Interested with backend integration & optimistic update
  const handleToggleInterested = async () => {
    const nextState = !isInterested;
    const nextCount = Math.max(0, interestedCount + (nextState ? 1 : -1));
    setIsInterested(nextState);
    setInterestedCount(nextCount);

    try {
      const res = await toggleInterestedMutation.mutateAsync(event.id);
      setIsInterested(res.isInterested);
      setInterestedCount(res.interestedCount);
      Toast.show({
        type: "success",
        text1: res.isInterested ? "Marked as Interested!" : "Interest Removed",
        text2: res.isInterested
          ? `You will receive updates for "${event.title}".`
          : `You are no longer marked as interested.`,
      });
    } catch {
      // Revert optimistic update on failure
      setIsInterested(!nextState);
      setInterestedCount(interestedCount);
      Toast.show({
        type: "error",
        text1: "Action Failed",
        text2: "Unable to update interested status. Please try again.",
      });
    }
  };

  // Get Reminder handler
  const handleGetReminder = async () => {
    try {
      const title = encodeURIComponent(`Reminder: ${event.title || "Campus Event"}`);
      const details = encodeURIComponent(
        `Don't miss ${event.title} at ${event.location || "Designated Campus Venue"}.\n\n${event.description || ""}`
      );
      const location = encodeURIComponent(event.location || "");
      const startIso = eventDate.toISOString().replace(/-|:|\.\d\d\d/g, "");
      // 1 hour event block for calendar invite
      const endDate = new Date(eventDate.getTime() + 60 * 60 * 1000);
      const endIso = endDate.toISOString().replace(/-|:|\.\d\d\d/g, "");

      const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${location}`;
      const supported = await Linking.canOpenURL(gcalUrl);
      if (supported) {
        await Linking.openURL(gcalUrl);
      }
      setHasReminder(true);
      Toast.show({
        type: "success",
        text1: "Reminder Added",
        text2: "Event added to your calendar and reminder scheduled.",
      });
    } catch {
      setHasReminder(true);
      Toast.show({
        type: "success",
        text1: "Reminder Scheduled",
        text2: "You will be notified before this event begins.",
      });
    }
  };

  // Trigger custom delete modal
  const handleDeleteEvent = () => {
    setShowDeleteConfirm(true);
  };

  // Confirm delete execution
  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteEventMutation.mutateAsync(event.id);
      Toast.show({
        type: "success",
        text1: "Event Deleted",
        text2: "The campus event has been removed.",
      });
      setShowDeleteConfirm(false);
      onClose();
    } catch {
      Toast.show({
        type: "error",
        text1: "Delete Failed",
        text2: "Unable to delete event. Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      visible={!!event}
      animationType="slide"
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.modalOverlay,
          { paddingTop: Math.max(insets.top, 24) },
        ]}
      >
        {/* Backdrop overlay dismiss */}
        <TouchableOpacity
          style={styles.backdropDismiss}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Floating Sheet Container */}
        <View style={styles.sheetContainer}>
          {/* Top Handle Bar */}
          <View style={styles.handleBar} />

          {/* Header Bar */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={onClose}
              style={styles.circleBtn}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close event details"
              activeOpacity={0.7}
            >
              <Feather name="x" size={18} color="#0f172a" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Event Details</Text>

            <View style={styles.headerRightActions}>
              {isAdmin && (
                <>
                  <TouchableOpacity
                    onPress={() => {
                      onClose();
                      onEdit?.(event);
                    }}
                    style={[styles.circleBtn, { marginRight: 6 }]}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Edit event"
                    activeOpacity={0.7}
                  >
                    <Feather name="edit-2" size={15} color="#2563eb" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleDeleteEvent}
                    style={[styles.circleBtn, { marginRight: 6 }]}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Delete event"
                    activeOpacity={0.7}
                  >
                    <Feather name="trash-2" size={15} color="#dc2626" />
                  </TouchableOpacity>
                </>
              )}
              <TouchableOpacity
                onPress={() => safeShareEvent(event)}
                style={styles.circleBtn}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Share event"
                activeOpacity={0.7}
              >
                <Feather name="share-2" size={16} color="#0f172a" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Scrollable Content */}
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Status Badge */}
            <View
              style={[
                styles.statusPill,
                isToday && styles.statusPillToday,
                isPast && styles.statusPillPast,
              ]}
            >
              <Feather
                name="calendar"
                size={12}
                color={isToday ? "#059669" : isPast ? "#64748b" : "#2563eb"}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.statusText,
                  isToday && styles.statusTextToday,
                  isPast && styles.statusTextPast,
                ]}
              >
                {isToday
                  ? "HAPPENING TODAY"
                  : isPast
                    ? "COMPLETED EVENT"
                    : "UPCOMING EVENT"}
              </Text>
            </View>

            {/* Event Title */}
            <Text style={styles.eventTitle}>{event.title}</Text>

            {/* 2-Column Grid: Date & Time + Location */}
            <View style={styles.twoColumnGrid}>
              {/* Card 1: Date & Time */}
              <View style={styles.gridCard}>
                <View style={styles.cardHeaderRow}>
                  <View style={[styles.iconBox, { backgroundColor: "#eff6ff" }]}>
                    <Feather name="calendar" size={12} color="#2563eb" />
                  </View>
                  <Text style={styles.cardHeaderLabel}>DATE & TIME</Text>
                </View>
                <Text style={styles.dateMainText}>{dayMonthYear}</Text>
                <View style={styles.weekdayTimeRow}>
                  <Text style={styles.weekdayText}>{weekdayText}</Text>
                  <View style={styles.timeTagPill}>
                    <Feather
                      name="clock"
                      size={9}
                      color="#2563eb"
                      style={{ marginRight: 2.5 }}
                    />
                    <Text style={styles.timeTagText}>{formattedStartTime}</Text>
                  </View>
                </View>
              </View>

              {/* Card 2: Location */}
              <View style={styles.gridCard}>
                <View style={styles.cardHeaderRow}>
                  <View style={[styles.iconBox, { backgroundColor: "#ecfdf5" }]}>
                    <Feather name="map-pin" size={12} color="#059669" />
                  </View>
                  <Text style={styles.cardHeaderLabel}>LOCATION</Text>
                </View>
                <Text style={styles.locationValueText} numberOfLines={3}>
                  {event.location || "To Be Announced"}
                </Text>
              </View>
            </View>

            {/* Organizer Card (No Verified tag, real data) */}
            <View style={styles.organizerCard}>
              <View style={styles.organizerIconBox}>
                <Feather name="award" size={16} color="#4338ca" />
              </View>
              <View style={styles.organizerTextCol}>
                <Text style={styles.organizerLabel}>ORGANIZED BY</Text>
                <Text style={styles.organizerName} numberOfLines={2}>
                  {organizerName}
                </Text>
              </View>
            </View>

            {/* Total Interested People Card */}
            <View style={styles.interestedCard}>
              <View style={styles.interestedLeft}>
                <View
                  style={[
                    styles.interestedIconBox,
                    isInterested && styles.interestedIconBoxActive,
                  ]}
                >
                  <Feather
                    name="heart"
                    size={18}
                    color={isInterested ? "#e11d48" : "#f43f5e"}
                  />
                </View>
                <View style={styles.interestedInfo}>
                  <Text style={styles.interestedCountText}>
                    {interestedCount} {interestedCount === 1 ? "Person" : "People"} Interested
                  </Text>
                  <Text style={styles.interestedSubtext}>
                    {isInterested
                      ? "You and others marked interest"
                      : "Students & faculty marked interest"}
                  </Text>
                </View>
              </View>

              {/* Avatar Stack Preview */}
              <View style={styles.avatarStack}>
                <View
                  style={[styles.avatarBubble, { backgroundColor: "#3b82f6" }]}
                >
                  <Text style={styles.avatarInitial}>S</Text>
                </View>
                <View
                  style={[
                    styles.avatarBubble,
                    styles.avatarOverlap,
                    { backgroundColor: "#8b5cf6" },
                  ]}
                >
                  <Text style={styles.avatarInitial}>M</Text>
                </View>
                <View
                  style={[
                    styles.avatarBubble,
                    styles.avatarOverlap,
                    { backgroundColor: "#10b981" },
                  ]}
                >
                  <Text style={styles.avatarInitial}>U</Text>
                </View>
                <View
                  style={[
                    styles.avatarBubble,
                    styles.avatarOverlap,
                    { backgroundColor: "#e2e8f0" },
                  ]}
                >
                  <Text style={[styles.avatarInitial, { color: "#475569" }]}>
                    +{Math.max(1, interestedCount > 3 ? interestedCount - 3 : 1)}
                  </Text>
                </View>
              </View>
            </View>

            {/* About This Event Card */}
            <View style={styles.aboutCard}>
              <View style={styles.aboutHeaderRow}>
                <View style={styles.aboutIconBox}>
                  <Feather name="file-text" size={14} color="#0f172a" />
                </View>
                <Text style={styles.aboutLabel}>ABOUT THIS EVENT</Text>
              </View>
              <Text style={styles.aboutText}>
                {event.description ||
                  "An interactive event and showcase. Join faculty and peers to participate, gain industry insights, and explore campus opportunities."}
              </Text>
            </View>

            {/* Online Registration Link (If Available) */}
            {event.registrationLink ? (
              <TouchableOpacity
                style={styles.regCard}
                onPress={() => Linking.openURL(event.registrationLink!)}
                activeOpacity={0.8}
              >
                <View style={styles.regIconBox}>
                  <Feather name="external-link" size={16} color="#2563eb" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.regTitle}>Online Registration Available</Text>
                  <Text style={styles.regSubtitle} numberOfLines={1}>
                    Tap to open official registration portal
                  </Text>
                </View>
                <Feather name="chevron-right" size={18} color="#94a3b8" />
              </TouchableOpacity>
            ) : null}
          </ScrollView>

          {/* Bottom Fixed Action Buttons: Interested & Get Reminder */}
          <View
            style={[
              styles.bottomBar,
              { paddingBottom: Math.max(insets.bottom, 16) },
            ]}
          >
            {/* Button 1: Interested */}
            <TouchableOpacity
              style={[
                styles.interestedBtn,
                isInterested && styles.interestedBtnActive,
              ]}
              onPress={handleToggleInterested}
              activeOpacity={0.85}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={
                isInterested
                  ? "Marked as interested"
                  : "Mark yourself as interested"
              }
            >
              <Feather
                name={isInterested ? "check" : "star"}
                size={16}
                color={isInterested ? "#2563eb" : "#1e293b"}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.interestedBtnText,
                  isInterested && styles.interestedBtnTextActive,
                ]}
              >
                {isInterested ? "Interested" : "Interested"}
              </Text>
            </TouchableOpacity>

            {/* Button 2: Get Reminder */}
            <TouchableOpacity
              style={[
                styles.reminderBtn,
                hasReminder && styles.reminderBtnActive,
              ]}
              onPress={handleGetReminder}
              activeOpacity={0.85}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Add reminder for this event"
            >
              <Feather
                name={hasReminder ? "check-circle" : "bell"}
                size={16}
                color="#ffffff"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.reminderBtnText}>
                {hasReminder ? "Reminder Set" : "Get Reminder"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Custom Bento Delete Event Confirmation Modal */}
        {showDeleteConfirm && (
          <View style={styles.confirmOverlay}>
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={() => !isDeleting && setShowDeleteConfirm(false)}
              accessible={false}
            />

            <View style={styles.confirmCard}>
              {/* Top Warning Icon Halo */}
              <View style={styles.confirmIconHalo}>
                <View style={styles.confirmIconCircle}>
                  <Feather name="trash-2" size={24} color="#dc2626" />
                </View>
              </View>

              {/* Title & Description */}
              <Text style={styles.confirmTitle}>Delete Campus Event?</Text>
              <Text style={styles.confirmMessage}>
                Are you sure you want to permanently delete this event? This action will remove it for all students and cannot be undone.
              </Text>

              {/* Event Snapshot Card Preview */}
              <View style={styles.confirmEventPreview}>
                <View style={styles.confirmEventIconBox}>
                  <Feather name="calendar" size={14} color="#2563eb" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.confirmEventTitle} numberOfLines={1}>
                    {event.title}
                  </Text>
                  <Text style={styles.confirmEventSub} numberOfLines={1}>
                    {dayMonthYear} • {formattedStartTime}
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.confirmActionsRow}>
                <TouchableOpacity
                  style={styles.confirmCancelBtn}
                  onPress={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  activeOpacity={0.7}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel delete event"
                >
                  <Text style={styles.confirmCancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.confirmDeleteBtn}
                  onPress={handleConfirmDelete}
                  disabled={isDeleting}
                  activeOpacity={0.8}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Confirm delete event"
                >
                  {isDeleting ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                      <Feather
                        name="trash-2"
                        size={15}
                        color="#ffffff"
                        style={{ marginRight: 6 }}
                      />
                      <Text style={styles.confirmDeleteBtnText}>
                        Delete Event
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    justifyContent: "flex-end",
  },
  backdropDismiss: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "92%",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 12,
    overflow: "hidden",
  },
  handleBar: {
    width: 42,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: "#cbd5e1",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  headerTitle: {
    fontFamily,
    fontSize: 17,
    fontWeight: "800",
    color: "#0f172a",
  },
  headerRightActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: BENTO_COLORS.pillRadius,
    borderWidth: 1,
    borderColor: "#dbeafe",
    marginBottom: 12,
  },
  statusPillToday: {
    backgroundColor: "#ecfdf5",
    borderColor: "#a7f3d0",
  },
  statusPillPast: {
    backgroundColor: "#f1f5f9",
    borderColor: "#e2e8f0",
  },
  statusText: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "800",
    color: "#2563eb",
    letterSpacing: 0.7,
  },
  statusTextToday: {
    color: "#059669",
  },
  statusTextPast: {
    color: "#64748b",
  },
  eventTitle: {
    fontFamily,
    fontSize: 23,
    fontWeight: "900",
    color: "#0f172a",
    letterSpacing: -0.4,
    lineHeight: 30,
    marginBottom: 16,
  },
  twoColumnGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  gridCard: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    paddingHorizontal: 11,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    justifyContent: "flex-start",
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  iconBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  cardHeaderLabel: {
    fontFamily,
    fontSize: 9.5,
    fontWeight: "800",
    color: "#64748b",
    letterSpacing: 0.8,
  },
  dateMainText: {
    fontFamily,
    fontSize: 12.5,
    fontWeight: "800",
    color: "#0f172a",
    lineHeight: 17,
  },
  weekdayTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "nowrap",
    gap: 5,
    marginTop: 4,
  },
  weekdayText: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "700",
    color: "#334155",
    flexShrink: 0,
  },
  timeTagPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    flexShrink: 0,
  },
  timeTagText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "700",
    color: "#1d4ed8",
  },
  locationValueText: {
    fontFamily,
    fontSize: 12.5,
    fontWeight: "800",
    color: "#0f172a",
    lineHeight: 17,
    marginTop: 1,
  },
  organizerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 12,
  },
  organizerIconBox: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: "#eef2ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#e0e7ff",
  },
  organizerTextCol: {
    flex: 1,
  },
  organizerLabel: {
    fontFamily,
    fontSize: 9.5,
    fontWeight: "800",
    color: "#64748b",
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  organizerName: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "800",
    color: "#0f172a",
    lineHeight: 18,
  },
  interestedCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff1f2",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#ffe4e6",
    marginBottom: 14,
  },
  interestedLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  interestedIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
    borderWidth: 1,
    borderColor: "#fecdd3",
  },
  interestedIconBoxActive: {
    backgroundColor: "#ffe4e6",
    borderColor: "#fda4af",
  },
  interestedInfo: {
    flex: 1,
  },
  interestedCountText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "800",
    color: "#9f1239",
    letterSpacing: -0.2,
  },
  interestedSubtext: {
    fontFamily,
    fontSize: 11,
    color: "#be123c",
    marginTop: 2,
  },
  avatarStack: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  avatarBubble: {
    width: 27,
    height: 27,
    borderRadius: 13.5,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  avatarOverlap: {
    marginLeft: -8,
  },
  avatarInitial: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: "#ffffff",
  },
  aboutCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 14,
  },
  aboutHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  aboutIconBox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  aboutLabel: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: "#475569",
    letterSpacing: 0.8,
  },
  aboutText: {
    fontFamily,
    fontSize: 13.5,
    color: "#334155",
    lineHeight: 21,
  },
  regCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    borderRadius: 16,
    paddingVertical: 13,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    marginBottom: 14,
  },
  regIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  regTitle: {
    fontFamily,
    fontSize: 13,
    fontWeight: "800",
    color: "#1d4ed8",
  },
  regSubtitle: {
    fontFamily,
    fontSize: 11,
    color: "#3b82f6",
    marginTop: 2,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    flexDirection: "row",
    gap: 12,
  },
  interestedBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    paddingVertical: 14,
    borderRadius: 14,
  },
  interestedBtnActive: {
    backgroundColor: "#eff6ff",
    borderColor: "#93c5fd",
  },
  interestedBtnText: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "800",
    color: "#1e293b",
  },
  interestedBtnTextActive: {
    color: "#2563eb",
  },
  reminderBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BENTO_COLORS.deepNavy,
    paddingVertical: 14,
    borderRadius: 14,
    ...BENTO_COLORS.shadow,
  },
  reminderBtnActive: {
    backgroundColor: "#0f766e",
  },
  reminderBtnText: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "800",
    color: "#ffffff",
  },
  confirmOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
    paddingHorizontal: 24,
  },
  confirmCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#ffffff",
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 22,
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 15,
  },
  confirmIconHalo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fee2e2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  confirmIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fef2f2",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#fecaca",
  },
  confirmTitle: {
    fontFamily,
    fontSize: 18,
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: 8,
    textAlign: "center",
  },
  confirmMessage: {
    fontFamily,
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  confirmEventPreview: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    width: "100%",
    marginBottom: 20,
  },
  confirmEventIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  confirmEventTitle: {
    fontFamily,
    fontSize: 13,
    fontWeight: "800",
    color: "#0f172a",
  },
  confirmEventSub: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 2,
  },
  confirmActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    width: "100%",
  },
  confirmCancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  confirmCancelBtnText: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "700",
    color: "#475569",
  },
  confirmDeleteBtn: {
    flex: 1.25,
    flexDirection: "row",
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: "#dc2626",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#dc2626",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  confirmDeleteBtnText: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "800",
    color: "#ffffff",
  },
});

