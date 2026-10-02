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
import { BENTO, fontFamily } from "./types";

interface DeleteReviewModalProps {
  isVisible: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onDelete: () => void;
}

export const DeleteReviewModal: React.FC<DeleteReviewModalProps> = React.memo(
  ({ isVisible, isDeleting, onClose, onDelete }) => {
    if (!isVisible) return null;

    return (
      <Modal
        visible={isVisible}
        animationType="fade"
        transparent={true}
        statusBarTranslucent={true}
        onRequestClose={onClose}
      >
        <View style={styles.modalBackdropCentered}>
          <TouchableOpacity
            style={styles.backdropTap}
            activeOpacity={1}
            onPress={isDeleting ? undefined : onClose}
          />
          <View style={styles.confirmCard}>
            <View style={styles.confirmIconBox}>
              <Feather name="trash-2" size={24} color="#ef4444" />
            </View>
            <Text style={styles.confirmTitle}>Delete Your Review?</Text>
            <Text style={styles.confirmMessage}>
              Are you sure you want to delete your evaluation? This action will remove your feedback
              from the course evaluation metrics. You can re-submit a review anytime while evaluations
              are open.
            </Text>

            <View style={styles.confirmActionsRow}>
              <TouchableOpacity
                style={styles.confirmCancelBtn}
                onPress={onClose}
                disabled={isDeleting}
              >
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmDeleteBtn}
                onPress={onDelete}
                disabled={isDeleting}
                activeOpacity={0.8}
              >
                {isDeleting ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.confirmDeleteText}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
);

const styles = StyleSheet.create({
  modalBackdropCentered: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  backdropTap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  confirmCard: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 22,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
    ...BENTO.shadow,
  },
  confirmIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#fee2e2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  confirmTitle: {
    fontFamily,
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 6,
    textAlign: "center",
  },
  confirmMessage: {
    fontFamily,
    fontSize: 12,
    color: "#64748b",
    lineHeight: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  confirmActionsRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  confirmCancelBtn: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmCancelText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
  },
  confirmDeleteBtn: {
    flex: 1,
    backgroundColor: "#ef4444",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmDeleteText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
});
