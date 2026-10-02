import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { fontFamily, RATING_LABELS } from "./types";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface ReviewFormModalProps {
  isVisible: boolean;
  isEditMode: boolean;
  rating: number;
  setRating: (rating: number) => void;
  comment: string;
  setComment: (comment: string) => void;
  answers: Record<string, string>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  reviewQuestions: string[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export const ReviewFormModal: React.FC<ReviewFormModalProps> = React.memo(
  ({
    isVisible,
    isEditMode,
    rating,
    setRating,
    comment,
    setComment,
    answers,
    setAnswers,
    reviewQuestions,
    isSubmitting,
    onClose,
    onSubmit,
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
            onPress={isSubmitting ? undefined : onClose}
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
                  <Text style={styles.modalTitle} numberOfLines={1}>
                    {isEditMode ? "Edit Your Evaluation" : "Course Evaluation"}
                  </Text>
                  <Text style={styles.modalSub} numberOfLines={1}>
                    {isEditMode ? "Update your confidential rating" : "100% confidential & anonymous"}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.modalCloseBtn}
                  disabled={isSubmitting}
                >
                  <Feather name="x" size={18} color="#0f172a" />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={{ marginTop: 8 }}
                contentContainerStyle={{ paddingBottom: 16 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {/* Confidentiality Reminder Banner */}
                <View style={styles.privacyBanner}>
                  <Feather name="shield" size={16} color="#0284c7" style={{ marginRight: 8 }} />
                  <Text style={styles.privacyBannerText}>
                    100% Anonymous. Neither your name, email, nor student ID will ever be revealed to
                    the instructor or peers.
                  </Text>
                </View>

                {/* Overall Rating Section */}
                <Text style={styles.inputLabel}>Overall Experience Rating *</Text>
                <View style={styles.starPickerContainer}>
                  <View style={styles.starPickerRow}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <TouchableOpacity
                        key={s}
                        onPress={() => setRating(s)}
                        style={styles.starTouch}
                        activeOpacity={0.7}
                      >
                        <Feather
                          name="star"
                          size={32}
                          color={s <= rating ? "#f59e0b" : "#cbd5e1"}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text style={styles.starRatingCaption}>
                    {RATING_LABELS[rating] || `${rating} Stars`}
                  </Text>
                </View>

                {/* Detailed Feedback Text Input */}
                <Text style={styles.inputLabel}>Detailed Feedback</Text>
                <TextInput
                  style={[styles.input, { height: 95, textAlignVertical: "top" }]}
                  placeholder="Share constructive feedback regarding lectures, course materials, clarity, or grading..."
                  placeholderTextColor="#94a3b8"
                  value={comment}
                  onChangeText={setComment}
                  multiline
                />

                {/* Optional Teacher Questions */}
                {reviewQuestions.length > 0 && (
                  <View style={styles.optionalQuestionsSection}>
                    <View style={styles.optionalSectionHeader}>
                      <Text style={styles.optionalSectionTitle}>Evaluation Questions</Text>
                      <Text style={styles.optionalSectionBadge}>Optional</Text>
                    </View>
                    <Text style={styles.optionalSectionSubtitle}>
                      The instructor added these questions to better understand student experience:
                    </Text>

                    {reviewQuestions.map((q, idx) => (
                      <View key={idx} style={{ marginTop: 12 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                          <Text style={styles.questionTextLabel}>{q}</Text>
                          <Text style={styles.optionalMiniBadge}>(Optional)</Text>
                        </View>
                        <TextInput
                          style={styles.input}
                          placeholder="Your answer (optional)..."
                          placeholderTextColor="#94a3b8"
                          value={answers[q] || ""}
                          onChangeText={(val) =>
                            setAnswers((prev) => ({ ...prev, [q]: val }))
                          }
                        />
                      </View>
                    ))}
                  </View>
                )}

                <TouchableOpacity
                  style={styles.submitConfirmBtn}
                  onPress={onSubmit}
                  disabled={isSubmitting}
                  activeOpacity={0.8}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.submitConfirmBtnText}>
                      {isEditMode ? "Save Changes" : "Submit Anonymous Evaluation"}
                    </Text>
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
  privacyBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f9ff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e0f2fe",
  },
  privacyBannerText: {
    flex: 1,
    fontFamily,
    fontSize: 11,
    color: "#0369a1",
    fontWeight: "600",
    lineHeight: 16,
  },
  inputLabel: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 8,
  },
  starPickerContainer: {
    alignItems: "center",
    backgroundColor: "#fafaf9",
    borderRadius: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#e7e5e4",
    marginBottom: 16,
  },
  starPickerRow: {
    flexDirection: "row",
    gap: 8,
  },
  starTouch: {
    padding: 4,
  },
  starRatingCaption: {
    fontFamily,
    fontSize: 13,
    fontWeight: "800",
    color: "#f59e0b",
    marginTop: 6,
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
  optionalQuestionsSection: {
    marginTop: 6,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  optionalSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  optionalSectionTitle: {
    fontFamily,
    fontSize: 13,
    fontWeight: "800",
    color: "#0f172a",
  },
  optionalSectionBadge: {
    fontFamily,
    fontSize: 10,
    fontWeight: "700",
    color: "#2563eb",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  optionalSectionSubtitle: {
    fontFamily,
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
    marginBottom: 6,
  },
  questionTextLabel: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
  },
  optionalMiniBadge: {
    fontFamily,
    fontSize: 10,
    color: "#94a3b8",
    marginLeft: 6,
  },
  submitConfirmBtn: {
    backgroundColor: "#0f172a",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 16,
  },
  submitConfirmBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "800",
    color: "#ffffff",
  },
});
