import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
  Keyboard,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import Toast from "react-native-toast-message";
import {
  BENTO_COLORS,
  ClassRoutineItem,
  fontFamily,
} from "../constants";
import { timeToMinutes } from "../utils";
import {
  ClassNoticeType,
  createClassNoticeAPI,
  deleteClassNoticeAPI,
} from "@/services/hub-service";

interface ClassNoticeModalProps {
  visible: boolean;
  item: ClassRoutineItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface TypeOption {
  type: ClassNoticeType;
  label: string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
  bgColor: string;
  borderColor: string;
}

const TYPE_OPTIONS: TypeOption[] = [
  {
    type: "CANCELLED",
    label: "Cancelled",
    icon: "slash",
    color: "#b91c1c",
    bgColor: "#fef2f2",
    borderColor: "#fecaca",
  },
  {
    type: "ROOM_CHANGE",
    label: "Room Change",
    icon: "map-pin",
    color: "#b45309",
    bgColor: "#fffbeb",
    borderColor: "#fde68a",
  },
  {
    type: "ONLINE_CLASS",
    label: "Online Class",
    icon: "video",
    color: "#0369a1",
    bgColor: "#f0f9ff",
    borderColor: "#bae6fd",
  },
  {
    type: "TIME_CHANGE",
    label: "Rescheduled",
    icon: "clock",
    color: "#6d28d9",
    bgColor: "#f5f3ff",
    borderColor: "#ddd6fe",
  },
  {
    type: "URGENT_NOTICE",
    label: "Notice",
    icon: "alert-circle",
    color: "#334155",
    bgColor: "#f8fafc",
    borderColor: "#e2e8f0",
  },
];

const parseTimeToDate = (timeStr?: string): Date => {
  const d = new Date();
  if (!timeStr) return d;
  try {
    const trimmed = timeStr.trim();
    const match = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (match) {
      let h = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      const mod = match[3]?.toUpperCase();
      if (mod === "AM" && h === 12) h = 0;
      if (mod === "PM" && h !== 12) h += 12;
      d.setHours(h, m, 0, 0);
      return d;
    }
  } catch {
    // fallback
  }
  return d;
};

const formatTime12h = (date: Date): string => {
  let h = date.getHours();
  const m = String(date.getMinutes()).padStart(2, "0");
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  const paddedH = h12 < 10 ? `0${h12}` : `${h12}`;
  return `${paddedH}:${m} ${period}`;
};

export function ClassNoticeModal({
  visible,
  item,
  onClose,
  onSuccess,
}: ClassNoticeModalProps) {
  const insets = useSafeAreaInsets();
  const [selectedType, setSelectedType] = useState<ClassNoticeType>("CANCELLED");
  const [message, setMessage] = useState<string>("");
  const [newRoom, setNewRoom] = useState<string>("");
  const [newTime, setNewTime] = useState<string>("");
  const [meetUrl, setMeetUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [showConfirmClear, setShowConfirmClear] = useState<boolean>(false);

  // Time Picker states for rescheduling
  const [reschedStart, setReschedStart] = useState<Date>(() => new Date());
  const [reschedEnd, setReschedEnd] = useState<Date>(() => new Date());
  const [activePicker, setActivePicker] = useState<"start" | "end" | null>(null);

  // Duration of original class routine in minutes (default: 80 mins)
  const classDurationMinutes = useMemo(() => {
    if (!item) return 80;
    const startM = timeToMinutes(item.startTime);
    const endM = timeToMinutes(item.endTime);
    if (endM > startM) return endM - startM;
    return 80;
  }, [item]);

  // Compute safe bottom padding ensuring buttons never clash with Android nav bar or iOS home indicator
  const bottomSafePadding = Platform.select({
    ios: Math.max(insets.bottom, 24),
    android: insets.bottom > 0 ? insets.bottom + 18 : 32,
    default: 24,
  });

  const updateReschedTimes = (startD: Date, endD: Date) => {
    setReschedStart(startD);
    setReschedEnd(endD);
    setNewTime(`${formatTime12h(startD)} – ${formatTime12h(endD)}`);
  };

  const handleStartTimeChange = (newStart: Date) => {
    let newEnd = reschedEnd;
    if (newStart.getTime() >= newEnd.getTime()) {
      newEnd = new Date(newStart.getTime() + classDurationMinutes * 60 * 1000);
    }
    updateReschedTimes(newStart, newEnd);
  };

  const handleEndTimeChange = (newEnd: Date) => {
    let newStart = reschedStart;
    if (newEnd.getTime() <= newStart.getTime()) {
      newStart = new Date(newEnd.getTime() - classDurationMinutes * 60 * 1000);
    }
    updateReschedTimes(newStart, newEnd);
  };

  const applyPresetOffset = (minutes: number) => {
    const newStart = new Date(reschedStart.getTime() + minutes * 60 * 1000);
    const newEnd = new Date(reschedEnd.getTime() + minutes * 60 * 1000);
    updateReschedTimes(newStart, newEnd);
  };

  const resetToOriginal = () => {
    if (!item) return;
    const origStart = parseTimeToDate(item.startTime);
    const origEnd = parseTimeToDate(item.endTime);
    updateReschedTimes(origStart, origEnd);
  };

  // Sync state when modal opens or item changes
  useEffect(() => {
    setShowConfirmClear(false);
    if (!item) return;

    const origStart = parseTimeToDate(item.startTime);
    const origEnd = parseTimeToDate(item.endTime);

    if (item.activeNotice) {
      setSelectedType(item.activeNotice.type);
      setMessage(item.activeNotice.message || "");
      setNewRoom(item.activeNotice.newRoom || "");
      const existingTime = item.activeNotice.newTime || "";
      setNewTime(existingTime);
      setMeetUrl(item.activeNotice.meetUrl || "");

      // Parse existing range if present
      if (existingTime.includes("–") || existingTime.includes("-")) {
        const parts = existingTime.split(/[–-]/);
        if (parts.length >= 2) {
          setReschedStart(parseTimeToDate(parts[0]));
          setReschedEnd(parseTimeToDate(parts[1]));
        } else {
          setReschedStart(origStart);
          setReschedEnd(origEnd);
        }
      } else if (existingTime) {
        const parsed = parseTimeToDate(existingTime);
        setReschedStart(parsed);
        setReschedEnd(new Date(parsed.getTime() + 80 * 60 * 1000));
      } else {
        setReschedStart(origStart);
        setReschedEnd(origEnd);
      }
    } else {
      setSelectedType("CANCELLED");
      setMessage("");
      setNewRoom("");
      setReschedStart(origStart);
      setReschedEnd(origEnd);
      setNewTime(`${formatTime12h(origStart)} – ${formatTime12h(origEnd)}`);
      setMeetUrl("");
    }
  }, [item, visible]);

  if (!item) return null;

  const handleSubmit = async () => {
    const trimmedMessage = message.trim();

    if (selectedType === "ROOM_CHANGE" && !newRoom.trim()) {
      Toast.show({
        type: "error",
        text1: "Room Required",
        text2: "Please specify the new room number.",
      });
      return;
    }

    const effectiveTime =
      newTime.trim() ||
      `${formatTime12h(reschedStart)} – ${formatTime12h(reschedEnd)}`;

    if (selectedType === "TIME_CHANGE" && !effectiveTime.trim()) {
      Toast.show({
        type: "error",
        text1: "Time Required",
        text2: "Please specify the rescheduled class time.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Effective date defaults to today
      const now = new Date();
      const effectiveDate = now.toISOString();

      await createClassNoticeAPI(item.hubId, {
        type: selectedType,
        message: trimmedMessage || undefined,
        targetDay: item.day,
        effectiveDate,
        newRoom: newRoom.trim() || undefined,
        newTime: selectedType === "TIME_CHANGE" ? effectiveTime : undefined,
        meetUrl: meetUrl.trim() || undefined,
      });

      Keyboard.dismiss();
      onClose();
      onSuccess();
      setTimeout(() => {
        Toast.show({
          type: "success",
          text1: "Notice Published",
          text2: "Students will now see this update on their schedule.",
          visibilityTime: 4000,
        });
      }, 100);
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err?.message || "Failed to publish notice";
      Toast.show({
        type: "error",
        text1: "Failed to Publish Notice",
        text2: errMsg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearNoticePress = () => {
    if (!item.activeNotice) return;
    setShowConfirmClear(true);
  };

  const handleConfirmClear = async () => {
    if (!item.activeNotice) return;
    setIsDeleting(true);
    try {
      await deleteClassNoticeAPI(item.hubId, item.activeNotice.id);
      Keyboard.dismiss();
      setShowConfirmClear(false);
      onClose();
      onSuccess();
      setTimeout(() => {
        Toast.show({
          type: "success",
          text1: "Notice Cleared",
          text2: "Class routine has returned to standard schedule.",
          visibilityTime: 4000,
        });
      }, 100);
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.message || err?.message || "Failed to clear notice";
      Toast.show({
        type: "error",
        text1: "Failed to Clear Notice",
        text2: errMsg,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={true}
      />
      <View style={styles.modalOverlay}>
        {/* Backdrop dismiss touchable */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
          accessible={false}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardWrap}
          pointerEvents="box-none"
        >
          <View
            style={[
              styles.sheetContainer,
              { paddingBottom: bottomSafePadding },
            ]}
          >
            {/* Top Drag Handle */}
            <View style={styles.dragHandleWrap}>
              <View style={styles.dragHandle} />
            </View>

            {/* Header */}
            <View style={styles.sheetHeader}>
              <View style={styles.headerTitles}>
                <Text style={styles.sheetTitle}>Class Notice & Status</Text>
                <Text style={styles.sheetSubtitle}>
                  {item.courseCode} · {item.day} ({item.startTime} – {item.endTime})
                </Text>
              </View>

              <TouchableOpacity
                onPress={onClose}
                style={styles.closeBtn}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Close notice modal"
              >
                <Feather name="x" size={18} color={BENTO_COLORS.deepNavy} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollBody}
              keyboardShouldPersistTaps="handled"
            >
            {/* Active Notice Alert if currently set */}
            {item.activeNotice && (
              <View style={styles.activeNoticeBanner}>
                <Feather name="info" size={14} color="#0284c7" style={{ marginRight: 6 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.activeNoticeTitle}>
                    Active Update: {item.activeNotice.type.replace("_", " ")}
                  </Text>
                  <Text style={styles.activeNoticeText} numberOfLines={2}>
                    "{item.activeNotice.message}"
                  </Text>
                </View>
              </View>
            )}

            {/* Type Selector */}
            <Text style={styles.sectionLabel}>UPDATE TYPE</Text>
            <View style={styles.typeGrid}>
              {TYPE_OPTIONS.map((opt) => {
                const isSelected = selectedType === opt.type;
                return (
                  <TouchableOpacity
                    key={opt.type}
                    onPress={() => setSelectedType(opt.type)}
                    style={[
                      styles.typeCard,
                      { borderColor: isSelected ? opt.color : "#e2e8f0" },
                      isSelected && { backgroundColor: opt.bgColor },
                    ]}
                    activeOpacity={0.7}
                  >
                    <Feather
                      name={opt.icon}
                      size={15}
                      color={isSelected ? opt.color : "#64748b"}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[
                        styles.typeCardText,
                        isSelected && { color: opt.color, fontWeight: "800" },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Conditional Input: Room Change */}
            {selectedType === "ROOM_CHANGE" && (
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>NEW ROOM NUMBER</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., 1501, UB 204 or Lab 3"
                  placeholderTextColor="#94a3b8"
                  value={newRoom}
                  onChangeText={setNewRoom}
                />
              </View>
            )}

            {/* Conditional Input: Time Change with Native TimePicker */}
            {selectedType === "TIME_CHANGE" && (
              <View style={styles.fieldGroup}>
                <View style={styles.fieldLabelRow}>
                  <Text style={styles.fieldLabel}>RESCHEDULED CLASS TIME</Text>
                  <Text style={styles.fieldHint}>Tap card to pick time</Text>
                </View>

                {/* Time Picker Cards (Start Time & End Time) */}
                <View style={styles.timePickerRow}>
                  {/* Start Time Card */}
                  <TouchableOpacity
                    style={[
                      styles.timePickerCard,
                      activePicker === "start" && styles.timePickerCardActive,
                    ]}
                    onPress={() => setActivePicker("start")}
                    activeOpacity={0.7}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Select rescheduled start time"
                  >
                    <Text style={styles.timePickerCardLabel}>START TIME</Text>
                    <View style={styles.timePickerValueWrap}>
                      <Feather
                        name="clock"
                        size={14}
                        color="#7c3aed"
                        style={{ marginRight: 6 }}
                      />
                      <Text style={styles.timePickerValueText}>
                        {formatTime12h(reschedStart)}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* Arrow Indicator */}
                  <View style={styles.timeArrowBox}>
                    <Feather name="arrow-right" size={15} color="#94a3b8" />
                  </View>

                  {/* End Time Card */}
                  <TouchableOpacity
                    style={[
                      styles.timePickerCard,
                      activePicker === "end" && styles.timePickerCardActive,
                    ]}
                    onPress={() => setActivePicker("end")}
                    activeOpacity={0.7}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Select rescheduled end time"
                  >
                    <Text style={styles.timePickerCardLabel}>END TIME</Text>
                    <View style={styles.timePickerValueWrap}>
                      <Feather
                        name="clock"
                        size={14}
                        color="#7c3aed"
                        style={{ marginRight: 6 }}
                      />
                      <Text style={styles.timePickerValueText}>
                        {formatTime12h(reschedEnd)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Rescheduled Slot Summary Banner */}
                <View style={styles.timeSummaryBanner}>
                  <Feather
                    name="calendar"
                    size={13}
                    color="#6d28d9"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.timeSummaryText}>
                    New Routine:{" "}
                    <Text style={styles.timeSummaryBold}>
                      {newTime || `${formatTime12h(reschedStart)} – ${formatTime12h(reschedEnd)}`}
                    </Text>
                  </Text>
                </View>

                {/* Quick Shift Presets */}
                <View style={styles.timePresetsRow}>
                  <Text style={styles.timePresetsLabel}>Quick shift:</Text>
                  <TouchableOpacity
                    onPress={() => applyPresetOffset(30)}
                    style={styles.timePresetPill}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.timePresetPillText}>+30 min</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => applyPresetOffset(60)}
                    style={styles.timePresetPill}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.timePresetPillText}>+1 hr</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => applyPresetOffset(120)}
                    style={styles.timePresetPill}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.timePresetPillText}>+2 hrs</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={resetToOriginal}
                    style={[styles.timePresetPill, styles.timePresetResetPill]}
                    activeOpacity={0.7}
                  >
                    <Feather name="rotate-ccw" size={10} color="#64748b" style={{ marginRight: 3 }} />
                    <Text style={styles.timePresetResetText}>Reset</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Conditional Input: Online Class Meet Link */}
            {selectedType === "ONLINE_CLASS" && (
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>GOOGLE MEET / CLASS LINK</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="https://meet.google.com/xyz-abcd-efg"
                  placeholderTextColor="#94a3b8"
                  value={meetUrl}
                  onChangeText={setMeetUrl}
                  autoCapitalize="none"
                  keyboardType="url"
                />
              </View>
            )}

            {/* Reason / Message Textarea (Optional) */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                REASON / MESSAGE FOR STUDENTS <Text style={styles.optionalLabel}>(OPTIONAL)</Text>
              </Text>
              <TextInput
                style={styles.textArea}
                placeholder={
                  selectedType === "CANCELLED"
                    ? "(Optional) e.g., Teacher is unwell with fever / class suspended."
                    : selectedType === "ROOM_CHANGE"
                      ? "(Optional) e.g., Projector issue in previous room."
                      : selectedType === "ONLINE_CLASS"
                        ? "(Optional) e.g., Due to rain, class will be held online."
                        : "(Optional) Write any additional details..."
                }
                placeholderTextColor="#94a3b8"
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>

          {/* Action Buttons Footer */}
          <View style={styles.sheetFooter}>
            {item.activeNotice && (
              <TouchableOpacity
                onPress={handleClearNoticePress}
                style={styles.clearBtn}
                disabled={isDeleting || isSubmitting}
                activeOpacity={0.7}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#dc2626" />
                ) : (
                  <>
                    <Feather name="trash-2" size={15} color="#dc2626" style={{ marginRight: 6 }} />
                    <Text style={styles.clearBtnText}>Clear Notice</Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleSubmit}
              style={[
                styles.submitBtn,
                !item.activeNotice && { flex: 1 },
              ]}
              disabled={isSubmitting || isDeleting}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Feather name="check" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                  <Text style={styles.submitBtnText}>
                    {item.activeNotice ? "Update Notice" : "Publish Notice"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Native DateTimePicker for Android */}
      {Platform.OS === "android" && activePicker && (
        <DateTimePicker
          value={activePicker === "start" ? reschedStart : reschedEnd}
          mode="time"
          is24Hour={false}
          display="default"
          onValueChange={(_event, selectedDate) => {
            const picker = activePicker;
            setActivePicker(null);
            if (!selectedDate) return;
            if (picker === "start") {
              handleStartTimeChange(selectedDate);
            } else if (picker === "end") {
              handleEndTimeChange(selectedDate);
            }
          }}
          onDismiss={() => setActivePicker(null)}
        />
      )}

      {/* Native DateTimePicker Modal for iOS */}
      {Platform.OS === "ios" && (
        <Modal
          visible={Boolean(activePicker)}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setActivePicker(null)}
        >
          <TouchableOpacity
            style={styles.iosPickerBackdrop}
            activeOpacity={1}
            onPress={() => setActivePicker(null)}
          >
            <View style={styles.iosPickerContent}>
              <View style={styles.iosPickerHeader}>
                <Text style={styles.iosPickerTitle}>
                  {activePicker === "start" ? "Select Start Time" : "Select End Time"}
                </Text>
                <TouchableOpacity
                  onPress={() => setActivePicker(null)}
                  style={styles.iosPickerDoneBtn}
                >
                  <Text style={styles.iosPickerDoneText}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={activePicker === "start" ? reschedStart : reschedEnd}
                mode="time"
                display="spinner"
                is24Hour={false}
                onValueChange={(_event, selectedDate) => {
                  if (!selectedDate) return;
                  if (activePicker === "start") {
                    handleStartTimeChange(selectedDate);
                  } else if (activePicker === "end") {
                    handleEndTimeChange(selectedDate);
                  }
                }}
                onDismiss={() => setActivePicker(null)}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {/* Custom Bento Confirmation Alert Modal */}
      {showConfirmClear && (
        <View style={styles.confirmOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => !isDeleting && setShowConfirmClear(false)}
            accessible={false}
          />

          <View style={styles.confirmCard}>
            {/* Top Warning Icon Halo */}
            <View style={styles.confirmIconHalo}>
              <View style={styles.confirmIconCircle}>
                <Feather name="trash-2" size={24} color="#dc2626" />
              </View>
            </View>

            {/* Title & Description */}
            <Text style={styles.confirmTitle}>Clear Class Notice?</Text>
            <Text style={styles.confirmMessage}>
              Are you sure you want to remove this notice? The routine will immediately restore its standard scheduled time and room for all students.
            </Text>

            {/* Active Notice Snapshot Preview */}
            {item.activeNotice && (
              <View style={styles.confirmNoticePreview}>
                <Feather
                  name="info"
                  size={14}
                  color="#b45309"
                  style={{ marginRight: 8, marginTop: 1 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.confirmNoticePreviewTitle}>
                    ACTIVE: {item.activeNotice.type.replace(/_/g, " ")}
                  </Text>
                  {item.activeNotice.message ? (
                    <Text
                      style={styles.confirmNoticePreviewMsg}
                      numberOfLines={2}
                    >
                      "{item.activeNotice.message}"
                    </Text>
                  ) : null}
                </View>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.confirmActionsRow}>
              <TouchableOpacity
                style={styles.confirmCancelBtn}
                onPress={() => setShowConfirmClear(false)}
                disabled={isDeleting}
                activeOpacity={0.7}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Cancel clearing notice"
              >
                <Text style={styles.confirmCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmDeleteBtn}
                onPress={handleConfirmClear}
                disabled={isDeleting}
                activeOpacity={0.8}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Confirm remove notice"
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Feather
                      name="trash-2"
                      size={15}
                      color="#ffffff"
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.confirmDeleteBtnText}>
                      Remove Notice
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  </Modal>
);
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  keyboardWrap: {
    width: "100%",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingTop: 6,
    paddingHorizontal: 20,
    width: "100%",
    maxHeight: Platform.select({
      android: "92%",
      default: "88%",
    }),
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  dragHandleWrap: {
    alignItems: "center",
    paddingTop: 6,
    paddingBottom: 8,
  },
  dragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#d1d5db",
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  headerTitles: {
    flex: 1,
  },
  sheetTitle: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
  },
  sheetSubtitle: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  scrollBody: {
    paddingVertical: 14,
  },
  activeNoticeBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f9ff",
    borderWidth: 1,
    borderColor: "#bae6fd",
    borderRadius: 12,
    padding: 10,
    marginBottom: 14,
  },
  activeNoticeTitle: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "800",
    color: "#0369a1",
  },
  activeNoticeText: {
    fontFamily,
    fontSize: 11,
    color: "#334155",
    marginTop: 1,
  },
  sectionLabel: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: "#64748b",
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  typeCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: "#ffffff",
  },
  typeCardText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },
  fieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "800",
    color: "#64748b",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  optionalLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#94a3b8",
  },
  textInput: {
    fontFamily,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13.5,
    color: BENTO_COLORS.deepNavy,
  },
  textArea: {
    fontFamily,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13.5,
    color: BENTO_COLORS.deepNavy,
    minHeight: 70,
  },
  sheetFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  clearBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#dc2626",
  },
  submitBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BENTO_COLORS.deepNavy,
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  submitBtnText: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "700",
    color: "#ffffff",
  },
  fieldLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  fieldHint: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "600",
    color: "#7c3aed",
  },
  timePickerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  timePickerCard: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  timePickerCardActive: {
    borderColor: "#7c3aed",
    backgroundColor: "#f5f3ff",
  },
  timePickerCardLabel: {
    fontFamily,
    fontSize: 9.5,
    fontWeight: "800",
    color: "#64748b",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  timePickerValueWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  timePickerValueText: {
    fontFamily,
    fontSize: 14.5,
    fontWeight: "800",
    color: "#1e293b",
  },
  timeArrowBox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  timeSummaryBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f3ff",
    borderWidth: 1,
    borderColor: "#ddd6fe",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  timeSummaryText: {
    fontFamily,
    fontSize: 12,
    color: "#5b21b6",
  },
  timeSummaryBold: {
    fontWeight: "800",
    color: "#6d28d9",
  },
  timePresetsRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  timePresetsLabel: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: "#94a3b8",
    marginRight: 2,
  },
  timePresetPill: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  timePresetPillText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
  },
  timePresetResetPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#cbd5e1",
  },
  timePresetResetText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: "#64748b",
  },
  iosPickerBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  iosPickerContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 24,
  },
  iosPickerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  iosPickerTitle: {
    fontFamily,
    fontSize: 15,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
  },
  iosPickerDoneBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: "#7c3aed",
    borderRadius: 8,
  },
  iosPickerDoneText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
  confirmOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    zIndex: 100,
    elevation: 20,
  },
  confirmCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#ffffff",
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 20,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.25,
        shadowRadius: 24,
      },
      android: {
        elevation: 24,
      },
    }),
  },
  confirmIconHalo: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#fef2f2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#fee2e2",
  },
  confirmIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#fee2e2",
    alignItems: "center",
    justifyContent: "center",
  },
  confirmTitle: {
    fontFamily,
    fontSize: 19,
    fontWeight: "800",
    color: "#0f172a",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  confirmMessage: {
    fontFamily,
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 16,
    paddingHorizontal: 6,
  },
  confirmNoticePreview: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fde68a",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    width: "100%",
    marginBottom: 18,
  },
  confirmNoticePreviewTitle: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "800",
    color: "#b45309",
  },
  confirmNoticePreviewMsg: {
    fontFamily,
    fontSize: 11,
    color: "#78350f",
    marginTop: 2,
    fontStyle: "italic",
  },
  confirmActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    width: "100%",
  },
  confirmCancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  confirmCancelBtnText: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "700",
    color: "#475569",
  },
  confirmDeleteBtn: {
    flex: 1.2,
    flexDirection: "row",
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: "#dc2626",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#dc2626",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  confirmDeleteBtnText: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "700",
    color: "#ffffff",
  },
});
