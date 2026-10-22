// src/screens/notices/components/delete-notice-modal.tsx
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
import { NormalizedNotice } from "../types";
import { fontFamily, NOTICE_COLORS } from "../constants";

export interface DeleteNoticeModalProps {
  visible: boolean;
  notice: NormalizedNotice | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteNoticeModal = React.memo(function DeleteNoticeModal({
  visible,
  notice,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteNoticeModalProps) {
  if (!visible || !notice) return null;

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
          <Text style={styles.confirmTitle}>Delete Official Notice?</Text>
          <Text style={styles.confirmMessage}>
            Are you sure you want to permanently delete this notice? This action
            will remove it from the digital noticeboard for all students and faculty
            and cannot be undone.
          </Text>

          {/* Notice Snapshot Card Preview */}
          <View style={styles.confirmNoticePreview}>
            <View style={styles.confirmNoticeIconBox}>
              <Feather name="file-text" size={14} color="#2563eb" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.confirmNoticeTitle} numberOfLines={1}>
                {notice.title}
              </Text>
              <Text style={styles.confirmNoticeSub} numberOfLines={1}>
                {notice.referenceNo ? `Ref: ${notice.referenceNo} • ` : ""}
                {notice.formattedDate}
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
              accessibilityLabel="Cancel delete notice"
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
              accessibilityLabel="Confirm delete notice"
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
                  <Text style={styles.confirmDeleteBtnText}>Delete Notice</Text>
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
    backgroundColor: NOTICE_COLORS.white,
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
    color: NOTICE_COLORS.deepNavy,
    marginBottom: 8,
    textAlign: "center",
  },
  confirmMessage: {
    fontFamily,
    fontSize: 13,
    color: NOTICE_COLORS.subtleText,
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  confirmNoticePreview: {
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
  confirmNoticeIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  confirmNoticeTitle: {
    fontFamily,
    fontSize: 13,
    fontWeight: "800",
    color: NOTICE_COLORS.deepNavy,
  },
  confirmNoticeSub: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: NOTICE_COLORS.subtleText,
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
