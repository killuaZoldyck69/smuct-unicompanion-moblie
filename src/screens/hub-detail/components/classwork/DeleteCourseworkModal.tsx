import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { AssessmentData } from "./types";
import { getAssessmentTypeConfig, formatDueDate } from "./utils";

const BENTO = {
  card: "#ffffff",
  navy: "#0f172a",
  slate: "#64748b",
  border: "rgba(15, 23, 42, 0.08)",
  redSoft: "#fef2f2",
  redBorder: "#fee2e2",
  redPrimary: "#dc2626",
  canvas: "#f8fafc",
};

const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  web: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  default: "sans-serif",
});

interface Props {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  assessment?: AssessmentData | null;
  isPending?: boolean;
}

export function DeleteCourseworkModal({
  isVisible,
  onClose,
  onConfirm,
  assessment,
  isPending = false,
}: Props) {
  const insets = useSafeAreaInsets();
  const typeConfig = assessment ? getAssessmentTypeConfig(assessment.type) : null;

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={true}
      />
      <View
        style={[
          styles.overlay,
          {
            paddingTop: Math.max(insets.top + 16, 24),
            paddingBottom: Math.max(insets.bottom + 16, 24),
            paddingLeft: Math.max(insets.left + 16, 16),
            paddingRight: Math.max(insets.right + 16, 16),
          },
        ]}
        accessibilityViewIsModal={true}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={isPending ? undefined : onClose}
          accessible={false}
        />
        <View style={styles.modalContent}>
          {/* Top Decorative Alert Icon */}
          <View style={styles.iconCircle}>
            <View style={styles.iconInnerCircle}>
              <Feather name="trash-2" size={22} color={BENTO.redPrimary} />
            </View>
          </View>

          {/* Title & Warning Subtitle */}
          <Text style={styles.titleText}>Delete Coursework?</Text>
          <Text style={styles.subtitleText}>
            Are you sure you want to delete this coursework? All student submissions and
            records will be permanently removed.
          </Text>

          {/* Coursework Details Preview Card */}
          {assessment && (
            <View style={styles.previewBox}>
              <View style={styles.previewHeader}>
                {typeConfig && (
                  <View
                    style={[
                      styles.typePill,
                      { backgroundColor: typeConfig.badgeBg },
                    ]}
                  >
                    <Text
                      style={[
                        styles.typePillText,
                        { color: typeConfig.badgeText },
                      ]}
                    >
                      {typeConfig.label}
                    </Text>
                  </View>
                )}
                {assessment.totalMarks !== undefined && (
                  <Text style={styles.marksText}>
                    Max Marks: {assessment.totalMarks}
                  </Text>
                )}
              </View>
              <Text style={styles.previewTitle} numberOfLines={2}>
                {assessment.title}
              </Text>
              <View style={styles.dueRow}>
                <Feather
                  name="calendar"
                  size={11.5}
                  color={BENTO.slate}
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.dueText}>
                  Due: {formatDueDate(assessment.deadline)}
                </Text>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={isPending}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Cancel coursework deletion"
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.deleteBtn,
                isPending && { opacity: 0.75 },
              ]}
              onPress={onConfirm}
              disabled={isPending}
              activeOpacity={0.85}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Confirm delete coursework"
            >
              {isPending ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Feather
                    name="trash-2"
                    size={14}
                    color="#ffffff"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: BENTO.card,
    borderRadius: 24,
    width: "100%",
    maxWidth: 340,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 20,
    alignItems: "center",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 28,
    elevation: 10,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.06)",
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: BENTO.redSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BENTO.redBorder,
  },
  iconInnerCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: BENTO.redPrimary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
  titleText: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: BENTO.navy,
    textAlign: "center",
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  subtitleText: {
    fontFamily,
    fontSize: 13,
    color: BENTO.slate,
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 16,
  },
  previewBox: {
    width: "100%",
    backgroundColor: BENTO.canvas,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BENTO.border,
    borderLeftWidth: 3.5,
    borderLeftColor: BENTO.redPrimary,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 18,
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  typePill: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 9999,
  },
  typePillText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "700",
  },
  marksText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: BENTO.slate,
  },
  previewTitle: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: BENTO.navy,
    lineHeight: 19,
    marginBottom: 4,
  },
  dueRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  dueText: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "500",
    color: BENTO.slate,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    width: "100%",
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    backgroundColor: BENTO.canvas,
    borderWidth: 1,
    borderColor: BENTO.border,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: BENTO.slate,
  },
  deleteBtn: {
    flex: 1.2,
    height: 44,
    borderRadius: 14,
    backgroundColor: BENTO.redPrimary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: BENTO.redPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },
  deleteBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
});
