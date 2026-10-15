import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import {
  TeacherProfileData,
  ConsultationSlot,
} from "@/services/teacher-service";
import {
  PROFILE_COLORS,
  SECTION_THEMES,
  SPACING,
  fontFamily,
} from "../../constants";
import { CampusBuildingWatermark } from "./faculty-illustrations";

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

interface TeacherAcademicCardProps {
  profile: TeacherProfileData;
  isEditing: boolean;
  designation: string;
  department: string;
  officeRoom: string;
  advisoryBatch: string;
  dayOff: string;
  consultationSlots: ConsultationSlot[];
  consultationHours: string;
  onChangeDesignation: (val: string) => void;
  onChangeDepartment: (val: string) => void;
  onChangeOfficeRoom: (val: string) => void;
  onChangeAdvisoryBatch: (val: string) => void;
  onChangeDayOff: (val: string) => void;
  onAddConsultationSlot: (slot: ConsultationSlot) => void;
  onUpdateConsultationSlot: (
    index: number,
    slotUpdates: Partial<ConsultationSlot>
  ) => void;
  onRemoveConsultationSlot: (index: number) => void;
}

export const TeacherAcademicCard = React.memo(function TeacherAcademicCard({
  profile,
  isEditing,
  designation,
  department,
  officeRoom,
  advisoryBatch,
  dayOff,
  consultationSlots,
  consultationHours,
  onChangeDesignation,
  onChangeDepartment,
  onChangeOfficeRoom,
  onChangeAdvisoryBatch,
  onChangeDayOff,
  onAddConsultationSlot,
  onUpdateConsultationSlot,
  onRemoveConsultationSlot,
}: TeacherAcademicCardProps) {
  const theme = SECTION_THEMES.ACADEMIC;

  const displayOfficeRoom = profile.roomNumber
    ? `Office: ${profile.roomNumber}`
    : (profile as any).officeRoom
      ? `Office: ${(profile as any).officeRoom}`
      : "Not provided";

  const displayAdvisoryBatch =
    profile.advisoryBatch !== null && profile.advisoryBatch !== undefined
      ? `Batch ${profile.advisoryBatch}`
      : advisoryBatch
        ? `Batch ${advisoryBatch}`
        : "Not assigned";

  const displayDayOff = profile.dayOff || dayOff || "Not specified";

  const displayHours =
    (profile as any).consultationHours ||
    (profile as any).officeHours ||
    "Not provided";

  return (
    <View style={styles.card}>
      {/* Background Campus Illustration Watermark on Right */}
      <View style={styles.watermarkContainer} pointerEvents="none">
        <CampusBuildingWatermark
          width={150}
          height={125}
          opacity={0.13}
          color={theme.primaryText}
        />
      </View>

      {/* Header */}
      <View style={styles.sectionHeaderRow}>
        <View style={styles.headerLeft}>
          <View style={styles.sectionIconBadge}>
            <Ionicons name="business-outline" size={16} color={theme.primaryText} />
          </View>
          <Text style={styles.sectionTitle}>ACADEMIC POSITION</Text>
        </View>
      </View>

      {/* Row 1: Designation */}
      <View style={styles.infoRow}>
        <View style={styles.iconCircle}>
          <Feather name="user" size={16} color={theme.primaryText} />
        </View>
        <View style={styles.fieldContent}>
          <Text style={styles.fieldLabel}>Designation</Text>
          {isEditing ? (
            <TextInput
              style={styles.editInput}
              value={designation}
              onChangeText={onChangeDesignation}
              placeholder="e.g. Lecturer"
              placeholderTextColor={PROFILE_COLORS.mutedText}
              accessible={true}
              accessibilityLabel="Faculty Designation Input"
            />
          ) : (
            <Text style={styles.fieldValue} numberOfLines={1}>
              {profile.designation || "Not provided"}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.divider} />

      {/* Row 2: Department */}
      <View style={styles.infoRow}>
        <View style={styles.iconCircle}>
          <Ionicons name="business-outline" size={16} color={theme.primaryText} />
        </View>
        <View style={styles.fieldContent}>
          <Text style={styles.fieldLabel}>Department</Text>
          {isEditing ? (
            <TextInput
              style={styles.editInput}
              value={department}
              onChangeText={onChangeDepartment}
              placeholder="e.g. Computer Science and Engineering"
              placeholderTextColor={PROFILE_COLORS.mutedText}
              accessible={true}
              accessibilityLabel="Faculty Department Input"
            />
          ) : (
            <Text style={styles.fieldValue} numberOfLines={2}>
              {profile.department || "Not provided"}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.divider} />

      {/* Row 3: Office Room */}
      <View style={styles.infoRow}>
        <View style={styles.iconCircle}>
          <Feather name="map-pin" size={16} color={theme.primaryText} />
        </View>
        <View style={styles.fieldContent}>
          <Text style={styles.fieldLabel}>Office Room</Text>
          {isEditing ? (
            <TextInput
              style={styles.editInput}
              value={officeRoom}
              onChangeText={onChangeOfficeRoom}
              placeholder="e.g. Office: 1803"
              placeholderTextColor={PROFILE_COLORS.mutedText}
              accessible={true}
              accessibilityLabel="Faculty Office Room Input"
            />
          ) : (
            <Text style={styles.fieldValue} numberOfLines={1}>
              {displayOfficeRoom}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.divider} />

      {/* Row 4: Advisory Batch */}
      <View style={styles.infoRow}>
        <View style={styles.iconCircle}>
          <Feather name="award" size={16} color={theme.primaryText} />
        </View>
        <View style={styles.fieldContent}>
          <Text style={styles.fieldLabel}>Advisory Batch</Text>
          {isEditing ? (
            <TextInput
              style={styles.editInput}
              value={advisoryBatch}
              onChangeText={onChangeAdvisoryBatch}
              keyboardType="numeric"
              placeholder="e.g. 29"
              placeholderTextColor={PROFILE_COLORS.mutedText}
              accessible={true}
              accessibilityLabel="Faculty Advisory Batch Input"
            />
          ) : (
            <Text style={styles.fieldValue} numberOfLines={1}>
              {displayAdvisoryBatch}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.divider} />

      {/* Row 5: Day Off */}
      <View style={styles.infoRow}>
        <View style={styles.iconCircle}>
          <Feather name="coffee" size={16} color={theme.primaryText} />
        </View>
        <View style={styles.fieldContent}>
          <Text style={styles.fieldLabel}>Day Off</Text>
          {isEditing ? (
            <View>
              <TextInput
                style={styles.editInput}
                value={dayOff}
                onChangeText={onChangeDayOff}
                placeholder="e.g. Friday"
                placeholderTextColor={PROFILE_COLORS.mutedText}
                accessible={true}
                accessibilityLabel="Faculty Day Off Input"
              />
              <View style={styles.quickDayOffRow}>
                {DAYS_OF_WEEK.map((d) => {
                  const isSelected = dayOff.toLowerCase() === d.toLowerCase();
                  return (
                    <TouchableOpacity
                      key={d}
                      style={[
                        styles.quickDayChip,
                        isSelected && styles.quickDayChipSelected,
                      ]}
                      onPress={() => onChangeDayOff(d)}
                      accessibilityLabel={`Select ${d} as day off`}
                    >
                      <Text
                        style={[
                          styles.quickDayChipText,
                          isSelected && styles.quickDayChipTextSelected,
                        ]}
                      >
                        {DAY_ABBR[d]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ) : (
            <Text style={styles.fieldValue} numberOfLines={1}>
              {displayDayOff}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.divider} />

      {/* Row 6: Consultation Schedule */}
      <View style={styles.infoRowTop}>
        <View style={styles.iconCircle}>
          <Feather name="clock" size={16} color={theme.primaryText} />
        </View>
        <View style={styles.fieldContent}>
          <Text style={styles.fieldLabel}>Consultation Schedule</Text>
          {isEditing ? (
            <View style={styles.slotEditContainer}>
              {consultationSlots.map((slot, index) => (
                <View key={index} style={styles.slotCard}>
                  <View style={styles.slotCardHeader}>
                    <Text style={styles.slotCardTitle}>Slot #{index + 1}</Text>
                    <TouchableOpacity
                      onPress={() => onRemoveConsultationSlot(index)}
                      style={styles.deleteSlotBtn}
                      accessibilityLabel={`Delete consultation slot ${index + 1}`}
                    >
                      <Feather name="trash-2" size={14} color="#ef4444" />
                    </TouchableOpacity>
                  </View>

                  {/* Day Picker Pills */}
                  <View style={styles.dayPillsRow}>
                    {DAYS_OF_WEEK.map((d) => {
                      const isSelected = slot.day === d;
                      return (
                        <TouchableOpacity
                          key={d}
                          style={[
                            styles.dayPill,
                            isSelected && styles.dayPillSelected,
                          ]}
                          onPress={() =>
                            onUpdateConsultationSlot(index, { day: d })
                          }
                          accessibilityLabel={`Set slot ${index + 1} day to ${d}`}
                        >
                          <Text
                            style={[
                              styles.dayPillText,
                              isSelected && styles.dayPillTextSelected,
                            ]}
                          >
                            {DAY_ABBR[d] || d.slice(0, 3)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Start & End Time Inputs */}
                  <View style={styles.timeInputsRow}>
                    <View style={styles.timeInputCol}>
                      <Text style={styles.timeSubLabel}>Start Time</Text>
                      <TextInput
                        style={styles.timeInput}
                        value={slot.startTime}
                        onChangeText={(val) =>
                          onUpdateConsultationSlot(index, { startTime: val })
                        }
                        placeholder="e.g. 10:00 AM"
                        placeholderTextColor={PROFILE_COLORS.mutedText}
                        accessible={true}
                        accessibilityLabel={`Slot ${index + 1} Start Time`}
                      />
                    </View>
                    <Text style={styles.timeToSeparator}>–</Text>
                    <View style={styles.timeInputCol}>
                      <Text style={styles.timeSubLabel}>End Time</Text>
                      <TextInput
                        style={styles.timeInput}
                        value={slot.endTime}
                        onChangeText={(val) =>
                          onUpdateConsultationSlot(index, { endTime: val })
                        }
                        placeholder="e.g. 12:00 PM"
                        placeholderTextColor={PROFILE_COLORS.mutedText}
                        accessible={true}
                        accessibilityLabel={`Slot ${index + 1} End Time`}
                      />
                    </View>
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
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Add another consultation slot"
              >
                <Feather name="plus-circle" size={14} color={theme.primaryText} />
                <Text style={styles.addSlotButtonText}>
                  + Add Day & Time Slot
                </Text>
              </TouchableOpacity>
            </View>
          ) : consultationSlots.length > 0 ? (
            <View style={styles.slotsViewContainer}>
              {consultationSlots.map((slot, index) => (
                <View key={`${slot.day}-${index}`} style={styles.slotViewBadge}>
                  <View style={styles.slotDayTag}>
                    <Text style={styles.slotDayTagText}>{slot.day}</Text>
                  </View>
                  <Text style={styles.slotTimeText}>
                    {slot.startTime || "TBD"} – {slot.endTime || "TBD"}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.fieldValue} numberOfLines={2}>
              {displayHours}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: PROFILE_COLORS.white,
    borderRadius: PROFILE_COLORS.cardRadius,
    marginBottom: SPACING.cardGap,
    shadowColor: PROFILE_COLORS.deepNavy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.02)",
    padding: SPACING.lg,
    position: "relative",
    overflow: "hidden",
  },
  watermarkContainer: {
    position: "absolute",
    right: 0,
    bottom: -8,
    zIndex: 0,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.lg,
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
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    zIndex: 1,
  },
  infoRowTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 4,
    zIndex: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  fieldContent: {
    flex: 1,
    paddingRight: 12,
  },
  fieldLabel: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "500",
    color: PROFILE_COLORS.subtleText,
    marginBottom: 3,
  },
  fieldValue: {
    fontFamily,
    fontSize: 14.5,
    fontWeight: "700",
    color: PROFILE_COLORS.deepNavy,
    lineHeight: 19,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(19, 27, 46, 0.05)",
    marginVertical: 6,
    marginLeft: 50,
  },
  editInput: {
    fontFamily,
    fontSize: 14,
    fontWeight: "600",
    color: PROFILE_COLORS.deepNavy,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "rgba(37, 99, 235, 0.15)",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 2,
  },
  quickDayOffRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 6,
  },
  quickDayChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },
  quickDayChipSelected: {
    backgroundColor: SECTION_THEMES.ACADEMIC.primaryText,
    borderColor: SECTION_THEMES.ACADEMIC.primaryText,
  },
  quickDayChipText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: PROFILE_COLORS.mutedText,
  },
  quickDayChipTextSelected: {
    color: "#ffffff",
    fontWeight: "700",
  },
  slotsViewContainer: {
    gap: 6,
    marginTop: 4,
  },
  slotViewBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },
  slotDayTag: {
    backgroundColor: "#eff6ff",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  slotDayTagText: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "700",
    color: SECTION_THEMES.ACADEMIC.primaryText,
  },
  slotTimeText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "600",
    color: PROFILE_COLORS.deepNavy,
  },
  slotEditContainer: {
    gap: 10,
    marginTop: 6,
  },
  slotCard: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "rgba(37, 99, 235, 0.15)",
    borderRadius: 8,
    padding: 8,
    gap: 8,
  },
  slotCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  slotCardTitle: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: SECTION_THEMES.ACADEMIC.primaryText,
    textTransform: "uppercase",
  },
  deleteSlotBtn: {
    padding: 3,
  },
  dayPillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  dayPill: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  dayPillSelected: {
    backgroundColor: SECTION_THEMES.ACADEMIC.primaryText,
    borderColor: SECTION_THEMES.ACADEMIC.primaryText,
  },
  dayPillText: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "600",
    color: PROFILE_COLORS.mutedText,
  },
  dayPillTextSelected: {
    color: "#ffffff",
    fontWeight: "700",
  },
  timeInputsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timeInputCol: {
    flex: 1,
  },
  timeSubLabel: {
    fontFamily,
    fontSize: 10,
    fontWeight: "500",
    color: PROFILE_COLORS.subtleText,
    marginBottom: 2,
  },
  timeInput: {
    fontFamily,
    fontSize: 12.5,
    fontWeight: "600",
    color: PROFILE_COLORS.deepNavy,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  timeToSeparator: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: PROFILE_COLORS.mutedText,
    marginTop: 12,
  },
  addSlotButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "rgba(37, 99, 235, 0.2)",
    borderStyle: "dashed",
    borderRadius: 6,
    paddingVertical: 7,
  },
  addSlotButtonText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: SECTION_THEMES.ACADEMIC.primaryText,
  },
});
