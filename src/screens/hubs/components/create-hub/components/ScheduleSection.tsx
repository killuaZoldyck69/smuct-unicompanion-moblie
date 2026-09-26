import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO_THEME } from "../constants";
import { ScheduleBlock, TimePickerType } from "../types";
import { ScheduleItemCard } from "./ScheduleItemCard";
import { styles } from "../styles";

interface ScheduleSectionProps {
  schedules: ScheduleBlock[];
  onOpenDayPicker: (id: string) => void;
  onOpenTimePicker: (id: string, type: TimePickerType) => void;
  onUpdateRoom: (id: string, room: string) => void;
  onRemoveSchedule: (id: string) => void;
  onAddSchedule: () => void;
}

export const ScheduleSection = React.memo(function ScheduleSection({
  schedules,
  onOpenDayPicker,
  onOpenTimePicker,
  onUpdateRoom,
  onRemoveSchedule,
  onAddSchedule,
}: ScheduleSectionProps) {
  const totalCount = schedules.length;

  return (
    <View style={[styles.bentoCard, styles.amberBentoCard]}>
      {/* Section Header */}
      <View style={styles.cardHeaderRow}>
        <View
          style={[
            styles.cardHeaderIcon,
            { backgroundColor: BENTO_THEME.amberHeaderBg },
          ]}
        >
          <Feather name="clock" size={16} color={BENTO_THEME.amberIcon} />
        </View>
        <View style={styles.cardHeaderTextGroup}>
          <Text style={styles.cardHeaderTitle}>Weekly Class Schedule</Text>
          <Text style={[styles.cardHeaderSub, { color: BENTO_THEME.amberSub }]}>
            Routine times, days & room numbers
          </Text>
        </View>
        <View
          style={[
            styles.requiredBadge,
            { backgroundColor: BENTO_THEME.amberHeaderBg },
          ]}
        >
          <Text
            style={[
              styles.requiredBadgeText,
              { color: BENTO_THEME.amberIcon },
            ]}
          >
            {totalCount} CLASS{totalCount > 1 ? "ES" : ""}
          </Text>
        </View>
      </View>

      {/* Dynamic Schedule List */}
      {schedules.map((schedule, index) => (
        <ScheduleItemCard
          key={schedule.id}
          schedule={schedule}
          index={index}
          totalSchedules={totalCount}
          onOpenDayPicker={onOpenDayPicker}
          onOpenTimePicker={onOpenTimePicker}
          onUpdateRoom={onUpdateRoom}
          onRemove={onRemoveSchedule}
        />
      ))}

      {/* Add Class Button */}
      <TouchableOpacity
        style={styles.amberAddScheduleBtn}
        onPress={onAddSchedule}
        activeOpacity={0.75}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Add Another Class Time"
      >
        <Feather name="plus" size={15} color={BENTO_THEME.amberIcon} />
        <Text style={styles.amberAddScheduleText}>
          Add Another Class Time
        </Text>
      </TouchableOpacity>
    </View>
  );
});
