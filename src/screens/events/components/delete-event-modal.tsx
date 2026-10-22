import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { CampusEventItem } from "@/services/event-service";
import { fontFamily } from "../constants";
import { formatEventTime } from "../utils";

export interface DeleteEventModalProps {
  visible: boolean;
  event: CampusEventItem | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteEventModal = React.memo(function DeleteEventModal({
  visible,
  event,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteEventModalProps) {
  if (!visible || !event) return null;

  const eventDateStr = event.eventDate || event.date || event.createdAt;
  const eventDate = new Date(eventDateStr);
  const day = eventDate.getDate();
  const month = eventDate.toLocaleDateString("en-US", { month: "long" });
  const year = eventDate.getFullYear();
  const dayMonthYear = `${day} ${month}, ${year}`;
  const formattedStartTime = formatEventTime(eventDateStr);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => !isDeleting && onClose()}
      statusBarTranslucent={true}
    >
      <View style={styles.confirmOverlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={() => !isDeleting && onClose()}
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
            Are you sure you want to permanently delete this event? This action
            will remove it for all students and faculty and cannot be undone.
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
              onPress={onClose}
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
              onPress={onConfirm}
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
                  <Text style={styles.confirmDeleteBtnText}>Delete Event</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  confirmOverlay: {
    flex: 1,
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
