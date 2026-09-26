import React from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO_THEME } from "../constants";
import { ScheduleBlock, TimePickerType } from "../types";
import { formatTimeDisplay } from "../utils";
import { styles } from "../styles";

interface ScheduleItemCardProps {
  schedule: ScheduleBlock;
  index: number;
  totalSchedules: number;
  onOpenDayPicker: (id: string) => void;
  onOpenTimePicker: (id: string, type: TimePickerType) => void;
  onUpdateRoom: (id: string, room: string) => void;
  onRemove: (id: string) => void;
}

export const ScheduleItemCard = React.memo(function ScheduleItemCard({
  schedule,
  index,
  totalSchedules,
  onOpenDayPicker,
  onOpenTimePicker,
  onUpdateRoom,
  onRemove,
}: ScheduleItemCardProps) {
  return (
    <View style={styles.amberScheduleItemCard}>
      {/* Schedule Header */}
      <View style={styles.scheduleCardHeader}>
        <View style={styles.amberScheduleBadge}>
          <Text style={styles.amberScheduleBadgeText}>
            CLASS #{index + 1}
          </Text>
        </View>

        {totalSchedules > 1 && (
          <TouchableOpacity
            onPress={() => onRemove(schedule.id)}
            style={styles.deleteScheduleBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Delete class schedule ${index + 1}`}
          >
            <Feather name="trash-2" size={15} color={BENTO_THEME.roseIcon} />
          </TouchableOpacity>
        )}
      </View>

      {/* Day Picker Trigger */}
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: BENTO_THEME.amberLabel }]}>
          DAY OF WEEK
        </Text>
        <TouchableOpacity
          style={[styles.inputBox, styles.amberInputBox]}
          onPress={() => onOpenDayPicker(schedule.id)}
          activeOpacity={0.7}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Select day for class ${index + 1}`}
        >
          <Feather
            name="calendar"
            size={15}
            color={BENTO_THEME.amberIcon}
            style={styles.inputLeadingIcon}
          />
          <Text style={styles.pickerValueText}>{schedule.day}</Text>
          <Feather
            name="chevron-down"
            size={18}
            color={BENTO_THEME.amberIcon}
          />
        </TouchableOpacity>
      </View>

      {/* Start & End Time Grid */}
      <View style={styles.gridRow}>
        <View style={styles.gridItem}>
          <Text style={[styles.inputLabel, { color: BENTO_THEME.amberLabel }]}>
            START TIME
          </Text>
          <TouchableOpacity
            style={[styles.inputBox, styles.amberInputBox]}
            onPress={() => onOpenTimePicker(schedule.id, "start")}
            activeOpacity={0.7}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Select start time for class ${index + 1}`}
          >
            <Feather
              name="clock"
              size={15}
              color={BENTO_THEME.amberIcon}
              style={styles.inputLeadingIcon}
            />
            <Text style={styles.timeValueText}>
              {formatTimeDisplay(schedule.startTime)}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.gridItem}>
          <Text style={[styles.inputLabel, { color: BENTO_THEME.amberLabel }]}>
            END TIME
          </Text>
          <TouchableOpacity
            style={[styles.inputBox, styles.amberInputBox]}
            onPress={() => onOpenTimePicker(schedule.id, "end")}
            activeOpacity={0.7}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Select end time for class ${index + 1}`}
          >
            <Feather
              name="clock"
              size={15}
              color={BENTO_THEME.amberIcon}
              style={styles.inputLeadingIcon}
            />
            <Text style={styles.timeValueText}>
              {formatTimeDisplay(schedule.endTime)}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Room / Lab */}
      <View style={[styles.inputGroup, { marginBottom: 0 }]}>
        <Text style={[styles.inputLabel, { color: BENTO_THEME.amberLabel }]}>
          ROOM / LAB NUMBER
        </Text>
        <View style={[styles.inputBox, styles.amberInputBox]}>
          <Feather
            name="map-pin"
            size={15}
            color={BENTO_THEME.amberIcon}
            style={styles.inputLeadingIcon}
          />
          <TextInput
            style={styles.input}
            value={schedule.room}
            onChangeText={(t) => onUpdateRoom(schedule.id, t)}
            placeholder="e.g. Room 402 / Lab 3"
            placeholderTextColor={BENTO_THEME.slateLight}
            accessible={true}
            accessibilityLabel={`Room or lab number for class ${index + 1}`}
          />
        </View>
      </View>
    </View>
  );
});
