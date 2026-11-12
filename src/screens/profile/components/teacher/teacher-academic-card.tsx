import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerChangeEvent,
} from "@react-native-community/datetimepicker";
import {
  TeacherProfileData,
  ConsultationSlot,
} from "@/services/teacher-service";
import { colors } from "@/theme/colors";
import {
  PROFILE_COLORS,
  SECTION_THEMES,
  SPACING,
  fontFamily,
} from "../../constants";
import { ProfileModalFrame } from "../shared/profile-modal-frame";
import { CampusBuildingWatermark } from "./faculty-illustrations";
import { SMUCT_PROGRAM_DEPARTMENTS } from "@/data/programs";

const WEB_TIME_OPTIONS = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "01:00 PM",
  "01:30 PM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
  "05:00 PM",
  "05:30 PM",
  "06:00 PM",
] as const;

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

const DAY_ABBR: Record<string, string> = {
  Sunday: "Sun",
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
};

type ConsultationTimeField = "startTime" | "endTime";

const parseTime = (value: string, defaultHour: number): Date => {
  const date = new Date();
  const match = value.trim().match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
  if (!match) {
    date.setHours(defaultHour, 0, 0, 0);
    return date;
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3]?.toUpperCase();
  if (
    minutes > 59 ||
    (meridiem && (hours < 1 || hours > 12)) ||
    (!meridiem && hours > 23)
  ) {
    date.setHours(defaultHour, 0, 0, 0);
    return date;
  }
  if (meridiem) {
    hours = (hours % 12) + (meridiem === "PM" ? 12 : 0);
  }
  date.setHours(hours, minutes, 0, 0);
  return date;
};

const formatTime = (date: Date): string =>
  date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

interface TeacherAcademicCardProps {
  profile: TeacherProfileData;
  isEditing: boolean;
  department: string;
  officeRoom: string;
  advisoryBatch: string;
  dayOff: string;
  consultationSlots: ConsultationSlot[];
  onChangeDepartment: (val: string) => void;
  onChangeOfficeRoom: (val: string) => void;
  onChangeAdvisoryBatch: (val: string) => void;
  onChangeDayOff: (val: string) => void;
  onAddConsultationSlot: (slot: ConsultationSlot) => void;
  onUpdateConsultationSlot: (
    index: number,
    slotUpdates: Partial<ConsultationSlot>,
  ) => void;
  onRemoveConsultationSlot: (index: number) => void;
}

export const TeacherAcademicCard = React.memo(function TeacherAcademicCard({
  profile,
  isEditing,
  department,
  officeRoom,
  advisoryBatch,
  dayOff,
  consultationSlots,
  onChangeDepartment,
  onChangeOfficeRoom,
  onChangeAdvisoryBatch,
  onChangeDayOff,
  onAddConsultationSlot,
  onUpdateConsultationSlot,
  onRemoveConsultationSlot,
}: TeacherAcademicCardProps) {
  const [isDepartmentPickerOpen, setIsDepartmentPickerOpen] = useState(false);
  const [isDayOffPickerOpen, setIsDayOffPickerOpen] = useState(false);
  const [activeTimePicker, setActiveTimePicker] = useState<{
    index: number;
    field: ConsultationTimeField;
  } | null>(null);
  const [iosDraftDate, setIosDraftDate] = useState<Date>(() => new Date());
  const [departmentSearch, setDepartmentSearch] = useState("");
  const filteredDepartments = useMemo(() => {
    const query = departmentSearch.trim().toLowerCase();
    if (!query) return SMUCT_PROGRAM_DEPARTMENTS;
    return SMUCT_PROGRAM_DEPARTMENTS.filter(
      (option) =>
        option.name.toLowerCase().includes(query) ||
        option.code.toLowerCase().includes(query),
    );
  }, [departmentSearch]);

  const displayOfficeRoom =
    profile.officeRoom ||
    profile.roomNumber ||
    profile.roomNo ||
    officeRoom ||
    "Not provided";
  const currentAdvisoryBatch = isEditing
    ? advisoryBatch
    : profile.advisoryBatch !== null && profile.advisoryBatch !== undefined
      ? String(profile.advisoryBatch)
      : advisoryBatch;
  const displayDayOff = isEditing
    ? dayOff || "Choose a day"
    : profile.dayOff || dayOff || "Not specified";
  const advisoryOrdinal = Number(currentAdvisoryBatch);
  const advisorySuffix =
    advisoryOrdinal % 100 >= 11 && advisoryOrdinal % 100 <= 13
      ? "th"
      : ["th", "st", "nd", "rd"][advisoryOrdinal % 10] || "th";
  const activeSlot = activeTimePicker
    ? consultationSlots[activeTimePicker.index]
    : undefined;
  const activeTime =
    activeSlot && activeTimePicker ? activeSlot[activeTimePicker.field] : "";
  const pickerDate = parseTime(
    activeTime,
    activeTimePicker?.field === "endTime" ? 11 : 10,
  );

  const openTimePicker = (index: number, field: ConsultationTimeField) => {
    const slotValue = consultationSlots[index]?.[field] || "";
    setIosDraftDate(parseTime(slotValue, field === "endTime" ? 11 : 10));
    setActiveTimePicker({ index, field });
  };

  const handleTimeChange = (
    _event: DateTimePickerChangeEvent,
    selectedDate?: Date,
  ) => {
    if (Platform.OS === "ios") {
      if (selectedDate) {
        setIosDraftDate(selectedDate);
      }
      return;
    }

    if (selectedDate && activeTimePicker) {
      onUpdateConsultationSlot(activeTimePicker.index, {
        [activeTimePicker.field]: formatTime(selectedDate),
      });
    }
    setActiveTimePicker(null);
  };

  const handleConfirmIosTime = () => {
    if (activeTimePicker) {
      onUpdateConsultationSlot(activeTimePicker.index, {
        [activeTimePicker.field]: formatTime(iosDraftDate),
      });
    }
    setActiveTimePicker(null);
  };

  return (
    <View style={styles.card}>
      <View style={styles.watermarkContainer} pointerEvents="none">
        <CampusBuildingWatermark
          width={150}
          height={125}
          opacity={0.1}
          color={SECTION_THEMES.ACADEMIC.primaryText}
        />
      </View>

      <View style={styles.sectionHeaderRow}>
        <View style={styles.headerLeft}>
          <View style={styles.sectionIconBadge}>
            <Ionicons
              name="business-outline"
              size={16}
              color={SECTION_THEMES.ACADEMIC.primaryText}
            />
          </View>
          <Text style={styles.sectionTitle}>ACADEMIC POSITION</Text>
        </View>
      </View>

      <View style={styles.departmentTile}>
        <Text style={styles.fieldLabel}>DESIGNATION</Text>
        <Text style={styles.departmentValue}>
          {profile.designation || "Not provided"}
        </Text>
      </View>

      <View style={[styles.departmentTile, styles.designationTile]}>
        <Text style={styles.fieldLabel}>DEPARTMENT</Text>
        {isEditing ? (
          <TouchableOpacity
            style={styles.departmentPicker}
            onPress={() => setIsDepartmentPickerOpen(true)}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Choose department"
          >
            <Text style={styles.departmentValue} numberOfLines={1}>
              {department || "Select department"}
            </Text>
            <Feather
              name="chevron-down"
              size={16}
              color={colors.semantic.blue.darker}
            />
          </TouchableOpacity>
        ) : (
          <Text style={styles.departmentValue}>
            {profile.department || "Not provided"}
          </Text>
        )}
      </View>

      <View style={styles.detailTiles}>
        <View style={[styles.detailTile, styles.officeTile]}>
          <Text style={[styles.tileLabel, styles.officeLabel]}>
            OFFICE ROOM
          </Text>
          {isEditing ? (
            <TextInput
              style={styles.tileInput}
              value={officeRoom}
              onChangeText={(value) =>
                onChangeOfficeRoom(value.replace(/\D/g, ""))
              }
              keyboardType="number-pad"
              placeholder="Room"
              placeholderTextColor={PROFILE_COLORS.mutedText}
              accessibilityLabel="Faculty Office Room Input"
            />
          ) : (
            <Text style={styles.tileValue} numberOfLines={1}>
              {displayOfficeRoom}
            </Text>
          )}
        </View>
        <View style={[styles.detailTile, styles.advisoryTile]}>
          <Text style={[styles.tileLabel, styles.advisoryLabel]}>ADVISORY</Text>
          {isEditing ? (
            <TextInput
              style={styles.tileInput}
              value={advisoryBatch}
              onChangeText={(value) =>
                onChangeAdvisoryBatch(value.replace(/\D/g, ""))
              }
              keyboardType="numeric"
              placeholder="Batch"
              placeholderTextColor={PROFILE_COLORS.mutedText}
              accessibilityLabel="Faculty Advisory Batch Input"
            />
          ) : currentAdvisoryBatch ? (
            <View style={styles.batchValueRow}>
              <Text style={styles.tileValue}>Batch {currentAdvisoryBatch}</Text>
              <Text style={styles.ordinalSuffix}>{advisorySuffix}</Text>
            </View>
          ) : (
            <Text style={styles.tileValue} numberOfLines={1}>
              Not assigned
            </Text>
          )}
        </View>
        <View style={[styles.detailTile, styles.dayOffTile]}>
          <Text style={[styles.tileLabel, styles.dayOffLabel]}>DAY OFF</Text>
          {isEditing ? (
            <TouchableOpacity
              style={styles.dayOffPicker}
              onPress={() => setIsDayOffPickerOpen(true)}
              accessibilityRole="button"
              accessibilityLabel="Choose day off"
            >
              <Text style={styles.tileValue} numberOfLines={1}>
                {dayOff || "Choose"}
              </Text>
              <Feather
                name="chevron-down"
                size={13}
                color={colors.semantic.amber.accent}
              />
            </TouchableOpacity>
          ) : (
            <Text style={styles.tileValue} numberOfLines={1}>
              {displayDayOff}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.scheduleHeader}>
        <Text style={styles.scheduleTitle}>Consultation Schedule</Text>
        {!isEditing && (
          <Feather name="clock" size={14} color={colors.semantic.blue.accent} />
        )}
      </View>

      {isEditing ? (
        <View style={styles.slotEditContainer}>
          {consultationSlots.map((slot, index) => (
            <View key={`${slot.day}-${index}`} style={styles.slotCard}>
              <View style={styles.slotCardHeader}>
                <Text style={styles.slotCardTitle}>Slot {index + 1}</Text>
                <TouchableOpacity
                  onPress={() => onRemoveConsultationSlot(index)}
                  style={styles.deleteSlotBtn}
                  accessibilityRole="button"
                  accessibilityLabel={`Delete consultation slot ${index + 1}`}
                >
                  <Feather
                    name="trash-2"
                    size={14}
                    color={colors.semantic.red.solid}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.dayPillsRow}>
                {DAYS_OF_WEEK.map((day) => {
                  const selected = slot.day === day;
                  return (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.dayPill,
                        selected && styles.dayPillSelected,
                      ]}
                      onPress={() => onUpdateConsultationSlot(index, { day })}
                      accessibilityRole="button"
                      accessibilityLabel={`Set slot ${index + 1} day to ${day}`}
                    >
                      <Text
                        style={[
                          styles.dayPillText,
                          selected && styles.dayPillTextSelected,
                        ]}
                      >
                        {DAY_ABBR[day]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <View style={styles.timeInputsRow}>
                <TouchableOpacity
                  style={styles.timePickerButton}
                  onPress={() => openTimePicker(index, "startTime")}
                  accessibilityRole="button"
                  accessibilityLabel={`Choose slot ${index + 1} start time`}
                >
                  <Feather
                    name="clock"
                    size={13}
                    color={colors.semantic.blue.accent}
                  />
                  <Text
                    style={[
                      styles.timePickerText,
                      !slot.startTime && styles.timePickerPlaceholder,
                    ]}
                  >
                    {slot.startTime || "Start time"}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.timeSeparator}>–</Text>
                <TouchableOpacity
                  style={styles.timePickerButton}
                  onPress={() => openTimePicker(index, "endTime")}
                  accessibilityRole="button"
                  accessibilityLabel={`Choose slot ${index + 1} end time`}
                >
                  <Feather
                    name="clock"
                    size={13}
                    color={colors.semantic.blue.accent}
                  />
                  <Text
                    style={[
                      styles.timePickerText,
                      !slot.endTime && styles.timePickerPlaceholder,
                    ]}
                  >
                    {slot.endTime || "End time"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <TouchableOpacity
            style={styles.addSlotButton}
            onPress={() =>
              onAddConsultationSlot({
                day: "Sunday",
                startTime: "",
                endTime: "",
              })
            }
            accessibilityRole="button"
            accessibilityLabel="Add another consultation slot"
          >
            <Feather
              name="plus"
              size={14}
              color={colors.semantic.blue.darker}
            />
            <Text style={styles.addSlotButtonText}>Add day and time slot</Text>
          </TouchableOpacity>
        </View>
      ) : consultationSlots.length > 0 ? (
        <View style={styles.slotsViewContainer}>
          {consultationSlots.map((slot, index) => (
            <View key={`${slot.day}-${index}`} style={styles.slotViewBadge}>
              <Text style={styles.slotDayTagText}>{slot.day}</Text>
              <Text style={styles.slotTimeText}>
                {slot.startTime || "TBD"} – {slot.endTime || "TBD"}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.emptySchedule}>No consultation hours provided</Text>
      )}
      <ProfileModalFrame
        visible={isDepartmentPickerOpen}
        onClose={() => setIsDepartmentPickerOpen(false)}
        keyboardAvoiding={true}
        maxHeightRatio={0.78}
        cardStyle={styles.departmentModal}
        backdropAccessibilityLabel="Close department picker"
      >
        <View style={styles.departmentModalHeader}>
          <Text style={styles.departmentModalTitle}>Select Department</Text>
          <TouchableOpacity
            onPress={() => setIsDepartmentPickerOpen(false)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Close department picker"
          >
            <Feather name="x" size={20} color={PROFILE_COLORS.deepNavy} />
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.departmentSearch}
          value={departmentSearch}
          onChangeText={setDepartmentSearch}
          placeholder="Search departments"
          placeholderTextColor={PROFILE_COLORS.mutedText}
          autoCapitalize="none"
          accessibilityLabel="Search departments"
        />
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {filteredDepartments.map((option) => {
            const selected =
              option.name.toLowerCase() === department.toLowerCase();
            return (
              <TouchableOpacity
                key={option.code}
                style={[
                  styles.departmentOption,
                  selected && styles.departmentOptionSelected,
                ]}
                onPress={() => {
                  onChangeDepartment(option.name);
                  setDepartmentSearch("");
                  setIsDepartmentPickerOpen(false);
                }}
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                <View style={styles.departmentCode}>
                  <Text style={styles.departmentCodeText}>
                    {option.code}
                  </Text>
                </View>
                <Text style={styles.departmentOptionText}>
                  {option.name}
                </Text>
                {selected && (
                  <Feather
                    name="check"
                    size={16}
                    color={colors.semantic.blue.darker}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </ProfileModalFrame>
      <ProfileModalFrame
        visible={isDayOffPickerOpen}
        onClose={() => setIsDayOffPickerOpen(false)}
        maxHeightRatio={0.78}
        cardStyle={styles.dayOffModal}
        backdropAccessibilityLabel="Close day off picker"
      >
        <View style={styles.departmentModalHeader}>
          <Text style={styles.departmentModalTitle}>Choose Day Off</Text>
          <TouchableOpacity
            onPress={() => setIsDayOffPickerOpen(false)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Close day off picker"
          >
            <Feather name="x" size={20} color={PROFILE_COLORS.deepNavy} />
          </TouchableOpacity>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          {DAYS_OF_WEEK.map((day) => {
            const selected = dayOff === day;
            return (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayOffOption,
                  selected && styles.dayOffOptionSelected,
                ]}
                onPress={() => {
                  onChangeDayOff(day);
                  setIsDayOffPickerOpen(false);
                }}
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                <Text
                  style={[
                    styles.departmentOptionText,
                    selected && styles.dayOffOptionTextSelected,
                  ]}
                >
                  {day}
                </Text>
                {selected && (
                  <Feather
                    name="check"
                    size={16}
                    color={colors.semantic.amber.accent}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </ProfileModalFrame>
      {activeTimePicker && Platform.OS === "android" && (
        <DateTimePicker
          value={pickerDate}
          mode="time"
          is24Hour={false}
          display="default"
          onValueChange={handleTimeChange}
          onDismiss={() => setActiveTimePicker(null)}
        />
      )}

      {activeTimePicker && Platform.OS === "ios" && (
        <ProfileModalFrame
          visible={true}
          onClose={() => setActiveTimePicker(null)}
          maxHeightRatio={0.78}
          cardStyle={styles.dayOffModal}
          backdropAccessibilityLabel="Cancel time selection"
        >
          <View style={styles.departmentModalHeader}>
            <TouchableOpacity
              onPress={() => setActiveTimePicker(null)}
              accessibilityRole="button"
              accessibilityLabel="Cancel time picker"
            >
              <Text style={styles.pickerCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.departmentModalTitle}>Select Time</Text>
            <TouchableOpacity
              onPress={handleConfirmIosTime}
              accessibilityRole="button"
              accessibilityLabel="Confirm time selection"
            >
              <Text style={styles.pickerDoneText}>Done</Text>
            </TouchableOpacity>
          </View>
          <DateTimePicker
            value={iosDraftDate}
            mode="time"
            is24Hour={false}
            display="spinner"
            onValueChange={handleTimeChange}
          />
        </ProfileModalFrame>
      )}

      {activeTimePicker && Platform.OS === "web" && (
        <ProfileModalFrame
          visible={true}
          onClose={() => setActiveTimePicker(null)}
          maxHeightRatio={0.78}
          cardStyle={styles.dayOffModal}
          backdropAccessibilityLabel="Close time picker"
        >
          <View style={styles.departmentModalHeader}>
            <Text style={styles.departmentModalTitle}>Select Time</Text>
            <TouchableOpacity
              onPress={() => setActiveTimePicker(null)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Close time picker"
            >
              <Feather
                name="x"
                size={20}
                color={PROFILE_COLORS.subtleText}
              />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {WEB_TIME_OPTIONS.map((option) => {
              const selected = activeTime === option;
              return (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.departmentOption,
                    selected && styles.departmentOptionSelected,
                  ]}
                  onPress={() => {
                    onUpdateConsultationSlot(activeTimePicker.index, {
                      [activeTimePicker.field]: option,
                    });
                    setActiveTimePicker(null);
                  }}
                >
                  <Text
                    style={[
                      styles.departmentOptionText,
                      selected && styles.departmentOptionTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                  {selected && (
                    <Feather
                      name="check"
                      size={16}
                      color={colors.semantic.blue.darker}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </ProfileModalFrame>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: PROFILE_COLORS.white,
    borderRadius: PROFILE_COLORS.cardRadius,
    marginBottom: SPACING.cardGap,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: PROFILE_COLORS.subtleBorder,
    overflow: "hidden",
    position: "relative",
    shadowColor: PROFILE_COLORS.deepNavy,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  watermarkContainer: {
    position: "absolute",
    right: -4,
    top: 0,
  },
  sectionHeaderRow: {
    marginBottom: SPACING.md,
    zIndex: 1,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: SECTION_THEMES.ACADEMIC.badgeBg,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: SECTION_THEMES.ACADEMIC.primaryText,
    letterSpacing: 0.8,
  },
  departmentTile: {
    backgroundColor: colors.slate100,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.slate200,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: SPACING.md,
    zIndex: 1,
  },
  designationTile: {
    marginTop: -SPACING.xs,
  },
  fieldLabel: {
    fontFamily,
    fontSize: 11,
    color: colors.slateMutedTint,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  departmentValue: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
  },
  departmentPicker: {
    minHeight: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  editInput: {
    fontFamily,
    fontSize: 14,
    fontWeight: "600",
    color: PROFILE_COLORS.deepNavy,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.semantic.blue.alpha16,
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  detailTiles: {
    flexDirection: "row",
    gap: 8,
    marginBottom: SPACING.md,
    zIndex: 1,
  },
  detailTile: {
    flex: 1,
    minWidth: 0,
    minHeight: 58,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    borderWidth: 1,
    paddingHorizontal: 4,
    paddingVertical: 7,
  },
  officeTile: {
    backgroundColor: colors.semantic.indigo.tint,
    borderColor: colors.semantic.blue.soft,
  },
  advisoryTile: {
    backgroundColor: colors.semantic.emerald.tint,
    borderColor: colors.semantic.emerald.mintBorder,
  },
  dayOffTile: {
    backgroundColor: colors.semantic.amber.tint,
    borderColor: colors.semantic.amber.border,
  },
  tileLabel: {
    fontFamily,
    fontSize: 10,
    letterSpacing: 0.5,
    fontWeight: "700",
    marginBottom: 3,
  },
  officeLabel: { color: colors.semantic.indigo.solid },
  advisoryLabel: { color: colors.semantic.emerald.accent },
  dayOffLabel: { color: colors.semantic.amber.accent },
  tileValue: {
    fontFamily,
    fontSize: 12.5,
    color: PROFILE_COLORS.deepNavy,
    fontWeight: "700",
    textAlign: "center",
  },
  tileInput: {
    fontFamily,
    fontSize: 11,
    color: PROFILE_COLORS.deepNavy,
    fontWeight: "600",
    textAlign: "center",
    width: "100%",
    paddingVertical: 2,
  },
  batchValueRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
  },
  ordinalSuffix: {
    fontFamily,
    fontSize: 8,
    lineHeight: 10,
    fontWeight: "700",
    color: PROFILE_COLORS.deepNavy,
    marginTop: -2,
  },
  dayOffPicker: {
    minHeight: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  departmentModal: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 18,
  },
  departmentModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  departmentModalTitle: {
    fontFamily,
    fontSize: 17,
    fontWeight: "700",
    color: PROFILE_COLORS.deepNavy,
  },
  departmentSearch: {
    fontFamily,
    fontSize: 14,
    color: PROFILE_COLORS.deepNavy,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.semantic.blue.soft,
    backgroundColor: colors.slate50,
    marginBottom: 10,
  },
  departmentOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 48,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  departmentOptionSelected: {
    backgroundColor: colors.semantic.blue.tint,
  },
  departmentCode: {
    width: 42,
    paddingVertical: 5,
    alignItems: "center",
    borderRadius: 7,
    backgroundColor: colors.semantic.blue.tint,
  },
  departmentCodeText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "700",
    color: colors.semantic.blue.darker,
  },
  departmentOptionText: {
    flex: 1,
    fontFamily,
    fontSize: 13,
    color: PROFILE_COLORS.deepNavy,
  },
  departmentOptionTextSelected: {
    color: colors.semantic.blue.darker,
    fontWeight: "700",
  },
  dayOffModal: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 18,
  },
  dayOffOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 44,
    paddingHorizontal: 10,
    borderRadius: 9,
  },
  dayOffOptionSelected: {
    backgroundColor: colors.semantic.amber.tint,
  },
  dayOffOptionTextSelected: {
    color: colors.semantic.amber.deep,
    fontWeight: "700",
  },
  scheduleHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
    paddingHorizontal: 2,
    zIndex: 1,
  },
  scheduleTitle: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: colors.slate600,
  },
  slotsViewContainer: {
    gap: 6,
    zIndex: 1,
  },
  slotViewBadge: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.semantic.blue.tint,
    borderWidth: 1,
    borderColor: colors.semantic.blue.border,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
  },
  slotDayTagText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: colors.semantic.blue.darker,
    backgroundColor: colors.white,
    borderRadius: 7,
    overflow: "hidden",
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  slotTimeText: {
    flex: 1,
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: PROFILE_COLORS.deepNavy,
  },
  emptySchedule: {
    fontFamily,
    fontSize: 12,
    color: PROFILE_COLORS.subtleText,
    paddingVertical: 6,
  },
  slotEditContainer: {
    gap: 8,
    zIndex: 1,
  },
  slotCard: {
    backgroundColor: colors.slate50,
    borderWidth: 1,
    borderColor: colors.semantic.blue.soft,
    borderRadius: 12,
    padding: 9,
    gap: 8,
  },
  slotCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  slotCardTitle: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: colors.semantic.blue.darker,
  },
  deleteSlotBtn: { padding: 4 },
  dayPillsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 3,
  },
  dayPill: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.slate200,
  },
  dayPillSelected: {
    backgroundColor: colors.semantic.blue.darker,
    borderColor: colors.semantic.blue.darker,
  },
  dayPillText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "600",
    color: PROFILE_COLORS.subtleText,
  },
  dayPillTextSelected: { color: colors.white },
  timeInputsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timePickerButton: {
    flex: 1,
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.slate200,
    borderRadius: 7,
    paddingHorizontal: 7,
  },
  timePickerText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "600",
    color: PROFILE_COLORS.deepNavy,
  },
  timePickerPlaceholder: {
    color: PROFILE_COLORS.mutedText,
  },
  timeSeparator: {
    fontFamily,
    fontSize: 13,
    color: PROFILE_COLORS.subtleText,
  },
  addSlotButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.semantic.blue.tint,
    borderWidth: 1,
    borderColor: colors.semantic.blue.border,
    borderStyle: "dashed",
    borderRadius: 9,
    paddingVertical: 8,
  },
  addSlotButtonText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: colors.semantic.blue.darker,
  },
  pickerCancelText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "600",
    color: colors.slate500,
  },
  pickerDoneText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: colors.semantic.blue.darker,
  },
});
