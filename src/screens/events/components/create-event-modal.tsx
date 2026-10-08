import React, { useState, useEffect } from "react";
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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
import { BENTO_COLORS, fontFamily } from "../constants";

interface CreateEventModalProps {
  visible: boolean;
  onClose: () => void;
  eventToEdit?: CampusEventItem | null;
}

export const CreateEventModal = React.memo(function CreateEventModal({
  visible,
  onClose,
  eventToEdit,
}: CreateEventModalProps) {
  const insets = useSafeAreaInsets();
  const isEditing = !!eventToEdit;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [eventDate, setEventDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const createEventMutation = useCreateCampusEvent();
  const updateEventMutation = useUpdateCampusEvent();
  const isPending =
    createEventMutation.isPending || updateEventMutation.isPending;

  // Initialize or reset form based on eventToEdit
  useEffect(() => {
    if (eventToEdit) {
      setTitle(eventToEdit.title || "");
      setDescription(eventToEdit.description || "");
      setLocation(eventToEdit.location || "");
      setOrganizer(eventToEdit.organizer || "");
      const d = eventToEdit.eventDate || eventToEdit.date;
      setEventDate(d ? new Date(d) : new Date());
    } else {
      setTitle("");
      setDescription("");
      setLocation("");
      setOrganizer("");
      setEventDate(new Date());
    }
  }, [eventToEdit, visible]);

  const handleDateValueChange = (
    _event: DateTimePickerChangeEvent,
    selectedDate?: Date
  ) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const updated = new Date(eventDate);
      updated.setFullYear(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate()
      );
      setEventDate(updated);
    }
  };

  const handleTimeValueChange = (
    _event: DateTimePickerChangeEvent,
    selectedDate?: Date
  ) => {
    setShowTimePicker(false);
    if (selectedDate) {
      const updated = new Date(eventDate);
      updated.setHours(selectedDate.getHours(), selectedDate.getMinutes());
      setEventDate(updated);
    }
  };

  const handleSubmit = async () => {
    const trimmedTitle = title.trim();
    const trimmedDesc = description.trim();
    const trimmedLoc = location.trim();

    if (!trimmedTitle) {
      Toast.show({
        type: "error",
        text1: "Event Title Required",
        text2: "Please enter a title for the event.",
      });
      return;
    }

    if (!trimmedLoc) {
      Toast.show({
        type: "error",
        text1: "Location Required",
        text2: "Please provide a venue or room.",
      });
      return;
    }

    try {
      if (isEditing && eventToEdit) {
        await updateEventMutation.mutateAsync({
          id: eventToEdit.id,
          data: {
            title: trimmedTitle,
            description: trimmedDesc,
            location: trimmedLoc,
            organizer: organizer.trim() || "SMUCT",
            eventDate: eventDate.toISOString(),
          },
        });

        Toast.show({
          type: "success",
          text1: "Event Updated",
          text2: "Campus event changes have been saved successfully.",
        });
      } else {
        await createEventMutation.mutateAsync({
          title: trimmedTitle,
          description: trimmedDesc,
          location: trimmedLoc,
          organizer: organizer.trim() || "SMUCT",
          eventDate: eventDate.toISOString(),
        });

        Toast.show({
          type: "success",
          text1: "Event Published",
          text2: "Your campus event has been published successfully.",
        });
      }

      onClose();
    } catch {
      Toast.show({
        type: "error",
        text1: isEditing ? "Update Failed" : "Creation Failed",
        text2: "An error occurred while saving the event. Please try again.",
      });
    }
  };

  const sheetContent = (
    <View style={styles.sheetContainer}>
      {/* Top Handle Bar */}
      <View style={styles.handleBar} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onClose}
          style={styles.circleBtn}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Close event modal"
          activeOpacity={0.7}
        >
          <Feather name="x" size={18} color="#0f172a" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {isEditing ? "Edit Campus Event" : "Add Campus Event"}
        </Text>

        {isEditing ? (
          <View style={styles.editBadge}>
            <Text style={styles.editBadgeText}>EDIT</Text>
          </View>
        ) : (
          <View style={{ width: 38 }} />
        )}
      </View>

      {/* Scrollable Form Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Event Title */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            Event Title <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. CSE Project Showcase, Cultural Fest"
            placeholderTextColor={BENTO_COLORS.subtleText}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Date & Time Selectors */}
        <View style={styles.dateTimeRow}>
          <View style={styles.dateTimeCol}>
            <Text style={styles.label}>
              Date <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.75}
            >
              <View style={[styles.pickerIconBox, { backgroundColor: "#eff6ff" }]}>
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
            >
              <View style={[styles.pickerIconBox, { backgroundColor: "#eff6ff" }]}>
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

        {/* Location Input */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            Venue / Location <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.inputWithIcon}>
            <View style={[styles.pickerIconBox, { backgroundColor: "#ecfdf5" }]}>
              <Feather name="map-pin" size={14} color="#059669" />
            </View>
            <TextInput
              style={styles.iconInput}
              placeholder="e.g. Main Auditorium, 5th Floor Room 1501"
              placeholderTextColor={BENTO_COLORS.subtleText}
              value={location}
              onChangeText={setLocation}
            />
          </View>
        </View>

        {/* Organizer Input */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Organizer / Club (Optional)</Text>
          <View style={styles.inputWithIcon}>
            <View style={[styles.pickerIconBox, { backgroundColor: "#eef2ff" }]}>
              <Feather name="users" size={14} color="#4338ca" />
            </View>
            <TextInput
              style={styles.iconInput}
              placeholder="e.g. CSE Dept, Cultural Club, ACM Chapter"
              placeholderTextColor={BENTO_COLORS.subtleText}
              value={organizer}
              onChangeText={setOrganizer}
            />
          </View>
        </View>

        {/* Description Input */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Description & Details</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Provide a brief overview, agenda, eligibility, or rules..."
            placeholderTextColor={BENTO_COLORS.subtleText}
            value={description}
            onChangeText={setDescription}
            multiline={true}
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      {/* Footer Submit Button with Safe Area Bottom Inset */}
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
    </View>
  );

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.backdropDismiss}
          activeOpacity={1}
          onPress={onClose}
        />

        {Platform.OS === "ios" ? (
          <KeyboardAvoidingView behavior="padding" style={styles.keyboardAvoid}>
            {sheetContent}
          </KeyboardAvoidingView>
        ) : (
          sheetContent
        )}

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
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    justifyContent: "flex-end",
  },
  backdropDismiss: {
    flex: 1,
  },
  keyboardAvoid: {
    width: "100%",
  },
  sheetContainer: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "92%",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 12,
    overflow: "hidden",
  },
  handleBar: {
    width: 42,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: "#cbd5e1",
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
    borderBottomColor: "#f1f5f9",
  },
  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  headerTitle: {
    fontFamily,
    fontSize: 17,
    fontWeight: "800",
    color: "#0f172a",
  },
  editBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  editBadgeText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: "#2563eb",
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 7,
  },
  required: {
    color: "#ef4444",
  },
  input: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily,
    fontSize: 14,
    color: "#0f172a",
  },
  textArea: {
    minHeight: 90,
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    paddingHorizontal: 10,
  },
  pickerIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  iconInput: {
    flex: 1,
    fontFamily,
    fontSize: 14,
    color: "#0f172a",
    paddingVertical: 12,
    paddingHorizontal: 10,
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
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 8,
  },
  pickerButtonText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
    flex: 1,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BENTO_COLORS.deepNavy,
    paddingVertical: 14,
    borderRadius: 14,
    ...BENTO_COLORS.shadow,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontFamily,
    fontSize: 14.5,
    fontWeight: "800",
    color: "#ffffff",
  },
});
