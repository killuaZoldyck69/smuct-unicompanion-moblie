import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
  Keyboard,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerChangeEvent,
} from "@react-native-community/datetimepicker";
import Toast from "react-native-toast-message";

import {
  useCreateCampusEvent,
  useUpdateCampusEvent,
} from "@/features/events/useEvents";
import { CampusEventItem } from "@/services/event-service";
import { toastConfig } from "@/components/ui/toast-config";
import { BENTO_COLORS, EVENT_CATEGORIES, fontFamily } from "../constants";
import { EventWysiwygEditor } from "./event-wysiwyg-editor";

export interface CreateEventModalProps {
  visible: boolean;
  onClose: () => void;
  eventToEdit?: CampusEventItem | null;
}

interface FormErrors {
  title?: string;
  category?: string;
  location?: string;
}

/**
 * Prepares raw body content (legacy Markdown, [justify] tags, or HTML) for the WYSIWYG editor.
 */
function convertToEditorHtml(raw: string): string {
  if (!raw) return "";

  let formatted = raw.replace(/\\r\\n|\\n|\\r/g, "\n");

  // Convert legacy [justify]...[/justify] tags to justified div blocks
  formatted = formatted.replace(
    /\[justify\]([\s\S]*?)\[\/justify\]/gi,
    '<div style="text-align: justify;">$1</div>',
  );

  // Check if it's already HTML (e.g. contains <p>, <div>, <br>, <strong>, <b>, <i>, <u>, <ul>, <li>)
  const hasHtml = /<\/?(?:p|div|b|i|u|strong|em|ul|li|br)[^>]*>/i.test(
    formatted,
  );

  if (!hasHtml) {
    // If it was stored as markdown/plain text:
    formatted = formatted.replace(/\*\*([\s\S]+?)\*\*/g, "<strong>$1</strong>");
    formatted = formatted.replace(
      /(^|[^\*])\*([^\*]+?)\*([^\*]|$)/g,
      "$1<em>$2</em>$3",
    );
    formatted = formatted
      .split(/\n\s*\n/)
      .map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`)
      .join("");
  }

  return formatted.trim();
}

export const CreateEventModal = React.memo(function CreateEventModal({
  visible,
  onClose,
  eventToEdit,
}: CreateEventModalProps) {
  const insets = useSafeAreaInsets();
  const isEditing = !!eventToEdit;

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("GENERAL");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [eventDate, setEventDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const createEventMutation = useCreateCampusEvent();
  const updateEventMutation = useUpdateCampusEvent();
  const isPending =
    createEventMutation.isPending || updateEventMutation.isPending;

  // Clear all form inputs and errors
  const clearForm = useCallback(() => {
    setTitle("");
    setCategory("GENERAL");
    setDescription("");
    setLocation("");
    setOrganizer("");
    setEventDate(new Date());
    setErrors({});
  }, []);

  // Safe dismiss handler: dismiss keyboard, clear state, and close modal
  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    clearForm();
    onClose();
  }, [clearForm, onClose]);

  // Input change handlers that immediately clear individual field errors
  const handleTitleChange = useCallback(
    (text: string) => {
      setTitle(text);
      if (errors.title) {
        setErrors((prev) => ({ ...prev, title: undefined }));
      }
    },
    [errors.title],
  );

  const handleCategorySelect = useCallback(
    (key: string) => {
      setCategory(key);
      if (errors.category) {
        setErrors((prev) => ({ ...prev, category: undefined }));
      }
    },
    [errors.category],
  );

  const handleLocationChange = useCallback(
    (text: string) => {
      setLocation(text);
      if (errors.location) {
        setErrors((prev) => ({ ...prev, location: undefined }));
      }
    },
    [errors.location],
  );

  // Initialize or reset form based on eventToEdit and modal visibility
  useEffect(() => {
    if (visible) {
      if (eventToEdit) {
        setTitle(eventToEdit.title || "");
        setCategory(eventToEdit.category || "GENERAL");
        setDescription(convertToEditorHtml(eventToEdit.description || ""));
        setLocation(eventToEdit.location || "");
        setOrganizer(eventToEdit.organizer || "");
        const d = eventToEdit.eventDate || eventToEdit.date;
        setEventDate(d ? new Date(d) : new Date());
      } else {
        clearForm();
      }
      setErrors({});
    }
  }, [eventToEdit, visible, clearForm]);

  const handleDateValueChange = (
    _event: DateTimePickerChangeEvent,
    selectedDate?: Date,
  ) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const updated = new Date(eventDate);
      updated.setFullYear(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
      );
      setEventDate(updated);
    }
  };

  const handleTimeValueChange = (
    _event: DateTimePickerChangeEvent,
    selectedDate?: Date,
  ) => {
    setShowTimePicker(false);
    if (selectedDate) {
      const updated = new Date(eventDate);
      updated.setHours(selectedDate.getHours(), selectedDate.getMinutes());
      setEventDate(updated);
    }
  };

  const handleSubmit = async () => {
    Keyboard.dismiss();
    const newErrors: FormErrors = {};

    const trimmedTitle = title.trim();
    const trimmedCategory = (category || "GENERAL").trim().toUpperCase();
    const trimmedDesc = description.trim();
    const trimmedLoc = location.trim();
    const trimmedOrg = organizer.trim();

    // 1. Title validation
    if (!trimmedTitle) {
      newErrors.title = "Event title is required";
      setErrors(newErrors);
      Toast.show({
        type: "error",
        text1: "Event Title Required",
        text2: "Please enter a title for the event.",
      });
      return;
    } else if (trimmedTitle.length < 3) {
      newErrors.title = "Title must be at least 3 characters";
      setErrors(newErrors);
      Toast.show({
        type: "error",
        text1: "Title Too Short",
        text2: "Event title must be at least 3 characters long.",
      });
      return;
    }

    // 2. Category validation
    if (!trimmedCategory) {
      newErrors.category = "Event category is required";
      setErrors(newErrors);
      Toast.show({
        type: "error",
        text1: "Category Required",
        text2: "Please select an event category.",
      });
      return;
    }

    // 3. Date validation
    if (isNaN(eventDate.getTime())) {
      Toast.show({
        type: "error",
        text1: "Invalid Date / Time",
        text2: "Please select a valid date and time for the event.",
      });
      return;
    }

    // 4. Location validation (Strictly non-optional)
    if (!trimmedLoc) {
      newErrors.location = "Venue / Location is required";
      setErrors(newErrors);
      Toast.show({
        type: "error",
        text1: "Location Required",
        text2: "Please provide a venue or room (e.g. Main Auditorium).",
      });
      return;
    } else if (trimmedLoc.length < 2) {
      newErrors.location = "Location must be at least 2 characters";
      setErrors(newErrors);
      Toast.show({
        type: "error",
        text1: "Location Too Short",
        text2: "Please provide a valid venue or room name.",
      });
      return;
    }

    setErrors({});

    try {
      if (isEditing && eventToEdit) {
        await updateEventMutation.mutateAsync({
          id: eventToEdit.id,
          data: {
            title: trimmedTitle,
            category: trimmedCategory,
            description: trimmedDesc,
            location: trimmedLoc,
            organizer: trimmedOrg || "SMUCT",
            eventDate: eventDate.toISOString(),
          },
        });
      } else {
        await createEventMutation.mutateAsync({
          title: trimmedTitle,
          category: trimmedCategory,
          description: trimmedDesc,
          location: trimmedLoc,
          organizer: trimmedOrg || "SMUCT",
          eventDate: eventDate.toISOString(),
        });
      }

      // Close modal screen, clear the form, and show success toast on main screen
      clearForm();
      onClose();

      setTimeout(() => {
        Toast.show({
          type: "success",
          text1: isEditing ? "Event Updated" : "Event Published",
          text2: isEditing
            ? `"${trimmedTitle}" changes have been saved successfully.`
            : `"${trimmedTitle}" has been published to campus events.`,
          visibilityTime: 4000,
        });
      }, 350);
    } catch (error: any) {
      const serverMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        (Array.isArray(error?.response?.data?.errors)
          ? error.response.data.errors[0]?.message
          : null) ||
        error?.message ||
        (isEditing
          ? "Unable to update campus event. Please try again."
          : "Unable to publish campus event. Please try again.");

      Toast.show({
        type: "error",
        text1: isEditing ? "Update Failed" : "Publish Failed",
        text2: serverMessage,
      });
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent={true}
      onRequestClose={handleClose}
    >
      <SafeAreaView
        style={styles.fullScreenContainer}
        edges={["top", "bottom"]}
      >
        {/* ── Top Header Navigation Bar ── */}
        <View style={styles.topHeader}>
          <TouchableOpacity
            onPress={handleClose}
            style={styles.circleBtn}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Close event modal"
            activeOpacity={0.7}
          >
            <Feather name="x" size={19} color={BENTO_COLORS.deepNavy} />
          </TouchableOpacity>

          <View style={styles.headerTitleGroup}>
            <Text style={styles.headerTitle}>
              {isEditing ? "Edit Campus Event" : "Add Campus Event"}
            </Text>
            <View
              style={[
                styles.headerBadge,
                isEditing ? styles.editBadge : styles.createBadge,
              ]}
            >
              <Text
                style={[
                  styles.headerBadgeText,
                  isEditing ? styles.editBadgeText : styles.createBadgeText,
                ]}
              >
                {isEditing ? "EDITING EVENT" : "NEW CAMPUS EVENT"}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isPending}
            style={[
              styles.headerSaveBtn,
              isPending && styles.headerSaveBtnDisabled,
            ]}
            activeOpacity={0.8}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={
              isEditing ? "Save event changes" : "Publish event"
            }
          >
            {isPending ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.headerSaveBtnText}>
                {isEditing ? "Save" : "Publish"}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Scrollable Form Area with Keyboard Avoiding ── */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
          >
            {/* 1. Basic Information */}
            <View style={styles.sectionHeader}>
              <Feather
                name="info"
                size={14}
                color={BENTO_COLORS.deepNavy}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.sectionTitle}>EVENT INFORMATION</Text>
            </View>

            {/* Event Title */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Event Title <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  errors.title ? styles.inputError : null,
                ]}
                placeholder="e.g. CSE Project Showcase, Cultural Fest"
                placeholderTextColor={BENTO_COLORS.subtleText}
                value={title}
                onChangeText={handleTitleChange}
                accessible={true}
                accessibilityLabel="Event Title"
              />
              {errors.title && (
                <View style={styles.errorRow}>
                  <Feather
                    name="alert-circle"
                    size={12}
                    color="#ef4444"
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.errorText}>{errors.title}</Text>
                </View>
              )}
            </View>

            {/* Event Category Selector */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Category <Text style={styles.required}>*</Text>
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryScrollContainer}
              >
                {EVENT_CATEGORIES.map((cat) => {
                  const isSelected =
                    (category || "GENERAL").toUpperCase() === cat.key;
                  return (
                    <TouchableOpacity
                      key={cat.key}
                      onPress={() => handleCategorySelect(cat.key)}
                      style={[
                        styles.categoryChip,
                        isSelected && {
                          backgroundColor: cat.badgeBg,
                          borderColor: cat.badgeText,
                          borderWidth: 1.5,
                        },
                      ]}
                      activeOpacity={0.75}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={`Category: ${cat.label}`}
                    >
                      <View
                        style={[
                          styles.categoryChipIconBox,
                          isSelected && {
                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                          },
                        ]}
                      >
                        <Feather
                          name={cat.icon as any}
                          size={13}
                          color={isSelected ? cat.badgeText : "#64748b"}
                        />
                      </View>
                      <Text
                        style={[
                          styles.categoryChipText,
                          isSelected && {
                            color: cat.badgeText,
                            fontWeight: "700",
                          },
                        ]}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              {errors.category && (
                <View style={styles.errorRow}>
                  <Feather
                    name="alert-circle"
                    size={12}
                    color="#ef4444"
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.errorText}>{errors.category}</Text>
                </View>
              )}
            </View>

            {/* 2. Schedule & Timing */}
            <View style={styles.sectionHeader}>
              <Feather
                name="calendar"
                size={14}
                color={BENTO_COLORS.deepNavy}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.sectionTitle}>SCHEDULE & TIMING</Text>
            </View>

            <View style={styles.dateTimeRow}>
              <View style={styles.dateTimeCol}>
                <Text style={styles.label}>
                  Date <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => setShowDatePicker(true)}
                  activeOpacity={0.75}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Select event date"
                >
                  <View
                    style={[
                      styles.pickerIconBox,
                      { backgroundColor: "#eff6ff" },
                    ]}
                  >
                    <Feather name="calendar" size={14} color="#2563eb" />
                  </View>
                  <Text style={styles.pickerButtonText}>
                    {eventDate.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.dateTimeCol}>
                <Text style={styles.label}>
                  Time <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => setShowTimePicker(true)}
                  activeOpacity={0.75}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Select event time"
                >
                  <View
                    style={[
                      styles.pickerIconBox,
                      { backgroundColor: "#eff6ff" },
                    ]}
                  >
                    <Feather name="clock" size={14} color="#2563eb" />
                  </View>
                  <Text style={styles.pickerButtonText}>
                    {eventDate.toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 3. Venue & Organizer */}
            <View style={styles.sectionHeader}>
              <Feather
                name="map-pin"
                size={14}
                color={BENTO_COLORS.deepNavy}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.sectionTitle}>VENUE & HOSTING</Text>
            </View>

            {/* Location Input */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Venue / Location <Text style={styles.required}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputWithIcon,
                  errors.location ? styles.inputError : null,
                ]}
              >
                <View
                  style={[styles.pickerIconBox, { backgroundColor: "#ecfdf5" }]}
                >
                  <Feather name="map-pin" size={14} color="#059669" />
                </View>
                <TextInput
                  style={styles.iconInput}
                  placeholder="e.g. Main Auditorium, 5th Floor Room 1501"
                  placeholderTextColor={BENTO_COLORS.subtleText}
                  value={location}
                  onChangeText={handleLocationChange}
                  accessible={true}
                  accessibilityLabel="Venue or Location"
                />
              </View>
              {errors.location && (
                <View style={styles.errorRow}>
                  <Feather
                    name="alert-circle"
                    size={12}
                    color="#ef4444"
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.errorText}>{errors.location}</Text>
                </View>
              )}
            </View>

            {/* Organizer Input */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Organizer / Club (Optional)</Text>
              <View style={styles.inputWithIcon}>
                <View
                  style={[styles.pickerIconBox, { backgroundColor: "#eef2ff" }]}
                >
                  <Feather name="users" size={14} color="#4338ca" />
                </View>
                <TextInput
                  style={styles.iconInput}
                  placeholder="e.g. CSE Dept, Cultural Club "
                  placeholderTextColor={BENTO_COLORS.subtleText}
                  value={organizer}
                  onChangeText={setOrganizer}
                  accessible={true}
                  accessibilityLabel="Organizer or Club"
                />
              </View>
            </View>

            {/* 4. Description & Details with Rich Text Editor */}
            <View style={styles.sectionHeader}>
              <Feather
                name="align-left"
                size={14}
                color={BENTO_COLORS.deepNavy}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.sectionTitle}>DESCRIPTION & DETAILS</Text>
            </View>

            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}></View>

              <EventWysiwygEditor
                initialValue={description}
                onChange={setDescription}
                minHeight={220}
                placeholder="Provide a brief overview, agenda, eligibility, rules, or key highlights... Select any text to apply Bold, Italic, Underline, Bullet Lists, and Justify alignment."
              />
            </View>
          </ScrollView>

          {/* ── Fixed Bottom Footer Submit Button ── */}
          <View
            style={[
              styles.footer,
              { paddingBottom: Math.max(insets.bottom, 16) },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.submitButton,
                isPending && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isPending}
              activeOpacity={0.85}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={
                isEditing ? "Save event changes" : "Publish event"
              }
            >
              {isPending ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <>
                  <Feather
                    name={isEditing ? "check-circle" : "check"}
                    size={18}
                    color="#ffffff"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.submitButtonText}>
                    {isEditing ? "Save Changes" : "Publish Event"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        {/* DateTimePickers */}
        {showDatePicker && (
          <DateTimePicker
            value={eventDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onValueChange={handleDateValueChange}
            onDismiss={() => setShowDatePicker(false)}
          />
        )}
        {showTimePicker && (
          <DateTimePicker
            value={eventDate}
            mode="time"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onValueChange={handleTimeValueChange}
            onDismiss={() => setShowTimePicker(false)}
          />
        )}
      </SafeAreaView>
      <Toast config={toastConfig} topOffset={Math.max(insets.top + 8, 44)} />
    </Modal>
  );
});

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: BENTO_COLORS.background,
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(15, 23, 42, 0.06)",
    backgroundColor: BENTO_COLORS.background,
  },
  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: BENTO_COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    ...BENTO_COLORS.shadow,
  },
  headerTitleGroup: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 12,
  },
  headerTitle: {
    fontFamily,
    fontSize: 16.5,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    letterSpacing: -0.3,
  },
  headerBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 3,
  },
  createBadge: {
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "rgba(5, 150, 105, 0.25)",
  },
  editBadge: {
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "rgba(37, 99, 235, 0.25)",
  },
  headerBadgeText: {
    fontFamily,
    fontSize: 9.5,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  createBadgeText: {
    color: "#059669",
  },
  editBadgeText: {
    color: "#2563eb",
  },
  headerSaveBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: BENTO_COLORS.deepNavy,
    alignItems: "center",
    justifyContent: "center",
  },
  headerSaveBtnDisabled: {
    opacity: 0.6,
  },
  headerSaveBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    letterSpacing: 0.8,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  label: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
    marginBottom: 6,
  },
  required: {
    color: "#ef4444",
  },
  formatHint: {
    fontFamily,
    fontSize: 11,
    color: BENTO_COLORS.subtleText,
    fontWeight: "600",
  },
  input: {
    fontFamily,
    fontSize: 14,
    color: BENTO_COLORS.deepNavy,
    backgroundColor: BENTO_COLORS.white,
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO_COLORS.white,
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  iconInput: {
    flex: 1,
    fontFamily,
    fontSize: 14,
    color: BENTO_COLORS.deepNavy,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  dateTimeRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  dateTimeCol: {
    flex: 1,
  },
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO_COLORS.white,
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  pickerIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  pickerButtonText: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "600",
    color: BENTO_COLORS.deepNavy,
  },
  footer: {
    backgroundColor: BENTO_COLORS.white,
    borderTopWidth: 1,
    borderTopColor: "rgba(15, 23, 42, 0.06)",
    paddingHorizontal: 20,
    paddingTop: 12,
    ...BENTO_COLORS.shadow,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BENTO_COLORS.deepNavy,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  submitButtonDisabled: {
    opacity: 0.65,
  },
  submitButtonText: {
    fontFamily,
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: -0.2,
  },
  categoryScrollContainer: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 2,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO_COLORS.white,
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  categoryChipIconBox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  categoryChipText: {
    fontFamily,
    fontSize: 12.5,
    fontWeight: "600",
    color: BENTO_COLORS.subtleText,
  },
  inputError: {
    borderColor: "#ef4444",
    backgroundColor: "#fff5f5",
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    paddingHorizontal: 2,
  },
  errorText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: "#ef4444",
  },
});
