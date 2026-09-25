import React, { useCallback } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useDeleteComplaint } from "@/features/complaints/useComplaints";
import { CAMPUS_HUB_COLORS, fontFamily } from "@/screens/campus-hub/shared/design-tokens";
import type { ComplaintItem } from "@/services/complaint-service";

interface ComplaintDeleteModalProps {
  visible: boolean;
  complaint: ComplaintItem | null;
  onClose: () => void;
}

export const ComplaintDeleteModal = React.memo(function ComplaintDeleteModal({
  visible,
  complaint,
  onClose,
}: ComplaintDeleteModalProps) {
  const insets = useSafeAreaInsets();
  const deleteMutation = useDeleteComplaint();

  const isDeleting = deleteMutation.isPending;

  const handleDelete = useCallback(() => {
    if (!complaint) return;

    deleteMutation.mutate(complaint.id, {
      onSuccess: () => {
        Toast.show({
          type: "success",
          text1: "Complaint Deleted",
          text2: "The complaint record has been removed.",
        });
        onClose();
      },
      onError: (err: any) => {
        Toast.show({
          type: "error",
          text1: "Deletion Failed",
          text2: err?.message || "Could not delete complaint.",
        });
      },
    });
  }, [complaint, deleteMutation, onClose]);

  if (!visible || !complaint) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      <View style={styles.overlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
          accessible={false}
        />

        <View style={[styles.dialogCard, { marginBottom: Math.max(insets.bottom, 24) }]}>
          {/* Warning Icon Badge */}
          <View style={styles.iconCircle}>
            <Feather name="trash-2" size={24} color="#e11d48" />
          </View>

          <Text style={styles.title}>Delete Complaint?</Text>
          <Text style={styles.subtitle}>
            Are you sure you want to permanently delete:
          </Text>

          <View style={styles.titlePreviewBox}>
            <Text style={styles.titlePreviewText} numberOfLines={2}>
              "{complaint.title}"
            </Text>
          </View>

          <Text style={styles.warningNote}>
            This action cannot be undone and will remove the complaint from review.
          </Text>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={isDeleting}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.deleteBtn, isDeleting && styles.deleteBtnDisabled]}
              onPress={handleDelete}
              disabled={isDeleting}
              activeOpacity={0.8}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.deleteBtnText}>Delete</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(10, 15, 29, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  dialogCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    ...CAMPUS_HUB_COLORS.heroShadow,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#ffe4e6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  title: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
    marginBottom: 6,
  },
  subtitle: {
    fontFamily,
    fontSize: 13,
    color: CAMPUS_HUB_COLORS.subtleText,
    textAlign: "center",
    marginBottom: 10,
  },
  titlePreviewBox: {
    backgroundColor: "#f8fafc",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    width: "100%",
    marginBottom: 10,
  },
  titlePreviewText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
    textAlign: "center",
  },
  warningNote: {
    fontFamily,
    fontSize: 11.5,
    color: "#e11d48",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 16,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.neutralText,
  },
  deleteBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    backgroundColor: "#e11d48",
    alignItems: "center",
    justifyContent: "center",
    ...CAMPUS_HUB_COLORS.shadow,
  },
  deleteBtnDisabled: {
    opacity: 0.6,
  },
  deleteBtnText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "800",
    color: "#ffffff",
  },
});
