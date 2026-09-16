import React, { createElement, memo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO, TIME_SLOT_PRESETS } from "../../constants";
import { formatTime12h } from "../../utils";
import type { DurationInfo } from "../../types";

interface TimeSectionProps {
  startTime: string;
  endTime: string;
  durationInfo: DurationInfo;
  onSelectPreset: (start: string, end: string) => void;
  onChangeStartTime: (val: string) => void;
  onChangeEndTime: (val: string) => void;
  onOpenNativePicker: (mode: "start" | "end") => void;
}

export const TimeSection = memo(function TimeSection({
  startTime,
  endTime,
  durationInfo,
  onSelectPreset,
  onChangeStartTime,
  onChangeEndTime,
  onOpenNativePicker,
}: TimeSectionProps) {
  return (
    <View style={styles.formSection}>
      <Text style={styles.sectionLabel}>TIME SLOT (12-HR)</Text>

      {/* Quick Campus Time Slots */}
      <View style={styles.timeSlotPresetsGrid}>
        {TIME_SLOT_PRESETS.map((slot) => {
          const isSelected = startTime === slot.start && endTime === slot.end;
          return (
            <TouchableOpacity
              key={slot.label}
              style={[
                styles.timeSlotPresetCard,
                isSelected && styles.timeSlotPresetCardActive,
              ]}
              onPress={() => onSelectPreset(slot.start, slot.end)}
              activeOpacity={0.7}
            >
              <View style={styles.timePresetIconWrap}>
                <Feather
                  name={slot.icon}
                  size={14}
                  color={isSelected ? BENTO.navy : BENTO.slate}
                />
              </View>
              <Text
                style={[
                  styles.timePresetLabel,
                  isSelected && styles.timePresetLabelActive,
                ]}
              >
                {slot.label}
              </Text>
              <Text
                style={[
                  styles.timePresetSub,
                  isSelected && styles.timePresetSubActive,
                ]}
              >
                {formatTime12h(slot.start)} - {formatTime12h(slot.end)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Custom Start & End Time Pickers */}
      <View style={styles.customTimeRow}>
        {/* Start Time Card */}
        <TouchableOpacity
          style={styles.timeCardHalf}
          activeOpacity={Platform.OS === "web" ? 1 : 0.7}
          onPress={() => {
            if (Platform.OS !== "web") {
              onOpenNativePicker("start");
            }
          }}
        >
          <Text style={styles.timeCardSubLabel}>START TIME</Text>
          <View style={styles.timeCardValRow}>
            <Feather
              name="clock"
              size={15}
              color={BENTO.indigo}
              style={styles.timeIcon}
            />
            <Text style={styles.timeCardValText}>
              {formatTime12h(startTime)}
            </Text>
          </View>

          {Platform.OS === "web" &&
            createElement("input", {
              type: "time",
              value: startTime,
              onChange: (e: any) => {
                if (e?.target?.value) {
                  onChangeStartTime(e.target.value);
                }
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

        {/* End Time Card */}
        <TouchableOpacity
          style={styles.timeCardHalf}
          activeOpacity={Platform.OS === "web" ? 1 : 0.7}
          onPress={() => {
            if (Platform.OS !== "web") {
              onOpenNativePicker("end");
            }
          }}
        >
          <Text style={styles.timeCardSubLabel}>END TIME</Text>
          <View style={styles.timeCardValRow}>
            <Feather
              name="clock"
              size={15}
              color={BENTO.indigo}
              style={styles.timeIcon}
            />
            <Text style={styles.timeCardValText}>{formatTime12h(endTime)}</Text>
          </View>

          {Platform.OS === "web" &&
            createElement("input", {
              type: "time",
              value: endTime,
              onChange: (e: any) => {
                if (e?.target?.value) {
                  onChangeEndTime(e.target.value);
                }
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
      </View>

      {/* Calculated Duration or Warning Pill */}
      <View
        style={[
          styles.durationPillContainer,
          !durationInfo.isValid && styles.durationPillError,
        ]}
      >
        <Feather
          name={durationInfo.isValid ? "check" : "alert-triangle"}
          size={14}
          color={durationInfo.isValid ? BENTO.emerald : BENTO.rose}
          style={styles.durationIcon}
        />
        <Text
          style={[
            styles.durationPillText,
            !durationInfo.isValid && { color: BENTO.rose },
          ]}
        >
          {durationInfo.isValid
            ? `Calculated Duration: ${durationInfo.durationText}`
            : durationInfo.durationText}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  formSection: {
    marginBottom: 22,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: BENTO.slate,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  timeSlotPresetsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  timeSlotPresetCard: {
    width: "48%",
    backgroundColor: BENTO.card,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: BENTO.border,
  },
  timeSlotPresetCardActive: {
    borderColor: BENTO.navy,
    backgroundColor: "#f8fafc",
  },
  timePresetIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: BENTO.slateSubtle,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  timePresetLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: BENTO.navy,
  },
  timePresetLabelActive: {
    color: BENTO.navy,
  },
  timePresetSub: {
    fontSize: 10,
    color: BENTO.slate,
    marginTop: 2,
  },
  timePresetSubActive: {
    color: BENTO.indigo,
    fontWeight: "600",
  },
  customTimeRow: {
    flexDirection: "row",
    gap: 10,
  },
  timeCardHalf: {
    flex: 1,
    backgroundColor: BENTO.card,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: BENTO.border,
    position: "relative",
  },
  timeCardSubLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: BENTO.slate,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  timeCardValRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeIcon: {
    marginRight: 6,
  },
  timeCardValText: {
    fontSize: 14,
    fontWeight: "800",
    color: BENTO.navy,
  },
  durationPillContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.emeraldBg,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BENTO.emeraldBorder,
  },
  durationPillError: {
    backgroundColor: BENTO.roseBg,
    borderColor: BENTO.roseBorder,
  },
  durationIcon: {
    marginRight: 6,
  },
  durationPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: BENTO.emerald,
  },
});
