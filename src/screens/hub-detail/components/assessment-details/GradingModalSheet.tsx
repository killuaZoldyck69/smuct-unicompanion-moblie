import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { GradingStudentTarget } from "./types";

const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

interface GradingModalSheetProps {
  target: GradingStudentTarget | null;
  totalMarks: number;
  initialMarks?: number | null;
  initialFeedback?: string | null;
  isPending: boolean;
  onClose: () => void;
  onSave: (marks: number, feedback?: string) => void;
}

export const GradingModalSheet: React.FC<GradingModalSheetProps> = ({
  target,
  totalMarks,
  initialMarks,
  initialFeedback,
  isPending,
  onClose,
  onSave,
}) => {
  const insets = useSafeAreaInsets();
  const [marksStr, setMarksStr] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (target) {
      setMarksStr(
        initialMarks !== undefined && initialMarks !== null
          ? String(initialMarks)
          : ""
      );
      setFeedback(initialFeedback || "");
    }
  }, [target, initialMarks, initialFeedback]);

  if (!target) return null;

  const handleValidateAndSave = () => {
    const trimmed = marksStr.trim();
    if (!trimmed) {
      Toast.show({
        type: "error",
        text1: "Marks Required",
        text2: "Please enter a valid numeric mark for this student.",
      });
      return;
    }

    const num = parseFloat(trimmed);
    if (isNaN(num) || num < 0) {
      Toast.show({
        type: "error",
        text1: "Invalid Marks",
        text2: "Marks must be a positive number.",
      });
      return;
    }

    if (num > totalMarks) {
      Toast.show({
        type: "error",
        text1: "Marks Exceeded",
        text2: `Marks cannot exceed the maximum mark of ${totalMarks}.`,
      });
      return;
    }

    onSave(num, feedback.trim() || undefined);
  };

  return (
    <Modal
      visible={!!target}
      animationType="fade"
      transparent
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View
          style={[
            styles.overlay,
            {
              paddingTop: Math.max(insets.top + 16, 24),
              paddingBottom: Math.max(insets.bottom + 16, 24),
            },
          ]}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoid}
          >
            <View style={styles.sheetContainer}>
              {/* Header */}
              <View style={styles.headerRow}>
                <Text style={styles.titleText}>Grade Submission</Text>
                <TouchableOpacity
                  onPress={onClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={styles.closeBtn}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Close grading modal"
                >
                  <Feather name="x" size={18} color="#64748b" />
                </TouchableOpacity>
              </View>

              <Text style={styles.studentNameSubtitle}>Student: {target.name}</Text>

              {/* Marks Input */}
              <Text style={styles.inputLabel}>
                Marks (Out of {totalMarks}) <Text style={{ color: "#ef4444" }}>*</Text>
              </Text>
              <View style={styles.marksInputRow}>
                <TextInput
                  style={styles.marksInput}
                  placeholder={`0 - ${totalMarks}`}
                  placeholderTextColor="#94a3b8"
                  value={marksStr}
                  onChangeText={(text) => {
                    const sanitized = text.replace(/[^0-9.]/g, "");
                    setMarksStr(sanitized);
                  }}
                  keyboardType="numeric"
                  autoFocus
                />
                <Text style={styles.marksSuffix}>/ {totalMarks} Marks</Text>
              </View>

              {/* Feedback Input */}
              <Text style={styles.inputLabel}>Instructor Feedback (Optional)</Text>
              <TextInput
                style={styles.feedbackInput}
                placeholder="Add comments, corrections, or encouraging feedback..."
                placeholderTextColor="#94a3b8"
                value={feedback}
                onChangeText={setFeedback}
                multiline
                numberOfLines={3}
              />

              {/* Actions */}
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={onClose}
                  disabled={isPending}
                  activeOpacity={0.7}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel"
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={handleValidateAndSave}
                  disabled={isPending}
                  activeOpacity={0.85}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Save Grade"
                >
                  {isPending ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.saveBtnText}>Save Grade</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  keyboardAvoid: {
    width: "100%",
    maxWidth: 440,
    justifyContent: "center",
  },
  sheetContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  titleText: {
    fontFamily,
    fontSize: 17,
    fontWeight: "800",
    color: "#0f172a",
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  studentNameSubtitle: {
    fontFamily,
    fontSize: 13,
    fontWeight: "600",
    color: "#2563eb",
    marginBottom: 14,
  },
  inputLabel: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 6,
    marginTop: 8,
  },
  marksInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  marksInput: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    width: 120,
    fontSize: 15,
    color: "#0f172a",
    fontWeight: "700",
  },
  marksSuffix: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#64748b",
  },
  feedbackInput: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    color: "#0f172a",
    height: 80,
    textAlignVertical: "top",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
  },
  saveBtn: {
    flex: 1.4,
    backgroundColor: "#16a34a",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  saveBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "800",
    color: "#ffffff",
  },
});
