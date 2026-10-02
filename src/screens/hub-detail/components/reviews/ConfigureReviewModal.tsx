import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Switch,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { fontFamily } from "./types";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface ConfigureReviewModalProps {
  isVisible: boolean;
  settingsOpen: boolean;
  setSettingsOpen: (val: boolean) => void;
  customQuestions: string[];
  newQuestionText: string;
  setNewQuestionText: (text: string) => void;
  isSaving: boolean;
  onAddQuestion: () => void;
  onRemoveQuestion: (idx: number) => void;
  onClose: () => void;
  onSave: () => void;
}

export const ConfigureReviewModal: React.FC<ConfigureReviewModalProps> = React.memo(
  ({
    isVisible,
    settingsOpen,
    setSettingsOpen,
    customQuestions,
    newQuestionText,
    setNewQuestionText,
    isSaving,
    onAddQuestion,
    onRemoveQuestion,
    onClose,
    onSave,
  }) => {
    const insets = useSafeAreaInsets();

    if (!isVisible) return null;

    return (
      <Modal
        visible={isVisible}
        animationType="slide"
        transparent={true}
        statusBarTranslucent={true}
        onRequestClose={onClose}
      >
        <View style={styles.modalBackdrop}>
          {/* Backdrop tap to dismiss */}
          <TouchableOpacity
            style={styles.backdropTap}
            activeOpacity={1}
            onPress={isSaving ? undefined : onClose}
          />

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.keyboardWrap}
          >
            <View
              style={[
                styles.modalSheet,
                { paddingBottom: Math.max(insets.bottom + 14, 20) },
              ]}
            >
              {/* Drag Handle */}
              <View style={styles.dragHandleWrap}>
                <View style={styles.dragHandle} />
              </View>

              <View style={styles.modalHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle} numberOfLines={1}>Evaluation Settings</Text>
                  <Text style={styles.modalSub} numberOfLines={1}>Configure student evaluation & questions</Text>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.modalCloseBtn}
                  disabled={isSaving}
                >
                  <Feather name="x" size={18} color="#0f172a" />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={{ marginTop: 12 }}
                contentContainerStyle={{ paddingBottom: 16 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {/* Active Evaluation Switch */}
                <View style={styles.switchRow}>
                  <View style={{ flex: 1, paddingRight: 12 }}>
                    <Text style={styles.switchTitle}>Allow Student Evaluations</Text>
                    <Text style={styles.switchSubtitle}>
                      When active, students enrolled in this hub can submit anonymous evaluations.
                    </Text>
                  </View>
                  <Switch
                    value={settingsOpen}
                    onValueChange={setSettingsOpen}
                    trackColor={{ false: "#cbd5e1", true: "#10b981" }}
                    thumbColor="#ffffff"
                  />
                </View>

                {/* Custom Evaluation Questions Section */}
                <View style={{ marginTop: 20 }}>
                  <Text style={styles.inputLabel}>Optional Evaluation Questions</Text>
                  <Text style={styles.settingsSectionSubtitle}>
                    Add specific questions for students. Questions are optional for students to answer.
                  </Text>

                  {customQuestions.map((q, idx) => (
                    <View key={idx} style={styles.questionItemRow}>
                      <View style={styles.questionNumBadge}>
                        <Text style={styles.questionNumText}>{idx + 1}</Text>
                      </View>
                      <Text style={styles.questionItemText} numberOfLines={2}>
                        {q}
                      </Text>
                      <TouchableOpacity
                        onPress={() => onRemoveQuestion(idx)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Feather name="trash-2" size={15} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  ))}

                  {/* Add Question Input */}
                  <View style={styles.addQuestionRow}>
                    <TextInput
                      style={[styles.input, { flex: 1, marginBottom: 0 }]}
                      placeholder="e.g. How effective were the lab sessions?"
                      placeholderTextColor="#94a3b8"
                      value={newQuestionText}
                      onChangeText={setNewQuestionText}
                      onSubmitEditing={onAddQuestion}
                      returnKeyType="done"
                    />
                    <TouchableOpacity
                      style={styles.addQuestionBtn}
                      onPress={onAddQuestion}
                      activeOpacity={0.8}
                    >
                      <Feather name="plus" size={18} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.saveSettingsBtn}
                  onPress={onSave}
                  disabled={isSaving}
                  activeOpacity={0.8}
                >
                  {isSaving ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.saveSettingsBtnText}>Save Settings</Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    );
  }
);

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "flex-end",
  },
  backdropTap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  keyboardWrap: {
    width: "100%",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 8,
    maxHeight: SCREEN_HEIGHT * 0.88,
    width: "100%",
  },
  dragHandleWrap: {
    alignItems: "center",
    paddingVertical: 8,
  },
  dragHandle: {
    width: 38,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: "#cbd5e1",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingBottom: 12,
  },
  modalTitle: {
    fontFamily,
    fontSize: 17,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: -0.3,
  },
  modalSub: {
    fontFamily,
    fontSize: 11,
    color: "#64748b",
    fontWeight: "500",
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  switchTitle: {
    fontFamily,
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
  },
  switchSubtitle: {
    fontFamily,
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
    lineHeight: 15,
  },
  inputLabel: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 6,
  },
  settingsSectionSubtitle: {
    fontFamily,
    fontSize: 11,
    color: "#64748b",
    marginBottom: 10,
  },
  questionItemRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  questionNumBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  questionNumText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
  },
  questionItemText: {
    flex: 1,
    fontFamily,
    fontSize: 12,
    color: "#0f172a",
    fontWeight: "600",
    marginRight: 8,
  },
  addQuestionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  input: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13,
    color: "#0f172a",
    marginBottom: 14,
  },
  addQuestionBtn: {
    backgroundColor: "#0f172a",
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  saveSettingsBtn: {
    backgroundColor: "#0f172a",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 16,
  },
  saveSettingsBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "800",
    color: "#ffffff",
  },
});
