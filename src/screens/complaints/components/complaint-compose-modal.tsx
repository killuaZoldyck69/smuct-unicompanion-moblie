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
  Keyboard,
  KeyboardAvoidingView,
  StatusBar,
  Switch,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { toastConfig } from "@/components/ui/toast-config";
import {
  useCreateComplaint,
  useUpdateComplaint,
} from "@/features/complaints/useComplaints";
import {
  CAMPUS_HUB_COLORS,
  fontFamily,
} from "@/screens/campus-hub/shared/design-tokens";
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

  const resetForm = useCallback(() => {
    setTitle("");
    setDescription("");
    setCategory("Facilities");
    setIsAnonymous(false);
  }, []);

  const handleModalClose = useCallback(() => {
    if (isSaving) return;
    Keyboard.dismiss();
    onClose();
  }, [isSaving, onClose]);

  const handleSubmit = useCallback(() => {
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const wasAnonymous = isAnonymous;

    if (!trimmedTitle) {
      Toast.hide();
      Toast.show({
        type: "error",
        text1: "Title Required",
        text2: "Please provide a short summary of the grievance.",
        visibilityTime: 3500,
      });
      return;
    }

    if (trimmedTitle.length < 3) {
      Toast.hide();
      Toast.show({
        type: "error",
        text1: "Title Too Short",
        text2: "Please provide a more descriptive title (at least 3 characters).",
        visibilityTime: 3500,
      });
      return;
    }

    if (!trimmedDescription) {
      Toast.hide();
      Toast.show({
        type: "error",
        text1: "Details Required",
        text2: "Please describe the grievance with context or location.",
        visibilityTime: 3500,
      });
      return;
    }

    if (trimmedDescription.length < 10) {
      Toast.hide();
      Toast.show({
        type: "error",
        text1: "Details Too Brief",
        text2: "Please provide sufficient detail (at least 10 characters).",
        visibilityTime: 3500,
      });
      return;
    }

    Keyboard.dismiss();

    const parseError = (err: any): string => {
      if (typeof err === "string") return err;
      if (err?.response?.data?.message) {
        if (Array.isArray(err.response.data.message)) {
          return err.response.data.message.join(", ");
        }
        return String(err.response.data.message);
      }
      if (err?.message) return String(err.message);
      return "Could not connect to the campus service. Please try again.";
    };

    if (isEditMode && complaintToEdit) {
      updateMutation.mutate(
        {
          id: complaintToEdit.id,
          data: {
            title: trimmedTitle,
            description: trimmedDescription,
            category,
            isAnonymous: wasAnonymous,
          },
        },
        {
          onSuccess: () => {
            // 1. Clear form state
            resetForm();
            // 2. Close modal screen
            onClose();
            // 3. Show success toast safely on parent screen
            setTimeout(() => {
              Toast.hide();
              Toast.show({
                type: "success",
                text1: "Complaint Updated ✨",
                text2: "Your grievance details have been updated successfully.",
                visibilityTime: 4000,
              });
            }, 200);
          },
          onError: (err: any) => {
            const message = parseError(err);
            Toast.hide();
            Toast.show({
              type: "error",
              text1: "Update Failed",
              text2: message,
              visibilityTime: 4500,
            });
          },
        },
      );
    } else {
      createMutation.mutate(
        {
          title: trimmedTitle,
          description: trimmedDescription,
          category,
          isAnonymous: wasAnonymous,
        },
        {
          onSuccess: () => {
            // 1. Clear form state
            resetForm();
            // 2. Close modal screen
            onClose();
            // 3. Show success toast safely on parent screen
            setTimeout(() => {
              Toast.hide();
              Toast.show({
                type: "success",
                text1: "Complaint Submitted 🎉",
                text2: wasAnonymous
                  ? "Submitted anonymously to university administration."
                  : "Your grievance has been filed successfully.",
                visibilityTime: 4000,
              });
            }, 200);
          },
          onError: (err: any) => {
            const message = parseError(err);
            Toast.hide();
            Toast.show({
              type: "error",
              text1: "Submission Failed",
              text2: message,
              visibilityTime: 4500,
            });
          },
        },
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
    resetForm,
    onClose,
  ]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent={true}
      onRequestClose={handleModalClose}
    >
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent={true}
        />

        {/* Modal Top Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <View style={styles.headerIconCircle}>
              <Feather
                name={isEditMode ? "edit-2" : "file-text"}
                size={18}
                color={CAMPUS_HUB_COLORS.complaintAccent}
              />
            </View>
            <View style={styles.headerTextCol}>
              <Text style={styles.headerTitle}>
                {isEditMode ? "Edit Complaint" : "File a Complaint"}
              </Text>
              <Text style={styles.headerSubtitle}>
                {isEditMode
                  ? "Update grievance details"
                  : "Submit a grievance to campus administration"}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleModalClose}
            style={styles.closeBtn}
            activeOpacity={0.7}
            disabled={isSaving}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Close form"
          >
            <Feather name="x" size={20} color={CAMPUS_HUB_COLORS.deepNavy} />
          </TouchableOpacity>
        </View>

        {/* Form Body with Keyboard Avoiding */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardAvoid}
        >
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
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
                    color={
                      isAnonymous ? "#6366f1" : CAMPUS_HUB_COLORS.subtleText
                    }
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
                <Text style={styles.charCount}>
                  {description.length}/1000
                </Text>
              </View>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Describe the complaint with specific room numbers, dates, and context..."
                placeholderTextColor={CAMPUS_HUB_COLORS.subtleText}
                value={description}
                onChangeText={setDescription}
                multiline={true}
                numberOfLines={8}
                textAlignVertical="top"
                maxLength={1000}
                editable={!isSaving}
                accessible={true}
                accessibilityLabel="Complaint description"
              />
            </View>
          </ScrollView>

          {/* Pinned Bottom Action Bar */}
          <View
            style={[
              styles.footer,
              { paddingBottom: Math.max(insets.bottom, 12) + 6 },
            ]}
          >
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={handleModalClose}
              disabled={isSaving}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.submitBtn,
                isSaving && styles.submitBtnDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isSaving}
              activeOpacity={0.8}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={
                isEditMode ? "Save changes" : "Submit complaint"
              }
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
        </KeyboardAvoidingView>
      </SafeAreaView>
      <Toast config={toastConfig} topOffset={Math.max(insets.top + 8, 44)} />
    </Modal>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    backgroundColor: "#ffffff",
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    marginRight: 12,
  },
  headerIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#fff1f2",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextCol: {
    flex: 1,
  },
  headerTitle: {
    fontFamily,
    fontSize: 18,
    fontWeight: "900",
    color: CAMPUS_HUB_COLORS.deepNavy,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontFamily,
    fontSize: 11.5,
    color: CAMPUS_HUB_COLORS.subtleText,
    fontWeight: "500",
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
    gap: 18,
  },
  formGroup: {
    gap: 7,
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
    paddingHorizontal: 13,
    paddingVertical: 7.5,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.08)",
  },
  categoryChoiceActive: {
    backgroundColor: "#6366f1",
    borderColor: "#6366f1",
  },
  categoryChoiceText: {
    fontFamily,
    fontSize: 12.5,
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
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
  },
  anonymousLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    marginRight: 8,
  },
  anonymousIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
  },
  anonymousIconBadgeActive: {
    backgroundColor: "#eef2ff",
    borderColor: "#c7d2fe",
  },
  anonymousTitle: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  anonymousSubtitle: {
    fontFamily,
    fontSize: 11,
    color: CAMPUS_HUB_COLORS.subtleText,
    marginTop: 2,
    lineHeight: 15,
  },
  textInput: {
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily,
    fontSize: 14,
    color: CAMPUS_HUB_COLORS.deepNavy,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  textArea: {
    minHeight: 200,
    paddingTop: 14,
    lineHeight: 22,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    backgroundColor: "#ffffff",
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
    fontSize: 13.5,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  submitBtn: {
    flex: 1.8,
    paddingVertical: 13,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    backgroundColor: "#6366f1",
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
    gap: 7,
  },
  submitBtnText: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "800",
    color: "#ffffff",
  },
});
