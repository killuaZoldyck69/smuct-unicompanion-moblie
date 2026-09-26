import React, { createElement } from "react";
import { View, Text, TextInput, TouchableOpacity, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO_THEME, formatTimeDisplay } from "@/screens/hubs/components/create-hub";
import { editHubStyles as s } from "../styles";
import type { ScheduleBlock, DateTimePickerTarget } from "../types";
import { toHHMM } from "../utils";

interface Props {
  schedules: ScheduleBlock[];
  onAddSchedule: () => void;
  onRemoveSchedule: (id: string) => void;
  onUpdateField: (id: string, field: keyof ScheduleBlock, value: any) => void;
  onOpenDayPicker: (id: string) => void;
  onOpenTimePicker: (cfg: DateTimePickerTarget) => void;
}

export function ScheduleSection({
  schedules,
  onAddSchedule,
  onRemoveSchedule,
  onUpdateField,
  onOpenDayPicker,
  onOpenTimePicker,
}: Props) {
  return (
    <View style={[s.bentoCard, s.amberBentoCard]}>
      {/* Card Header */}
      <View style={s.cardHeaderRow}>
        <View style={[s.cardHeaderIcon, { backgroundColor: BENTO_THEME.amberHeaderBg }]}>
          <Feather name="clock" size={16} color={BENTO_THEME.amberIcon} />
        </View>
        <View style={s.cardHeaderTextGroup}>
          <Text style={s.cardHeaderTitle}>Weekly Class Schedule</Text>
          <Text style={[s.cardHeaderSub, { color: BENTO_THEME.amberSub }]}>
            Routine times, days &amp; room numbers
          </Text>
        </View>
        <View style={[s.statusBadge, { backgroundColor: BENTO_THEME.amberHeaderBg }]}>
          <Text style={[s.statusBadgeText, { color: BENTO_THEME.amberIcon }]}>
            {schedules.length} CLASS{schedules.length === 1 ? "" : "ES"}
          </Text>
        </View>
      </View>

      {schedules.map((schedule, index) => (
        <ScheduleItemCard
          key={schedule.id}
          schedule={schedule}
          index={index}
          onRemove={onRemoveSchedule}
          onUpdateField={onUpdateField}
          onOpenDayPicker={onOpenDayPicker}
          onOpenTimePicker={onOpenTimePicker}
        />
      ))}

      <TouchableOpacity
        style={s.addScheduleBtn}
        onPress={onAddSchedule}
        activeOpacity={0.75}
        accessible
        accessibilityRole="button"
        accessibilityLabel="Add another class time"
      >
        <Feather name="plus" size={15} color={BENTO_THEME.amberIcon} />
        <Text style={s.addScheduleBtnText}>Add Another Class Time</Text>
      </TouchableOpacity>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Internal ScheduleItemCard — not exported, only used by ScheduleSection
// ---------------------------------------------------------------------------
interface ItemProps {
  schedule: ScheduleBlock;
  index: number;
  onRemove: (id: string) => void;
  onUpdateField: (id: string, field: keyof ScheduleBlock, value: any) => void;
  onOpenDayPicker: (id: string) => void;
  onOpenTimePicker: (cfg: DateTimePickerTarget) => void;
}

function ScheduleItemCard({
  schedule,
  index,
  onRemove,
  onUpdateField,
  onOpenDayPicker,
  onOpenTimePicker,
}: ItemProps) {
  return (
    <View style={s.scheduleItemCard}>
      {/* Item Header */}
      <View style={s.scheduleItemHeader}>
        <View style={s.scheduleBadge}>
          <Text style={s.scheduleBadgeText}>CLASS #{index + 1}</Text>
        </View>
        <TouchableOpacity
          onPress={() => onRemove(schedule.id)}
          style={s.deleteBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}
          accessible
          accessibilityRole="button"
          accessibilityLabel={`Delete class session ${index + 1}`}
        >
          <Feather name="trash-2" size={15} color={BENTO_THEME.roseIcon} />
        </TouchableOpacity>
      </View>

      {/* Day Picker */}
      <View style={s.inputGroup}>
        <Text style={[s.inputLabel, { color: BENTO_THEME.amberLabel }]}>DAY OF WEEK</Text>
        <TouchableOpacity
          style={[s.inputRow, s.amberInputRow]}
          onPress={() => onOpenDayPicker(schedule.id)}
          activeOpacity={0.7}
          accessible
          accessibilityRole="button"
          accessibilityLabel={`Select day for class ${index + 1}`}
        >
          <Feather name="calendar" size={15} color={BENTO_THEME.amberIcon} style={s.leadingIcon} />
          <Text style={s.pickerText}>{schedule.day}</Text>
          <Feather name="chevron-down" size={18} color={BENTO_THEME.amberIcon} />
        </TouchableOpacity>
      </View>

      {/* Start & End Time */}
      <View style={s.grid}>
        <View style={s.gridItem}>
          <Text style={[s.inputLabel, { color: BENTO_THEME.amberLabel }]}>START TIME</Text>
          <TimePickerTrigger
            value={schedule.startTime}
            color={BENTO_THEME.amberIcon}
            inputStyle={s.amberInputRow}
            accessibilityLabel={`Class ${index + 1} start time`}
            onPress={() =>
              onOpenTimePicker({ target: "schedule", id: schedule.id, type: "start" })
            }
            onWebChange={(d) => onUpdateField(schedule.id, "startTime", d)}
          />
        </View>

        <View style={s.gridItem}>
          <Text style={[s.inputLabel, { color: BENTO_THEME.amberLabel }]}>END TIME</Text>
          <TimePickerTrigger
            value={schedule.endTime}
            color={BENTO_THEME.amberIcon}
            inputStyle={s.amberInputRow}
            accessibilityLabel={`Class ${index + 1} end time`}
            onPress={() =>
              onOpenTimePicker({ target: "schedule", id: schedule.id, type: "end" })
            }
            onWebChange={(d) => onUpdateField(schedule.id, "endTime", d)}
          />
        </View>
      </View>

      {/* Room */}
      <View style={[s.inputGroup, { marginBottom: 0 }]}>
        <Text style={[s.inputLabel, { color: BENTO_THEME.amberLabel }]}>ROOM / LAB NUMBER</Text>
        <View style={[s.inputRow, s.amberInputRow]}>
          <Feather name="map-pin" size={15} color={BENTO_THEME.amberIcon} style={s.leadingIcon} />
          <TextInput
            style={s.textInput}
            value={schedule.room}
            onChangeText={(t) => onUpdateField(schedule.id, "room", t)}
            placeholder="e.g. Room 402 / Lab 3"
            placeholderTextColor={BENTO_THEME.slateLight}
            accessible
            accessibilityLabel={`Class ${index + 1} room or lab`}
          />
        </View>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Shared time-picker trigger that handles both native and web
// ---------------------------------------------------------------------------
interface TimePickerTriggerProps {
  value: Date;
  color: string;
  inputStyle: object;
  accessibilityLabel: string;
  onPress: () => void;
  onWebChange: (d: Date) => void;
}

function TimePickerTrigger({
  value,
  color,
  inputStyle,
  accessibilityLabel,
  onPress,
  onWebChange,
}: TimePickerTriggerProps) {
  const isWeb = Platform.OS === "web";

  return (
    <TouchableOpacity
      style={[s.inputRow, inputStyle]}
      onPress={!isWeb ? onPress : undefined}
      activeOpacity={isWeb ? 1 : 0.7}
      accessible
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Feather name="clock" size={15} color={color} style={s.leadingIcon} />
      <Text style={s.pickerText}>{formatTimeDisplay(value)}</Text>

      {isWeb &&
        createElement("input", {
          type: "time",
          value: toHHMM(value),
          onChange: (e: any) => {
            if (!e?.target?.value) return;
            const [h, m] = e.target.value.split(":").map(Number);
            const d = new Date(value);
            d.setHours(h, m, 0, 0);
            onWebChange(d);
          },
          style: {
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            opacity: 0,
            cursor: "pointer",
            zIndex: 10,
          },
        })}
    </TouchableOpacity>
  );
}
