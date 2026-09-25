import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  ScrollView,
  useWindowDimensions,
  Keyboard,
  KeyboardAvoidingView,
  StatusBar,
  Switch,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useCreateComplaint, useUpdateComplaint } from "@/features/complaints/useComplaints";
import { CAMPUS_HUB_COLORS, fontFamily } from "@/screens/campus-hub/shared/design-tokens";
import type { ComplaintItem } from "@/services/complaint-service";

interface ComplaintComposeModalProps {
  visible: boolean;
  complaintToEdit?: ComplaintItem | null;
  onClose: () => void;
}

const CATEGORIES = [
  "Facilities",
  "Academic",
  "Hostel",
  "IT Support",
  "Administrative",
  "Other",
] as const;

export const ComplaintComposeModal = React.memo(function ComplaintComposeModal({
  visible,
  complaintToEdit,
  onClose,
}: ComplaintComposeModalProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("Facilities");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const createMutation = useCreateComplaint();
  const updateMutation = useUpdateComplaint();

  const isEditMode = Boolean(complaintToEdit);
  const isSaving = createMutation.isPending || updateMutation.isPending;

  // Sync form state when editing or opening modal
  useEffect(() => {
    if (visible) {
      if (complaintToEdit) {
        setTitle(complaintToEdit.title || "");
        setDescription(complaintToEdit.description || "");
        setCategory(complaintToEdit.category || "Facilities");
        setIsAnonymous(complaintToEdit.isAnonymous || false);
      } else {
        setTitle("");
        setDescription("");
        setCategory("Facilities");
        setIsAnonymous(false);
      }
    }
  }, [visible, complaintToEdit]);

  // Keyboard height listener
  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const maxAllowedWithKeyboard = windowHeight - keyboardHeight - Math.max(insets.top, 24) - 10;
  const sheetMaxHeight =
    keyboardHeight > 0
      ? Math.max(280, maxAllowedWithKeyboard)
      : Math.round(windowHeight * 0.88);

  const handleModalClose = useCallback(() => {
    if (isSaving) return;
    Keyboard.dismiss();
    onClose();
  }, [isSaving, onClose]);

  const handleSubmit = useCallback(() => {
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle) {
      Toast.show({
        type: "error",
        text1: "Title Required",
        text2: "Please provide a short summary of the issue.",
      });
      return;
    }

    if (!trimmedDescription) {
      Toast.show({
        type: "error",
        text1: "Details Required",
        text2: "Please describe the grievance with context or location.",
      });
      return;
    }

    if (isEditMode && complaintToEdit) {
      updateMutation.mutate(
        {
          id: complaintToEdit.id,
          data: {
            title: trimmedTitle,
            description: trimmedDescription,
            category,
            isAnonymous,
          },
        },
        {
          onSuccess: () => {
            Toast.show({
              type: "success",
              text1: "Complaint Updated ✨",
              text2: "Your changes have been saved.",
            });
            handleModalClose();
          },
          onError: (err: any) => {
            Toast.show({
              type: "error",
              text1: "Update Failed",
              text2: err.message || "Could not update complaint.",
            });
          },
        }
      );
    } else {
      createMutation.mutate(
        {
          title: trimmedTitle,
          description: trimmedDescription,
          category,
          isAnonymous,
        },
        {
          onSuccess: () => {
            Toast.show({
              type: "success",
              text1: "Complaint Submitted 🎉",
              text2: isAnonymous
                ? "Submitted anonymously to university administration."
                : "Submitted to university administration.",
            });
            handleModalClose();
          },
          onError: (err: any) => {
            Toast.show({
              type: "error",
              text1: "Submission Failed",
              text2: err.message || "Could not submit complaint.",
            });
          },
        }
      );
    }
  }, [
    title,
    description,
    category,
    isAnonymous,
    isEditMode,
    complaintToEdit,
    createMutation,
    updateMutation,
    handleModalClose,
  ]);

  if (!visible) return null;

  const bottomPadding = keyboardHeight > 0 ? 8 : Math.max(insets.bottom, 14);

  return (
    <Modal
      visible={visible}
      transparent={true}
      statusBarTranslucent={true}
      animationType="slide"
      onRequestClose={handleModalClose}
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      <View style={styles.overlay}>
        {/* Backdrop tap to dismiss */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={handleModalClose}
          accessible={false}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={[
            styles.keyboardAvoid,
            Platform.OS === "android" && keyboardHeight > 0 && {
              paddingBottom: keyboardHeight,
            },
          ]}
        >
          <View style={[styles.sheet, { maxHeight: sheetMaxHeight }]}>
            {/* Top Drag Handle */}
            <View style={styles.dragHandle} />

            {/* Modal Header */}
            <View style={styles.header}>
              <View style={styles.headerTitleRow}>
                <View style={styles.headerIconCircle}>
                  <Feather
                    name={isEditMode ? "edit-2" : "alert-circle"}
                    size={16}
                    color={CAMPUS_HUB_COLORS.complaintAccent}
                  />
                </View>
                <Text style={styles.headerTitle}>
                  {isEditMode ? "Edit Complaint" : "File a Complaint"}
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleModalClose}
                style={styles.closeBtn}
                activeOpacity={0.7}
                disabled={isSaving}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Close modal"
              >
                <Feather name="x" size={18} color={CAMPUS_HUB_COLORS.subtleText} />
              </TouchableOpacity>
            </View>

            {/* Form Scroll View */}
            <ScrollView
              ref={scrollViewRef}
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {/* Category Pills */}
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>CATEGORY</Text>
                <View style={styles.categorySelectRow}>
                  {CATEGORIES.map((cat) => {
                    const isSelected = category === cat;
                    return (
                      <TouchableOpacity
                        key={cat}
                        style={[
                          styles.categoryChoice,
                          isSelected && styles.categoryChoiceActive,
                        ]}
                        onPress={() => setCategory(cat)}
                        activeOpacity={0.75}
                        accessible={true}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: isSelected }}
                        accessibilityLabel={cat}
                      >
                        {isSelected && (
                          <Feather
                            name="check"
                            size={12}
                            color="#ffffff"
                            style={{ marginRight: 4 }}
                          />
                        )}
                        <Text
                          style={[
                            styles.categoryChoiceText,
                            isSelected && styles.categoryChoiceTextActive,
                          ]}
                        >
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Anonymous Submission Switch Card */}
              <View style={styles.anonymousCard}>
                <View style={styles.anonymousLeft}>
                  <View
                    style={[
                      styles.anonymousIconBadge,
                      isAnonymous && styles.anonymousIconBadgeActive,
                    ]}
                  >
                    <Feather
                      name={isAnonymous ? "eye-off" : "user"}
                      size={16}
                      color={isAnonymous ? "#6366f1" : CAMPUS_HUB_COLORS.subtleText}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.anonymousTitle}>Submit Anonymously</Text>
                    <Text style={styles.anonymousSubtitle}>
                      {isAnonymous
                        ? "Your identity and student ID will remain hidden."
                        : "Your profile details will be attached."}
                    </Text>
                  </View>
                </View>

                <Switch
                  value={isAnonymous}
                  onValueChange={setIsAnonymous}
                  trackColor={{ false: "#e2e8f0", true: "#c7d2fe" }}
                  thumbColor={isAnonymous ? "#6366f1" : "#ffffff"}
                />
              </View>

              {/* Title Input */}
              <View style={styles.formGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.inputLabel}>TITLE</Text>
                  <Text style={styles.charCount}>{title.length}/150</Text>
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="Summary of the grievance..."
                  placeholderTextColor={CAMPUS_HUB_COLORS.subtleText}
                  value={title}
                  onChangeText={setTitle}
                  maxLength={150}
                  editable={!isSaving}
                  accessible={true}
                  accessibilityLabel="Complaint title"
                />
              </View>

              {/* Details Input */}
              <View style={styles.formGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.inputLabel}>DETAILS & LOCATION</Text>
                  <Text style={styles.charCount}>{description.length}/1000</Text>
                </View>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Describe the complaint with specific room numbers, dates, and context..."
                  placeholderTextColor={CAMPUS_HUB_COLORS.subtleText}
                  value={description}
                  onChangeText={setDescription}
                  multiline={true}
                  numberOfLines={4}
                  textAlignVertical="top"
                  scrollEnabled={false}
                  maxLength={1000}
                  editable={!isSaving}
                  accessible={true}
                  accessibilityLabel="Complaint description"
                />
              </View>
            </ScrollView>

            {/* Pinned Bottom Footer Action Buttons */}
            <View style={[styles.footer, { paddingBottom: bottomPadding }]}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={handleModalClose}
                disabled={isSaving}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitBtn, isSaving && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={isSaving}
                activeOpacity={0.8}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={isEditMode ? "Save changes" : "Submit complaint"}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <View style={styles.btnContentRow}>
                    <Feather
                      name={isEditMode ? "check" : "send"}
                      size={15}
                      color="#ffffff"
                    />
                    <Text style={styles.submitBtnText}>
                      {isEditMode ? "Save Changes" : "Submit Complaint"}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(10, 15, 29, 0.65)",
    justifyContent: "flex-end",
  },
  keyboardAvoid: {
    width: "100%",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
    ...CAMPUS_HUB_COLORS.heroShadow,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(0, 0, 0, 0.15)",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: CAMPUS_HUB_COLORS.subtleBorder,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: CAMPUS_HUB_COLORS.complaintAccentLight,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily,
    fontSize: 16,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flexGrow: 0,
    flexShrink: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 16,
    gap: 14,
  },
  formGroup: {
    gap: 6,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inputLabel: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.subtleText,
    letterSpacing: 0.5,
  },
  charCount: {
    fontFamily,
    fontSize: 11,
    color: CAMPUS_HUB_COLORS.subtleText,
    fontWeight: "600",
  },
  categorySelectRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 2,
  },
  categoryChoice: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
  },
  categoryChoiceActive: {
    backgroundColor: CAMPUS_HUB_COLORS.complaintAccent,
    borderColor: CAMPUS_HUB_COLORS.complaintAccent,
  },
  categoryChoiceText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.neutralText,
  },
  categoryChoiceTextActive: {
    color: "#ffffff",
  },
  anonymousCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  anonymousLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  anonymousIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  anonymousIconBadgeActive: {
    backgroundColor: "#eef2ff",
  },
  anonymousTitle: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  anonymousSubtitle: {
    fontFamily,
    fontSize: 11,
    color: CAMPUS_HUB_COLORS.subtleText,
    marginTop: 1,
  },
  textInput: {
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontFamily,
    fontSize: 14,
    color: CAMPUS_HUB_COLORS.neutralText,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.08)",
  },
  textArea: {
    minHeight: 88,
    paddingTop: 11,
    lineHeight: 20,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: CAMPUS_HUB_COLORS.subtleBorder,
    backgroundColor: CAMPUS_HUB_COLORS.white,
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
    fontSize: 13,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.neutralText,
  },
  submitBtn: {
    flex: 2,
    paddingVertical: 13,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    backgroundColor: CAMPUS_HUB_COLORS.complaintAccent,
    alignItems: "center",
    justifyContent: "center",
    ...CAMPUS_HUB_COLORS.shadow,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  btnContentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  submitBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
});
