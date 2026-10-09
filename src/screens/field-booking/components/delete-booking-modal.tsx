import React, { memo } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import type { FieldBookingItem } from "@/services/field-service";
import { BENTO } from "../constants";
import { formatDate, formatTime, formatPurposeWithEmoji } from "../utils";

interface DeleteBookingModalProps {
  visible: boolean;
  item: FieldBookingItem | null;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export const DeleteBookingModal = memo(function DeleteBookingModal({
  visible,
  item,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteBookingModalProps) {
  const insets = useSafeAreaInsets();

  if (!item) return null;

  const dateDisplay = formatDate(item.bookingDate || item.startTime);
  const timeDisplay = `${formatTime(item.startTime)} – ${formatTime(item.endTime)}`;
  const titleDisplay = formatPurposeWithEmoji(item.purpose);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={isDeleting ? undefined : onClose}
      statusBarTranslucent={true}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={true}
      />
      <View
        style={[
          styles.backdrop,
          {
            paddingTop: Math.max(insets.top, 16),
            paddingBottom: Math.max(insets.bottom, 16),
          },
        ]}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={isDeleting ? undefined : onClose}
          accessible={false}
        />

        <View style={styles.cardContainer}>
          {/* Danger Icon Header */}
          <View style={styles.iconCircle}>
            <Feather name="trash-2" size={22} color={BENTO.rose} />
          </View>

          {/* Heading */}
          <Text style={styles.titleText}>Delete Booking?</Text>
          <Text style={styles.descriptionText}>
            Are you sure you want to delete this booking request? This action cannot be undone.
          </Text>

          {/* Booking Preview Summary Card */}
          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle} numberOfLines={2}>
              {titleDisplay}
            </Text>

            <View style={styles.summaryMetaRow}>
              <View style={styles.summaryPill}>
                <Feather
                  name="calendar"
                  size={11}
                  color={BENTO.navySecondary}
                  style={styles.summaryPillIcon}
                />
                <Text
                  style={styles.summaryPillText}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {dateDisplay}
                </Text>
              </View>

              <View style={styles.summaryPill}>
                <Feather
                  name="clock"
                  size={11}
                  color={BENTO.indigo}
                  style={styles.summaryPillIcon}
                />
                <Text
                  style={[styles.summaryPillText, { color: BENTO.indigo }]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {timeDisplay}
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={isDeleting}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Cancel deletion"
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.confirmButton,
                isDeleting && styles.confirmButtonDisabled,
              ]}
              onPress={onConfirm}
              disabled={isDeleting}
              activeOpacity={0.85}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Confirm delete booking"
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.confirmButtonText}>Delete</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 22,
  },
  cardContainer: {
    width: Platform.OS === "web" ? 380 : "100%",
    maxWidth: 360,
    backgroundColor: BENTO.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: BENTO.border,
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 20,
    alignItems: "center",
    ...Platform.select({
      web: {
        boxShadow: "0 20px 40px -10px rgba(15, 23, 42, 0.25)",
      } as any,
      default: {
        shadowColor: "#0f172a",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.16,
        shadowRadius: 18,
        elevation: 8,
      },
    }),
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: BENTO.roseBg,
    borderWidth: 1,
    borderColor: BENTO.roseBorder,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  titleText: {
    fontSize: 18,
    fontWeight: "700",
    color: BENTO.navy,
    textAlign: "center",
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  descriptionText: {
    fontSize: 13,
    fontWeight: "500",
    color: BENTO.slate,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 16,
    paddingHorizontal: 6,
  },
  summaryBox: {
    width: "100%",
    backgroundColor: BENTO.slateSubtle,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BENTO.border,
    padding: 12,
    marginBottom: 18,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: BENTO.navy,
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  summaryMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  summaryPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BENTO.card,
    paddingHorizontal: 6,
    paddingVertical: 5.5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BENTO.border,
  },
  summaryPillIcon: {
    marginRight: 4,
  },
  summaryPillText: {
    fontSize: 10.5,
    fontWeight: "600",
    color: BENTO.navySecondary,
    letterSpacing: -0.2,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    width: "100%",
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    height: 44,
    backgroundColor: BENTO.slateSubtle,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: BENTO.border,
  },
  cancelButtonText: {
    fontSize: 13.5,
    fontWeight: "600",
    color: BENTO.navySecondary,
  },
  confirmButton: {
    flex: 1,
    height: 44,
    backgroundColor: BENTO.rose,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  confirmButtonDisabled: {
    opacity: 0.65,
  },
  confirmButtonText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#ffffff",
  },
});
